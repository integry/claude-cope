import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const events = new Hono<Env>();

// Fetch the latest 10 events for the SWR polling fallback.
// We use edge caching to ensure D1 isn't overwhelmed during traffic spikes.
events.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const { results } = await db
    .prepare("SELECT message, created_at FROM recent_events ORDER BY created_at DESC LIMIT 10")
    .all();

  // Cache the response at the edge for 10 seconds to handle viral load
  c.header("Cache-Control", "public, max-age=10");
  return c.json(results);
});

// Allow frontend to post new global incidents to the database.
events.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const { message } = await c.req.json<{ message: string }>();
  if (!message) return c.json({ error: "Message required" }, 400);

  await db.prepare("INSERT INTO recent_events (message) VALUES (?)").bind(message).run();
  return c.json({ success: true }, 201);
});

export default events;
