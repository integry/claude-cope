-- Hall of Blame leaderboard schema for Cloudflare D1 (serverless SQLite)

CREATE TABLE IF NOT EXISTS hall_of_blame (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL,
    corporate_rank TEXT NOT NULL,
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
