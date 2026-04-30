import { Hono } from "hono";
import { FREE_TIER_RANK_CAP } from "./rankConstants";
import { computeMultiplier } from "../gameConstants";
import { getProfile, getProfileByLicenseHash, isLicenseActive, resolveRank as resolveRankFromProfile, resolveProUser } from "../utils/profile";

type Env = {
  Bindings: {
    DB: D1Database;
    USAGE_KV?: KVNamespace;
    QUOTA_KV?: KVNamespace;
  };
  Variables: {
    sessionId: string;
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

/** GET /api/score/check-alias?username=X&proKeyHash=Y — check if a username is already taken (pro-only) */
score.get("/check-alias", async (c) => {
  const username = c.req.query("username");
  if (!username) return c.json({ error: "username required" }, 400);

  const proKeyHash = c.req.query("proKeyHash");
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  if (!proKeyHash || !(await isLicenseActive(db, proKeyHash))) {
    return c.json({ error: "Alias changes require an active Max license" }, 403);
  }

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
    .prepare("SELECT total_td, current_td, corporate_rank, license_hash FROM user_scores WHERE username = ?")
    .bind(username)
    .first<{ total_td: number; current_td: number; corporate_rank: string; license_hash: string | null }>();

  if (!row) return c.json({ total_td: 0, current_td: 0, corporate_rank: FREE_TIER_RANK_CAP });
  const rank = row.license_hash ? row.corporate_rank : FREE_TIER_RANK_CAP;
  return c.json({ total_td: row.total_td, current_td: row.current_td, corporate_rank: rank });
});

type ScoreBody = {
  username: string;
  currentTD: number;
  totalTDEarned: number;
  inventory: Record<string, number>;
  upgrades: string[];
  country?: string;
  completedTaskIds?: string[];
  proKeyHash?: string;
};

function detectCountry(c: { req: { raw: unknown; header: (name: string) => string | undefined } }, body: ScoreBody): string {
  const cfCountry = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  return body.country || cfCountry || c.req.header("cf-ipcountry") || "Unknown";
}

async function syncProUser(db: D1Database, body: ScoreBody) {
  if (!body.proKeyHash) return null;

  // Verify the license is still active — revoked licenses must not use the pro path.
  const licenseActive = await isLicenseActive(db, body.proKeyHash);
  if (!licenseActive) return null;

  // Validate ownership: look up the profile by license hash, not by username,
  // to prevent a caller from submitting any truthy proKeyHash with another user's username.
  const profileByHash = await getProfileByLicenseHash(db, body.proKeyHash);
  if (!profileByHash || profileByHash.username !== body.username) return null;

  const profile = profileByHash;

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

  return getProfile(db, body.username);
}

function computeTimeCap(existing: { last_sync_time: string } | null, serverTotal: number, claimedMultiplier: number, validatedTaskBonus: number): number {
  if (!existing?.last_sync_time) return Infinity;
  const lastSync = new Date(existing.last_sync_time + "Z");
  const elapsedSeconds = Math.max(0, (Date.now() - lastSync.getTime()) / 1000);
  const maxTDPerSecond = Math.max(1, ((claimedMultiplier - 1) * 100 + 20 * claimedMultiplier) * 1.5);
  return serverTotal + maxTDPerSecond * elapsedSeconds + validatedTaskBonus;
}

function resolveRankAndFlags(validatedTotal: number, claimedTotal: number, serverTotal: number): string {
  if (claimedTotal > serverTotal * 2 && serverTotal > 1000) return "🤡 DevTools Hacker";
  return FREE_TIER_RANK_CAP;
}

// INVARIANT: opts.validatedTotal includes opts.validatedClaims' bonus_td (computed
// upstream in score.post). The UPDATE below and the INSERTs into completed_tasks
// share the SAME `license_hash IS NULL` predicate. Within a single db.batch()
// transaction, both observe the same snapshot of user_scores — either both apply
// or both no-op. If you split these across batches, weaken the predicate, or
// remove the WHERE EXISTS guard from the inserts, you must re-derive total_td
// from the actually-inserted claims; otherwise the bonus TD can be applied
// without the corresponding claim rows existing (or vice versa).
function buildScoreBatch(db: D1Database, opts: {
  existing: { total_td: number } | null;
  serverTotal: number;
  validatedTotal: number;
  validatedCurrent: number;
  rank: string;
  country: string;
  username: string;
  validatedClaims: Array<{ ticketId: string; bonus: number }>;
}): D1PreparedStatement[] {
  const statements: D1PreparedStatement[] = [];

  if (opts.existing) {
    // Guard: only update rows without a license_hash (belt-and-suspenders with the 403 precheck).
    const updatedTotal = Math.max(opts.serverTotal, opts.validatedTotal);
    statements.push(
      db.prepare("UPDATE user_scores SET total_td = ?, current_td = ?, corporate_rank = ?, country = ?, updated_at = datetime('now'), last_sync_time = datetime('now') WHERE username = ? AND license_hash IS NULL")
        .bind(updatedTotal, opts.validatedCurrent, opts.rank, opts.country, opts.username),
    );
    // Guard task claims the same way: only insert if the user row is still free.
    // Uses a subquery so the INSERT no-ops when the UPDATE above would also no-op
    // (e.g. if the row was concurrently upgraded and now has a license_hash).
    for (const claim of opts.validatedClaims) {
      statements.push(
        db.prepare("INSERT INTO completed_tasks (username, ticket_id, bonus_td) SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM user_scores WHERE username = ? AND license_hash IS NULL)")
          .bind(opts.username, claim.ticketId, claim.bonus, opts.username),
      );
    }
  } else {
    statements.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, last_sync_time) VALUES (?, ?, ?, ?, ?, datetime('now'))")
        .bind(opts.username, opts.validatedTotal, opts.validatedCurrent, opts.rank, opts.country),
    );
    // New user insert — safe to add task claims unconditionally since we just created the row.
    for (const claim of opts.validatedClaims) {
      statements.push(
        db.prepare("INSERT INTO completed_tasks (username, ticket_id, bonus_td) VALUES (?, ?, ?)")
          .bind(opts.username, claim.ticketId, claim.bonus),
      );
    }
  }

  return statements;
}

