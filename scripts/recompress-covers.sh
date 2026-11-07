#!/usr/bin/env bash
# One-off: shrinks the cover files in GridFS to at most 600 px wide (JPEG quality 80), the size the UI needs.
# Filenames and the books stay the same; only the bytes change (and with them the file id, so the ETag).
# Needs only Docker: mongofiles and mongosh come from mongo:8.0, Pillow from python:3.13-slim.
#
# Usage (Git Bash, from anywhere):
#   MONGO_URI='mongodb://host.docker.internal:27017' scripts/recompress-covers.sh <backup-dir>            # dry run
#   MONGO_URI='mongodb://host.docker.internal:27017' APPLY=1 scripts/recompress-covers.sh <backup-dir>    # write
#   MONGO_URI='mongodb+srv://user:pass@cluster/' APPLY=1 scripts/recompress-covers.sh <backup-dir> readersDB
# The URI comes from the environment (keeps the password out of the shell history), without a database path.
# <backup-dir> must be a new, empty folder outside the repo: the originals go to <backup-dir>/original, the
# shrunk files to <backup-dir>/shrunk. To undo, put the originals back with mongofiles put --replace.
# The database is the second argument, default readersDB.
set -euo pipefail

backup="${1:?Give a new, empty backup folder outside the repo}"
db="${2:-readersDB}"
: "${MONGO_URI:?Set MONGO_URI to the Mongo connection string (no database path)}"

mkdir -p "$backup"
if [ -n "$(ls -A "$backup")" ]; then
  echo "Backup folder $backup is not empty" >&2
  exit 1
fi
mkdir "$backup/original" "$backup/shrunk"
# pwd -W (Git Bash): a Windows path like C:/Users/..., which Docker Desktop can mount
host="$(cd "$backup" && pwd -W)"

# MSYS_NO_PATHCONV: stop Git Bash rewriting the container paths
mongo() { MSYS_NO_PATHCONV=1 docker run --rm -e MONGO_URI -e DB="$db" -v "$host:/backup" mongo:8.0 bash -c "$1"; }

echo "1. Backing up every cover from $db"
mongo '
  set -euo pipefail
  cd /backup/original
  mongosh "$MONGO_URI" --quiet --eval "db.getSiblingDB(\"$DB\").getCollection(\"fs.files\").distinct(\"filename\").forEach(f => print(f))" > /tmp/names
  while IFS= read -r f; do
    mongofiles --uri "$MONGO_URI" --db "$DB" --quiet get --local "$f" "$f" > /dev/null
  done < /tmp/names
  expected=$(wc -l < /tmp/names); got=$(ls | wc -l)
  echo "   $got of $expected files saved"
  [ "$got" -eq "$expected" ] || { echo "   Backup incomplete, stopping" >&2; exit 1; }
'

echo "2. Shrinking"
MSYS_NO_PATHCONV=1 docker run --rm -v "$host:/backup" python:3.13-slim bash -c '
  pip install --quiet --disable-pip-version-check --root-user-action=ignore pillow==11.3.0
  python -I - <<"EOF"
import os
from PIL import Image, ImageOps

MAX_WIDTH, QUALITY = 600, 80
src, dst = "/backup/original", "/backup/shrunk"
before = after = changed = 0
for name in sorted(os.listdir(src)):
    path = os.path.join(src, name)
    size = os.path.getsize(path)
    before += size
    im = Image.open(path)
    is_jpeg = im.format == "JPEG"
    im = ImageOps.exif_transpose(im)  # browsers apply EXIF rotation; the re-encoded file drops EXIF
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        white = Image.new("RGB", im.size, "white")
        white.paste(im, mask=im.getchannel("A"))
        im = white
    im = im.convert("RGB")
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    out = os.path.join(dst, name)
    im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    new = os.path.getsize(out)
    # Keep a real JPEG that would not get smaller; a PNG under a .jpg name is always converted
    if is_jpeg and new >= size:
        os.remove(out)
        after += size
    else:
        after += new
        changed += 1
print(f"   {changed} files shrunk; total {before / 1048576:.1f} MB -> {after / 1048576:.1f} MB")
EOF
'

if [ "${APPLY:-}" != "1" ]; then
  echo "Dry run: nothing written. Check $backup/shrunk, then run again with APPLY=1 and a new backup folder."
  exit 0
fi

echo "3. Replacing the shrunk covers in $db"
mongo '
  set -euo pipefail
  cd /backup/shrunk
  count=0
  for f in *; do
    [ -f "$f" ] || continue
    mongofiles --uri "$MONGO_URI" --db "$DB" --quiet put --replace --type image/jpeg "$f" > /dev/null
    count=$((count + 1))
  done
  echo "   Replaced $count files"
  mongosh "$MONGO_URI" --quiet --eval "
    const d = db.getSiblingDB(\"$DB\");
    print(\"   Files in GridFS: \" + d.getCollection(\"fs.files\").countDocuments());
    const names = new Set(d.getCollection(\"fs.files\").distinct(\"filename\"));
    const missing = d.books.find({image: {\$exists: true}}, {title: 1, image: 1}).toArray()
      .filter(b => !names.has(b.image.replace(/^images\//, \"\")));
    print(\"   Books whose cover is missing: \" + missing.length);
    missing.forEach(b => print(\"     \" + b.title + \" -> \" + b.image));
  "
'
