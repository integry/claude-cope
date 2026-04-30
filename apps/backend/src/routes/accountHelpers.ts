import { getProfile, getProfileByLicenseHash, getProfileRow, resolveRank } from "../utils/profile";
import { validatePolarKey } from "../utils/polar";
import { hashKey } from "../utils/quota";

export type SyncBody = {
  licenseKey?: string;
  username?: string;
  currentProfile?: {
    total_td?: number;
    current_td?: number;
    corporate_rank?: string;
    inventory?: Record<string, number>;
    upgrades?: string[];
    achievements?: string[];
    buddy_type?: string | null;
    buddy_is_shiny?: boolean;
    unlocked_themes?: string[];
    active_theme?: string;
    active_ticket?: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null;
  };
};

function buildProfileCosmetics(cp: SyncBody["currentProfile"]) {
  // Only truly cosmetic preferences are accepted from the client.
  // unlocked_themes, active_theme, and active_ticket are server-authoritative:
  // themes are paid items that must not be mintable or activated via a forged
  // first-sync payload, and ticket state must not be restored from stale
  // client data.  active_theme is always "default" for new profiles because
  // the server initializes unlocked_themes to ["default"] — accepting a
  // client-supplied theme here would bypass the paid-theme gate.
  return {
    buddyType: cp?.buddy_type ?? null,
    buddyIsShiny: cp?.buddy_is_shiny ? 1 : 0,
  };
}

type CreateProfileResult =
  | { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined }
  | { profile: null; error: string };

async function createProfileFromClient(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<CreateProfileResult> {
  const newUsername = body.username?.trim();
  if (!newUsername) {
    return { profile: null, error: "Username is required — please set a username before activating." };
  }

  // Check if username already exists.
  const existing = await db
    .prepare("SELECT license_hash FROM user_scores WHERE username = ?")
    .bind(newUsername)
    .first<{ license_hash: string | null }>();
  if (existing) {
    if (existing.license_hash === hash) {
      // Already belongs to this license — just return the existing profile
      const profile = await getProfile(db, newUsername);
      if (!profile) return { profile: null, error: "Profile not found after lookup" };
      return { profile };
    }
    if (existing.license_hash === null) {
      // Free user upgrading to Max — attach the license to their existing profile.
      // Verify the caller's session is bound to this username to prevent an
      // attacker from seizing another free user's profile by sending /sync
      // with their username. Fail closed if no sessionContext: without it we
      // have no way to verify ownership of an existing free row, so refuse
      // the upgrade rather than allowing it unconditionally.
      if (!sessionContext) {
        return { profile: null, error: "Session required to upgrade an existing username." };
      }
      const boundUsername = await sessionContext.kv.get(`session_user:${sessionContext.sessionId}`);
      if (boundUsername !== newUsername) {
        return { profile: null, error: "Cannot claim an existing free username — log in to that account first or pick a different username." };
      }
      // Preserve the server-authoritative profile data (TD, inventory, etc.).
      // The WHERE clause includes `license_hash IS NULL` so that under a
      // concurrent /sync race only one request can claim the row. Check
      // result.meta.changes to detect if another request won the race.
      const upgradeResult = await db
        .prepare("UPDATE user_scores SET license_hash = ?, updated_at = datetime('now') WHERE username = ? AND license_hash IS NULL")
        .bind(hash, newUsername)
        .run();
      if (!upgradeResult.meta.changes) {
        // Another concurrent request already attached a license to this row.
        return { profile: null, error: "This username was just claimed by another request. Please try again." };
      }
      const profile = await getProfile(db, newUsername);
      if (!profile) return { profile: null, error: "Profile not found after upgrade" };
      return { profile };
    }
    // Username is owned by a different license — refuse
    return { profile: null, error: "This username is already taken. Please change your username and try again." };
  }

  // New profile for a freshly activated license — use server-authoritative defaults.
  // Only cosmetic preferences (theme, buddy) are accepted from the client; scoring
  // fields (TD, inventory, upgrades, achievements) start at zero to prevent a
  // forged first-sync payload from minting arbitrary progress.
  // TODO(byok): Profile creation only supports Pro licenses. BYOK users have no
  // server-side persistence — their progress lives in localStorage only. To support
  // cross-device sync for BYOK, add an apiKey-hash field to user_scores.
  const c = buildProfileCosmetics(body.currentProfile);
  const defaultRank = resolveRank(0);

  try {
    await db
      .prepare(
        `INSERT INTO user_scores (username, total_td, current_td, corporate_rank, license_hash, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier)
         VALUES (?, 0, 0, ?, ?, '{}', '[]', '[]', ?, ?, '["default"]', 'default', NULL, 1.0)`,
      )
      .bind(
        newUsername, defaultRank, hash,
        c.buddyType, c.buddyIsShiny,
      )
      .run();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Catch UNIQUE constraint violations from concurrent /sync requests racing
    // on the same username or license_hash.
    if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) {
      return { profile: null, error: "This username or license is being activated by another request. Please try again." };
    }
    throw err;
  }

  const profile = await getProfile(db, newUsername);
  if (!profile) return { profile: null, error: "Failed to create profile" };
  return { profile };
}

