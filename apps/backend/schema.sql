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
