import { Hono } from "hono";
import { validatePolarKey } from "../utils/polar";
import { hashKey, getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileRow, isLicenseActive } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, calcBulkCost } from "../gameConstants";
import { resolveProfile, verifyOwnership, broadcastPurchase, commitSyncSideEffects, validateActiveTicket, SHILL_CREDIT, fetchLicenseKeys, fetchCheckoutCustomerId, fetchNextCheckoutCreatedAt, parseCheckoutCache, claimCheckoutForSession, getStoredClaimedKeys, claimLicenseKeysForCheckout } from "./accountHelpers";
import type { SyncBody, CheckoutCache } from "./accountHelpers";
import { ACHIEVEMENT_IDS } from "@claude-cope/shared/achievements";
import { BUDDY_TYPE_SET } from "@claude-cope/shared/buddies";

type Env = {
  Bindings: {
    DB?: D1Database;
    QUOTA_KV?: KVNamespace;
    USAGE_KV?: KVNamespace;
    POLAR_ACCESS_TOKEN?: string;
    POLAR_ORGANIZATION_ID?: string;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
  };
  Variables: { sessionId: string };
};

async function validateSyncRequest(c: { req: { json: <T>() => Promise<T> }; env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response }) {
  const body = await c.req.json<SyncBody>();
  if (!body.licenseKey) return { error: c.json({ error: "licenseKey is required" }, 400) } as const;
  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) return { error: c.json({ error: "Polar integration is not configured" }, 500) } as const;
  const validation = await validatePolarKey(body.licenseKey, accessToken, organizationId);
  if (!validation.valid) return { error: c.json({ error: "Invalid or inactive license key", status: validation.status }, 403) } as const;
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) return { error: c.json({ error: "KV storage is not configured" }, 500) } as const;
  const db = c.env?.DB;
  if (!db) return { error: c.json({ error: "Database not configured" }, 500) } as const;
  return { body, validation, kv, db, hash: await hashKey(body.licenseKey) } as const;
}

async function lookupCheckoutCache(kv: KVNamespace, checkoutId: string, sessionId: string): Promise<{ keys: string[]; sessionMismatch?: boolean } | null> {
  const cached = await kv.get(`checkout_used:${checkoutId}`);
  if (!cached) return null;
  const entry = parseCheckoutCache(cached);
  if (!entry) {
    await kv.delete(`checkout_used:${checkoutId}`);
    return null;
  }
  return entry.sessionId && entry.sessionId !== sessionId ? { keys: entry.keys, sessionMismatch: true } : { keys: entry.keys };
}

async function validateCheckoutRequest(c: { req: { json: <T>() => Promise<T> }; get: (key: string) => string; env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response }) {
  const body = await c.req.json<{ checkoutId?: string }>();
  if (!body.checkoutId) return { error: c.json({ error: "checkoutId is required" }, 400) } as const;
  if (!/^[\w-]{4,128}$/.test(body.checkoutId)) return { error: c.json({ error: "Invalid checkoutId format" }, 400) } as const;
  const sessionId = c.get("sessionId");
  if (!sessionId) return { error: c.json({ error: "Session required" }, 401) } as const;
  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) return { error: c.json({ error: "Polar integration is not configured" }, 500) } as const;
  return { checkoutId: body.checkoutId, sessionId, accessToken, organizationId, kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV } as const;
}

function respondWithClaimedKeys(c: { json: (data: unknown, status?: number) => Response }, keys: string[]) {
  return c.json({ licenseKey: keys[0], allKeys: keys });
}

async function cacheClaimedKeys(kv: KVNamespace | undefined, checkoutId: string, sessionId: string, keys: string[]) {
  if (!kv) return;
  await kv.put(`checkout_used:${checkoutId}`, JSON.stringify({ keys, sessionId } satisfies CheckoutCache), { expirationTtl: 7 * 24 * 60 * 60 });
}

async function respondWithStoredClaim(
  c: { json: (data: unknown, status?: number) => Response },
  claim: {
    kv: KVNamespace | undefined;
    checkoutId: string;
    sessionId: string;
    keys: string[];
  },
) {
  await cacheClaimedKeys(claim.kv, claim.checkoutId, claim.sessionId, claim.keys);
  return respondWithClaimedKeys(c, claim.keys);
}

