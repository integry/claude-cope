#!/usr/bin/env bash
# Deploy Claude Cope to staging or production.
# Usage: scripts/deploy.sh <staging|production> [flags]
#
# Flags:
#   --migrate        Apply D1 schema before deploying
#   --skip-partykit  Skip PartyKit deployment
#   --backend-only   Deploy only the Worker
#   --frontend-only  Deploy only the Pages frontend
set -euo pipefail

USAGE="Usage: scripts/deploy.sh <staging|production> [--migrate] [--skip-partykit] [--backend-only] [--frontend-only]"
ENV="${1:?$USAGE}"
shift

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "Environment must be 'staging' or 'production'"
  exit 1
fi

MIGRATE=false
SKIP_PARTYKIT=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --migrate)        MIGRATE=true; shift;;
    --skip-partykit)  SKIP_PARTYKIT=true; shift;;
    --backend-only)   BACKEND_ONLY=true; shift;;
    --frontend-only)  FRONTEND_ONLY=true; shift;;
    *) echo "Unknown flag: $1"; echo "$USAGE"; exit 1;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.$ENV"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy .env.example to .env.$ENV and fill in values."
  exit 1
fi

# Export all env vars so VITE_* are available during the frontend build
set -a
source "$ENV_FILE"
set +a

# Validate required vars
for var in CF_WORKER_NAME CF_D1_DATABASE_NAME CF_D1_DATABASE_ID OPENROUTER_API_KEY CF_PAGES_PROJECT ALLOWED_ORIGINS; do
  if [[ -z "${!var:-}" ]]; then
    echo "$var is not set in $ENV_FILE"
    exit 1
  fi
done

# ── Generate temporary wrangler config ───────────────
WRANGLER_CFG=$(mktemp /tmp/wrangler-XXXX.toml)
trap "rm -f $WRANGLER_CFG" EXIT

ROUTES_BLOCK=""
if [[ -n "${CF_WORKER_ROUTE:-}" ]]; then
  if [[ -n "${CF_WORKER_ZONE:-}" ]]; then
    ROUTES_BLOCK="
[[routes]]
pattern = \"$CF_WORKER_ROUTE\"
zone_name = \"$CF_WORKER_ZONE\""
  else
    ROUTES_BLOCK="
[[routes]]
pattern = \"$CF_WORKER_ROUTE\"
custom_domain = true"
  fi
fi

cat > "$WRANGLER_CFG" <<EOF
name = "$CF_WORKER_NAME"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
ALLOWED_ORIGINS = "$ALLOWED_ORIGINS"
$ROUTES_BLOCK

[[d1_databases]]
binding = "DB"
database_name = "$CF_D1_DATABASE_NAME"
database_id = "$CF_D1_DATABASE_ID"
EOF

echo "==> Deploying [$ENV]"
echo ""

# ── D1 schema migration ─────────────────────────────
if $MIGRATE; then
  echo "--- Applying D1 schema to $CF_D1_DATABASE_NAME ---"
  (cd "$ROOT/apps/backend" && wrangler d1 execute "$CF_D1_DATABASE_NAME" \
    --remote --yes \
    --file="$ROOT/apps/backend/schema.sql" \
    --config "$WRANGLER_CFG")
  echo ""
fi

# ── Backend (Cloudflare Worker) ──────────────────────
if ! $FRONTEND_ONLY; then
  echo "--- Deploying Worker: $CF_WORKER_NAME ---"
  (cd "$ROOT/apps/backend" && wrangler deploy --config "$WRANGLER_CFG")
  echo ""

  echo "--- Setting Worker secrets ---"
  echo "$OPENROUTER_API_KEY" | (cd "$ROOT/apps/backend" && wrangler secret put OPENROUTER_API_KEY --config "$WRANGLER_CFG")
  if [[ -n "${OPENROUTER_PROVIDERS:-}" ]]; then
    echo "$OPENROUTER_PROVIDERS" | (cd "$ROOT/apps/backend" && wrangler secret put OPENROUTER_PROVIDERS --config "$WRANGLER_CFG")
  fi
  if [[ -n "${OPENROUTER_PROVIDERS_FREE_ONLY:-}" ]]; then
    echo "$OPENROUTER_PROVIDERS_FREE_ONLY" | (cd "$ROOT/apps/backend" && wrangler secret put OPENROUTER_PROVIDERS_FREE_ONLY --config "$WRANGLER_CFG")
  fi
  if [[ -n "${ENABLE_TICKET_REFINE:-}" ]]; then
    echo "$ENABLE_TICKET_REFINE" | (cd "$ROOT/apps/backend" && wrangler secret put ENABLE_TICKET_REFINE --config "$WRANGLER_CFG")
  fi
  echo ""
fi

# ── Frontend (Cloudflare Pages) ──────────────────────
if ! $BACKEND_ONLY; then
  echo "--- Building frontend ---"
  (cd "$ROOT/apps/frontend" && npm run build)
  echo ""

  echo "--- Deploying Pages: $CF_PAGES_PROJECT ---"
  (cd "$ROOT/apps/frontend" && wrangler pages deploy dist --project-name "$CF_PAGES_PROJECT")
  echo ""
fi

# ── PartyKit ─────────────────────────────────────────
if ! $BACKEND_ONLY && ! $FRONTEND_ONLY && ! $SKIP_PARTYKIT && [[ -n "${PARTYKIT_PROJECT_NAME:-}" ]]; then
  echo "--- Deploying PartyKit: $PARTYKIT_PROJECT_NAME ---"
  (cd "$ROOT/apps/partykit" && npx partykit deploy --name "$PARTYKIT_PROJECT_NAME")
  echo ""
fi

echo "==> [$ENV] deployed successfully."
