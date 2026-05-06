#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_VARS="$ROOT_DIR/apps/backend/.dev.vars"

if [[ ! -f "$DEV_VARS" ]]; then
  echo "Missing $DEV_VARS" >&2
  exit 1
fi

OPENROUTER_API_KEY="$(sed -n 's/^OPENROUTER_API_KEY=//p' "$DEV_VARS" | head -n1)"
if [[ -z "$OPENROUTER_API_KEY" ]]; then
  echo "OPENROUTER_API_KEY not found in $DEV_VARS" >&2
  exit 1
fi

cd "$ROOT_DIR/apps/frontend"
unset E2E_CHAT_BASE_URL
unset BACKEND_URL
export OPENROUTER_API_KEY

npx vitest run -c vitest.e2e.config.ts src/__tests__/e2e-llm.test.ts "$@"