const account = new Hono<Env>();

account.post("/checkout-license", async (c) => {
  const validated = await validateCheckoutRequest(c);
  if ("error" in validated) return validated.error;
  const { checkoutId, sessionId, accessToken, organizationId, kv } = validated;
  if (kv) {
    const cacheResult = await lookupCheckoutCache(kv, checkoutId, sessionId);
    if (cacheResult) return cacheResult.sessionMismatch ? c.json({ error: "This checkout was already redeemed by another session" }, 403) : c.json({ licenseKey: cacheResult.keys[0], allKeys: cacheResult.keys });
  }
  const result = await fetchCheckoutCustomerId(checkoutId, accessToken, organizationId);
  if ("error" in result) return c.json({ error: result.error }, result.status);
  if (!result.createdAt) return c.json({ error: "Checkout is missing creation timestamp — cannot verify license ownership" }, 500);
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const claim = await claimCheckoutForSession(db, checkoutId, sessionId, { checkoutCreatedAt: result.createdAt });
  if (!claim.ok) return c.json({ error: claim.error }, claim.retriable ? 503 : 403);
  const storedClaim = await getStoredClaimedKeys(db, checkoutId);
  if (!storedClaim.ok) return c.json({ error: storedClaim.error }, 503);
  if (storedClaim.keys?.length) return respondWithStoredClaim(c, { kv, checkoutId, sessionId, keys: storedClaim.keys });
  const nextCheckout = await fetchNextCheckoutCreatedAt(result.customerId, organizationId, accessToken, { checkoutId, checkoutCreatedAt: result.createdAt });
  if ("error" in nextCheckout) return c.json({ error: nextCheckout.error }, nextCheckout.status);
  const lkResult = await fetchLicenseKeys(result.customerId, organizationId, accessToken, { createdAt: result.createdAt, nextCheckoutCreatedAt: nextCheckout.createdAt ?? undefined });
  if ("error" in lkResult) return c.json({ error: lkResult.error }, lkResult.status);
  const claimedKeys = await claimLicenseKeysForCheckout(db, checkoutId, lkResult.keys);
  if (!claimedKeys.ok) return c.json({ error: claimedKeys.error }, claimedKeys.error.includes("already claimed") ? 409 : 503);
  return respondWithStoredClaim(c, { kv, checkoutId, sessionId, keys: claimedKeys.keys });
});

account.post("/sync", async (c) => {
  const validated = await validateSyncRequest(c);
  if ("error" in validated) return validated.error;
  const { body, validation, kv, db, hash } = validated;
  const sessionId = c.get("sessionId");
  const limits = getQuotaLimits(c.env);
  const result = await resolveProfile(db, hash, body, sessionId && kv ? { sessionId, kv } : undefined);
  if (result.error) {
    const isConflict = result.error.includes("already taken") || result.error.includes("just claimed") || result.error.includes("being activated");
    return c.json({ error: result.error }, isConflict ? 409 : 403);
  }
  await commitSyncSideEffects({ db, kv, hash }, { validationId: validation.id, limits, sessionId });
  if (sessionId && result.profile?.username) await kv.put(`session_user:${sessionId}`, result.profile.username, { expirationTtl: 60 * 60 * 24 * 365 });
  const quotaPercent = await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: hash, limits });
  return c.json({ success: true, hash, restored: result.restored, profile: { ...result.profile, quota_percent: quotaPercent } });
});

account.get("/me", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const sessionId = c.get("sessionId");
  if (!kv || !sessionId) return c.json({ found: false });
  const username = await kv.get(`session_user:${sessionId}`);
  if (!username) return c.json({ found: false });
  const db = c.env?.DB;
  const row = db ? await getProfileRow(db, username) : null;
  const rawLicenseHash = row?.license_hash ?? null;
  const licenseActive = rawLicenseHash && db ? await isLicenseActive(db, rawLicenseHash) : false;
  const isPro = Boolean(rawLicenseHash && licenseActive);
  const limits = getQuotaLimits(c.env);
  const quotaPercent = isPro ? await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: rawLicenseHash!, limits }) : await getQuotaPercent(kv, { tier: "free", sessionId, limits });
  const profile = db ? await getProfile(db, username) : null;
  const revoked = Boolean(rawLicenseHash && !licenseActive);
  return c.json({ found: true, username, profile: profile ? { ...profile, quota_percent: quotaPercent } : null, quotaPercent, isPro, ...(revoked ? { revoked: true } : {}) });
});

