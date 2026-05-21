#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VIDEO_PATH="${1:-out/launch-video.mp4}"
OUT_DIR="out/review"
SECOND_DIR="$OUT_DIR/seconds"
OUT_PATH="$OUT_DIR/every-second-contact-sheet.png"
TOTAL_FRAMES=1860
FPS=30

mkdir -p "$OUT_DIR"
mkdir -p "$SECOND_DIR"

if command -v ffmpeg >/dev/null 2>&1; then
  if [[ ! -f "$VIDEO_PATH" ]]; then
    echo "Video not found: $VIDEO_PATH" >&2
    exit 1
  fi

  ffmpeg -hide_banner -loglevel error -y \
    -i "$VIDEO_PATH" \
    -vf "fps=1,scale=270:270:flags=lanczos,tile=6x11" \
    -frames:v 1 \
    "$OUT_PATH"

  echo "$OUT_PATH"
  exit 0
fi

find "$SECOND_DIR" -maxdepth 1 -type f -name '*.png' -delete

SECOND_FRAMES=()
last_frame=$((TOTAL_FRAMES - 1))
last_second=$((last_frame / FPS))

for second in $(seq 0 "$last_second"); do
  frame=$((second * FPS))
  if ((frame > last_frame)); then
    frame="$last_frame"
  fi
  output="$SECOND_DIR/$(printf '%03d' "$second")s.png"
  npx remotion still src/index.ts LaunchVideo "$output" --frame "$frame"
  SECOND_FRAMES+=("$output")
done

if command -v montage >/dev/null 2>&1; then
  montage "${SECOND_FRAMES[@]}" -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 6x -geometry +0+0 "$OUT_PATH"
elif command -v magick >/dev/null 2>&1; then
  magick montage "${SECOND_FRAMES[@]}" -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 6x -geometry +0+0 "$OUT_PATH"
else
  echo "Neither ffmpeg nor ImageMagick is available; per-second stills are in $SECOND_DIR." >&2
  exit 1
fi

echo "$OUT_PATH"
