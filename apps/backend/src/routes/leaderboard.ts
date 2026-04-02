import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const leaderboard = new Hono<Env>();

leaderboard.get("/", async (c) => {
  const db = c.env?.DB;

  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const { results } = await db
    .prepare(
      "SELECT id, username, corporate_rank, technical_debt, created_at FROM hall_of_blame ORDER BY technical_debt DESC LIMIT 50"
    )
    .all();

  c.header("Cache-Control", "public, max-age=60");
  return c.json(results);
});

leaderboard.post("/", async (c) => {
  const db = c.env?.DB;

  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const body = await c.req.json<{
    username: string;
    rank: string;
    debt: number;
  }>();

  const { username, rank, debt } = body;

  if (!username || !rank || debt == null) {
    return c.json({ error: "Missing required fields: username, rank, debt" }, 400);
  }

  // Cheater Catch: if debt exceeds 50 billion, override rank
  const corporateRank = debt > 50_000_000_000 ? "🤡 DevTools Hacker" : rank;

  const { success } = await db
    .prepare(
      "INSERT INTO hall_of_blame (id, username, corporate_rank, technical_debt) VALUES (lower(hex(randomblob(16))), ?, ?, ?)"
    )
    .bind(username, corporateRank, debt)
    .run();

  if (!success) {
    return c.json({ error: "Failed to insert record" }, 500);
  }

  return c.json({ success: true }, 201);
});

export default leaderboard;