type ResolveProfileResult =
  | { restored: boolean; profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined }
  | { restored: false; profile: null; error: string };

export async function resolveProfile(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<ResolveProfileResult> {
  // Case 1: Existing profile with this license_hash → restore (cross-device sync)
  const existingByHash = await getProfileByLicenseHash(db, hash);
  if (existingByHash) {
    return { restored: true, profile: existingByHash };
  }

  // Case 2: No profile for this license → create a new one, or upgrade an
  // existing free (unlicensed) profile if the username matches.
  const created = await createProfileFromClient(db, hash, body, sessionContext);
  if ('error' in created && created.error) {
    return { restored: false, profile: null, error: created.error };
  }
  // After error check, created.profile is guaranteed non-null by CreateProfileResult union
  return { restored: false, profile: created.profile! };
}

export type OwnershipResult =
  | { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; status: "ok" }
  | { profile: null; status: "not_found"; error: string }
  | { profile: null; status: "unauthorized"; error: string };

export async function verifyOwnership(db: D1Database, username: string, licenseKeyHash: string): Promise<OwnershipResult> {
  const row = await getProfileRow(db, username);
  if (!row) return { profile: null, status: "not_found", error: "Profile not found" };
  const rowWithHash = row as unknown as { license_hash: string | null };
  if (!rowWithHash.license_hash || rowWithHash.license_hash !== licenseKeyHash) {
    return { profile: null, status: "unauthorized", error: "Unauthorized: license key does not match this profile" };
  }

  // Verify the license is still active in the local licenses table.
  const license = await db
    .prepare("SELECT status FROM licenses WHERE key_hash = ?")
    .bind(licenseKeyHash)
    .first<{ status: string }>();
  if (!license || license.status !== "active") {
    return { profile: null, status: "unauthorized", error: "License has been revoked or is no longer active" };
  }

  const profile = await getProfile(db, username);
  if (!profile) return { profile: null, status: "not_found", error: "Profile not found" };
  return { profile, status: "ok" };
}

export function broadcastPurchase(message: string, db: D1Database | undefined, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
  if (db) {
    ctx.waitUntil(
      db.prepare("INSERT INTO recent_events (message) VALUES (?)").bind(message).run(),
    );
  }
}

async function ensureQuota(kv: KVNamespace, hash: string, proInitialQuota: number): Promise<void> {
  const kvKey = `polar:${hash}`;
  const existingQuota = await kv.get(kvKey);
  if (existingQuota !== null) return;

  const revokedKey = `polar_revoked:${hash}`;
  const savedQuota = await kv.get(revokedKey);
  if (savedQuota !== null) {
    await kv.put(kvKey, savedQuota);
    await kv.delete(revokedKey);
  } else {
    await kv.put(kvKey, String(proInitialQuota));
  }
}

export async function validateSyncRequest(c: { req: { json: <T>() => Promise<T> }; env?: { POLAR_ACCESS_TOKEN?: string; POLAR_ORGANIZATION_ID?: string; QUOTA_KV?: KVNamespace; USAGE_KV?: KVNamespace; DB?: D1Database }; json: (data: unknown, status?: number) => Response }) {
  const body = await c.req.json<SyncBody>();
  if (!body.licenseKey) {
    return { error: c.json({ error: "licenseKey is required" }, 400) } as const;
  }

  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) {
    return { error: c.json({ error: "Polar integration is not configured" }, 500) } as const;
  }

  const validation = await validatePolarKey(body.licenseKey, accessToken, organizationId);
  if (!validation.valid) {
    return { error: c.json({ error: "Invalid or inactive license key", status: validation.status }, 403) } as const;
  }

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return { error: c.json({ error: "KV storage is not configured" }, 500) } as const;
  }

  const db = c.env?.DB;
  if (!db) {
    return { error: c.json({ error: "Database not configured" }, 500) } as const;
  }

  const hash = await hashKey(body.licenseKey);
  return { body, validation, kv, db, hash } as const;
}

