import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const backlog = new Hono<Env>();

backlog.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const { results } = await db
    .prepare(
      "SELECT id, title, description, technical_debt, kickoff_prompt, created_at FROM community_backlog ORDER BY created_at DESC"
    )
    .all();

  return c.json(results ?? []);
});

backlog.delete("/:id", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const id = c.req.param("id");

  await db
    .prepare("DELETE FROM community_backlog WHERE id = ?")
    .bind(id)
    .run();

  return c.json({ success: true, id });
});

export default backlog;
