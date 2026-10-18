#!/usr/bin/env bash
#
# Enables HTTPS with a Let's Encrypt certificate and points the app at it.
#   bash deploy/scripts/enable-tls.sh <domain> [email]
#
set -euo pipefail
cd "$(dirname "$0")/../.."

DOMAIN="${1:-}"
EMAIL="${2:-}"
if [ -z "$DOMAIN" ]; then
  echo "usage: bash deploy/scripts/enable-tls.sh <domain> [email]"
  exit 1
fi
if [ -z "$EMAIL" ]; then
  read -r -p "Email for Let's Encrypt notices: " EMAIL
fi
if [ ! -f .env ]; then
  echo "✗ .env not found. Run deploy/scripts/bootstrap.sh first."
  exit 1
fi

CONF_DIR=deploy/nginx/conf.d
HTTP_TEMPLATE="$CONF_DIR/app-http.conf.disabled"

# Keep a pristine copy of the HTTP config, then make sure HTTP is active so the
# ACME challenge can be served.
if [ ! -f "$HTTP_TEMPLATE" ]; then
  cp "$CONF_DIR/app.conf" "$HTTP_TEMPLATE"
fi
cp "$HTTP_TEMPLATE" "$CONF_DIR/app.conf"

echo "→ Starting nginx (HTTP)…"
docker compose up -d nginx

echo "→ Requesting certificate for $DOMAIN…"
docker compose run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email --keep-until-expiring

echo "→ Activating the TLS server block…"
sed "s/__DOMAIN__/$DOMAIN/g" "$CONF_DIR/app-ssl-le.conf.disabled" > "$CONF_DIR/app.conf"
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

echo "→ Switching the app to https://$DOMAIN …"
set_env() { # key value
  if grep -q "^$1=" .env; then
    sed -i "s|^$1=.*|$1=$2|" .env
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}
set_env NEXT_PUBLIC_SITE_URL "https://$DOMAIN"
set_env FRONTEND_URL "https://$DOMAIN"
set_env CORS_ORIGINS "https://$DOMAIN,https://www.$DOMAIN"
set_env BACKEND_PUBLIC_URL "https://$DOMAIN"
set_env COOKIE_SECURE "true"

echo "→ Rebuilding the web image (the site URL is baked in at build time)…"
docker compose build frontend
docker compose up -d

cat <<EOF

✓ HTTPS enabled.

  Site:  https://$DOMAIN
  Renew: bash deploy/scripts/renew-tls.sh     (add to cron weekly)

  Note: if you enabled TLS after logging in, the old HTTP cookie is now
  invalid — visitors just log in again.
EOF
