import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getProfile, getProfileByLicenseHash, getProfileRow, resolveRank } from "../utils/profile";
import { getQuotaLimits, hashKey } from "../utils/quota";

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

const MAX_KEY_MINT_WINDOW_MS = 15 * 60 * 1000;
const MAX_KEY_FALLBACK_WINDOW_MS = 60 * 60 * 1000;
const MAX_FALLBACK_CLUSTER_GAP_MS = 2 * 60 * 1000;
const LICENSE_KEY_PAGE_SIZE = 100;
const CHECKOUT_PAGE_SIZE = 100;
const MAX_TICKET_TITLE_LEN = 200;
const MAX_TICKET_ID_LEN = 100;

export function pickAllLicenseKeys(granted: PolarLicenseKeyItem[], checkoutCreatedAt: string, nextCheckoutCreatedAt?: string): PolarLicenseKeyItem[] {
  const checkoutTime = new Date(checkoutCreatedAt).getTime();
  if (!Number.isFinite(checkoutTime)) return [];
  const nextCheckoutTime = nextCheckoutCreatedAt ? new Date(nextCheckoutCreatedAt).getTime() : NaN;
  const hasNextCheckout = Number.isFinite(nextCheckoutTime) && nextCheckoutTime > checkoutTime;
  const sorted = [...granted].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const upperBound = hasNextCheckout ? Math.min(checkoutTime + MAX_KEY_MINT_WINDOW_MS, nextCheckoutTime) : checkoutTime + MAX_KEY_MINT_WINDOW_MS;
  const windowed = sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && t <= upperBound;
  });
  if (windowed.length > 0) return windowed;
  const fallbackBound = hasNextCheckout ? Math.min(checkoutTime + MAX_KEY_FALLBACK_WINDOW_MS, nextCheckoutTime) : checkoutTime + MAX_KEY_FALLBACK_WINDOW_MS;
  const fallback = sorted.filter((k) => {
    const t = new Date(k.created_at).getTime();
    return t >= checkoutTime && t <= fallbackBound;
  });
  if (fallback.length === 0 || hasNextCheckout) return fallback;
  const firstCluster: PolarLicenseKeyItem[] = [fallback[0]!];
  let previousTime = new Date(fallback[0]!.created_at).getTime();
  for (let i = 1; i < fallback.length; i++) {
    const current = fallback[i]!;
    const currentTime = new Date(current.created_at).getTime();
    if (!Number.isFinite(currentTime) || currentTime - previousTime > MAX_FALLBACK_CLUSTER_GAP_MS) break;
    firstCluster.push(current);
    previousTime = currentTime;
  }
  return firstCluster;
}

export async function fetchLicenseKeys(customerId: string, organizationId: string, accessToken: string, opts: { createdAt: string; nextCheckoutCreatedAt?: string }): Promise<{ keys: string[] } | { error: string; status: ContentfulStatusCode }> {
  const allItems: PolarLicenseKeyItem[] = [];
  const lowerBound = new Date(opts.createdAt).getTime();
  for (let page = 1; ; page++) {
    let lkResp: Response;
    try {
      lkResp = await fetch(`https://api.polar.sh/v1/license-keys/?customer_id=${encodeURIComponent(customerId)}&organization_id=${encodeURIComponent(organizationId)}&limit=${LICENSE_KEY_PAGE_SIZE}&page=${page}&sorting=-created_at`, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch {
      return { error: "Unable to reach Polar — please try again", status: 502 };
    }
    if (!lkResp.ok) return { error: "Failed to list license keys", status: 502 };
    const items = ((await lkResp.json()) as { items?: PolarLicenseKeyItem[] }).items ?? [];
    allItems.push(...items);
    if (items.length < LICENSE_KEY_PAGE_SIZE) break;
    const oldestItemTime = items.reduce((oldest, item) => {
      const t = new Date(item.created_at).getTime();
      return Number.isFinite(t) ? Math.min(oldest, t) : oldest;
    }, Number.POSITIVE_INFINITY);
    if (Number.isFinite(lowerBound) && oldestItemTime <= lowerBound) break;
  }
  const granted = allItems.filter((l) => l.status === "granted");
  if (!granted.length) return { error: "No license issued yet — try again in a few seconds", status: 409 };
  const allKeys = pickAllLicenseKeys(granted, opts.createdAt, opts.nextCheckoutCreatedAt);
  return allKeys.length ? { keys: allKeys.map((k) => k.key) } : { error: "No license issued yet — try again in a few seconds", status: 409 };
}

export async function fetchCheckoutCustomerId(
  checkoutId: string,
  accessToken: string,
  organizationId: string,
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
  return customerId ? { customerId, createdAt: checkout.created_at, referenceId } : { error: "Checkout has no associated customer", status: 500 };
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

export type CheckoutCache = { keys: string[]; sessionId: string };

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(raw: string): Uint8Array {
  return Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
}

async function importCheckoutClaimKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptClaimedKeys(keys: string[], secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify(keys));
  const key = await importCheckoutClaimKey(secret);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload));
  return JSON.stringify({ iv: toBase64(iv), data: toBase64(ciphertext) });
}

