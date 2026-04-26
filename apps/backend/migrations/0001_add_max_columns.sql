-- Migration: Add columns required by Max (paid tier) features
-- NOTE: This migration is NOT idempotent. ALTER TABLE ADD COLUMN will fail if
-- the column already exists (SQLite does not support IF NOT EXISTS for ADD COLUMN
-- prior to 3.35). D1's migration runner tracks applied migrations, so this file
-- will only execute once per database. Do NOT run it manually a second time.

-- ── user_scores: new columns for inventory, cosmetics, and license linking ──

ALTER TABLE user_scores ADD COLUMN license_hash TEXT;
ALTER TABLE user_scores ADD COLUMN inventory TEXT NOT NULL DEFAULT '{}';
ALTER TABLE user_scores ADD COLUMN upgrades TEXT NOT NULL DEFAULT '[]';
ALTER TABLE user_scores ADD COLUMN achievements TEXT NOT NULL DEFAULT '[]';
ALTER TABLE user_scores ADD COLUMN buddy_type TEXT;
ALTER TABLE user_scores ADD COLUMN buddy_is_shiny INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_scores ADD COLUMN unlocked_themes TEXT NOT NULL DEFAULT '["default"]';
ALTER TABLE user_scores ADD COLUMN active_theme TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_scores ADD COLUMN active_ticket TEXT;
ALTER TABLE user_scores ADD COLUMN td_multiplier REAL NOT NULL DEFAULT 1.0;

-- ── indexes for the new columns ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_scores_license_hash
    ON user_scores (license_hash);

-- ── licenses table for admin purchase stats ─────────────────────────────────

CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    key_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    activated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_licenses_status
    ON licenses (status);
