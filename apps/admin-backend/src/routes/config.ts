import { Hono } from "hono";

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

const SENSITIVE_KEYS = new Set(["openrouter_api_key", "turnstile_secret_key", "category_api_key"]);

function maskSensitiveValue(key: string, value: string): string {
  if (!SENSITIVE_KEYS.has(key)) return value;
  if (value.length <= 4) return "••••";
  return value.slice(0, 4) + "••••" + value.slice(-4);
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

  const body = await c.req.json<{
    value: string;
    description?: string;
  }>();

  if (body.value === undefined || body.value === null) {
    return c.json({ error: "value is required" }, 400);
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
    .bind(key, tier, String(body.value), body.description ?? null)
    .run();

  return c.json({ success: true, key, tier });
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
