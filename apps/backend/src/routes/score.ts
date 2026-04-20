import { Hono } from "hono";
import { CORPORATE_RANKS } from "./rankConstants";
import { computeMultiplier } from "../gameConstants";
import { getProfile, resolveRank as resolveRankFromProfile } from "../utils/profile";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const score = new Hono<Env>();

/**
 * Validate completed task bonuses and return validated bonus + claims list.
 *
 * TRUST-BOUNDARY LIMITATION: The server verifies that claimed ticket IDs exist
 * in community_backlog and have not been previously claimed by this user, but it
 * cannot prove the client actually completed the sprint for that ticket — there
 * is no server-side sprint progress tracking. A malicious client could claim any
 * unclaimed backlog ticket. Fully closing this gap requires server-authoritative
 * sprint state, which is outside the scope of the current schema.
 */
async function validateTaskBonuses(
  db: D1Database,
  username: string,
  completedTaskIds: string[] | undefined,
): Promise<{ validatedTaskBonus: number; validatedClaims: Array<{ ticketId: string; bonus: number }> }> {
  let validatedTaskBonus = 0;
  const taskIds = [...new Set(completedTaskIds ?? [])];
  const validatedClaims: Array<{ ticketId: string; bonus: number }> = [];
  for (const ticketId of taskIds) {
    const ticket = await db
      .prepare("SELECT technical_debt FROM community_backlog WHERE id = ?")
      .bind(ticketId)
      .first<{ technical_debt: number }>();
    if (!ticket) continue;

    const alreadyClaimed = await db
      .prepare("SELECT 1 FROM completed_tasks WHERE username = ? AND ticket_id = ?")
      .bind(username, ticketId)
      .first();
    if (alreadyClaimed) continue;

    const bonus = ticket.technical_debt * 10;
    validatedTaskBonus += bonus;
    validatedClaims.push({ ticketId, bonus });
  }
  return { validatedTaskBonus, validatedClaims };
}

/** GET /api/score/check-alias?username=X — check if a username is already taken */
score.get("/check-alias", async (c) => {
  const username = c.req.query("username");
  if (!username) return c.json({ error: "username required" }, 400);

  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const row = await db
    .prepare("SELECT 1 FROM user_scores WHERE LOWER(username) = LOWER(?)")
    .bind(username)
    .first();

  return c.json({ taken: !!row });
});

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
    completedTaskIds?: string[];
    proKeyHash?: string;
  }>();

  if (!body.username) return c.json({ error: "username required" }, 400);

  // Country detection priority: body (frontend), CF object, header, fallback
  const cfCountry = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  const country = body.country || cfCountry || c.req.header("cf-ipcountry") || "Unknown";

  // Pro users: task-only path — only process completedTaskIds, read/write TD from D1
  if (body.proKeyHash) {
    const profile = await getProfile(db, body.username);
    if (profile) {
      const { validatedTaskBonus, validatedClaims } = await validateTaskBonuses(db, body.username, body.completedTaskIds);

      if (validatedTaskBonus > 0) {
        const newTotal = profile.total_td + validatedTaskBonus;
        const newCurrent = profile.current_td + validatedTaskBonus;
        const newRank = resolveRankFromProfile(newTotal);

        const batchStatements: D1PreparedStatement[] = [
          db.prepare("UPDATE user_scores SET total_td = ?, current_td = ?, corporate_rank = ?, updated_at = datetime('now'), last_sync_time = datetime('now') WHERE username = ?")
            .bind(newTotal, newCurrent, newRank, body.username),
        ];
        for (const claim of validatedClaims) {
          batchStatements.push(
            db.prepare("INSERT INTO completed_tasks (username, ticket_id, bonus_td) VALUES (?, ?, ?)")
              .bind(body.username, claim.ticketId, claim.bonus),
          );
        }
        await db.batch(batchStatements);
      }

      const updated = await getProfile(db, body.username);
      return c.json({ profile: updated });
    }
  }

  // Validate the multiplier from the claimed inventory
  const claimedMultiplier = computeMultiplier(body.inventory, body.upgrades);

  // Fetch server-side score and last sync time
  const existing = await db
    .prepare("SELECT total_td, current_td, last_sync_time FROM user_scores WHERE username = ?")
    .bind(body.username)
    .first<{ total_td: number; current_td: number; last_sync_time: string }>();

  const serverTotal = existing?.total_td ?? 0;

  // Validate completed task bonuses — these are the only source of large one-off earnings.
  const { validatedTaskBonus, validatedClaims } = await validateTaskBonuses(db, body.username, body.completedTaskIds);

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
  const timeClampedTotal = serverTotal + maxTDGain + validatedTaskBonus;

  // Client's totalTDEarned can't exceed server's tracked total (10% tolerance + task bonus)
  // AND can't exceed the time-based generation cap (also includes task bonus)
  const validatedTotal = Math.min(body.totalTDEarned, Math.round(serverTotal * 1.1) + validatedTaskBonus, Math.round(timeClampedTotal));
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

  // Use db.batch() to execute score update + task completion inserts atomically.
  // D1 batch runs all statements in a single transaction — if any statement fails,
  // the entire batch is rolled back, preventing state divergence.
  const batchStatements: D1PreparedStatement[] = [];

  if (existing) {
    const updatedTotal = Math.max(serverTotal, validatedTotal);
    batchStatements.push(
      db.prepare("UPDATE user_scores SET total_td = ?, current_td = ?, corporate_rank = ?, country = ?, updated_at = datetime('now'), last_sync_time = datetime('now') WHERE username = ?")
        .bind(updatedTotal, validatedCurrent, rank, country, body.username),
    );
  } else {
    batchStatements.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, last_sync_time) VALUES (?, ?, ?, ?, ?, datetime('now'))")
        .bind(body.username, validatedTotal, validatedCurrent, rank, country),
    );
  }

  for (const claim of validatedClaims) {
    batchStatements.push(
      db.prepare("INSERT INTO completed_tasks (username, ticket_id, bonus_td) VALUES (?, ?, ?)")
        .bind(body.username, claim.ticketId, claim.bonus),
    );
  }

  try {
    await db.batch(batchStatements);
  } catch {
    return c.json({ error: "Score sync failed — please retry" }, 500);
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
