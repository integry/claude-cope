#!/usr/bin/env bash
# One-time infrastructure setup: creates the D1 database and Pages project.
# Usage: scripts/setup.sh <staging|production>
set -euo pipefail

ENV="${1:?Usage: scripts/setup.sh <staging|production>}"

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "Environment must be 'staging' or 'production'"
  exit 1
fi

# Pages production-branch convention: main → staging, prod → production.
PAGES_PRODUCTION_BRANCH="main"
[[ "$ENV" == "production" ]] && PAGES_PRODUCTION_BRANCH="prod"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.$ENV"

# wrangler is installed as a workspace devDependency, not globally.
export PATH="$ROOT/node_modules/.bin:$PATH"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy .env.example to .env.$ENV and fill in the values first."
  exit 1
fi

set -a; source "$ENV_FILE"; set +a

for var in CF_D1_DATABASE_NAME CF_PAGES_PROJECT; do
  if [[ -z "${!var:-}" ]]; then
    echo "$var is not set in $ENV_FILE"
    exit 1
  fi
done

echo "==> Setting up [$ENV] infrastructure"
echo ""

# ── Create D1 database ──────────────────────────────
echo "--- Creating D1 database: $CF_D1_DATABASE_NAME ---"
D1_OUTPUT=$(wrangler d1 create "$CF_D1_DATABASE_NAME" 2>&1) || true
echo "$D1_OUTPUT"

DB_ID=$(echo "$D1_OUTPUT" | grep -oP '"database_id"\s*:\s*"\K[^"]+' || true)
[[ -z "$DB_ID" ]] && DB_ID=$(echo "$D1_OUTPUT" | grep -oP 'database_id\s*=\s*"\K[^"]+' || true)
if [[ -n "$DB_ID" ]]; then
  echo ""
  echo "Updating CF_D1_DATABASE_ID in $ENV_FILE"
  if grep -q "^CF_D1_DATABASE_ID=" "$ENV_FILE"; then
    sed -i "s/^CF_D1_DATABASE_ID=.*/CF_D1_DATABASE_ID=$DB_ID/" "$ENV_FILE"
  else
    echo "CF_D1_DATABASE_ID=$DB_ID" >> "$ENV_FILE"
  fi
  echo "  Set to: $DB_ID"
else
  echo ""
  echo "Could not auto-detect database_id. Set CF_D1_DATABASE_ID manually in $ENV_FILE."
fi
echo ""

# ── Create KV namespaces ────────────────────────────
create_kv() {
  local binding="$1"
  local var="$2"
  local title="${CF_WORKER_NAME:-claude-cope}-${binding}"
  echo "--- Creating KV namespace: $title (binding $binding) ---"
  local out
  out=$(wrangler kv namespace create "$title" 2>&1) || true
  echo "$out"

  local id
  id=$(echo "$out" | grep -oP '"id"\s*:\s*"\K[^"]+' | head -n 1 || true)
  [[ -z "$id" ]] && id=$(echo "$out" | grep -oP '\bid\s*=\s*"\K[^"]+' | head -n 1 || true)
  if [[ -n "$id" ]]; then
    echo ""
    echo "Updating $var in $ENV_FILE"
    if grep -q "^$var=" "$ENV_FILE"; then
      sed -i "s/^$var=.*/$var=$id/" "$ENV_FILE"
    else
      echo "$var=$id" >> "$ENV_FILE"
    fi
    echo "  Set to: $id"
  else
    echo ""
    echo "Could not auto-detect id for $binding. Set $var manually in $ENV_FILE."
  fi
  echo ""
}

create_kv "USAGE_KV" "CF_USAGE_KV_ID"
create_kv "QUOTA_KV" "CF_QUOTA_KV_ID"

# ── Create Pages project ────────────────────────────
echo "--- Creating Pages project: $CF_PAGES_PROJECT ---"
wrangler pages project create "$CF_PAGES_PROJECT" --production-branch "$PAGES_PRODUCTION_BRANCH" 2>&1 || true
echo ""

# ── Create admin Pages project (optional) ──────────
if [[ -n "${CF_ADMIN_PAGES_PROJECT:-}" ]]; then
  echo "--- Creating admin Pages project: $CF_ADMIN_PAGES_PROJECT ---"
  wrangler pages project create "$CF_ADMIN_PAGES_PROJECT" --production-branch "$PAGES_PRODUCTION_BRANCH" 2>&1 || true
  echo ""
fi

echo "==> Setup complete for [$ENV]."
echo ""
echo "Next steps:"
echo "  1. Verify CF_D1_DATABASE_ID, CF_USAGE_KV_ID, CF_QUOTA_KV_ID are set in $ENV_FILE"
echo "  2. Fill in remaining values (OPENROUTER_API_KEY, VITE_*, ALLOWED_ORIGINS)"
echo "  3. First deploy: scripts/deploy.sh $ENV --migrate"
