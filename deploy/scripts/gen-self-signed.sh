#!/usr/bin/env bash
#
# Generates a self-signed certificate and serves the site over HTTPS.
# Useful before a real domain exists: the auth cookie needs HTTPS when
# COOKIE_SECURE=true, and browsers warn until you get a real certificate.
#
#   bash deploy/scripts/gen-self-signed.sh [server-ip-or-hostname]
#
# Replace it later with:  bash deploy/scripts/enable-tls.sh <domain> <email>
#
set -euo pipefail
cd "$(dirname "$0")/../.."

NAME="${1:-}"
if [ -z "$NAME" ]; then
  NAME="$(hostname -I 2>/dev/null | awk '{print $1}')"
fi
if [ -z "$NAME" ]; then
  echo "usage: bash deploy/scripts/gen-self-signed.sh <server-ip-or-hostname>"
  exit 1
fi
if [ ! -f .env ]; then
  echo "✗ .env not found. Run deploy/scripts/bootstrap.sh first."
  exit 1
fi
command -v openssl >/dev/null 2>&1 || { echo "✗ openssl not installed (apt install openssl)"; exit 1; }

CERT_DIR=deploy/nginx/certs
mkdir -p "$CERT_DIR"

if [[ "$NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  SAN="IP:$NAME,DNS:localhost,IP:127.0.0.1"
else
  SAN="DNS:$NAME,DNS:localhost,IP:127.0.0.1"
fi

echo "→ Creating a self-signed certificate for $NAME…"
openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
  -keyout "$CERT_DIR/self.key" -out "$CERT_DIR/self.crt" \
  -subj "/CN=$NAME" -addext "subjectAltName=$SAN" >/dev/null 2>&1
chmod 600 "$CERT_DIR/self.key"

CONF_DIR=deploy/nginx/conf.d
if [ ! -f "$CONF_DIR/app-http.conf.disabled" ]; then
  cp "$CONF_DIR/app.conf" "$CONF_DIR/app-http.conf.disabled"
fi

echo "→ Activating the self-signed TLS server block…"
sed "s/__SERVER_NAME__/$NAME/g" "$CONF_DIR/app-ssl-selfsigned.conf.disabled" > "$CONF_DIR/app.conf"

echo "→ Pointing the app at https://$NAME …"
set_env() {
  if grep -q "^$1=" .env; then
    sed -i "s|^$1=.*|$1=$2|" .env
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}
set_env NEXT_PUBLIC_SITE_URL "https://$NAME"
set_env FRONTEND_URL "https://$NAME"
set_env CORS_ORIGINS "https://$NAME"
set_env BACKEND_PUBLIC_URL "https://$NAME"
set_env COOKIE_SECURE "true"

docker compose build frontend
docker compose up -d
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

cat <<EOF

✓ HTTPS enabled with a self-signed certificate.

  Site: https://$NAME   (your browser will show a "not private" warning — expected)
  When your domain is ready, replace this certificate:
    bash deploy/scripts/enable-tls.sh <domain> <email>
EOF
