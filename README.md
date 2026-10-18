# Magma Minds Academy — Academy Management Website

A production-ready academy website and management system: a public marketing
site, a student portal, and a staff/admin panel — all backed by a real REST API
and MongoDB. No mock data or fake integrations.

- **Frontend:** Next.js 16 (App Router, React 19, Tailwind CSS 4)
- **Backend:** Express 5 + Mongoose 9 (MongoDB)
- **Auth:** JWT in an httpOnly cookie, role-based access control
- **Integrations:** Cloudinary (with local-disk fallback), SMTP (with console
  fallback), Razorpay (with an offline payments workflow)

---

## Repository layout

```
ACADEMY/
├── backend/        Express API, MongoDB models, seeders, tests
│   ├── src/
│   │   ├── config/          env + database connection
│   │   ├── models/          Mongoose schemas (19 models)
│   │   ├── middleware/      auth, validate, security, rate limit, maintenance
│   │   ├── services/        token, email, upload, payment, audit, settings cache
│   │   ├── controllers/     request handlers
│   │   ├── routes/          auth / public / student / admin / index
│   │   ├── validators/      Zod schemas
│   │   ├── utils/           response, pagination, csv, roles
│   │   └── seeders/         super-admin + demo data seeders
│   └── tests/               Jest + Supertest API tests
└── frontend/       Next.js app
    ├── app/
    │   ├── (site)/          public pages (home, courses, trainers, …)
    │   ├── (auth)/          login, register, forgot/reset password
    │   ├── (dashboard)/     student portal (overview, applications, …)
    │   ├── (admin)/         admin panel (CRUD for every entity)
    │   ├── api/             (none — /api is proxied to the backend)
    │   ├── layout.js        root layout (metadata from settings)
    │   ├── sitemap.js / robots.js / not-found.js / error.js
    ├── components/          ui/, layout/, site/, auth/, admin/, dashboard/
    ├── lib/                 api (server), client (browser), format, constants, site
    └── proxy.js            route protection for /admin and /dashboard (Next 16)
```

## How the two apps talk to each other

The browser always calls **same-origin** URLs (`/api/*`, `/uploads/*`). Next.js
`rewrites` (in `frontend/next.config.mjs`) proxy those to the Express backend
(`BACKEND_URL`, default `http://localhost:5000`). This keeps the httpOnly session
cookie first-party, so there is no CORS/cookie hassle in the browser.

Server Components call the backend directly through `lib/api.js`, forwarding the
session cookie with `next/headers`.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- A running MongoDB instance (local or Atlas)

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values (see below)
npm run seed                # super admin + demo data
npm run dev                 # http://localhost:5000
```

Key environment variables (`.env`):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `CORS_ORIGINS` | Comma-separated allowlist of browser origins |
| `FRONTEND_URL` | Public URL of the site (links in emails, redirects) |
| `BACKEND_PUBLIC_URL` | Public URL of the API (behind the same proxy) |
| `TRUST_PROXY` | Set to `1` behind nginx so rate limits see real client IPs |
| `COOKIE_SECURE` | Auth cookie `Secure` flag (defaults to on in production; needs HTTPS) |
| `CLOUDINARY_*` | Optional — enables Cloudinary uploads |
| `SMTP_*` | Optional — enables real email sending |
| `RAZORPAY_*` | Optional — enables online payments |

Every optional integration degrades gracefully:

- No Cloudinary → uploads are stored on local disk under `backend/uploads/` and
  served at `/uploads`.
- No SMTP → emails are logged to the console.
- No Razorpay → online payment endpoints return `503`; admins can still record
  offline payments.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set BACKEND_URL if not localhost:5000
npm run dev                  # http://localhost:3000
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | `http://localhost:5000` | Where the proxy forwards `/api` and `/uploads` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URL for SEO/sitemap |

## Default credentials

Created by `npm run seed` (development / staging only):

- **Super admin:** `admin@elevateacademy.example` / `Admin@12345`
- **Demo students:** `aditya.demo@example.com` … `lakshmi.demo@example.com` /
  `Demo@12345`

> In production, create only the super admin from your own
> `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`, and change the password
> immediately after the first login. If you import the demo catalogue, remove
> the demo student logins with `npm run clear:demo-users`.

## Roles

`super_admin` → `admin` → `staff` → `trainer` → `student`

- **super_admin / admin** — full admin panel including users, settings and audit logs.
- **staff** — day-to-day operations (courses, applications, enquiries, payments,
  content) but not user administration.
- **trainer** — staff-level read access to their area.
- **student** — the student portal only (`/dashboard`).

Route protection is enforced in two layers: the edge `proxy.js` (Next 16's
middleware) checks for a session cookie, and every API endpoint re-checks the
role on the server.

## Testing

Backend API tests (Jest + Supertest, in-memory-ish against a test database):

```bash
cd backend
npm test
```

The suite covers auth, course CRUD and validation, applications/enquiries,
batch capacity, RBAC, dashboard aggregates, audit logging, uploads and secret
leakage.

