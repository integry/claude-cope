import { Hono } from "hono";
import { CORPORATE_RANKS } from "./rankConstants";
import { computeMultiplier } from "../gameConstants";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const score = new Hono<Env>();

/** GET /api/score?username=X — fetch server-authoritative score for syncing */
score.get("/", async (c) => {
  const username = c.req.query("username");
  if (!username) return c.json({ error: "username required" }, 400);

  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const row = await db
    .prepare("SELECT total_td, current_td, corporate_rank FROM user_scores WHERE username = ?")
    .bind(username)
    .first<{ total_td: number; current_td: number; corporate_rank: string }>();

  if (!row) return c.json({ total_td: 0, current_td: 0, corporate_rank: "Junior Code Monkey" });
  return c.json(row);
});

/**
 * POST /api/score — debounced sync from client.
 * Validates the claimed score against server-side tracking.
 * The server's total_td is the floor — client can't claim more than what the server has awarded.
 */
score.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    username: string;
    currentTD: number;
    totalTDEarned: number;
    inventory: Record<string, number>;
    upgrades: string[];
    country?: string;
  }>();

  if (!body.username) return c.json({ error: "username required" }, 400);

  // Country detection priority: body (frontend), CF object, header, fallback
  const cfCountry = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  const country = body.country || cfCountry || c.req.header("cf-ipcountry") || "Unknown";

  // Validate the multiplier from the claimed inventory
  const claimedMultiplier = computeMultiplier(body.inventory, body.upgrades);

  // Fetch server-side score and last sync time
  const existing = await db
    .prepare("SELECT total_td, current_td, last_sync_time FROM user_scores WHERE username = ?")
    .bind(body.username)
    .first<{ total_td: number; current_td: number; last_sync_time: string }>();

  const serverTotal = existing?.total_td ?? 0;

  // Time-based generation cap: calculate maximum possible TD since last sync
  const now = new Date();
  let maxTDGain = Infinity;
  if (existing?.last_sync_time) {
    const lastSync = new Date(existing.last_sync_time + "Z");
    const elapsedSeconds = Math.max(0, (now.getTime() - lastSync.getTime()) / 1000);
    // Max TD/sec = idle generation + generous click allowance
    // Idle output = (multiplier - 1) * 100 TD/sec from generators
    // Click output = ~20 clicks/sec * multiplier TD/click
    // Total with 50% safety buffer to avoid false positives
    const maxTDPerSecond = Math.max(1, ((claimedMultiplier - 1) * 100 + 20 * claimedMultiplier) * 1.5);
    maxTDGain = maxTDPerSecond * elapsedSeconds;
  }
  const timeClampedTotal = serverTotal + maxTDGain;

  // Client's totalTDEarned can't exceed server's tracked total (10% tolerance)
  // AND can't exceed the time-based generation cap
  const validatedTotal = Math.min(body.totalTDEarned, Math.round(serverTotal * 1.1), Math.round(timeClampedTotal));
  // currentTD can't exceed validatedTotal (can't have more than you earned)
  const validatedCurrent = Math.min(body.currentTD, validatedTotal);

  // Resolve rank from validated total
  let rank = "Junior Code Monkey";
  for (const r of CORPORATE_RANKS) {
    if (validatedTotal >= r.threshold) rank = r.title;
  }

  // Cheater flag
  const isSuspicious = body.totalTDEarned > serverTotal * 2 && serverTotal > 1000;
  if (isSuspicious) rank = "🤡 DevTools Hacker";

  if (existing) {
    const updatedTotal = Math.max(serverTotal, validatedTotal);
    await db
      .prepare("UPDATE user_scores SET total_td = ?, current_td = ?, corporate_rank = ?, country = ?, updated_at = datetime('now'), last_sync_time = datetime('now') WHERE username = ?")
      .bind(updatedTotal, validatedCurrent, rank, country, body.username)
      .run();
  } else {
    await db
      .prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, last_sync_time) VALUES (?, ?, ?, ?, ?, datetime('now'))")
      .bind(body.username, validatedTotal, validatedCurrent, rank, country)
      .run();
  }

  const finalTotal = existing ? Math.max(serverTotal, validatedTotal) : validatedTotal;
  return c.json({
    total_td: finalTotal,
    current_td: validatedCurrent,
    corporate_rank: rank,
    multiplier: claimedMultiplier,
  });
});

export default score;
