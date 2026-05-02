import { Hono } from "hono";
import { SENSITIVE_KEYS, CATEGORY_KEYS, VALID_CATEGORY_TIERS_SET, GLOBAL_ONLY_KEYS, PRESERVE_VALUE_SENTINEL, WELL_KNOWN_KEYS, BOOLEAN_KEYS } from "@claude-cope/shared/config";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

interface ConfigRow {
  key: string;
  tier: string;
  value: string;
  description: string | null;
  updated_at: string;
}

const KNOWN_KEYS_SET = new Set<string>(WELL_KNOWN_KEYS.map((k) => k.key));

const MASKED_PLACEHOLDER = "••••";

function maskSensitiveValue(key: string, value: string): string {
  if (!SENSITIVE_KEYS.has(key)) return value;
  return MASKED_PLACEHOLDER;
}

function normalizeBooleanValue(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return "true";
  if (lower === "false" || lower === "0" || lower === "no") return "false";
  return value;
}

function shouldPreserveValue(value: string): boolean {
  return value === PRESERVE_VALUE_SENTINEL;
}

const config = new Hono<Env>();

config.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const tier = c.req.query("tier");

  let results: ConfigRow[];
  if (tier) {
    const res = await db
      .prepare(
        "SELECT key, tier, value, description, updated_at FROM system_config WHERE tier = ? ORDER BY key"
      )
      .bind(tier)
      .all<ConfigRow>();
    results = res.results ?? [];
  } else {
    const res = await db
      .prepare(
        "SELECT key, tier, value, description, updated_at FROM system_config ORDER BY key, tier"
      )
      .all<ConfigRow>();
    results = res.results ?? [];
  }

  return c.json(results.map((r) => ({ ...r, value: maskSensitiveValue(r.key, r.value) })));
});

config.get("/:key", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key");

  const { results } = await db
    .prepare(
      "SELECT key, tier, value, description, updated_at FROM system_config WHERE key = ? ORDER BY tier"
    )
    .bind(key)
    .all<ConfigRow>();

  const rows = results ?? [];
  return c.json(rows.map((r) => ({ ...r, value: maskSensitiveValue(r.key, r.value) })));
});

config.put("/:key/:tier", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key").trim();
  const tier = c.req.param("tier").trim();

  if (!key) return c.json({ error: "key must not be empty" }, 400);
  if (!tier) return c.json({ error: "tier must not be empty" }, 400);

  if (CATEGORY_KEYS.has(key) && !VALID_CATEGORY_TIERS_SET.has(tier)) {
    return c.json({ error: `Invalid tier "${tier}" for ${key}. Valid tiers: *, max, free, depleted` }, 400);
  }

  if (GLOBAL_ONLY_KEYS.has(key) && tier !== "*") {
    return c.json({ error: `Key "${key}" only supports tier "*". This key is not category-specific.` }, 400);
  }

  let body: { value: string; description?: string };
  try {
    body = await c.req.json<{ value: string; description?: string }>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (body.value == null) {
    return c.json({ error: "value is required" }, 400);
  }

  if (typeof body.value !== "string") {
    return c.json({ error: "value must be a string" }, 400);
  }

  if (body.description != null && typeof body.description !== "string") {
    return c.json({ error: "description must be a string" }, 400);
  }

  let value = body.value;

  if (SENSITIVE_KEYS.has(key) && (!value.trim() || shouldPreserveValue(value))) {
    const existing = await db
      .prepare("SELECT value FROM system_config WHERE key = ? AND tier = ?")
      .bind(key, tier)
      .first<{ value: string }>();
    if (existing) {
      value = existing.value;
    } else {
      return c.json({ error: "Value is required for new sensitive key entries" }, 400);
    }
  }

  if (BOOLEAN_KEYS.has(key)) {
    value = normalizeBooleanValue(value);
  }

  await db
    .prepare(
      `INSERT INTO system_config (key, tier, value, description, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT (key, tier) DO UPDATE SET
         value = excluded.value,
         description = excluded.description,
         updated_at = datetime('now')`
    )
    .bind(key, tier, value, body.description ?? null)
    .run();

  const warning = !KNOWN_KEYS_SET.has(key) ? `Unknown key "${key}" — check for typos` : undefined;
  return c.json({ success: true, key, tier, warning });
});

config.delete("/:key/:tier", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key").trim();
  const tier = c.req.param("tier").trim();

  if (!key) return c.json({ error: "key must not be empty" }, 400);
  if (!tier) return c.json({ error: "tier must not be empty" }, 400);

  await db
    .prepare("DELETE FROM system_config WHERE key = ? AND tier = ?")
    .bind(key, tier)
    .run();

  return c.json({ success: true, key, tier });
});

export default config;
