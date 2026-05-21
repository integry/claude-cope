#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

bash scripts/render-review.sh
npx remotion render src/index.ts LaunchVideo out/launch-video.mp4
bash scripts/render-reddit-video.sh out/launch-video.mp4 out/launch-video-reddit.mp4
bash scripts/render-second-contact-sheet.sh out/launch-video.mp4
