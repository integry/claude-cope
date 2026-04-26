-- Migration: Add columns required by Max (paid tier) features
-- This migration is safe to re-run: every statement uses IF NOT EXISTS or
-- conditionally checks for column existence via the ADD COLUMN IF NOT EXISTS
-- pattern supported by D1/SQLite ≥ 3.35.

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
