import { Hono } from "hono";
import { FREE_TIER_RANK_CAP } from "./rankConstants";
import { computeMultiplier } from "../gameConstants";
import { accountKvKeys } from "./accountHelpers";
import { getProfile, getProfileByLicenseHash, isLicenseActive, resolveRank as resolveRankFromProfile, resolveProUser } from "../utils/profile";
import { issueFreeAccountCookie } from "../utils/freeAccountIdentity";

type Env = {
  Bindings: {
    DB: D1Database;
    USAGE_KV?: KVNamespace;
    QUOTA_KV?: KVNamespace;
    FREE_ACCOUNT_COOKIE_SECRET?: string;
  };
  Variables: {
    sessionId: string;
    freeAccountId?: string;
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

  // TODO(byok): BYOK users are treated as free tier here because the backend has no
  // knowledge of client-side apiKey. Add a BYOK tier to allow rank progression for
  // standalone installations once BYOK becomes a first-class feature.
  if (!row) return c.json({ total_td: 0, current_td: 0, corporate_rank: FREE_TIER_RANK_CAP });
  const licenseActive = row.license_hash ? await isLicenseActive(db, row.license_hash) : false;
  const rank = licenseActive ? row.corporate_rank : FREE_TIER_RANK_CAP;
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

async function syncResolvedProUser(
  db: D1Database,
  body: ScoreBody,
  profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>,
) {
  if (profile.username !== body.username) {
    return null;
  }

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

function resolveRankAndFlags(claimedTotal: number, serverTotal: number): string {
  void claimedTotal;
  void serverTotal;
  // Free-tier users are always rank-capped, even when their claim is suspicious.
  // Anti-cheat still clamps their score; the paid-only rank ladder remains closed.
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
  accountId: string;
  validatedClaims: Array<{ ticketId: string; bonus: number }>;
}): D1PreparedStatement[] {
  const statements: D1PreparedStatement[] = [];

  if (opts.existing) {
    // Guard: only update rows without a license_hash (belt-and-suspenders with the 403 precheck).
    const updatedTotal = Math.max(opts.serverTotal, opts.validatedTotal);
    statements.push(
      db.prepare("UPDATE user_scores SET account_id = COALESCE(account_id, ?), total_td = ?, current_td = ?, corporate_rank = ?, country = ?, updated_at = datetime('now'), last_sync_time = datetime('now') WHERE username = ? AND license_hash IS NULL")
        .bind(opts.accountId, updatedTotal, opts.validatedCurrent, opts.rank, opts.country, opts.username),
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
      db.prepare("INSERT INTO user_scores (username, account_id, total_td, current_td, corporate_rank, country, last_sync_time) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
        .bind(opts.username, opts.accountId, opts.validatedTotal, opts.validatedCurrent, opts.rank, opts.country),
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
  | { error: null; deferredKvWrites: (() => Promise<void>) | null; accountId: string };
type SessionAuthorizationResult =
  | { authorized: false; deferredKvWrites?: undefined }
  | { authorized: true; deferredKvWrites: (() => Promise<void>) | null };

const SESSION_USERNAME_TTL_SECONDS = 60 * 60 * 24 * 365;
const MAX_SESSION_RENAME_HOPS = 5;

function sameUsername(a: string | null | undefined, b: string): boolean {
  return typeof a === "string" && a.toLowerCase() === b.toLowerCase();
}

async function resolveRenamedSessionUsername(kv: KVNamespace, startUsername: string, targetUsername: string): Promise<boolean> {
  let current = startUsername;
  let hops = 0;
  const seen = new Set([startUsername.toLowerCase()]);

  while (hops < MAX_SESSION_RENAME_HOPS) {
    const renamedTo = await kv.get(accountKvKeys.renamed(current));
    if (!renamedTo) return false;
    if (sameUsername(renamedTo, targetUsername)) return true;

    const lowered = renamedTo.toLowerCase();
    if (seen.has(lowered)) return false;
    seen.add(lowered);
    current = renamedTo;
    hops += 1;
  }

  return false;
}

async function canSessionClaimUsername(
  kv: KVNamespace,
  sessionId: string,
  username: string,
): Promise<boolean> {
  const existingOwner = await kv.get(accountKvKeys.usernameSession(username));
  return !existingOwner || existingOwner === sessionId;
}

async function isSessionAuthorizedForUsername(
  kv: KVNamespace,
  sessionId: string,
  username: string,
  options?: { allowRenameRepair?: boolean },
): Promise<SessionAuthorizationResult> {
  const allowRenameRepair = options?.allowRenameRepair ?? true;
  // This fallback is intentionally narrower than "any session with this cookie can write".
  // When a legacy Pro row is synced without `proKeyHash`, we trust only server-issued KV
  // ownership state for this exact username: a direct session_user match, an exact
  // username_session lease for the requested username, or a bounded rename chain that can
  // safely repair both mappings. Do not broaden these conditions without adding adversarial
  // coverage for stale, cyclic, or conflicting KV state.
  const sessionUsername = await kv.get(accountKvKeys.sessionUser(sessionId));
  const existingOwner = await kv.get(accountKvKeys.usernameSession(username));
  if (sameUsername(sessionUsername, username)) {
    if (existingOwner && existingOwner !== sessionId) {
      return { authorized: false };
    }
    if (sessionUsername === username && existingOwner === sessionId) {
      return { authorized: true, deferredKvWrites: null };
    }
    return {
      authorized: true,
      deferredKvWrites: async () => {
        await kv.put(accountKvKeys.sessionUser(sessionId), username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        await kv.put(accountKvKeys.usernameSession(username), sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      },
    };
  }

  if (existingOwner === sessionId) {
    return {
      authorized: true,
      deferredKvWrites: async () => {
        await kv.put(accountKvKeys.sessionUser(sessionId), username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      },
    };
  }

  if (!allowRenameRepair) return { authorized: false };
  if (!sessionUsername) return { authorized: false };
  if (!(await resolveRenamedSessionUsername(kv, sessionUsername, username))) return { authorized: false };
  if (!(await canSessionClaimUsername(kv, sessionId, username))) return { authorized: false };
  return {
    authorized: true,
    deferredKvWrites: async () => {
      await kv.put(accountKvKeys.sessionUser(sessionId), username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      await kv.put(accountKvKeys.usernameSession(username), sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
    },
  };
}

/**
 * Verify session ownership for free-user score writes.
 * For existing users, checks session_user mapping.
 * For new users, enforces first-claim-wins but DEFERS KV writes so they
 * only execute after the DB batch succeeds — preventing orphaned KV
 * entries when the DB write fails.
 */
async function verifyFreeSessionOwnership(
  params: {
    kv: KVNamespace;
    sessionId: string;
    username: string;
    existingRow: { account_id: string | null } | null;
    trustedFreeAccountId: string | undefined;
  },
): Promise<OwnershipCheckResult> {
  const { kv, sessionId, username, existingRow, trustedFreeAccountId } = params;
  if (existingRow) {
    const sessionUsername = await kv.get(`session_user:${sessionId}`);
    if (sameUsername(sessionUsername, username)) {
      const accountId = existingRow.account_id ?? crypto.randomUUID();
      if (sessionUsername === username) return { error: null, deferredKvWrites: null, accountId };
      return {
        error: null,
        accountId,
        deferredKvWrites: async () => {
          await kv.put(`session_user:${sessionId}`, username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        },
      };
    }

    const existingOwner = await kv.get(`username_session:${username}`);
    if (existingOwner === sessionId) {
      const accountId = existingRow.account_id ?? crypto.randomUUID();
      return {
        error: null,
        accountId,
        deferredKvWrites: async () => {
          await kv.put(`session_user:${sessionId}`, username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        },
      };
    }

    if (
      sessionUsername
      && await resolveRenamedSessionUsername(kv, sessionUsername, username)
      && await canSessionClaimUsername(kv, sessionId, username)
    ) {
      const accountId = existingRow.account_id ?? crypto.randomUUID();
      return {
        error: null,
        accountId,
        deferredKvWrites: async () => {
          await kv.put(`session_user:${sessionId}`, username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
          await kv.put(`username_session:${username}`, sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        },
      };
    }

    if (existingRow.account_id && trustedFreeAccountId === existingRow.account_id) {
      return {
        error: null,
        accountId: existingRow.account_id,
        deferredKvWrites: async () => {
          await kv.put(`session_user:${sessionId}`, username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
          await kv.put(`username_session:${username}`, sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        },
      };
    }

    return { error: "Session does not own this username" };
  } else {
    const existingOwner = await kv.get(`username_session:${username}`);
    if (existingOwner && existingOwner !== sessionId) return { error: "Session does not own this username" };
    // Defer KV writes until after DB persistence succeeds.
    const accountId = crypto.randomUUID();
    return {
      error: null,
      accountId,
      deferredKvWrites: async () => {
        await kv.put(`session_user:${sessionId}`, username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
        await kv.put(`username_session:${username}`, sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      },
    };
  }
}

/**
 * POST /api/score — debounced sync from client.
 * Validates the claimed score against server-side tracking.
 * The server's total_td is the floor — client can't claim more than what the server has awarded.
 */
// eslint-disable-next-line complexity
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
    if (resolution.profile === null) {
      return c.json({ error: resolution.error }, resolution.code === "revoked" ? 403 : 409);
    }
    const { profile } = resolution;
    const updated = await syncResolvedProUser(db, body, profile);
    if (updated) return c.json({ profile: updated });
    return c.json({ error: "Pro score sync failed — please retry" }, 500);
  }

  // Guard: if this username already has a license_hash, refuse unauthenticated writes.
  const existingRow = await db
    .prepare("SELECT total_td, current_td, last_sync_time, license_hash, account_id FROM user_scores WHERE username = ?")
    .bind(body.username)
    .first<{ total_td: number; current_td: number; last_sync_time: string; license_hash: string | null; account_id: string | null }>();

  if (existingRow?.license_hash) {
    const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
    const sessionId = c.get("sessionId");
    if (!kv) {
      return c.json({ error: "Cannot verify session ownership — please retry" }, 503);
    }
    const sessionAuthorization = await isSessionAuthorizedForUsername(kv, sessionId, body.username, {
      allowRenameRepair: false,
    });
    if (!sessionAuthorization.authorized) {
      return c.json({ error: "This account is linked to a Pro license — authenticate with proKeyHash" }, 403);
    }
    const licenseActive = await isLicenseActive(db, existingRow.license_hash);
    if (!licenseActive) {
      return c.json({ error: "License has been revoked or is not active" }, 403);
    }
    const profile = await getProfileByLicenseHash(db, existingRow.license_hash);
    if (!profile) {
      return c.json({ error: "Pro score sync failed — please retry" }, 500);
    }
    if (profile.username !== body.username) {
      return c.json({ error: "Username does not match the license owner" }, 409);
    }
    const updated = await syncResolvedProUser(db, body, profile);
    if (updated) {
      if (sessionAuthorization.deferredKvWrites) {
        await sessionAuthorization.deferredKvWrites();
      }
      return c.json({ profile: updated });
    }
    return c.json({ error: "Pro score sync failed — please retry" }, 500);
  }

  // Session-based ownership: both new and existing free users require session verification.
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const sessionId = c.get("sessionId");
  if (!kv) {
    return c.json({ error: "Cannot verify session ownership — please retry" }, 503);
  }
  const ownershipResult = await verifyFreeSessionOwnership({
    kv,
    sessionId,
    username: body.username,
    existingRow: existingRow ? { account_id: existingRow.account_id } : null,
    trustedFreeAccountId: c.get("freeAccountId"),
  });
  if (ownershipResult.error) {
    return c.json({ error: ownershipResult.error }, 403);
  }
  const { accountId, deferredKvWrites } = ownershipResult as Extract<OwnershipCheckResult, { error: null }>;

  const claimedMultiplier = computeMultiplier(body.inventory, body.upgrades);

  const existing = existingRow as { total_td: number; current_td: number; last_sync_time: string } | null;

  const serverTotal = existing?.total_td ?? 0;
  const { validatedTaskBonus, validatedClaims } = await validateTaskBonuses(db, body.username, body.completedTaskIds);

  const timeClampedTotal = computeTimeCap(existing, serverTotal, claimedMultiplier, validatedTaskBonus);
  const validatedTotal = Math.min(body.totalTDEarned, Math.round(serverTotal * 1.1) + validatedTaskBonus, Math.round(timeClampedTotal));
  const validatedCurrent = Math.min(body.currentTD, validatedTotal);

  const rank = resolveRankAndFlags(body.totalTDEarned, serverTotal);
  const batchStatements = buildScoreBatch(db, {
    existing, serverTotal, validatedTotal, validatedCurrent,
    rank, country, username: body.username, accountId, validatedClaims,
  });

  try {
    await db.batch(batchStatements);
  } catch {
    return c.json({ error: "Score sync failed — please retry" }, 500);
  }

  // KV ownership writes are deferred until after DB persistence succeeds.
  // If db.batch() threw, these never execute — no orphaned KV entries.
  if (deferredKvWrites) {
    await deferredKvWrites();
  }

  await issueFreeAccountCookie(c, c.env.FREE_ACCOUNT_COOKIE_SECRET, accountId);

  const finalTotal = existing ? Math.max(serverTotal, validatedTotal) : validatedTotal;
  return c.json({
    total_td: finalTotal,
    current_td: validatedCurrent,
    corporate_rank: rank,
    multiplier: claimedMultiplier,
  });
});

export default score;
