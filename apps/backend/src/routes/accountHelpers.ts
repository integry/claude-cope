import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getProfile, getProfileByLicenseHash, getProfileRow, resolveRank } from "../utils/profile";
import { getQuotaLimits } from "../utils/quota";

export type PolarCheckout = {
  organization_id?: string;
  status?: string;
  customer_id?: string | null;
  customer?: { id?: string };
  created_at?: string;
};

export type PolarLicenseKeyItem = {
  key: string;
  created_at: string;
  status: string;
};

const MAX_KEY_MINT_WINDOW_MS = 15 * 60 * 1000;
const MAX_KEY_FALLBACK_WINDOW_MS = 60 * 60 * 1000;

// Returns ALL keys minted by a checkout, ordered oldest-first.
// Uses a time window after checkout creation to avoid returning keys from later purchases.
// NOTE: The Polar API does not expose a direct checkout→license-key mapping, so we
// cannot cryptographically prove a key was created by a specific checkout. Session
// binding via claimCheckoutForSession is the primary security control; this filter
// is a best-effort heuristic to scope down to the correct keys.
// KNOWN LIMITATION: if the same customer makes two purchases within the time window,
// keys from both purchases may be returned. The KV cache ensures consistency on
// repeat calls, but the first call may include extra keys.
export function pickAllLicenseKeys(granted: PolarLicenseKeyItem[], checkoutCreatedAt: string): PolarLicenseKeyItem[] {
  const checkoutTime = new Date(checkoutCreatedAt).getTime();
  if (!Number.isFinite(checkoutTime)) return [];
  const sorted = [...granted].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const upperBound = checkoutTime + MAX_KEY_MINT_WINDOW_MS;
  const windowed = sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && t <= upperBound;
  });
  if (windowed.length > 0) return windowed;

  // Fallback: if Polar minted keys beyond the primary window (delayed
  // processing), extend to 1 hour. This prevents permanent rejection of
  // legitimate purchases without returning keys from unrelated later orders.
  const fallbackBound = checkoutTime + MAX_KEY_FALLBACK_WINDOW_MS;
  return sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && t <= fallbackBound;
  });
}

const MAX_LICENSE_KEY_PAGES = 3;
const LICENSE_KEY_PAGE_SIZE = 100;

export async function fetchLicenseKeys(
  customerId: string,
  organizationId: string,
  accessToken: string,
  createdAt: string,
): Promise<{ keys: string[] } | { error: string; status: ContentfulStatusCode }> {
  const allItems: PolarLicenseKeyItem[] = [];
  for (let page = 1; page <= MAX_LICENSE_KEY_PAGES; page++) {
    let lkResp: Response;
    try {
      lkResp = await fetch(
        `https://api.polar.sh/v1/license-keys/?customer_id=${encodeURIComponent(customerId)}&organization_id=${encodeURIComponent(organizationId)}&limit=${LICENSE_KEY_PAGE_SIZE}&page=${page}&sorting=-created_at`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch {
      return { error: "Unable to reach Polar — please try again", status: 502 };
    }
    if (!lkResp.ok) return { error: "Failed to list license keys", status: 502 };
    const lkData = await lkResp.json() as { items?: PolarLicenseKeyItem[] };
    const items = lkData.items ?? [];
    allItems.push(...items);
    if (items.length < LICENSE_KEY_PAGE_SIZE) break;
  }
  const granted = allItems.filter((l) => l.status === "granted");
  if (!granted.length) return { error: "No license issued yet — try again in a few seconds", status: 409 };
  const allKeys = pickAllLicenseKeys(granted, createdAt);
  if (!allKeys.length) return { error: "No license issued yet — try again in a few seconds", status: 409 };
  return { keys: allKeys.map((k) => k.key) };
}

export async function fetchCheckoutCustomerId(checkoutId: string, accessToken: string, organizationId: string): Promise<{ customerId: string; createdAt?: string } | { error: string; status: ContentfulStatusCode }> {
  let resp: Response;
  try {
    resp = await fetch(`https://api.polar.sh/v1/checkouts/${encodeURIComponent(checkoutId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return { error: "Unable to reach Polar — please try again", status: 502 };
  }
  if (!resp.ok) {
    if (resp.status >= 500) return { error: "Polar is temporarily unavailable — please try again", status: 502 };
    if (resp.status === 404) return { error: "Invalid checkout id", status: 400 };
    return { error: `Polar returned an unexpected error (${resp.status})`, status: 502 };
  }
  const checkout = await resp.json() as PolarCheckout;
  if (checkout.organization_id !== organizationId) return { error: "Checkout belongs to a different organization", status: 403 };
  if (checkout.status !== "succeeded") return { error: "Payment not yet confirmed", status: 409 };
  const customerId = checkout.customer_id || checkout.customer?.id;
  if (!customerId) return { error: "Checkout has no associated customer", status: 500 };
  return { customerId, createdAt: checkout.created_at };
}

export type CheckoutCache = {
  keys: string[];
  sessionId: string;
};

function isNonEmptyStringArray(arr: unknown[]): arr is string[] {
  return arr.length > 0 && arr.every((v) => typeof v === "string" && v.length > 0);
}

export function parseCheckoutCache(raw: string): CheckoutCache | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (!isNonEmptyStringArray(parsed)) return null;
      return { keys: parsed, sessionId: "" };
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.keys)) {
      if (!isNonEmptyStringArray(parsed.keys)) return null;
      const sid = parsed.sessionId;
      if (sid !== undefined && sid !== null && typeof sid !== "string") return null;
      return { keys: parsed.keys, sessionId: typeof sid === "string" ? sid : "" };
    }
    return null;
  } catch {
    if (typeof raw === "string" && raw.length > 0 && /^[A-Za-z0-9_-]+$/.test(raw)) return { keys: [raw], sessionId: "" };
    return null;
  }
}

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

export const SHILL_CREDIT = 5;

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

export async function commitSyncSideEffects(
  deps: { db: D1Database; kv: KVNamespace; hash: string },
  opts: { validationId?: string; limits: ReturnType<typeof getQuotaLimits>; sessionId?: string },
) {
  const { db, kv, hash } = deps;
  await db
    .prepare(
      "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')",
    )
    .bind(hash)
    .run();

  await ensureQuota(kv, hash, opts.limits.proInitialQuota);

  if (opts.validationId) {
    await kv.put(`polar_id:${hash}`, opts.validationId);
  }
}

export async function claimCheckoutForSession(
  db: D1Database,
  checkoutId: string,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const result = await db
      .prepare(
        "INSERT INTO checkout_claims (checkout_id, session_id) VALUES (?, ?) ON CONFLICT(checkout_id) DO NOTHING",
      )
      .bind(checkoutId, sessionId)
      .run();

    if (result.meta.changes) {
      return { ok: true };
    }

    const existing = await db
      .prepare("SELECT session_id FROM checkout_claims WHERE checkout_id = ?")
      .bind(checkoutId)
      .first<{ session_id: string }>();

    if (existing && existing.session_id === sessionId) {
      return { ok: true };
    }

    return { ok: false, error: "This checkout was already claimed by another session" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("no such table") || msg.includes("checkout_claims")) {
      return { ok: false, error: "Checkout claim table is not available — please try again later" };
    }
    return { ok: false, error: "Unable to verify checkout claim — please try again" };
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
