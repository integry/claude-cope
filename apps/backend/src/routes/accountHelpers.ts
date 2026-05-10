/* eslint-disable max-lines */
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ProfileRow } from "../utils/profile";
import { getProfile, getProfileByLicenseHash, getProfileRow, isLicenseActive, resolveRank } from "../utils/profile";
import { validatePolarKey } from "../utils/polar";
import { hashKey } from "../utils/quota";

const LICENSE_STALE_SQL_CUTOFF = "-90 days";
const MAX_SESSION_RENAME_HOPS = 32;
const SESSION_USERNAME_TTL_SECONDS = 60 * 60 * 24 * 365;
const RENAME_REDIRECT_TTL_SECONDS = SESSION_USERNAME_TTL_SECONDS;
export const accountKvKeys = {
  renamed: (username: string) => `renamed:${username}`,
  sessionUser: (sessionId: string) => `session_user:${sessionId}`,
  shill: (sessionId: string) => `shill:${sessionId}`,
  usernameSession: (username: string) => `username_session:${username}`,
} as const;
export const ACTIVE_LICENSE_EXISTS_SQL =
  `EXISTS (
     SELECT 1 FROM licenses
     WHERE key_hash = user_scores.license_hash
       AND status = 'active'
       AND datetime(last_activated_at) >= datetime('now', '${LICENSE_STALE_SQL_CUTOFF}')
   )`;

export type PolarCheckout = {
  id?: string;
  organization_id?: string;
  status?: string;
  customer_id?: string | null;
  customer?: { id?: string };
  created_at?: string;
  metadata?: Record<string, unknown>;
};
export type PolarLicenseKeyItem = { key: string; created_at: string; status: string };
export type CheckoutCache = { keys: string[]; sessionId: string };

const MAX_KEY_MINT_WINDOW_MS = 15 * 60 * 1000;
const MAX_KEY_FALLBACK_WINDOW_MS = 60 * 60 * 1000;
const MAX_FALLBACK_CLUSTER_GAP_MS = 2 * 60 * 1000;
const LICENSE_KEY_PAGE_SIZE = 100;
const CHECKOUT_PAGE_SIZE = 100;
const CHECKOUT_CLAIM_CIPHER_VERSION = 1;
const CHECKOUT_CLAIM_KEY_INFO = "checkout-claim:v1";

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
  | { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; mutation: SyncProfileMutation; error?: undefined }
  | { profile: null; error: string; mutation?: undefined };

type SyncProfileMutation =
  | { kind: "none" }
  | { kind: "created"; username: string }
  | { kind: "attached_license"; username: string; previousUsername: string };

