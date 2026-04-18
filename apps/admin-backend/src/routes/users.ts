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
