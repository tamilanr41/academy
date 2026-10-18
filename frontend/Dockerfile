# --- Next.js 16 production image (standalone output) ---
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
# These are inlined at build time: the rewrite proxy target and the canonical site URL.
ARG BACKEND_URL=http://backend:5000
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV BACKEND_URL=$BACKEND_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# The image optimizer writes to .next/cache at runtime, so it must be writable
# by the unprivileged runtime user.
RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next

USER node
EXPOSE 3000

CMD ["node", "server.js"]
