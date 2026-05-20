#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run build:css

OUT_DIR="out/review"
mkdir -p "$OUT_DIR"
find "$OUT_DIR" -maxdepth 1 -type f -name '*.png' -delete

render_scene() {
  local frame="$1"
  local output="$2"
  npx remotion still src/index.ts LaunchVideo "$output" --frame "$frame"
}

render_scene 90   "$OUT_DIR/01-bait.png"
render_scene 260  "$OUT_DIR/02-bait-build.png"
render_scene 302  "$OUT_DIR/03-bait-break.png"
render_scene 385  "$OUT_DIR/04-splash.png"
render_scene 580  "$OUT_DIR/05-boot-complete.png"
render_scene 652  "$OUT_DIR/06-backlog-typing.png"
render_scene 705  "$OUT_DIR/07-backlog-category-menu.png"
render_scene 875  "$OUT_DIR/08-backlog-category-scroll.png"
render_scene 930  "$OUT_DIR/09-backlog-table.png"
render_scene 1025 "$OUT_DIR/10-take-ticket-typing.png"
render_scene 1100 "$OUT_DIR/11-jira-imported.png"
render_scene 1225 "$OUT_DIR/12-routing-typing.png"
render_scene 1285 "$OUT_DIR/13-routing-processing.png"
render_scene 1425 "$OUT_DIR/14-routing-response.png"
render_scene 1725 "$OUT_DIR/15-buddy-typing.png"
render_scene 1785 "$OUT_DIR/16-buddy-active.png"
render_scene 1870 "$OUT_DIR/17-redux-typing.png"
render_scene 1980 "$OUT_DIR/18-redux-processing-buddy.png"
render_scene 2395 "$OUT_DIR/19-redux-response.png"
render_scene 2463 "$OUT_DIR/20-unit-tests-attempt.png"
render_scene 2521 "$OUT_DIR/21-backspace-of-shame.png"
render_scene 2547 "$OUT_DIR/22-prod-typing.png"
render_scene 2625 "$OUT_DIR/23-prod-processing.png"
render_scene 2725 "$OUT_DIR/24-prod-response.png"
render_scene 3083 "$OUT_DIR/25-rollback-typing.png"
render_scene 3170 "$OUT_DIR/26-rollback-processing.png"
render_scene 3305 "$OUT_DIR/27-rollback-response.png"
render_scene 3615 "$OUT_DIR/28-terminal-cta.png"

if command -v montage >/dev/null 2>&1; then
  montage "$OUT_DIR"/*.png -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 7x -geometry +0+0 "$OUT_DIR/review-contact-sheet.png"
elif command -v magick >/dev/null 2>&1; then
  magick montage "$OUT_DIR"/*.png -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 7x -geometry +0+0 "$OUT_DIR/review-contact-sheet.png"
fi
