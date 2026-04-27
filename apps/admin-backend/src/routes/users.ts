import { Hono } from "hono";
import { maskHash } from "../utils/maskHash";

type Env = {
  Bindings: {
    DB: D1Database;
    FREE_QUOTA_LIMIT?: string;
  };
};

const users = new Hono<Env>();

function buildStatusFilter(statusFilter: string | undefined): string {
  if (statusFilter === "max") return " WHERE l.key_hash IS NOT NULL";
  if (statusFilter === "free") return " WHERE u.license_hash IS NULL";
  if (statusFilter === "revoked") return " WHERE l.key_hash IS NULL AND u.license_hash IS NOT NULL";
  return "";
}

async function runFallbackQuery(
  db: D1Database,
  statusFilter: string | undefined,
  hasLicenseHashColumn: boolean,
): Promise<Record<string, unknown>[] | Response> {
  // When the schema is degraded we cannot distinguish free/max/revoked users.
  // Return an explicit error instead of silently returning misleading data.
  if (statusFilter) {
    return new Response(
      JSON.stringify({
        error: `Status filter "${statusFilter}" is unavailable — schema is in a degraded state. Run migrations first.`,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const resp = await db
    .prepare(
      `SELECT u.username, u.total_td, u.current_td, u.corporate_rank, u.country, u.updated_at,
              COALESCE(ul.msg_count, 0) AS credits_used
       FROM user_scores u
       LEFT JOIN (
         SELECT username, COUNT(*) AS msg_count FROM usage_logs GROUP BY username
       ) ul ON ul.username = u.username
       ORDER BY u.updated_at DESC`
    )
    .all();
  return (resp.results ?? []) as Record<string, unknown>[];
}

function enrichRows(
  results: Record<string, unknown>[],
  hasLicenseHashColumn: boolean,
  freeLimit: number,
): Record<string, unknown>[] {
  return results.map((row: Record<string, unknown>) => {
    const status = hasLicenseHashColumn ? (row.user_status as string) || "free" : "free";
    return {
      ...row,
      license_hash: maskHash(row.license_hash as string | null),
      credits_remaining: status === "max" ? null : Math.max(0, freeLimit - (Number(row.credits_used) || 0)),
      status,
    };
  });
}

users.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const freeLimit = parseInt(c.env?.FREE_QUOTA_LIMIT || "20", 10) || 20;
  const statusFilter = c.req.query("status"); // "free", "max", "revoked", or undefined for all

  const VALID_STATUSES = new Set(["free", "max", "revoked"]);
  if (statusFilter && !VALID_STATUSES.has(statusFilter)) {
    return c.json({ error: `Invalid status filter: "${statusFilter}". Use "free", "max", or "revoked".` }, 400);
  }

  let results: Record<string, unknown>[];
  let hasLicenseHashColumn = true;
  try {
    const query = `SELECT u.username, u.total_td, u.current_td, u.corporate_rank, u.country, u.updated_at,
                u.license_hash,
                u.credits_used,
                CASE WHEN l.key_hash IS NOT NULL THEN 'max'
                     WHEN u.license_hash IS NOT NULL THEN 'revoked'
                     ELSE 'free' END AS user_status
         FROM user_scores u
         LEFT JOIN licenses l ON u.license_hash = l.key_hash AND l.status = 'active'`
      + buildStatusFilter(statusFilter)
      + " ORDER BY u.updated_at DESC LIMIT 200";

    const resp = await db.prepare(query).all();
    results = (resp.results ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("no such column") && !msg.includes("no such table")) {
      throw err;
    }
    console.warn(`[admin/users] schema fallback: ${msg.slice(0, 200)}`);
    // Any schema error that involves license_hash, credits_used, or the
    // licenses table means the main query's user_status CASE expression
    // is unavailable. Mark the column as missing so enrichRows() doesn't
    // default every row to "free" based on a null user_status field.
    if (msg.includes("license_hash") || msg.includes("credits_used") || msg.includes("licenses")) {
      hasLicenseHashColumn = false;
    }
    const fallback = await runFallbackQuery(db, statusFilter, hasLicenseHashColumn);
    if (fallback instanceof Response) return fallback;
    results = fallback;
  }

  return c.json(enrichRows(results, hasLicenseHashColumn, freeLimit));
});

users.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    username: string;
    corporate_rank?: number;
    country?: string;
  }>();

  if (!body.username) {
    return c.json({ error: "username is required" }, 400);
  }

  await db
    .prepare(
      "INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, updated_at) VALUES (?, 0, 0, ?, ?, datetime('now'))"
    )
    .bind(body.username, body.corporate_rank ?? 0, body.country ?? "")
    .run();

  return c.json({ success: true, username: body.username });
});

users.put("/:username", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const username = c.req.param("username");
  const body = await c.req.json<{
    username?: string;
    corporate_rank?: number;
    country?: string;
    total_td?: number;
    current_td?: number;
  }>();

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (body.username !== undefined) {
    if (!body.username.trim()) {
      return c.json({ error: "username cannot be empty" }, 400);
    }
    fields.push("username = ?");
    values.push(body.username.trim());
  }
  if (body.corporate_rank !== undefined) {
    fields.push("corporate_rank = ?");
    values.push(body.corporate_rank);
  }
  if (body.country !== undefined) {
    fields.push("country = ?");
    values.push(body.country);
  }
  if (body.total_td !== undefined) {
    fields.push("total_td = ?");
    values.push(body.total_td);
  }
  if (body.current_td !== undefined) {
    fields.push("current_td = ?");
    values.push(body.current_td);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(username);

  await db
    .prepare(`UPDATE user_scores SET ${fields.join(", ")} WHERE username = ?`)
    .bind(...values)
    .run();

  const updatedUsername = body.username?.trim() || username;
  return c.json({ success: true, username: updatedUsername });
});

users.post("/:username/reset", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const username = c.req.param("username");

  await db
    .prepare("UPDATE user_scores SET total_td = 0, current_td = 0 WHERE username = ?")
    .bind(username)
    .run();

  return c.json({ success: true, username });
});

export default users;