async function createProfileFromClient(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<CreateProfileResult> {
  const newUsername = body.username?.trim();
  if (!newUsername) {
    return { profile: null, error: "Username is required — please set a username before activating." };
  }

  // Check if username already exists.
  const existing = await db
    .prepare("SELECT username, license_hash FROM user_scores WHERE LOWER(username) = LOWER(?)")
    .bind(newUsername)
    .first<{ username: string; license_hash: string | null }>();
  if (existing) {
    const existingUsername = existing.username;
    if (existing.license_hash === hash) {
      // Already belongs to this license — just return the existing profile
      const profile = await getProfile(db, existingUsername);
      if (!profile) return { profile: null, error: "Profile not found after lookup" };
      return { profile, mutation: { kind: "none" } };
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
      const boundUsername = await sessionContext.kv.get(accountKvKeys.sessionUser(sessionContext.sessionId));
      if (boundUsername?.toLowerCase() !== existingUsername.toLowerCase()) {
        return { profile: null, error: "Cannot claim an existing free username — log in to that account first or pick a different username." };
      }
      // Preserve the server-authoritative profile data (TD, inventory, etc.).
      // The WHERE clause includes `license_hash IS NULL` so that under a
      // concurrent /sync race only one request can claim the row. Check
      // result.meta.changes to detect if another request won the race.
      const upgradeResult = await db
        .prepare("UPDATE user_scores SET username = ?, license_hash = ?, updated_at = datetime('now') WHERE username = ? AND license_hash IS NULL")
        .bind(newUsername, hash, existingUsername)
        .run();
      if (!upgradeResult.meta.changes) {
        // Another concurrent request already attached a license to this row.
        return { profile: null, error: "This username was just claimed by another request. Please try again." };
      }
      const profile = await getProfile(db, newUsername);
      if (!profile) return { profile: null, error: "Profile not found after upgrade" };
      return { profile, mutation: { kind: "attached_license", username: newUsername, previousUsername: existingUsername } };
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
  return { profile, mutation: { kind: "created", username: newUsername } };
}

type ResolveProfileResult =
  | { restored: boolean; profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; mutation: SyncProfileMutation; error?: undefined }
  | { restored: false; profile: null; error: string; mutation?: undefined };

export async function resolveProfile(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<ResolveProfileResult> {
  // Case 1: Existing profile with this license_hash → restore (cross-device sync)
  const existingByHash = await getProfileByLicenseHash(db, hash);
  if (existingByHash) {
    return { restored: true, profile: existingByHash, mutation: { kind: "none" } };
  }

  // Case 2: No profile for this license → create a new one, or upgrade an
  // existing free (unlicensed) profile if the username matches.
  const created = await createProfileFromClient(db, hash, body, sessionContext);
  if (created.profile === null) {
    return { restored: false, profile: null, error: created.error };
  }
  return { restored: false, profile: created.profile, mutation: created.mutation };
}

export async function rollbackProfileMutation(
  db: D1Database,
  hash: string,
  mutation: SyncProfileMutation,
): Promise<void> {
  if (mutation.kind === "none") return;
  if (mutation.kind === "created") {
    await db
      .prepare("DELETE FROM user_scores WHERE username = ? AND license_hash = ?")
      .bind(mutation.username, hash)
      .run();
    return;
  }

  await db
    .prepare("UPDATE user_scores SET username = ?, license_hash = NULL, updated_at = datetime('now') WHERE username = ? AND license_hash = ?")
    .bind(mutation.previousUsername, mutation.username, hash)
    .run();
}

export type OwnershipResult =
  | { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; status: "ok"; licenseKeyHash: string }
  | { profile: null; status: "not_found"; error: string }
  | { profile: null; status: "unauthorized"; error: string };

async function followRenameChain(kv: KVNamespace, username: string) {
  let current = username;
  let hops = 0;
  const seen = new Set([username]);
  const traversed = [username];

  while (hops < MAX_SESSION_RENAME_HOPS) {
    const renamedTo = await kv.get(accountKvKeys.renamed(current));
    if (!renamedTo || seen.has(renamedTo)) {
      break;
    }
    current = renamedTo;
    seen.add(current);
    traversed.push(current);
    hops += 1;
  }

  return { current, hops, traversed };
}

export async function resolveSessionProfileRow(opts: {
  db: D1Database | undefined;
  kv: KVNamespace;
  sessionId: string;
  username: string;
  logPrefix?: string;
}): Promise<{ username: string; row: ProfileRow | null; redirected?: boolean }> {
  const { db, kv, sessionId } = opts;
  const originalUsername = opts.username;
  const logPrefix = opts.logPrefix ?? "[account/session]";
  if (!db) return { username: originalUsername, row: null };

  const originalRow = await getProfileRow(db, originalUsername);
  if (originalRow) {
    return { username: originalUsername, row: originalRow, redirected: false };
  }

  const { current, hops, traversed } = await followRenameChain(kv, originalUsername);

  if (hops === MAX_SESSION_RENAME_HOPS) {
    console.warn(`${logPrefix} rename chain hop cap reached for ${originalUsername}`);
  }

  const row = await getProfileRow(db, current);
  const redirected = current !== originalUsername;

  if (row && redirected) {
    try {
      await kv.put(accountKvKeys.sessionUser(sessionId), current, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      await Promise.all(
        traversed
          .slice(0, -1)
          .map((username) => kv.put(accountKvKeys.renamed(username), current, { expirationTtl: RENAME_REDIRECT_TTL_SECONDS })),
      );
    } catch (err: unknown) {
      console.warn(
        `${logPrefix} failed to repair session rename ${originalUsername} -> ${current}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { username: current, row, redirected };
}

export async function verifyOwnership(db: D1Database, username: string, licenseKeyHash: string): Promise<OwnershipResult> {
  const row = await getProfileRow(db, username);
  if (!row) return { profile: null, status: "not_found", error: "Profile not found" };
  const rowWithHash = row as unknown as { license_hash: string | null };
  if (!rowWithHash.license_hash || rowWithHash.license_hash !== licenseKeyHash) {
    return { profile: null, status: "unauthorized", error: "Unauthorized: license key does not match this profile" };
  }

  // Keep paid mutation routes aligned with /me and score gating semantics:
  // stale "active" rows are treated as revoked until refreshed.
  if (!(await isLicenseActive(db, licenseKeyHash))) {
    return { profile: null, status: "unauthorized", error: "License has been revoked or is no longer active" };
  }

  const profile = await getProfile(db, username);
  if (!profile) return { profile: null, status: "not_found", error: "Profile not found" };
  return { profile, status: "ok", licenseKeyHash };
}

export async function resolveThemePurchaseOwnership(
  db: D1Database,
  opts: {
    username: string;
    licenseKeyHash?: string;
    kv?: KVNamespace;
    sessionId?: string;
  },
): Promise<OwnershipResult> {
  if (opts.licenseKeyHash) {
    const ownership = await verifyOwnership(db, opts.username, opts.licenseKeyHash);
    if (ownership.status === "ok" || !opts.kv || !opts.sessionId) {
      return ownership;
    }
  }

  if (!opts.kv || !opts.sessionId) {
    return { profile: null, status: "unauthorized", error: "Session authentication is required for this purchase" };
  }

  const boundUsername = await opts.kv.get(accountKvKeys.sessionUser(opts.sessionId));
  if (!boundUsername) {
    return { profile: null, status: "unauthorized", error: "Session authentication is required for this purchase" };
  }

  const resolved = await resolveSessionProfileRow({
    db,
    kv: opts.kv,
    sessionId: opts.sessionId,
    username: boundUsername,
    logPrefix: "[account/buy-theme]",
  });
  if (!resolved.row) {
    if (boundUsername.toLowerCase() !== opts.username.toLowerCase()) {
      const requestedAlias = await followRenameChain(opts.kv, opts.username);
      if (requestedAlias.current.toLowerCase() !== boundUsername.toLowerCase()) {
        return { profile: null, status: "unauthorized", error: "Unauthorized: session user does not match this profile" };
      }
    }
    return { profile: null, status: "not_found", error: "Profile not found" };
  }
  const requestedUsername = opts.username.toLowerCase();
  const sessionMatchesRequested = resolved.username.toLowerCase() === requestedUsername
    || boundUsername.toLowerCase() === requestedUsername;
  const requestedAlias = sessionMatchesRequested ? null : await followRenameChain(opts.kv, opts.username);
  if (!sessionMatchesRequested && requestedAlias?.current.toLowerCase() !== resolved.username.toLowerCase()) {
    return { profile: null, status: "unauthorized", error: "Unauthorized: session user does not match this profile" };
  }

  const row = resolved.row as typeof resolved.row & { license_hash: string | null };
  if (!row) return { profile: null, status: "not_found", error: "Profile not found" };
  if (!row.license_hash) {
    return { profile: null, status: "unauthorized", error: "An active Max license is required to purchase themes" };
  }

  if (!(await isLicenseActive(db, row.license_hash))) {
    return { profile: null, status: "unauthorized", error: "License has been revoked or is no longer active" };
  }

  const profile = await getProfile(db, resolved.username);
  if (!profile) return { profile: null, status: "not_found", error: "Profile not found" };
  return { profile, status: "ok", licenseKeyHash: row.license_hash };
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

async function rollbackLicenseActivation(
  db: D1Database,
  hash: string,
  previousLicense: { status: string; last_activated_at: string | null } | null,
): Promise<void> {
  if (previousLicense) {
    await db
      .prepare("UPDATE licenses SET status = ?, last_activated_at = ? WHERE key_hash = ?")
      .bind(previousLicense.status, previousLicense.last_activated_at, hash)
      .run();
    return;
  }

  await db.prepare("DELETE FROM licenses WHERE key_hash = ?").bind(hash).run();
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
  opts: { validationId?: string; proInitialQuota: number },
) {
  const { db, kv, hash } = deps;
  const polarKey = `polar:${hash}`;
  const revokedKey = `polar_revoked:${hash}`;
  const polarIdKey = `polar_id:${hash}`;
  const [previousLicense, previousQuota, previousRevokedQuota, previousPolarId] = await Promise.all([
    db
      .prepare("SELECT status, last_activated_at FROM licenses WHERE key_hash = ?")
      .bind(hash)
      .first<{ status: string; last_activated_at: string | null }>(),
    kv.get(polarKey),
    kv.get(revokedKey),
    kv.get(polarIdKey),
  ]);

  try {
    await db
      .prepare(
        "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')",
      )
      .bind(hash)
      .run();

    await ensureQuota(kv, hash, opts.proInitialQuota);

    if (opts.validationId) {
      await kv.put(polarIdKey, opts.validationId);
    }
  } catch (err: unknown) {
    try {
      await rollbackLicenseActivation(db, hash, previousLicense);

      if (previousQuota === null) {
        await kv.delete(polarKey);
      } else {
        await kv.put(polarKey, previousQuota);
      }

      if (previousRevokedQuota === null) {
        await kv.delete(revokedKey);
      } else {
        await kv.put(revokedKey, previousRevokedQuota);
      }

      if (previousPolarId === null) {
        await kv.delete(polarIdKey);
      } else {
        await kv.put(polarIdKey, previousPolarId);
      }
    } catch (rollbackErr: unknown) {
      console.warn(
        `[account/sync] failed to rollback side effects for ${hash.slice(0, 8)}:`,
        rollbackErr instanceof Error ? rollbackErr.message : rollbackErr,
      );
    }
    throw err;
  }
}

export function pickAllLicenseKeys(granted: PolarLicenseKeyItem[], checkoutCreatedAt: string, nextCheckoutCreatedAt?: string): PolarLicenseKeyItem[] {
  const checkoutTime = new Date(checkoutCreatedAt).getTime();
  if (!Number.isFinite(checkoutTime)) return [];
  const nextCheckoutTime = nextCheckoutCreatedAt ? new Date(nextCheckoutCreatedAt).getTime() : NaN;
  const hasNextCheckout = Number.isFinite(nextCheckoutTime) && nextCheckoutTime > checkoutTime;
  const sorted = [...granted].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const upperBound = hasNextCheckout ? Math.min(checkoutTime + MAX_KEY_MINT_WINDOW_MS, nextCheckoutTime) : checkoutTime + MAX_KEY_MINT_WINDOW_MS;
  const windowed = sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && (hasNextCheckout ? t < upperBound : t <= upperBound);
  });
  if (windowed.length > 0) return windowed;
  const fallbackBound = hasNextCheckout ? Math.min(checkoutTime + MAX_KEY_FALLBACK_WINDOW_MS, nextCheckoutTime) : checkoutTime + MAX_KEY_FALLBACK_WINDOW_MS;
  const fallback = sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && (hasNextCheckout ? t < fallbackBound : t <= fallbackBound);
  });
  if (fallback.length === 0 || hasNextCheckout) return fallback;
  // Without a later checkout boundary, fail closed by treating only the first
  // tightly-clustered delayed mint burst as this checkout's likely key set.
  const firstCluster: PolarLicenseKeyItem[] = [fallback[0]];
  let previousTime = new Date(fallback[0].created_at).getTime();
  for (let i = 1; i < fallback.length; i++) {
    const current = fallback[i];
    const currentTime = new Date(current.created_at).getTime();
    if (!Number.isFinite(currentTime) || currentTime - previousTime > MAX_FALLBACK_CLUSTER_GAP_MS) break;
    firstCluster.push(current);
    previousTime = currentTime;
  }
  return firstCluster;
}

export async function fetchLicenseKeys(customerId: string, organizationId: string, accessToken: string, opts: { createdAt: string; nextCheckoutCreatedAt?: string }): Promise<{ keys: string[] } | { error: string; status: ContentfulStatusCode }> {
  const lowerBound = new Date(opts.createdAt).getTime();
  const nextCheckoutTime = opts.nextCheckoutCreatedAt ? new Date(opts.nextCheckoutCreatedAt).getTime() : NaN;
  const fetchUpperBound = Number.isFinite(lowerBound)
    ? (Number.isFinite(nextCheckoutTime) && nextCheckoutTime > lowerBound
      ? Math.min(lowerBound + MAX_KEY_FALLBACK_WINDOW_MS, nextCheckoutTime)
      : lowerBound + MAX_KEY_FALLBACK_WINDOW_MS)
    : Number.POSITIVE_INFINITY;
  const granted: PolarLicenseKeyItem[] = [];
  for (let page = 1; ; page++) {
    let lkResp: Response;
    try {
      lkResp = await fetch(`https://api.polar.sh/v1/license-keys/?customer_id=${encodeURIComponent(customerId)}&organization_id=${encodeURIComponent(organizationId)}&limit=${LICENSE_KEY_PAGE_SIZE}&page=${page}&sorting=-created_at`, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch {
      return { error: "Unable to reach Polar — please try again", status: 502 };
    }
    if (!lkResp.ok) return { error: "Failed to list license keys", status: 502 };
    const items = ((await lkResp.json()) as { items?: PolarLicenseKeyItem[] }).items ?? [];
    for (const item of items) {
      const itemTime = new Date(item.created_at).getTime();
      if (!Number.isFinite(itemTime) || item.status !== "granted") continue;
      if (itemTime < lowerBound || itemTime > fetchUpperBound) continue;
      granted.push(item);
    }
    if (items.length < LICENSE_KEY_PAGE_SIZE) break;
    const oldestItemTime = items.reduce((oldest, item) => {
      const t = new Date(item.created_at).getTime();
      return Number.isFinite(t) ? Math.min(oldest, t) : oldest;
    }, Number.POSITIVE_INFINITY);
    if (Number.isFinite(lowerBound) && oldestItemTime <= lowerBound) break;
  }
  if (!granted.length) return { error: "No license issued yet — try again in a few seconds", status: 409 };
  const allKeys = pickAllLicenseKeys(granted, opts.createdAt, opts.nextCheckoutCreatedAt);
  return allKeys.length ? { keys: allKeys.map((k) => k.key) } : { error: "No license issued yet — try again in a few seconds", status: 409 };
}

export async function fetchCheckoutCustomerId(
  checkoutId: string,
  accessToken: string,
  organizationId: string,
  opts: { allowMissingReferenceId?: boolean } = {},
): Promise<{ customerId: string; createdAt?: string; referenceId?: string } | { error: string; status: ContentfulStatusCode }> {
  let resp: Response;
  try {
    resp = await fetch(`https://api.polar.sh/v1/checkouts/${encodeURIComponent(checkoutId)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
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
  const referenceId = typeof checkout.metadata?.reference_id === "string" ? checkout.metadata.reference_id : undefined;
  if (!customerId) return { error: "Checkout has no associated customer", status: 500 };
  if (!referenceId && !opts.allowMissingReferenceId) {
    return { error: "Checkout is missing session binding metadata — cannot verify license ownership", status: 500 };
  }
  return { customerId, createdAt: checkout.created_at, referenceId };
}

export async function fetchNextCheckoutCreatedAt(customerId: string, organizationId: string, accessToken: string, opts: { checkoutId: string; checkoutCreatedAt: string }): Promise<{ createdAt: string | null } | { error: string; status: ContentfulStatusCode }> {
  const checkoutTime = new Date(opts.checkoutCreatedAt).getTime();
  if (!Number.isFinite(checkoutTime)) return { error: "Checkout is missing creation timestamp — cannot verify license ownership", status: 500 };
  let candidate: string | null = null;
  for (let page = 1; ; page++) {
    let resp: Response;
    try {
      const params = new URLSearchParams({ customer_id: customerId, organization_id: organizationId, status: "succeeded", limit: String(CHECKOUT_PAGE_SIZE), page: String(page), sorting: "-created_at" });
      resp = await fetch(`https://api.polar.sh/v1/checkouts/?${params.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch {
      return { error: "Unable to reach Polar — please try again", status: 502 };
    }
    if (!resp.ok) return { error: "Failed to list customer checkouts", status: 502 };
    const items = ((await resp.json()) as { items?: PolarCheckout[] }).items ?? [];
    for (const item of items) {
      if (!item?.created_at || item.id === opts.checkoutId) continue;
      const itemTime = new Date(item.created_at).getTime();
      if (!Number.isFinite(itemTime)) continue;
      if (itemTime > checkoutTime) candidate = item.created_at;
      else if (candidate) return { createdAt: candidate };
    }
    if (items.length < CHECKOUT_PAGE_SIZE) break;
  }
  return { createdAt: candidate };
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(raw: string): Uint8Array {
  return Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function importCheckoutClaimKey(secret: string): Promise<CryptoKey> {
  const rawSecret = new TextEncoder().encode(`${CHECKOUT_CLAIM_KEY_INFO}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", rawSecret);
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

// CHECKOUT_CLAIM_SECRET supports rotation by splitting on commas/newlines, so
// operators must avoid those delimiters inside a single secret value.
function parseCheckoutClaimSecrets(secret: string): string[] {
  return secret.split(/[\n,]/).map((part) => part.trim()).filter(Boolean);
}

function isLegacyAesKeyLength(secret: string): boolean {
  const bytes = new TextEncoder().encode(secret).byteLength;
  return bytes === 16 || bytes === 24 || bytes === 32;
}

async function importLegacyCheckoutClaimKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "AES-GCM" }, false, ["decrypt"]);
}

async function encryptClaimedKeys(keys: string[], secret: string): Promise<string> {
  const [activeSecret] = parseCheckoutClaimSecrets(secret);
  if (!activeSecret) throw new Error("Checkout claim secret is empty");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify(keys));
  const key = await importCheckoutClaimKey(activeSecret);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload));
  return JSON.stringify({ v: CHECKOUT_CLAIM_CIPHER_VERSION, iv: toBase64(iv), data: toBase64(ciphertext) });
}

type DecryptClaimedKeysResult =
  | { ok: true; keys: string[] }
  | { ok: false; reason: "secret-mismatch" | "malformed" };

async function decryptClaimedKeys(raw: string, secret: string): Promise<DecryptClaimedKeysResult> {
  let parsed: { v?: unknown; iv?: unknown; data?: unknown };
  try {
    parsed = JSON.parse(raw) as { v?: unknown; iv?: unknown; data?: unknown };
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof parsed?.iv !== "string" || typeof parsed?.data !== "string") return { ok: false, reason: "malformed" };
  let iv: ArrayBuffer;
  let encrypted: ArrayBuffer;
  try {
    iv = toArrayBuffer(fromBase64(parsed.iv));
    encrypted = toArrayBuffer(fromBase64(parsed.data));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  const secrets = parseCheckoutClaimSecrets(secret);
  for (const candidate of secrets) {
    const keyFactories = [
      () => importCheckoutClaimKey(candidate),
      ...(parsed.v === undefined && isLegacyAesKeyLength(candidate)
        ? [() => importLegacyCheckoutClaimKey(candidate)]
        : []),
    ];
    for (const createKey of keyFactories) {
      try {
        const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await createKey(), encrypted);
        const decoded = JSON.parse(new TextDecoder().decode(plaintext));
        if (!Array.isArray(decoded) || !decoded.every((item) => typeof item === "string" && item.length > 0)) {
          return { ok: false, reason: "malformed" };
        }
        return { ok: true, keys: decoded };
      } catch {
        continue;
      }
    }
  }
  return { ok: false, reason: "secret-mismatch" };
}

function isNonEmptyStringArray(arr: unknown[]): arr is string[] {
  return arr.length > 0 && arr.every((v) => typeof v === "string" && v.length > 0);
}

export function parseCheckoutCache(raw: string): CheckoutCache | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return isNonEmptyStringArray(parsed) ? { keys: parsed, sessionId: "" } : null;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.keys)) {
      if (!isNonEmptyStringArray(parsed.keys)) return null;
      const sid = (parsed as { sessionId?: unknown }).sessionId;
      return sid !== undefined && sid !== null && typeof sid !== "string" ? null : { keys: parsed.keys, sessionId: typeof sid === "string" ? sid : "" };
    }
    return null;
  } catch {
    return typeof raw === "string" && raw.length > 0 && /^[A-Za-z0-9_-]+$/.test(raw) ? { keys: [raw], sessionId: "" } : null;
  }
}

function shouldPruneCheckoutClaims(checkoutId: string): boolean {
  let hash = 0;
  for (let i = 0; i < checkoutId.length; i++) {
    hash = (hash * 31 + checkoutId.charCodeAt(i)) >>> 0;
  }
  return hash % 64 === 0;
}

export async function claimCheckoutForSession(db: D1Database, checkoutId: string, sessionId: string, opts: { checkoutCreatedAt?: string } = {}): Promise<{ ok: true } | { ok: false; error: string; retriable: boolean }> {
  try {
    const result = await db.prepare("INSERT INTO checkout_claims (checkout_id, session_id, checkout_created_at) VALUES (?, ?, ?) ON CONFLICT(checkout_id) DO NOTHING").bind(checkoutId, sessionId, opts.checkoutCreatedAt ?? null).run();
    if (result.meta.changes) {
      if (shouldPruneCheckoutClaims(checkoutId)) {
        await db.prepare("DELETE FROM checkout_claims WHERE claimed_at < datetime('now', '-30 days')").run().catch(() => undefined);
      }
      return { ok: true };
    }
    const existing = await db.prepare("SELECT session_id, claimed_at FROM checkout_claims WHERE checkout_id = ?").bind(checkoutId).first<{ session_id: string; claimed_at: string }>();
    return existing && existing.session_id === sessionId ? { ok: true } : { ok: false, error: "This checkout was already claimed by another session", retriable: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("no such table") || msg.includes("checkout_claims")) return { ok: false, error: "Checkout claim table is not available — please try again later", retriable: true };
    return { ok: false, error: "Unable to verify checkout claim — please try again", retriable: true };
  }
}

export async function getStoredClaimedKeys(
  db: D1Database,
  checkoutId: string,
  secret: string,
): Promise<{ ok: true; sessionId: string | null; keys: string[] | null; unreadable?: boolean } | { ok: false; error: string }> {
  try {
    const row = await db.prepare("SELECT session_id, encrypted_keys FROM checkout_claims WHERE checkout_id = ?").bind(checkoutId).first<{ session_id: string | null; encrypted_keys: string | null }>();
    if (!row) return { ok: true, sessionId: null, keys: null };
    if (!row.encrypted_keys) return { ok: true, sessionId: row.session_id, keys: null };
    const parsed = await decryptClaimedKeys(row.encrypted_keys, secret);
    if (!parsed.ok) {
      if (parsed.reason === "secret-mismatch") {
        return { ok: true, sessionId: row.session_id, keys: null, unreadable: true };
      }
      return { ok: false, error: "Stored checkout claim is corrupted — please try again later" };
    }
    return { ok: true, sessionId: row.session_id, keys: parsed.keys };
  } catch {
    return { ok: false, error: "Unable to read stored checkout claim — please try again" };
  }
}

export async function storeClaimedKeys(db: D1Database, checkoutId: string, keys: string[], secret: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const encryptedKeys = await encryptClaimedKeys(keys, secret);
    const result = await db.prepare("UPDATE checkout_claims SET encrypted_keys = ? WHERE checkout_id = ?").bind(encryptedKeys, checkoutId).run();
    if (result.meta.changes) return { ok: true };
    const existing = await db.prepare("SELECT encrypted_keys FROM checkout_claims WHERE checkout_id = ?").bind(checkoutId).first<{ encrypted_keys: string | null }>();
    if (!existing) return { ok: false, error: "Checkout claim disappeared before keys could be recorded — please try again" };
    if (existing.encrypted_keys) {
      const parsed = await decryptClaimedKeys(existing.encrypted_keys, secret);
      if (parsed.ok && JSON.stringify(parsed.keys) === JSON.stringify(keys)) return { ok: true };
      if (!parsed.ok && parsed.reason === "malformed") {
        return { ok: false, error: "Stored checkout claim is corrupted — please try again later" };
      }
    }
    return { ok: false, error: "Checkout claim changed before keys could be recorded — please try again" };
  } catch {
    return { ok: false, error: "Unable to record claimed license keys — please try again" };
  }
}

export async function claimLicenseKeysForCheckout(db: D1Database, checkoutId: string, keys: string[], secret: string): Promise<{ ok: true; keys: string[] } | { ok: false; error: string }> {
  try {
    if (!keys.length) return { ok: false, error: "No license keys were provided for this checkout" };
    const keyHashes = await Promise.all(keys.map((key) => hashKey(key)));
    const valuePlaceholders = keyHashes.map(() => "(?)").join(", ");
    await db.prepare(
      `WITH incoming(license_key_hash) AS (VALUES ${valuePlaceholders})
       INSERT INTO checkout_key_claims (license_key_hash, checkout_id)
       SELECT incoming.license_key_hash, ?
       FROM incoming
       WHERE NOT EXISTS (
         SELECT 1
         FROM checkout_key_claims existing
         JOIN incoming conflicted
           ON conflicted.license_key_hash = existing.license_key_hash
         WHERE existing.checkout_id != ?
       )
       ON CONFLICT(license_key_hash) DO NOTHING`,
    ).bind(...keyHashes, checkoutId, checkoutId).run();
    const placeholders = keyHashes.map(() => "?").join(", ");
    const rows = await db.prepare(`SELECT license_key_hash, checkout_id FROM checkout_key_claims WHERE license_key_hash IN (${placeholders})`).bind(...keyHashes).all<{ license_key_hash: string; checkout_id: string }>();
    const ownerByHash = new Map((rows.results ?? []).map((row) => [row.license_key_hash, row.checkout_id]));
    const hasConflict = keyHashes.some((keyHash) => ownerByHash.get(keyHash) !== checkoutId);
    if (hasConflict) {
      return { ok: false, error: "Unable to claim the full license set for this checkout because some keys are already claimed elsewhere — please contact support" };
    }
    const stored = await storeClaimedKeys(db, checkoutId, keys, secret);
    return stored.ok ? { ok: true, keys } : stored;
  } catch {
    return { ok: false, error: "Unable to atomically claim license keys — please try again" };
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

async function pruneAliasRateLimits(db: D1Database): Promise<void> {
  await db
    .prepare("DELETE FROM alias_rate_limits WHERE change_date < date('now', '-30 days')")
    .run();
}

async function rollbackAliasRateLimitClaim(db: D1Database, licenseKeyHash: string): Promise<void> {
  await db
    .prepare(
      `UPDATE alias_rate_limits
       SET change_count = change_count - 1
       WHERE license_key_hash = ?
         AND change_date = date('now')
         AND change_count > 0`,
    )
    .bind(licenseKeyHash)
    .run();

  await db
    .prepare(
      `DELETE FROM alias_rate_limits
       WHERE license_key_hash = ?
         AND change_date = date('now')
         AND change_count <= 0`,
    )
    .bind(licenseKeyHash)
    .run();
}

async function aliasHasHistoricalRows(db: D1Database, alias: string, oldUsername: string): Promise<boolean> {
  const existing = await db
    .prepare(
      `SELECT 1
       FROM (
         SELECT username FROM completed_tasks
         UNION ALL
         SELECT username FROM hall_of_blame
         UNION ALL
         SELECT username FROM usage_logs
       ) AS alias_history
       WHERE LOWER(username) = LOWER(?)
         AND LOWER(username) != LOWER(?)
       LIMIT 1`,
    )
    .bind(alias, oldUsername)
    .first();

  return Boolean(existing);
}

export async function performAliasDbUpdate(
  db: D1Database,
  opts: {
    oldUsername: string;
    newAlias: string;
    licenseKeyHash: string;
    dailyLimit: number;
  },
): Promise<{ success: true } | { success: false; error: string; status: 409 | 429 | 500 }> {
  const { oldUsername, newAlias, licenseKeyHash, dailyLimit } = opts;
  await pruneAliasRateLimits(db);

  const taken = await db
    .prepare("SELECT 1 FROM user_scores WHERE LOWER(username) = LOWER(?) AND username != ?")
    .bind(newAlias, oldUsername)
    .first();
  if (taken) {
    return { success: false, error: "This alias is already taken", status: 409 };
  }

  if (await aliasHasHistoricalRows(db, newAlias, oldUsername)) {
    return { success: false, error: "This alias is unavailable because it still has historical activity", status: 409 };
  }

  // All updates run in a single db.batch() transaction so that primary
  // (user_scores), alias-rate-limit claim, and secondary
  // (completed_tasks, hall_of_blame, usage_logs) renames are atomic.
  // If any statement throws (e.g. UNIQUE constraint), the entire transaction
  // is rolled back so transient failures do not burn a daily alias token.
  let results: D1Result[];
  try {
    results = await db.batch([
      db.prepare(
        `INSERT INTO alias_rate_limits (license_key_hash, change_date, change_count)
         VALUES (?, date('now'), 1)
         ON CONFLICT(license_key_hash, change_date)
         DO UPDATE SET change_count = change_count + 1
         WHERE change_count < ?`,
      ).bind(licenseKeyHash, dailyLimit),
      db.prepare(
        `UPDATE user_scores SET username = ?, updated_at = datetime('now')
         WHERE username = ? AND license_hash = ?
           AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
      ).bind(newAlias, oldUsername, licenseKeyHash),
      db.prepare(
        `UPDATE completed_tasks SET username = ? WHERE username = ?
           AND EXISTS (SELECT 1 FROM user_scores WHERE username = ? AND license_hash = ?)`,
      ).bind(newAlias, oldUsername, newAlias, licenseKeyHash),
      db.prepare(
        `UPDATE hall_of_blame SET username = ? WHERE username = ?
           AND EXISTS (SELECT 1 FROM user_scores WHERE username = ? AND license_hash = ?)`,
      ).bind(newAlias, oldUsername, newAlias, licenseKeyHash),
      db.prepare(
        `UPDATE usage_logs SET username = ? WHERE username = ?
           AND EXISTS (SELECT 1 FROM user_scores WHERE username = ? AND license_hash = ?)`,
      ).bind(newAlias, oldUsername, newAlias, licenseKeyHash),
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) {
      return { success: false, error: "This alias is already taken", status: 409 };
    }
    return { success: false, error: "Alias update failed — please retry", status: 500 };
  }

  if (!results[0].meta.changes) {
    return { success: false, error: "Alias change limit reached", status: 429 };
  }

  if (!results[1].meta.changes) {
    await rollbackAliasRateLimitClaim(db, licenseKeyHash);
    return { success: false, error: "Update failed — profile not found, license mismatch, or license revoked", status: 409 };
  }

  return { success: true };
}

export { getQuotaLimits, getQuotaPercent } from "../utils/quota";
