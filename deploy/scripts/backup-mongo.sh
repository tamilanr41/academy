#!/usr/bin/env bash
#
# Dumps the `academy` database into ./backups as a gzipped mongodump archive.
#   bash deploy/scripts/backup-mongo.sh
#
# Restore with:
#   gunzip -c backups/academy-<stamp>.gz | \
#     docker compose exec -T mongo mongorestore --archive --gzip \
#       --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
#       --authenticationDatabase admin --drop
#
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ ! -f .env ]; then
  echo "✗ .env not found."
  exit 1
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a

mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/academy-$STAMP.gz"

docker compose exec -T mongo sh -c \
  "mongodump --archive --gzip --db academy --username '$MONGO_ROOT_USERNAME' --password '$MONGO_ROOT_PASSWORD' --authenticationDatabase admin" >"$OUT"

echo "✓ Backup written: $OUT"
ls -lh "$OUT"
