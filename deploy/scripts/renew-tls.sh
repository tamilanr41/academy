#!/usr/bin/env bash
#
# Renews Let's Encrypt certificates and reloads nginx.
# Suggested cron entry (weekly):
#   17 3 * * 1 cd /path/to/ACADEMY && bash deploy/scripts/renew-tls.sh >> /var/log/academy-tls.log 2>&1
#
set -euo pipefail
cd "$(dirname "$0")/../.."

docker compose run --rm certbot renew --webroot -w /var/www/certbot
docker compose exec nginx nginx -s reload
echo "✓ Certificate renewal check complete."
