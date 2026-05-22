#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SOURCE_VIDEO="${1:-out/launch-video.mp4}"
OUT_VIDEO="${2:-out/launch-video-reddit.mp4}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to generate the Reddit video export." >&2
  exit 1
fi

if [ ! -f "$SOURCE_VIDEO" ]; then
  echo "Source video not found: $SOURCE_VIDEO" >&2
  echo "Run npm run render:video first, or pass an existing source video path." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT_VIDEO")"

ffmpeg -hide_banner -loglevel error -y \
  -i "$SOURCE_VIDEO" \
  -vf "scale=720:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 \
  -profile:v high \
  -level 4.0 \
  -pix_fmt yuv420p \
  -color_range tv \
  -preset medium \
  -crf 28 \
  -movflags +faststart \
  -c:a aac \
  -b:a 96k \
  "$OUT_VIDEO"

ls -lh "$OUT_VIDEO"
