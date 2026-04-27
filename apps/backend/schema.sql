-- Hall of Blame leaderboard schema for Cloudflare D1 (serverless SQLite)

CREATE TABLE IF NOT EXISTS hall_of_blame (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL,
    corporate_rank TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Unknown',
    technical_debt INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Descending index on technical_debt for fast leaderboard retrieval
CREATE INDEX IF NOT EXISTS idx_hall_of_blame_technical_debt
    ON hall_of_blame (technical_debt DESC);

-- Community Backlog table for the Agile Suffering Loop
CREATE TABLE IF NOT EXISTS community_backlog (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    technical_debt INTEGER NOT NULL DEFAULT 0,
    kickoff_prompt TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index on technical_debt for fetching random tasks weighted by debt
CREATE INDEX IF NOT EXISTS idx_backlog_debt
    ON community_backlog (technical_debt DESC);

-- Index on created_at for fetching newest tasks
CREATE INDEX IF NOT EXISTS idx_backlog_date
    ON community_backlog (created_at DESC);

-- Store recent events for the SWR polling fallback.
-- We use a dedicated table so we can easily sort and limit the query to the latest 10 items.
CREATE TABLE IF NOT EXISTS recent_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Server-authoritative score tracking (prevents client-side cheating)
CREATE TABLE IF NOT EXISTS user_scores (
    username TEXT PRIMARY KEY,
    total_td INTEGER NOT NULL DEFAULT 0,
    current_td INTEGER NOT NULL DEFAULT 0,
    corporate_rank TEXT NOT NULL DEFAULT 'Junior Code Monkey',
    country TEXT NOT NULL DEFAULT 'Unknown',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_sync_time TEXT NOT NULL DEFAULT (datetime('now')),
    license_hash TEXT,
    inventory TEXT NOT NULL DEFAULT '{}',
    upgrades TEXT NOT NULL DEFAULT '[]',
    achievements TEXT NOT NULL DEFAULT '[]',
    buddy_type TEXT,
    buddy_is_shiny INTEGER NOT NULL DEFAULT 0,
    unlocked_themes TEXT NOT NULL DEFAULT '["default"]',
    active_theme TEXT NOT NULL DEFAULT 'default',
    active_ticket TEXT,
    td_multiplier REAL NOT NULL DEFAULT 1.0,
    -- Pre-aggregated count of usage_logs rows for this user. Incremented inline
    -- when usage_logs is written so admin views can avoid a full table scan.
    credits_used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_scores_total_td
    ON user_scores (total_td DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_scores_license_hash
    ON user_scores (license_hash) WHERE license_hash IS NOT NULL AND license_hash != '';

-- Usage logs for tracking token and model usage per user per hour
CREATE TABLE IF NOT EXISTS usage_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_sent INTEGER NOT NULL DEFAULT 0,
    tokens_received INTEGER NOT NULL DEFAULT 0,
    hour TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Track completed tasks per user to validate one-off bonus earnings and prevent replay
CREATE TABLE IF NOT EXISTS completed_tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    bonus_td INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_tasks_user_ticket
    ON completed_tasks (username, ticket_id);

-- Track activated Polar license keys (hashed) for admin purchase stats
CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    key_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_activated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_licenses_status
    ON licenses (status);

-- Idempotency table for webhook processing — prevents concurrent retries
-- from both executing side effects via a UNIQUE constraint on webhook_id.
CREATE TABLE IF NOT EXISTS processed_webhooks (
    webhook_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index on username and hour for per-user reporting queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_hour
    ON usage_logs (username, hour DESC);

-- Index on model for per-model aggregation
CREATE INDEX IF NOT EXISTS idx_usage_logs_model
    ON usage_logs (model, hour DESC);
