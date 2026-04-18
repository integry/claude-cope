import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
    FREE_QUOTA_LIMIT?: string;
  };
};

const users = new Hono<Env>();

users.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const freeLimit = parseInt(c.env?.FREE_QUOTA_LIMIT || "20", 10) || 20;
  const statusFilter = c.req.query("status"); // "free", "max", or undefined for all

  let query = `SELECT u.username, u.total_td, u.current_td, u.corporate_rank, u.country, u.updated_at,
              u.pro_key_hash,
              COALESCE(ul.msg_count, 0) AS credits_used
       FROM user_scores u
       LEFT JOIN (
         SELECT username, COUNT(*) AS msg_count FROM usage_logs GROUP BY username
       ) ul ON ul.username = u.username`;

  if (statusFilter === "max") {
    query += " WHERE u.pro_key_hash IS NOT NULL AND u.pro_key_hash != ''";
  } else if (statusFilter === "free") {
    query += " WHERE u.pro_key_hash IS NULL OR u.pro_key_hash = ''";
  }

  query += " ORDER BY u.updated_at DESC LIMIT 200";

  const { results } = await db.prepare(query).all();

  const enriched = (results ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    credits_remaining: Math.max(0, freeLimit - (Number(row.credits_used) || 0)),
    status: row.pro_key_hash ? "max" : "free",
  }));

  return c.json(enriched);
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
