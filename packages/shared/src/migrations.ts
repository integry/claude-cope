/**
 * D1 schema migration system.
 *
 * Each migration is a named SQL string.  On first request the middleware
 * checks a `schema_migrations` bookkeeping table, runs any migrations
 * that have not yet been applied (in order), and records them.
 *
 * Because D1 does not support transactional DDL we intentionally keep
 * each migration as a single idempotent statement so that a partial
 * failure can safely be retried.
 */

/** Minimal subset of D1Database used by the migration runner. */
export interface MigrationDB {
  exec(sql: string): Promise<unknown>;
  prepare(sql: string): {
    all<T = unknown>(): Promise<{ results?: T[] }>;
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
}

export interface Migration {
  /** Unique, never-changing identifier (e.g. "001_add_license_hash"). */
  name: string;
  /** A single SQL statement.  Must be idempotent (IF NOT EXISTS / etc.). */
  sql: string;
}

/**
 * Ordered list of migrations.  Append-only — never reorder or rename
 * existing entries.
 */
export const migrations: Migration[] = [
  // ── user_scores new columns ────────────────────────────────────────
  {
    name: "001_add_license_hash",
    sql: "ALTER TABLE user_scores ADD COLUMN license_hash TEXT",
  },
  {
    name: "002_add_inventory",
    sql: "ALTER TABLE user_scores ADD COLUMN inventory TEXT NOT NULL DEFAULT '{}'",
  },
  {
    name: "003_add_upgrades",
    sql: "ALTER TABLE user_scores ADD COLUMN upgrades TEXT NOT NULL DEFAULT '[]'",
  },
  {
    name: "004_add_achievements",
    sql: "ALTER TABLE user_scores ADD COLUMN achievements TEXT NOT NULL DEFAULT '[]'",
  },
  {
    name: "005_add_buddy_type",
    sql: "ALTER TABLE user_scores ADD COLUMN buddy_type TEXT",
  },
  {
    name: "006_add_buddy_is_shiny",
    sql: "ALTER TABLE user_scores ADD COLUMN buddy_is_shiny INTEGER NOT NULL DEFAULT 0",
  },
  {
    name: "007_add_unlocked_themes",
    sql: "ALTER TABLE user_scores ADD COLUMN unlocked_themes TEXT NOT NULL DEFAULT '[\"default\"]'",
  },
  {
    name: "008_add_active_theme",
    sql: "ALTER TABLE user_scores ADD COLUMN active_theme TEXT NOT NULL DEFAULT 'default'",
  },
  {
    name: "009_add_active_ticket",
    sql: "ALTER TABLE user_scores ADD COLUMN active_ticket TEXT",
  },
  {
    name: "010_add_td_multiplier",
    sql: "ALTER TABLE user_scores ADD COLUMN td_multiplier REAL NOT NULL DEFAULT 1.0",
  },
  {
    name: "011_add_credits_used",
    sql: "ALTER TABLE user_scores ADD COLUMN credits_used INTEGER NOT NULL DEFAULT 0",
  },

  // ── new tables ─────────────────────────────────────────────────────
  {
    name: "012_create_licenses",
    sql: `CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      key_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_activated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  },
  {
    name: "013_create_processed_webhooks",
    sql: `CREATE TABLE IF NOT EXISTS processed_webhooks (
      webhook_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  },
  {
    name: "014_create_completed_tasks",
    sql: `CREATE TABLE IF NOT EXISTS completed_tasks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL,
      ticket_id TEXT NOT NULL,
      bonus_td INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  },

  // ── indexes ────────────────────────────────────────────────────────
  // The partial-index predicate excludes both NULL and empty-string
  // license_hash values so that stale '' rows don't cause a unique-
  // constraint violation.  Migration 018 normalises '' → NULL later.
  {
    name: "015_idx_license_hash",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_user_scores_license_hash ON user_scores (license_hash) WHERE license_hash IS NOT NULL AND license_hash != ''",
  },
  {
    name: "016_idx_licenses_status",
    sql: "CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses (status)",
  },
  {
    name: "017_idx_completed_tasks_user_ticket",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_tasks_user_ticket ON completed_tasks (username, ticket_id)",
  },

  // ── normalize license_hash: convert empty strings to NULL ──────────
  {
    name: "018_normalize_license_hash_empty_to_null",
    sql: "UPDATE user_scores SET license_hash = NULL WHERE license_hash = ''",
  },
];

/**
 * Ensure the bookkeeping table exists, then run every migration whose
 * name is not yet recorded.  Safe to call on every request — after the
 * first run it becomes a single cheap SELECT.
 */
export async function applyMigrations(db: MigrationDB): Promise<void> {
  // Create the bookkeeping table (idempotent).
  await db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     )`
  );

  // Fetch already-applied migration names in one round-trip.
  const applied = new Set<string>();
  const rows = await db
    .prepare("SELECT name FROM schema_migrations")
    .all<{ name: string }>();
  for (const r of rows.results ?? []) {
    applied.add(r.name);
  }

  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    try {
      await db.exec(m.sql);
    } catch (err: unknown) {
      // "duplicate column name" / "table already exists" — the column
      // or table was added outside the migration system (e.g. by
      // running schema.sql directly).  Record it and move on.
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("duplicate column") ||
        msg.includes("already exists")
      ) {
        // Column/table/index already present — safe to continue.
      } else {
        throw err;
      }
    }
    // Record the migration as applied regardless of whether the DDL
    // was a no-op (already existed) so we don't retry it.
    await db
      .prepare("INSERT OR IGNORE INTO schema_migrations (name) VALUES (?)")
      .bind(m.name)
      .run();
  }
}