account.post("/buy-generator", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; generatorId: string; amount: number; licenseKeyHash: string }>();
  if (!body.username || !body.generatorId || !body.amount || body.amount < 1 || !Number.isInteger(body.amount) || body.amount > 1000 || !body.licenseKeyHash) return c.json({ error: "username, generatorId, amount (positive integer, max 1000), and licenseKeyHash are required" }, 400);
  const generator = GENERATORS.find((g) => g.id === body.generatorId);
  if (!generator) return c.json({ error: "Unknown generator" }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const { profile } = ownership;
  const owned = profile.inventory[body.generatorId] ?? 0;
  const cost = calcBulkCost(generator.baseCost, owned, body.amount);
  if (profile.current_td < cost) return c.json({ error: "Insufficient TD", required: cost, available: profile.current_td }, 400);
  const result = await db.prepare(
    `UPDATE user_scores SET
      current_td = current_td - ?,
      inventory = json_set(COALESCE(inventory, '{}'), '$."' || ? || '"', COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) + ?),
      updated_at = datetime('now')
    WHERE username = ? AND current_td >= ? AND license_hash = ?
      AND COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) = ?
      AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(cost, body.generatorId, body.generatorId, body.amount, body.username, cost, body.licenseKeyHash, body.generatorId, owned).run();
  if (!result.meta.changes) return c.json({ error: "Insufficient TD (concurrent update)", required: cost }, 409);
  const updated = await getProfile(db, body.username);
  if (cost > 1_000_000) broadcastPurchase(`💰 ${body.username} bought ${body.amount}x ${generator.name} for ${cost.toLocaleString()} TD!`, db, c.executionCtx);
  return c.json({ success: true, profile: updated });
});

account.post("/buy-upgrade", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; upgradeId: string; licenseKeyHash: string }>();
  if (!body.username || !body.upgradeId || !body.licenseKeyHash) return c.json({ error: "username, upgradeId, and licenseKeyHash are required" }, 400);
  const upgrade = UPGRADES.find((u) => u.id === body.upgradeId);
  if (!upgrade) return c.json({ error: "Unknown upgrade" }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const { profile } = ownership;
  if (profile.upgrades.includes(body.upgradeId)) return c.json({ error: "Upgrade already owned" }, 400);
  if ((profile.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) return c.json({ error: "Required generator not owned" }, 400);
  if (profile.current_td < upgrade.cost) return c.json({ error: "Insufficient TD", required: upgrade.cost, available: profile.current_td }, 400);
  const result = await db.prepare(
    `UPDATE user_scores SET
      current_td = current_td - ?,
      upgrades = json_insert(COALESCE(upgrades, '[]'), '$[#]', ?),
      updated_at = datetime('now')
    WHERE username = ? AND current_td >= ? AND license_hash = ?
      AND ? NOT IN (SELECT value FROM json_each(COALESCE(upgrades, '[]')))
      AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(upgrade.cost, body.upgradeId, body.username, upgrade.cost, body.licenseKeyHash, body.upgradeId).run();
  if (!result.meta.changes) return c.json({ error: "Insufficient TD or upgrade already owned (concurrent update)", required: upgrade.cost }, 409);
  return c.json({ success: true, profile: await getProfile(db, body.username) });
});