async function decryptClaimedKeys(raw: string, secret: string): Promise<string[] | null> {
  const parsed = JSON.parse(raw) as { iv?: unknown; data?: unknown };
  if (typeof parsed?.iv !== "string" || typeof parsed?.data !== "string") return null;
  const key = await importCheckoutClaimKey(secret);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(parsed.iv) }, key, fromBase64(parsed.data));
  const decoded = JSON.parse(new TextDecoder().decode(plaintext));
  return Array.isArray(decoded) && decoded.every((item) => typeof item === "string" && item.length > 0) ? decoded : null;
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
      const sid = parsed.sessionId;
      return sid !== undefined && sid !== null && typeof sid !== "string" ? null : { keys: parsed.keys, sessionId: typeof sid === "string" ? sid : "" };
    }
    return null;
  } catch {
    return typeof raw === "string" && raw.length > 0 && /^[A-Za-z0-9_-]+$/.test(raw) ? { keys: [raw], sessionId: "" } : null;
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
  return { buddyType: cp?.buddy_type ?? null, buddyIsShiny: cp?.buddy_is_shiny ? 1 : 0 };
}

type CreateProfileResult = { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined } | { profile: null; error: string };

async function createProfileFromClient(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<CreateProfileResult> {
  const newUsername = body.username?.trim();
  if (!newUsername) return { profile: null, error: "Username is required — please set a username before activating." };
  const existing = await db.prepare("SELECT license_hash FROM user_scores WHERE username = ?").bind(newUsername).first<{ license_hash: string | null }>();
  if (existing) {
    if (existing.license_hash === hash) {
      const profile = await getProfile(db, newUsername);
      return profile ? { profile } : { profile: null, error: "Profile not found after lookup" };
    }
    if (existing.license_hash === null) {
      if (!sessionContext) return { profile: null, error: "Session required to upgrade an existing username." };
      const boundUsername = await sessionContext.kv.get(`session_user:${sessionContext.sessionId}`);
      if (boundUsername !== newUsername) return { profile: null, error: "Cannot claim an existing free username — log in to that account first or pick a different username." };
      const upgradeResult = await db.prepare("UPDATE user_scores SET license_hash = ?, updated_at = datetime('now') WHERE username = ? AND license_hash IS NULL").bind(hash, newUsername).run();
      if (!upgradeResult.meta.changes) return { profile: null, error: "This username was just claimed by another request. Please try again." };
      const profile = await getProfile(db, newUsername);
      return profile ? { profile } : { profile: null, error: "Profile not found after upgrade" };
    }
    return { profile: null, error: "This username is already taken. Please change your username and try again." };
  }
  const c = buildProfileCosmetics(body.currentProfile);
  try {
    await db.prepare(
      `INSERT INTO user_scores (username, total_td, current_td, corporate_rank, license_hash, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier)
       VALUES (?, 0, 0, ?, ?, '{}', '[]', '[]', ?, ?, '["default"]', 'default', NULL, 1.0)`,
    ).bind(newUsername, resolveRank(0), hash, c.buddyType, c.buddyIsShiny).run();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) return { profile: null, error: "This username or license is being activated by another request. Please try again." };
    throw err;
  }
  const profile = await getProfile(db, newUsername);
  return profile ? { profile } : { profile: null, error: "Failed to create profile" };
}

type ResolveProfileResult = { restored: boolean; profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined } | { restored: false; profile: null; error: string };

export async function resolveProfile(db: D1Database, hash: string, body: SyncBody, sessionContext?: { sessionId: string; kv: KVNamespace }): Promise<ResolveProfileResult> {
  const existingByHash = await getProfileByLicenseHash(db, hash);
  if (existingByHash) return { restored: true, profile: existingByHash };
  const created = await createProfileFromClient(db, hash, body, sessionContext);
  return "error" in created && created.error ? { restored: false, profile: null, error: created.error } : { restored: false, profile: created.profile! };
}

export type OwnershipResult = { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; status: "ok" } | { profile: null; status: "not_found"; error: string } | { profile: null; status: "unauthorized"; error: string };

export async function verifyOwnership(db: D1Database, username: string, licenseKeyHash: string): Promise<OwnershipResult> {
  const row = await getProfileRow(db, username);
  if (!row) return { profile: null, status: "not_found", error: "Profile not found" };
  const rowLicenseHash = "license_hash" in row ? row.license_hash : null;
  if (!rowLicenseHash || rowLicenseHash !== licenseKeyHash) return { profile: null, status: "unauthorized", error: "Unauthorized: license key does not match this profile" };
  const license = await db.prepare("SELECT status FROM licenses WHERE key_hash = ?").bind(licenseKeyHash).first<{ status: string }>();
  if (!license || license.status !== "active") return { profile: null, status: "unauthorized", error: "License has been revoked or is no longer active" };
  const profile = await getProfile(db, username);
  return profile ? { profile, status: "ok" } : { profile: null, status: "not_found", error: "Profile not found" };
}

export function broadcastPurchase(message: string, db: D1Database | undefined, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
  if (db) ctx.waitUntil(db.prepare("INSERT INTO recent_events (message) VALUES (?)").bind(message).run());
}

