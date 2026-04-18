import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const users = new Hono<Env>();

users.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const { results } = await db
    .prepare(
      "SELECT username, total_td, current_td, corporate_rank, country, updated_at FROM user_scores ORDER BY updated_at DESC LIMIT 100"
    )
    .all();

  return c.json(results ?? []);
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
    corporate_rank?: number;
    country?: string;
    total_td?: number;
    current_td?: number;
  }>();

  const fields: string[] = [];
  const values: (string | number)[] = [];

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

  return c.json({ success: true, username });
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