account.post("/buy-theme", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; themeId: string; licenseKeyHash: string }>();
  if (!body.username || !body.themeId || !body.licenseKeyHash) return c.json({ error: "username, themeId, and licenseKeyHash are required" }, 400);
  const theme = THEMES.find((t) => t.id === body.themeId);
  if (!theme) return c.json({ error: "Unknown theme" }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const { profile } = ownership;
  if (profile.unlocked_themes.includes(body.themeId)) return c.json({ error: "Theme already unlocked" }, 400);
  if (profile.current_td < theme.cost) return c.json({ error: "Insufficient TD", required: theme.cost, available: profile.current_td }, 400);
  const result = await db.prepare(
    `UPDATE user_scores SET
      current_td = current_td - ?,
      unlocked_themes = json_insert(COALESCE(unlocked_themes, '["default"]'), '$[#]', ?),
      updated_at = datetime('now')
    WHERE username = ? AND current_td >= ? AND license_hash = ?
      AND ? NOT IN (SELECT value FROM json_each(COALESCE(unlocked_themes, '["default"]')))
      AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(theme.cost, body.themeId, body.username, theme.cost, body.licenseKeyHash, body.themeId).run();
  if (!result.meta.changes) return c.json({ error: "Insufficient TD or theme already unlocked (concurrent update)", required: theme.cost }, 409);
  return c.json({ success: true, profile: await getProfile(db, body.username) });
});

account.post("/unlock-achievement", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; achievementId: string; licenseKeyHash: string }>();
  if (!body.username || !body.achievementId || !body.licenseKeyHash) return c.json({ error: "username, achievementId, and licenseKeyHash are required" }, 400);
  if (!ACHIEVEMENT_IDS.has(body.achievementId)) return c.json({ error: "Unknown achievementId" }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const { profile } = ownership;
  if (profile.achievements.includes(body.achievementId)) return c.json({ success: true, profile });
  const result = await db.prepare(
    `UPDATE user_scores SET
      achievements = json_insert(COALESCE(achievements, '[]'), '$[#]', ?),
      updated_at = datetime('now')
    WHERE username = ? AND license_hash = ?
      AND ? NOT IN (SELECT value FROM json_each(COALESCE(achievements, '[]')))
      AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(body.achievementId, body.username, body.licenseKeyHash, body.achievementId).run();
  if (!result.meta.changes) return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  return c.json({ success: true, profile: await getProfile(db, body.username) });
});

account.post("/update-buddy", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; buddyType: string | null; isShiny: boolean; licenseKeyHash: string }>();
  if (!body.username || !body.licenseKeyHash) return c.json({ error: "username and licenseKeyHash are required" }, 400);
  if (typeof body.isShiny !== "boolean") return c.json({ error: "isShiny must be a boolean" }, 400);
  if (body.buddyType !== null && body.buddyType !== undefined && !BUDDY_TYPE_SET.has(body.buddyType)) return c.json({ error: "Unknown buddyType" }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const result = await db.prepare(
    `UPDATE user_scores SET buddy_type = ?, buddy_is_shiny = ?, updated_at = datetime('now')
     WHERE username = ? AND license_hash = ?
       AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(body.buddyType ?? null, body.isShiny ? 1 : 0, body.username, body.licenseKeyHash).run();
  if (!result.meta.changes) return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  return c.json({ success: true, profile: await getProfile(db, body.username) });
});

account.post("/update-ticket", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const body = await c.req.json<{ username: string; activeTicket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null; licenseKeyHash: string }>();
  if (!body.username || !body.licenseKeyHash) return c.json({ error: "username and licenseKeyHash are required" }, 400);
  const ticketError = validateActiveTicket(body.activeTicket);
  if (ticketError) return c.json({ error: ticketError }, 400);
  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  const result = await db.prepare(
    `UPDATE user_scores SET active_ticket = ?, updated_at = datetime('now')
     WHERE username = ? AND license_hash = ?
       AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
  ).bind(body.activeTicket ? JSON.stringify(body.activeTicket) : null, body.username, body.licenseKeyHash).run();
  if (!result.meta.changes) return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  return c.json({ success: true, profile: await getProfile(db, body.username) });
});

account.post("/shill", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) return c.json({ error: "KV storage is not configured" }, 500);
  const sessionId = c.get("sessionId");
  const shillKey = `shill:${sessionId}`;
  if (await kv.get(shillKey)) return c.json({ error: "Shill credit already claimed" }, 409);
  const usageKey = `free:${sessionId}`;
  const raw = await kv.get(usageKey);
  await kv.put(usageKey, String(Math.max(0, (raw !== null ? parseInt(raw, 10) : 0) - SHILL_CREDIT)));
  await kv.put(shillKey, "1");
  return c.json({ success: true, creditsGranted: SHILL_CREDIT });
});

export default account;
