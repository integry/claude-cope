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

function enrichRows(
  results: Record<string, unknown>[],
  freeLimit: number,
): Record<string, unknown>[] {
  return results.map((row: Record<string, unknown>) => {
    const status = (row.user_status as string) || "free";
    return {
      ...row,
      license_hash: maskHash(row.license_hash as string | null),
      credits_remaining: status === "free" ? Math.max(0, freeLimit - (Number(row.credits_used) || 0)) : null,
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

  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10) || 0, 0);

  const whereClause = buildStatusFilter(statusFilter);

  const countQuery = `SELECT COUNT(*) as total
         FROM user_scores u
         LEFT JOIN licenses l ON u.license_hash = l.key_hash AND l.status = 'active'`
      + whereClause;
  const countRow = await db.prepare(countQuery).first<{ total: number }>();
  const total = countRow?.total ?? 0;

  const query = `SELECT u.username, u.total_td, u.current_td, u.corporate_rank, u.country, u.updated_at,
                u.license_hash,
                u.credits_used,
                CASE WHEN l.key_hash IS NOT NULL THEN 'max'
                     WHEN u.license_hash IS NOT NULL THEN 'revoked'
                     ELSE 'free' END AS user_status
         FROM user_scores u
         LEFT JOIN licenses l ON u.license_hash = l.key_hash AND l.status = 'active'`
      + whereClause
      + " ORDER BY u.updated_at DESC, u.username ASC LIMIT ? OFFSET ?";

  const resp = await db.prepare(query).bind(limit, offset).all();
  const results = (resp.results ?? []) as Record<string, unknown>[];

  return c.json({ items: enrichRows(results, freeLimit), total, limit, offset });
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
