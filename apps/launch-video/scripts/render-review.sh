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

render_scene 55   "$OUT_DIR/01-bait.png"
render_scene 120  "$OUT_DIR/02-bait-build.png"
render_scene 160  "$OUT_DIR/03-bait-break.png"
render_scene 210  "$OUT_DIR/04-splash.png"
render_scene 285  "$OUT_DIR/05-boot-complete.png"
render_scene 296  "$OUT_DIR/06-backlog-typing.png"
render_scene 310  "$OUT_DIR/07-backlog-category-menu.png"
render_scene 365  "$OUT_DIR/08-backlog-category-scroll.png"
render_scene 420  "$OUT_DIR/09-backlog-table.png"
render_scene 450  "$OUT_DIR/10-take-ticket-ready.png"
render_scene 472  "$OUT_DIR/11-jira-imported.png"
render_scene 548  "$OUT_DIR/12-routing-typing.png"
render_scene 588  "$OUT_DIR/13-routing-processing.png"
render_scene 678  "$OUT_DIR/14-routing-response.png"
render_scene 808  "$OUT_DIR/15-first-achievement-redux-typing.png"
render_scene 853  "$OUT_DIR/16-buddy-auto-spawn.png"
render_scene 873  "$OUT_DIR/17-redux-processing.png"
render_scene 1068 "$OUT_DIR/18-redux-response-buddy.png"
render_scene 1090 "$OUT_DIR/19-unit-tests-attempt.png"
render_scene 1126 "$OUT_DIR/20-backspace-of-shame.png"
render_scene 1148 "$OUT_DIR/21-prod-typing.png"
render_scene 1188 "$OUT_DIR/22-prod-processing.png"
render_scene 1298 "$OUT_DIR/23-prod-response.png"
render_scene 1343 "$OUT_DIR/24-rollback-typing.png"
render_scene 1388 "$OUT_DIR/25-rollback-processing.png"
render_scene 1498 "$OUT_DIR/26-rollback-response.png"
render_scene 1553 "$OUT_DIR/27-post-rollback.png"
render_scene 1806 "$OUT_DIR/28-terminal-cta.png"

if command -v montage >/dev/null 2>&1; then
  montage "$OUT_DIR"/*.png -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 7x -geometry +0+0 "$OUT_DIR/review-contact-sheet.png"
elif command -v magick >/dev/null 2>&1; then
  magick montage "$OUT_DIR"/*.png -resize 270x270 -bordercolor '#020617' -border 8 -background '#020617' -tile 7x -geometry +0+0 "$OUT_DIR/review-contact-sheet.png"
fi