export async function commitSyncSideEffects(
  deps: { db: D1Database; kv: KVNamespace; hash: string },
  opts: { validationId?: string; proInitialQuota: number; sessionId?: string },
) {
  const { db, kv, hash } = deps;
  await db
    .prepare(
      "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')",
    )
    .bind(hash)
    .run();

  await ensureQuota(kv, hash, opts.proInitialQuota);

  if (opts.validationId) {
    await kv.put(`polar_id:${hash}`, opts.validationId);
  }
}

const MAX_TICKET_TITLE_LEN = 200;
const MAX_TICKET_ID_LEN = 100;

export function validateActiveTicket(ticket: unknown): string | null {
  if (ticket === null || ticket === undefined) return null;
  if (typeof ticket !== "object") return "activeTicket must be an object or null";
  const t = ticket as Record<string, unknown>;
  if (typeof t.id !== "string" || !t.id || t.id.length > MAX_TICKET_ID_LEN) return "Invalid ticket id";
  if (typeof t.title !== "string" || !t.title || t.title.length > MAX_TICKET_TITLE_LEN) return "Invalid ticket title";
  if (!Number.isFinite(t.sprintProgress) || (t.sprintProgress as number) < 0) return "Invalid sprintProgress";
  if (!Number.isFinite(t.sprintGoal) || (t.sprintGoal as number) <= 0) return "Invalid sprintGoal";
  if ((t.sprintProgress as number) > (t.sprintGoal as number)) return "sprintProgress cannot exceed sprintGoal";
  return null;
}

export function validateAlias(raw: string): { alias: string; error?: undefined } | { alias?: undefined; error: string } {
  const alias = raw.trim();
  if (alias.length < 3 || alias.length > 33) return { error: "Alias must be between 3 and 33 characters" };
  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) return { error: "Alias can only contain letters, numbers, hyphens, and underscores" };
  if (!/[a-zA-Z]/.test(alias)) return { error: "Alias must contain at least one letter" };
  return { alias };
}

export async function checkAliasRateLimit(
  db: D1Database, licenseKeyHash: string, limit: number,
): Promise<{ allowed: boolean }> {
  // Atomic check-and-claim via D1's ACID guarantees.
  // INSERT creates count=1 on first change of the day; ON CONFLICT atomically
  // increments only while the count is below the limit. Two concurrent requests
  // are serialized by SQLite's write lock, so the KV get/put race is eliminated.
  const result = await db
    .prepare(
      `INSERT INTO alias_rate_limits (license_key_hash, change_date, change_count)
       VALUES (?, date('now'), 1)
       ON CONFLICT(license_key_hash, change_date)
       DO UPDATE SET change_count = change_count + 1
       WHERE change_count < ?`,
    )
    .bind(licenseKeyHash, limit)
    .run();
  return { allowed: Boolean(result.meta.changes) };
}

export async function rollbackAliasRateToken(
  db: D1Database, licenseKeyHash: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE alias_rate_limits SET change_count = MAX(change_count - 1, 0)
       WHERE license_key_hash = ? AND change_date = date('now')`,
    )
    .bind(licenseKeyHash)
    .run();
}

export async function performAliasDbUpdate(
  db: D1Database, oldUsername: string, newAlias: string, licenseKeyHash: string,
): Promise<{ success: true } | { success: false; error: string; status: 409 | 500 }> {
  const taken = await db
    .prepare("SELECT 1 FROM user_scores WHERE LOWER(username) = LOWER(?) AND username != ?")
    .bind(newAlias, oldUsername)
    .first();
  if (taken) {
    return { success: false, error: "This alias is already taken", status: 409 };
  }

  let results: D1Result[];
  try {
    results = await db.batch([
      db.prepare(
        `UPDATE user_scores SET username = ?, updated_at = datetime('now')
         WHERE username = ? AND license_hash = ?
           AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
      ).bind(newAlias, oldUsername, licenseKeyHash),
      db.prepare("UPDATE completed_tasks SET username = ? WHERE username = ?")
        .bind(newAlias, oldUsername),
    ]) as D1Result[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) {
      return { success: false, error: "This alias is already taken", status: 409 };
    }
    return { success: false, error: "Alias update failed — please retry", status: 500 };
  }

  const updateResult = results[0] as D1Result;
  if (!updateResult.meta.changes) {
    return { success: false, error: "Update failed — profile not found, license mismatch, or license revoked", status: 409 };
  }

  return { success: true };
}

export { getQuotaLimits, getQuotaPercent } from "../utils/quota";
