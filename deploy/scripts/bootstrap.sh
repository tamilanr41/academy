#!/usr/bin/env bash
#
# One-command deploy (run on the server, from the repo root):
#   bash deploy/scripts/bootstrap.sh
#
set -euo pipefail
cd "$(dirname "$0")/../.."

command -v docker >/dev/null 2>&1 || {
  echo "✗ Docker is not installed. Install it first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  exit 1
}
docker compose version >/dev/null 2>&1 || {
  echo "✗ The 'docker compose' plugin is missing (needs Docker Engine 20.10+)."
  exit 1
}

if [ ! -f .env ]; then
  cp .env.production.example .env
  cat <<'EOF'
→ Created .env from .env.production.example

  Edit .env and set at least:
    MONGO_ROOT_PASSWORD      (strong password)
    JWT_SECRET               node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
    SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD
    NEXT_PUBLIC_SITE_URL     http://<your-server-ip>   (or https://<domain>)
    CORS_ORIGINS             same value as NEXT_PUBLIC_SITE_URL
    COOKIE_SECURE            false for plain HTTP, true once HTTPS is on

  Then run this script again.
EOF
  exit 0
fi

# shellcheck disable=SC1091
set -a; . ./.env; set +a

# nginx bind-mounts this directory (empty until TLS is enabled).
mkdir -p deploy/nginx/certs

fail=0
check() { # name value minlen
  local name="$1" value="${2:-}" minlen="${3:-1}"
  if [ -z "$value" ] || [[ "$value" == CHANGE* ]] || [ "${#value}" -lt "$minlen" ]; then
    echo "✗ Set a valid $name in .env (min ${minlen} chars, not the placeholder)."
    fail=1
  fi
}
check MONGO_ROOT_PASSWORD "${MONGO_ROOT_PASSWORD:-}" 12
check JWT_SECRET "${JWT_SECRET:-}" 32
check SUPER_ADMIN_PASSWORD "${SUPER_ADMIN_PASSWORD:-}" 10

if [[ "${NEXT_PUBLIC_SITE_URL:-}" == *YOUR_SERVER_IP* || -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  echo "✗ Set NEXT_PUBLIC_SITE_URL in .env (http://<your-server-ip> or https://<domain>)."
  fail=1
fi
if [[ "${CORS_ORIGINS:-}" == *YOUR_SERVER_IP* || -z "${CORS_ORIGINS:-}" ]]; then
  echo "✗ Set CORS_ORIGINS in .env (comma-separated allowlist, same as the site URL)."
  fail=1
fi
[ "$fail" -eq 0 ] || exit 1

echo "→ Building images (first run takes a few minutes)…"
docker compose build

echo "→ Starting services…"
docker compose up -d

echo "→ Waiting for the API…"
for i in $(seq 1 60); do
  if curl -fsS http://localhost/api/health >/dev/null 2>&1; then
    echo "✓ API is healthy"
    break
  fi
  sleep 5
  if [ "$i" -eq 60 ]; then
    echo "✗ API did not become healthy. Check logs:  docker compose logs backend"
    exit 1
  fi
done

cat <<'EOF'

✓ Deployment is running.

Next steps
  1. Create the first super admin:
       docker compose exec backend node src/seeders/runSeeder.js --superadmin

  2. Optional — import the starter catalogue (3 categories, 5 trainers, 19 courses):
       docker compose exec backend node src/seeders/runSeeder.js --demo
       docker compose exec backend npm run clear:demo-users

  3. Log in and open the admin panel:
       <NEXT_PUBLIC_SITE_URL>/login   ->   /admin

  4. HTTPS:
       # domain ready:
       bash deploy/scripts/enable-tls.sh academy.example.com you@example.com
       # no domain yet (self-signed, browser warning):
       bash deploy/scripts/gen-self-signed.sh <server-ip>

  Backups:  bash deploy/scripts/backup-mongo.sh
EOF
