import { Hono } from "hono";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  BOOLEAN_KEYS,
  validateConfigValue,
  validateConfigKey,
  validateConfigKeyAndTier,
  isValidTierQuery,
} from "@claude-cope/shared/config";

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

interface ConfigMutationBody {
  value: string;
  description?: string;
}

interface StoredDescriptionRow {
  description: string | null;
}

function normalizeBooleanValue(value: string): string | null {
  const lower = value.trim().toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return "true";
  if (lower === "false" || lower === "0" || lower === "no") return "false";
  return null;
}

function jsonError(c: Context<Env>, error: string, status: ContentfulStatusCode): Response {
  return c.json({ error }, status);
}

async function parseMutationBody(c: Context<Env>): Promise<ConfigMutationBody | Response> {
  try {
    const body = await c.req.json<ConfigMutationBody>();
    if (typeof body.value !== "string") {
      return jsonError(c, "value is required and must be a string", 400);
    }
    if (body.description != null && typeof body.description !== "string") {
      return jsonError(c, "description must be a string", 400);
    }
    return body;
  } catch {
    return jsonError(c, "Invalid JSON body", 400);
  }
}

async function resolveStoredValue(
  c: Context<Env>,
  params: { key: string; tier: string; body: ConfigMutationBody },
): Promise<string | Response> {
  const { key, body } = params;
  let value = body.value;

  if (BOOLEAN_KEYS.has(key)) {
    const normalized = normalizeBooleanValue(value);
    if (normalized === null) {
      return jsonError(c, `Invalid boolean value for "${key}". Use true/false, 1/0, or yes/no.`, 400);
    }
    value = normalized;
  }

  const configValidationError = validateConfigValue(key, value);
  if (configValidationError) {
    return jsonError(c, configValidationError, 400);
  }

  return value;
}

async function resolveStoredDescription(
  db: D1Database,
  key: string,
  tier: string,
  body: ConfigMutationBody,
): Promise<string | null> {
  if (body.description !== undefined) {
    return body.description;
  }

  const existing = await db
    .prepare("SELECT description FROM system_config WHERE key = ? AND tier = ?")
    .bind(key, tier)
    .first<StoredDescriptionRow>();

  return existing?.description ?? null;
}

const config = new Hono<Env>();

config.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const tier = c.req.query("tier")?.trim();
  if (tier && !isValidTierQuery(tier)) {
    return jsonError(c, `Invalid tier "${tier}". Use one of *, max, free, depleted, or a model ID tier such as "openai/gpt-4o".`, 400);
  }

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

  return c.json(
    results.filter((r) => validateConfigKey(r.key) === null)
  );
});

config.get("/:key", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key").trim();
  const validationError = validateConfigKey(key);
  if (validationError) return c.json({ error: validationError }, 400);

  const { results } = await db
    .prepare(
      "SELECT key, tier, value, description, updated_at FROM system_config WHERE key = ? ORDER BY tier"
    )
    .bind(key)
    .all<ConfigRow>();

  return c.json(results ?? []);
});

config.put("/:key/:tier", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key").trim();
  const tier = c.req.param("tier").trim();
  const validationError = validateConfigKeyAndTier(key, tier);
  if (validationError) return c.json({ error: validationError }, 400);

  const parsedBody = await parseMutationBody(c);
  if (parsedBody instanceof Response) return parsedBody;

  const value = await resolveStoredValue(c, { key, tier, body: parsedBody });
  if (value instanceof Response) return value;
  const description = await resolveStoredDescription(db, key, tier, parsedBody);

  await db
    .prepare(
      `INSERT INTO system_config (key, tier, value, description, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT (key, tier) DO UPDATE SET
         value = excluded.value,
         description = excluded.description,
         updated_at = datetime('now')`
    )
    .bind(key, tier, value, description)
    .run();

  return c.json({ success: true, key, tier });
});

config.delete("/:key/:tier", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const key = c.req.param("key").trim();
  const tier = c.req.param("tier").trim();
  const validationError = validateConfigKeyAndTier(key, tier);
  if (validationError) return c.json({ error: validationError }, 400);

  const result = await db
    .prepare("DELETE FROM system_config WHERE key = ? AND tier = ?")
    .bind(key, tier)
    .run();

  if ((result.meta?.changes ?? 0) < 1) {
    return c.json({ error: `Configuration key "${key}" with tier "${tier}" was not found.` }, 404);
  }

  return c.json({ success: true, key, tier });
});

export default config;
