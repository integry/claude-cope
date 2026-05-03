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
  prepare(sql: string): {
    all<T = unknown>(): Promise<{ results?: T[] }>;
    run(): Promise<unknown>;
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
  /**
   * Optional matcher for errors that should be treated as "already applied"
   * rather than failures.  Use sparingly — only when the SQL itself can't
   * be made idempotent (e.g. RENAME COLUMN with no IF EXISTS variant).
   */
  ignoreErrorMatching?: RegExp;
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

  // ── repair stale-DB column drift on `licenses` ─────────────────────
  // Older databases were created with the column `activated_at`; the code
  // and migration 012 now use `last_activated_at`.  On those stale DBs,
  // 012 was a no-op (table already existed) and the column never got
  // renamed.  On fresh DBs the column is already named correctly, so the
  // RENAME below errors with "no such column: activated_at" — which we
  // intentionally swallow via ignoreErrorMatching.
  {
    name: "019_rename_licenses_activated_at",
    sql: "ALTER TABLE licenses RENAME COLUMN activated_at TO last_activated_at",
    ignoreErrorMatching: /no such column.*activated_at/i,
  },

  // ── system_config table ────────────────────────────────────────────
  {
    name: "020_create_system_config",
    sql: `CREATE TABLE IF NOT EXISTS system_config (
      key TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT '*',
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (key, tier)
    )`,
  },
  {
    name: "021_idx_system_config_tier",
    sql: "CREATE INDEX IF NOT EXISTS idx_system_config_tier ON system_config (tier)",
  },
];

/**
 * Ensure the bookkeeping table exists, then run every migration whose
 * name is not yet recorded.  Safe to call on every request — after the
 * first run it becomes a single cheap SELECT.
 */
export async function applyMigrations(db: MigrationDB): Promise<void> {
  // Create the bookkeeping table (idempotent). We use prepare().run() rather
  // than db.exec() because D1's exec() requires each statement to be on a
  // single line — a footgun that silently breaks any multi-line DDL.
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name TEXT PRIMARY KEY,
         applied_at TEXT NOT NULL DEFAULT (datetime('now'))
       )`
    )
    .run();

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
      await db.prepare(m.sql).run();
    } catch (err: unknown) {
      // "duplicate column name" / "table already exists" — the column
      // or table was added outside the migration system (e.g. by
      // running schema.sql directly).  Record it and move on.
      const msg = err instanceof Error ? err.message : String(err);
      const matchesPerMigration =
        m.ignoreErrorMatching instanceof RegExp && m.ignoreErrorMatching.test(msg);
      if (
        msg.includes("duplicate column") ||
        msg.includes("already exists") ||
        matchesPerMigration
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
