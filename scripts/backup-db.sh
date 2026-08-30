#!/usr/bin/env bash
# Nightly backup of the DEW Postgres database. Run via cron on the VPS:
#   0 3 * * * /var/www/dew/scripts/backup-db.sh >> /var/log/dew-backup.log 2>&1
#
# Keeps the last 14 daily backups locally under /var/backups/dew-db and
# deletes anything older. This is LOCAL-ONLY — it protects against
# accidental data corruption or a bad migration, but NOT against the VPS
# itself failing (disk failure, provider issue, etc). For real
# off-box protection, add a step at the bottom to copy the latest dump
# somewhere else (rclone to Backblaze/S3, a second server, etc) — flagged
# here rather than silently skipped.

set -euo pipefail

BACKUP_DIR="/var/backups/dew-db"
DB_NAME="dew"
DB_USER="dew_app"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
OUT_FILE="$BACKUP_DIR/dew_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup of $DB_NAME -> $OUT_FILE"

# PGPASSWORD should be set in the environment this script runs under, or
# use a .pgpass file (safer — avoids the password ever appearing in
# process listings). See: https://www.postgresql.org/docs/current/libpq-pgpass.html
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$OUT_FILE"

if [ ! -s "$OUT_FILE" ]; then
  echo "[$(date)] ERROR: backup file is empty — something went wrong" >&2
  exit 1
fi

echo "[$(date)] Backup complete: $(du -h "$OUT_FILE" | cut -f1)"

# Prune anything older than RETENTION_DAYS
find "$BACKUP_DIR" -name "dew_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "[$(date)] Pruned backups older than $RETENTION_DAYS days"

# --- Off-box copy (recommended, currently disabled) ---
# Uncomment and configure once you've set up a remote target, e.g. with
# rclone (rclone.org) pointed at Backblaze B2, S3, or another provider:
#
#   rclone copy "$OUT_FILE" remote:dew-backups/
#
# Without this, backups only protect against bad deploys/migrations, not
# the VPS itself going down or its disk failing.

echo "[$(date)] Done."
