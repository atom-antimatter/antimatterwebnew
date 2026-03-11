#!/usr/bin/env bash
# Extract frames from the Clinix exploding device GIF for scroll-scrub animation.
# Requires: ffmpeg
#
# Usage: ./scripts/extract-clinix-frames.sh
# Output: public/clinix-frames/frame_0001.png, frame_0002.png, ... + manifest.json

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GIF="$ROOT/public/clinix-exploded.gif"
OUT_DIR="$ROOT/public/clinix-frames"

if [ ! -f "$GIF" ]; then
  echo "Error: $GIF not found. Add the source GIF first." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Extract every frame as PNG (ffmpeg will name frame_0001.png, frame_0002.png, ...)
echo "Extracting frames from $GIF ..."
ffmpeg -y -i "$GIF" -vsync 0 "$OUT_DIR/frame_%04d.png" 2>/dev/null || true

# Count frames and write manifest for the app
COUNT=0
for f in "$OUT_DIR"/frame_*.png; do
  [ -f "$f" ] && COUNT=$((COUNT + 1))
done

echo "{\"totalFrames\": $COUNT}" > "$OUT_DIR/manifest.json"
echo "Wrote $COUNT frames and manifest.json to $OUT_DIR"