type OwnershipCheckResult =
  | { error: string; deferredKvWrites?: undefined }
  | { error: null; deferredKvWrites: (() => Promise<void>) | null };

/**
 * Verify session ownership for free-user score writes.
 * For existing users, checks session_user mapping.
 * For new users, enforces first-claim-wins but DEFERS KV writes so they
 * only execute after the DB batch succeeds — preventing orphaned KV
 * entries when the DB write fails.
 */
async function verifyFreeSessionOwnership(
  kv: KVNamespace,
  sessionId: string,
  username: string,
  existingRow: boolean,
): Promise<OwnershipCheckResult> {
  if (existingRow) {
    const sessionUsername = await kv.get(`session_user:${sessionId}`);
    if (sessionUsername !== username) return { error: "Session does not own this username" };
    return { error: null, deferredKvWrites: null };
  } else {
    const existingOwner = await kv.get(`username_session:${username}`);
    if (existingOwner && existingOwner !== sessionId) return { error: "Session does not own this username" };
    // Defer KV writes until after DB persistence succeeds.
    return {
      error: null,
      deferredKvWrites: async () => {
        await kv.put(`session_user:${sessionId}`, username, { expirationTtl: 60 * 60 * 24 * 365 });
        await kv.put(`username_session:${username}`, sessionId, { expirationTtl: 60 * 60 * 24 * 365 });
      },
    };
  }
}

/**
 * POST /api/score — debounced sync from client.
 * Validates the claimed score against server-side tracking.
 * The server's total_td is the floor — client can't claim more than what the server has awarded.
 */
score.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<ScoreBody>();
  if (!body.username) return c.json({ error: "username required" }, 400);

  const country = detectCountry(c, body);

  // Pro users: task-only path.
  // If a proKeyHash is presented but can't resolve to a profile, hard-fail
  // instead of falling through to the legacy username-keyed free path.
  if (body.proKeyHash) {
    const resolution = await resolveProUser(db, body.proKeyHash, body.username);
    if (resolution.error) {
      return c.json({ error: resolution.error }, resolution.code === "revoked" ? 403 : 409);
    }
    const updated = await syncProUser(db, body);
    if (updated) return c.json({ profile: updated });
    return c.json({ error: "Pro score sync failed — please retry" }, 500);
  }

  // Guard: if this username already has a license_hash, refuse unauthenticated writes.
  const existingRow = await db
    .prepare("SELECT total_td, current_td, last_sync_time, license_hash FROM user_scores WHERE username = ?")
    .bind(body.username)
    .first<{ total_td: number; current_td: number; last_sync_time: string; license_hash: string | null }>();

  if (existingRow?.license_hash) {
    return c.json({ error: "This account is linked to a Pro license — authenticate with proKeyHash" }, 403);
  }

  // Session-based ownership: both new and existing free users require session verification.
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const sessionId = c.get("sessionId");
  if (!kv) {
    return c.json({ error: "Cannot verify session ownership — please retry" }, 503);
  }
  const ownershipResult = await verifyFreeSessionOwnership(kv, sessionId, body.username, Boolean(existingRow));
  if (ownershipResult.error) {
    return c.json({ error: ownershipResult.error }, 403);
  }

  const claimedMultiplier = computeMultiplier(body.inventory, body.upgrades);

  const existing = existingRow as { total_td: number; current_td: number; last_sync_time: string } | null;

  const serverTotal = existing?.total_td ?? 0;
  const { validatedTaskBonus, validatedClaims } = await validateTaskBonuses(db, body.username, body.completedTaskIds);

  const timeClampedTotal = computeTimeCap(existing, serverTotal, claimedMultiplier, validatedTaskBonus);
  const validatedTotal = Math.min(body.totalTDEarned, Math.round(serverTotal * 1.1) + validatedTaskBonus, Math.round(timeClampedTotal));
  const validatedCurrent = Math.min(body.currentTD, validatedTotal);

  const rank = resolveRankAndFlags(validatedTotal, body.totalTDEarned, serverTotal);
  const batchStatements = buildScoreBatch(db, {
    existing, serverTotal, validatedTotal, validatedCurrent,
    rank, country, username: body.username, validatedClaims,
  });

  try {
    await db.batch(batchStatements);
  } catch {
    return c.json({ error: "Score sync failed — please retry" }, 500);
  }

  // KV ownership writes are deferred until after DB persistence succeeds.
  // If db.batch() threw, these never execute — no orphaned KV entries.
  if (ownershipResult.deferredKvWrites) {
    await ownershipResult.deferredKvWrites();
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
