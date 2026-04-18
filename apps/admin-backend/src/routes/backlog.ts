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

backlog.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    title: string;
    description?: string;
    technical_debt?: number;
    kickoff_prompt?: string;
  }>();

  if (!body.title) {
    return c.json({ error: "title is required" }, 400);
  }

  const result = await db
    .prepare(
      "INSERT INTO community_backlog (title, description, technical_debt, kickoff_prompt, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    )
    .bind(
      body.title,
      body.description ?? "",
      body.technical_debt ?? 0,
      body.kickoff_prompt ?? ""
    )
    .run();

  return c.json({ success: true, id: result.meta?.last_row_id });
});

backlog.put("/:id", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const id = c.req.param("id");
  const body = await c.req.json<{
    title?: string;
    description?: string;
    technical_debt?: number;
    kickoff_prompt?: string;
  }>();

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (body.title !== undefined) {
    fields.push("title = ?");
    values.push(body.title);
  }
  if (body.description !== undefined) {
    fields.push("description = ?");
    values.push(body.description);
  }
  if (body.technical_debt !== undefined) {
    fields.push("technical_debt = ?");
    values.push(body.technical_debt);
  }
  if (body.kickoff_prompt !== undefined) {
    fields.push("kickoff_prompt = ?");
    values.push(body.kickoff_prompt);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  values.push(id);

  await db
    .prepare(`UPDATE community_backlog SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ success: true, id });
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