export const SHILL_CREDIT = 5;

async function ensureQuota(kv: KVNamespace, hash: string, proInitialQuota: number): Promise<void> {
  const kvKey = `polar:${hash}`;
  if (await kv.get(kvKey) !== null) return;
  const revokedKey = `polar_revoked:${hash}`;
  const savedQuota = await kv.get(revokedKey);
  if (savedQuota !== null) {
    await kv.put(kvKey, savedQuota);
    await kv.delete(revokedKey);
  } else {
    await kv.put(kvKey, String(proInitialQuota));
  }
}

export async function commitSyncSideEffects(deps: { db: D1Database; kv: KVNamespace; hash: string }, opts: { validationId?: string; limits: ReturnType<typeof getQuotaLimits>; sessionId?: string }) {
  const { db, kv, hash } = deps;
  await db.prepare("INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')").bind(hash).run();
  await ensureQuota(kv, hash, opts.limits.proInitialQuota);
  if (opts.validationId) await kv.put(`polar_id:${hash}`, opts.validationId);
}

export async function claimCheckoutForSession(db: D1Database, checkoutId: string, sessionId: string, opts: { checkoutCreatedAt?: string } = {}): Promise<{ ok: true } | { ok: false; error: string; retriable: boolean }> {
  try {
    const result = await db.prepare("INSERT INTO checkout_claims (checkout_id, session_id, checkout_created_at) VALUES (?, ?, ?) ON CONFLICT(checkout_id) DO NOTHING").bind(checkoutId, sessionId, opts.checkoutCreatedAt ?? null).run();
    if (result.meta.changes) {
      try {
        await db.prepare("DELETE FROM checkout_claims WHERE claimed_at < datetime('now', '-30 days')").run();
      } catch {
        // Cleanup is best-effort and should not block a successful claim.
      }
      return { ok: true };
    }
    const existing = await db.prepare("SELECT session_id, claimed_at FROM checkout_claims WHERE checkout_id = ?").bind(checkoutId).first<{ session_id: string; claimed_at: string }>();
    return existing && existing.session_id === sessionId ? { ok: true } : { ok: false, error: "This checkout was already claimed by another session", retriable: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("no such table") || msg.includes("checkout_claims")) return { ok: false, error: "Checkout claim table is not available — please try again later", retriable: true };
    return { ok: false, error: "Unable to verify checkout claim — please try again", retriable: true };
  }
}

export async function getStoredClaimedKeys(
  db: D1Database,
  checkoutId: string,
  secret: string,
): Promise<{ ok: true; sessionId: string | null; keys: string[] | null } | { ok: false; error: string }> {
  try {
    const row = await db.prepare("SELECT session_id, encrypted_keys FROM checkout_claims WHERE checkout_id = ?").bind(checkoutId).first<{ session_id: string | null; encrypted_keys: string | null }>();
    if (!row) return { ok: true, sessionId: null, keys: null };
    if (!row.encrypted_keys) return { ok: true, sessionId: row.session_id, keys: null };
    const parsed = await decryptClaimedKeys(row.encrypted_keys, secret);
    return parsed
      ? { ok: true, sessionId: row.session_id, keys: parsed }
      : { ok: false, error: "Stored checkout claim is malformed — please try again" };
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
      if (parsed && JSON.stringify(parsed) === JSON.stringify(keys)) return { ok: true };
    }
    return { ok: false, error: "Checkout claim changed before keys could be recorded — please try again" };
  } catch {
    return { ok: false, error: "Unable to record claimed license keys — please try again" };
  }
}

export async function claimLicenseKeysForCheckout(db: D1Database, checkoutId: string, keys: string[], secret: string): Promise<{ ok: true; keys: string[] } | { ok: false; error: string }> {
  try {
    for (const key of keys) {
      await db.prepare("INSERT INTO checkout_key_claims (license_key_hash, checkout_id) VALUES (?, ?) ON CONFLICT(license_key_hash) DO NOTHING").bind(await hashKey(key), checkoutId).run();
    }
    const keyHashes = await Promise.all(keys.map((key) => hashKey(key)));
    const placeholders = keyHashes.map(() => "?").join(", ");
    const rows = await db.prepare(`SELECT license_key_hash, checkout_id FROM checkout_key_claims WHERE license_key_hash IN (${placeholders})`).bind(...keyHashes).all<{ license_key_hash: string; checkout_id: string }>();
    const ownerByHash = new Map((rows.results ?? []).map((row) => [row.license_key_hash, row.checkout_id]));
    const claimedKeys = keys.filter((key, idx) => ownerByHash.get(keyHashes[idx]!) === checkoutId);
    if (!claimedKeys.length) return { ok: false, error: "These license keys were already claimed by another checkout — please retry in a few seconds" };
    const stored = await storeClaimedKeys(db, checkoutId, claimedKeys, secret);
    return stored.ok ? { ok: true, keys: claimedKeys } : stored;
  } catch {
    return { ok: false, error: "Unable to atomically claim license keys — please try again" };
  }
}

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
