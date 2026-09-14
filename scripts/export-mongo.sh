#!/usr/bin/env bash
# Exports the MongoDB collections behind the hub to EJSON files, ready for
# scripts/import-mongo.mjs.
#
# Usage:
#   bash scripts/export-mongo.sh "mongodb+srv://readonly_user:PASSWORD@cluster0.xxxxx.mongodb.net/"
#
# Make a read-only database user for this and delete it afterwards, rather
# than using your main credentials.

set -euo pipefail

URI="${1:-}"
DB="${MONGO_DB:-avsph}"
OUT="${2:-avsph_export}"

if [ -z "$URI" ]; then
  echo "Usage: bash scripts/export-mongo.sh \"mongodb+srv://user:pass@host/\" [outdir]" >&2
  exit 1
fi

COLLECTIONS=(
  admins applicants attendance blogs bookings businesses clients comments
  compensation_profiles eod_reports exchange_rates invoices jobPosts leads staff
)

mkdir -p "$OUT"

# Resolve mongosh once instead of on every loop iteration.
if command -v mongosh >/dev/null 2>&1; then
  MONGOSH=(mongosh)
else
  echo "mongosh not found, using npx (first run downloads it)"
  MONGOSH=(npx --yes mongosh)
fi

for COLL in "${COLLECTIONS[@]}"; do
  printf '  %-24s' "$COLL"
  # getCollection rather than dot access, so names that are not valid JS
  # identifiers still work.
  "${MONGOSH[@]}" "$URI" --quiet --eval \
    "EJSON.stringify(db.getSiblingDB('$DB').getCollection('$COLL').find().toArray())" \
    > "$OUT/$COLL.json"

  COUNT=$(node -e "
    const fs = require('fs');
    try {
      const raw = fs.readFileSync('$OUT/$COLL.json', 'utf8').trim();
      console.log(raw ? JSON.parse(raw).length : 0);
    } catch { console.log('PARSE ERROR'); }
  ")
  echo "$COUNT documents"
done

echo ""
echo "Done. Zip '$OUT' and send it back:"
echo "  zip -r $OUT.zip $OUT"
