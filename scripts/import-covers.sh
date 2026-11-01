#!/usr/bin/env bash
# Imports the cover files from public/images/ into GridFS (Phase 10). Safe to re-run: --replace swaps a file
# that is already there. Needs only Docker: mongofiles and mongosh come from the mongo:8.0 image.
#
# Usage (Git Bash, from anywhere):
#   MONGO_URI='mongodb://host.docker.internal:27017' scripts/import-covers.sh            # local compose Mongo
#   MONGO_URI='mongodb+srv://user:pass@cluster/' scripts/import-covers.sh readersDB_staging
# The URI comes from the environment (keeps the password out of the shell history), without a database path.
# The database is the first argument, default readersDB.
set -euo pipefail

db="${1:-readersDB}"
: "${MONGO_URI:?Set MONGO_URI to the Mongo connection string (no database path)}"

# pwd -W (Git Bash): a Windows path like C:/Users/..., which Docker Desktop can mount
repo="$(cd "$(dirname "$0")/.." && pwd -W)"
covers="$repo/public/images"

# MSYS_NO_PATHCONV: stop Git Bash rewriting the container paths
MSYS_NO_PATHCONV=1 docker run --rm -e MONGO_URI -e DB="$db" -v "$covers:/covers:ro" mongo:8.0 bash -c '
  set -euo pipefail
  cd /covers
  count=0
  for f in *.jpg; do
    mongofiles --uri "$MONGO_URI" --db "$DB" --quiet put --replace --type image/jpeg "$f" > /dev/null
    count=$((count + 1))
  done
  echo "Imported $count files into $DB"
  mongosh "$MONGO_URI" --quiet --eval "
    const d = db.getSiblingDB(\"$DB\");
    print(\"Files in GridFS: \" + d.getCollection(\"fs.files\").countDocuments());
    const names = new Set(d.getCollection(\"fs.files\").distinct(\"filename\"));
    const missing = d.books.find({image: {\$exists: true}}, {title: 1, image: 1}).toArray()
      .filter(b => !names.has(b.image.replace(/^images\//, \"\")));
    print(\"Books whose cover is missing: \" + missing.length);
    missing.forEach(b => print(\"  \" + b.title + \" -> \" + b.image));
  "
'