> **Always use `npm test`** — never a bare `npx jest`. The script sets
> `NODE_OPTIONS=--experimental-vm-modules` (the MongoDB driver's handshake
> fails under Jest's default CJS sandbox otherwise) and pins
> `MONGODB_URI=mongodb://127.0.0.1:27017/academy_test`. As a safety net,
> `tests/setup-env.js` forces that test URI before any module loads and
> `tests/helpers.js` refuses to clear any database not named `*_test`, so a
> misconfigured run can never wipe development data.

## Deployment (Docker Compose on a VPS)

Everything needed for a self-hosted production deployment lives in the repo:

```
docker-compose.yml            mongo + backend + frontend + nginx (+ certbot profile)
.env.production.example       all production variables (copy to .env)
backend/Dockerfile            Express API image (prod deps only, non-root)
frontend/Dockerfile           Next.js standalone image (multi-stage, non-root)
deploy/nginx/conf.d/          HTTP server block + TLS templates
deploy/scripts/               bootstrap / tls / self-signed / renew / backup
```

Only **nginx** publishes ports (80/443). MongoDB, the API and the web app stay on
a private Docker network; `/api` and `/uploads` are proxied by Next.js to the API
container, so the auth cookie stays first-party.

### Requirements

- A Linux VPS (1 vCPU / 2 GB RAM is enough to start), ports 80 and 443 open
- Docker Engine 20.10+ with the `docker compose` plugin
  (`curl -fsSL https://get.docker.com | sh`)

### 1. Deploy

```bash
git clone <your-repo> academy && cd academy     # or upload the folder
bash deploy/scripts/bootstrap.sh
```

The first run copies `.env.production.example` to `.env` and tells you what to
fill in. Set at least:

| Setting | Value |
| --- | --- |
| `MONGO_ROOT_PASSWORD` | strong password (Mongo root) |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | your admin login |
| `NEXT_PUBLIC_SITE_URL` | `http://<server-ip>` (or `https://<domain>`) |
| `CORS_ORIGINS` | same as the site URL (comma-separated for extras) |
| `COOKIE_SECURE` | `false` on plain HTTP, `true` once HTTPS is on |

Run the script again — it validates the values, builds the images, starts the
stack, waits for `/api/health`, and prints the next steps.

### 2. Create the first super admin

```bash
docker compose exec backend node src/seeders/runSeeder.js --superadmin
```

Then log in at `/login` and open `/admin`.

### 3. Optional: import the starter catalogue

The demo seeder contains real Magma Minds content (3 categories, 5 trainers,
19 courses, announcements, testimonials, gallery, FAQs) — every document is
flagged `isDemo: true`:

```bash
docker compose exec backend node src/seeders/runSeeder.js --demo
docker compose exec backend npm run clear:demo-users   # remove demo student logins
```

Edit the content in **Admin → Courses / Trainers / Categories / Settings**.
Remove everything flagged as demo later with
`docker compose exec backend node src/seeders/runSeeder.js --clear-demo`.

### 4. HTTPS

`COOKIE_SECURE=true` requires HTTPS, so enable TLS as soon as you have a domain
(point an `A` record at the server first):

```bash
bash deploy/scripts/enable-tls.sh academy.example.com you@example.com
```

This fetches a Let's Encrypt certificate, switches nginx to HTTPS with an
HTTP→HTTPS redirect, updates `.env` (site URL, CORS, `COOKIE_SECURE=true`) and
rebuilds the web image. Renewals:

```bash
# crontab -e
17 3 * * 1 cd /root/academy && bash deploy/scripts/renew-tls.sh >> /var/log/academy-tls.log 2>&1
```

No domain yet? You can serve HTTPS immediately with a self-signed certificate
(browsers warn until you get a real one):

```bash
bash deploy/scripts/gen-self-signed.sh <server-ip>
```

> Changing `NEXT_PUBLIC_SITE_URL` (or `BACKEND_URL`) requires rebuilding the web
> image — those values are inlined into the Next.js build. The TLS scripts do
> that for you.

### Everyday operations

```bash
docker compose ps                     # service status + health
docker compose logs -f backend         # API logs
docker compose logs -f frontend        # web logs
docker compose restart backend         # restart one service
docker compose up -d --build           # deploy code changes
bash deploy/scripts/backup-mongo.sh     # gzipped mongodump into ./backups
```

Restore a backup:

```bash
gunzip -c backups/academy-<stamp>.gz | docker compose exec -T mongo mongorestore \
  --archive --gzip --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin --drop
```

Uploads live in the `uploads-data` volume (saved when Cloudinary is not
configured), so they survive redeploys. Configure Cloudinary in `.env` if you
prefer off-server storage, and SMTP/Razorpay to turn on email and online
payments.

### Without Docker

- Backend: `npm ci --omit=dev && NODE_ENV=production npm start` (systemd or PM2)
- Frontend: `npm ci && npm run build && npm run start` (PM2)
- Put nginx/Caddy in front for TLS, set `TRUST_PROXY=1`, keep the Mongo instance
  private, and set `COOKIE_SECURE=true` once HTTPS is live.

## Notable design decisions

- **Money is server-authoritative.** Course prices come from the database; the
  client never sends amounts. Razorpay amounts are sent in paise and verified by
  signature before a payment is marked paid.
- **Capacity is race-safe.** Enrollment uses an atomic conditional `$inc` so a
  batch can never be over-enrolled.
- **No fabricated success.** Offline payments are recorded explicitly as
  `provider: 'offline'`; the system never pretends a gateway call succeeded.
- **Consistent responses.** Every API response is
  `{ success, message, data?, meta?, errors? }`, with a shared `paginated()`
  helper producing `{ total, page, limit, totalPages, hasNext, hasPrev }`.
- **PATCH-safe validation.** Update endpoints use
  `validate(schema.partial(), 'body', { providedOnly: true })` so partial bodies
  don't get filled with defaults.
- **Accessible, dependency-light UI.** A small in-house component library
  (buttons, cards, tables, modals, toasts, uploader) keeps the bundle small and
  the styling consistent.
