import { Hono } from "hono";
import { validatePolarKey } from "../utils/polar";
import { hashKey, getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileRow, isLicenseActive } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, calcBulkCost } from "../gameConstants";
import { resolveProfile, verifyOwnership, broadcastPurchase, commitSyncSideEffects, validateActiveTicket, SHILL_CREDIT, fetchLicenseKeys, fetchCheckoutCustomerId, parseCheckoutCache, claimCheckoutForSession, storeClaimedKeys, getAlreadyClaimedKeys } from "./accountHelpers";
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
  Variables: {
    sessionId: string;
  };
};

/** Validate preconditions for /sync and return the validated resources, or an error response. */
async function validateSyncRequest(c: { req: { json: <T>() => Promise<T> }; env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response }) {
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

async function lookupCheckoutCache(kv: KVNamespace, checkoutId: string, sessionId: string): Promise<{ keys: string[]; sessionMismatch?: boolean } | null> {
  const cached = await kv.get(`checkout_used:${checkoutId}`);
  if (!cached) return null;
  const entry = parseCheckoutCache(cached);
  if (!entry) return null;
  if (entry.sessionId && entry.sessionId !== sessionId) return { keys: entry.keys, sessionMismatch: true };
  return { keys: entry.keys };
}

const account = new Hono<Env>();

account.post("/checkout-license", async (c) => {
  const body = await c.req.json<{ checkoutId?: string }>();
  if (!body.checkoutId) return c.json({ error: "checkoutId is required" }, 400);
  if (!/^[\w-]{4,128}$/.test(body.checkoutId)) return c.json({ error: "Invalid checkoutId format" }, 400);

  const sessionId = c.get("sessionId");
  if (!sessionId) return c.json({ error: "Session required" }, 401);

  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) return c.json({ error: "Polar integration is not configured" }, 500);

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) return c.json({ error: "KV storage is not configured" }, 500);

  const cacheResult = await lookupCheckoutCache(kv, body.checkoutId, sessionId);
  if (cacheResult) {
    if (cacheResult.sessionMismatch) {
      // Session mismatch — attempt D1 stale claim recovery before rejecting.
      // This handles users who lost cookies/session between checkout and return.
      const db = c.env?.DB;
      if (db) {
        const claim = await claimCheckoutForSession(db, body.checkoutId, sessionId);
        if (claim.ok) {
          const updated: CheckoutCache = { keys: cacheResult.keys, sessionId };
          await kv.put(`checkout_used:${body.checkoutId}`, JSON.stringify(updated), { expirationTtl: 7 * 24 * 60 * 60 });
          return c.json({ licenseKey: cacheResult.keys[0], allKeys: cacheResult.keys });
        }
      }
      return c.json({ error: "This checkout was already redeemed by another session" }, 403);
    }
    return c.json({ licenseKey: cacheResult.keys[0], allKeys: cacheResult.keys });
  }

  // Verify the checkout exists, belongs to this org, and payment succeeded
  // BEFORE claiming it for this session — this prevents callers from poisoning
  // arbitrary checkout IDs without proof of a valid purchase.
  const result = await fetchCheckoutCustomerId(body.checkoutId, accessToken, organizationId);
  if ("error" in result) return c.json({ error: result.error }, result.status);

  if (!result.createdAt) return c.json({ error: "Checkout is missing creation timestamp — cannot verify license ownership" }, 500);

  // Atomically bind this checkout to the current session via D1. If another
  // session already claimed this checkout_id, reject the request — this
  // prevents a stolen checkout_id from being redeemed by an attacker.
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  const claim = await claimCheckoutForSession(db, body.checkoutId, sessionId);
  if (!claim.ok) return c.json({ error: claim.error }, claim.retriable ? 503 : 403);

  const lkResult = await fetchLicenseKeys(result.customerId, organizationId, accessToken, result.createdAt);
  if ("error" in lkResult) return c.json({ error: lkResult.error }, lkResult.status);

  // Exclude keys already claimed by other checkouts to prevent cross-purchase
  // leakage when the same customer makes multiple purchases within the time window.
  const alreadyClaimed = await getAlreadyClaimedKeys(db, body.checkoutId);
  const allKeyStrings = alreadyClaimed.size > 0
    ? lkResult.keys.filter((k) => !alreadyClaimed.has(k))
    : lkResult.keys;
  if (!allKeyStrings.length) return c.json({ error: "No license issued yet — try again in a few seconds" }, 409);

  await storeClaimedKeys(db, body.checkoutId, allKeyStrings);
  const cachePayload: CheckoutCache = { keys: allKeyStrings, sessionId };
  await kv.put(`checkout_used:${body.checkoutId}`, JSON.stringify(cachePayload), { expirationTtl: 7 * 24 * 60 * 60 });
  return c.json({ licenseKey: allKeyStrings[0], allKeys: allKeyStrings });
});

account.post("/sync", async (c) => {
  const validated = await validateSyncRequest(c);
  if ("error" in validated) return validated.error;
  const { body, validation, kv, db, hash } = validated;

  const sessionId = c.get("sessionId");
  const limits = getQuotaLimits(c.env);

  // Resolve the profile FIRST — if this fails (username taken, concurrent
  // claim, etc.) we must NOT leave behind an activated license row or KV
  // quota for a sync that never completed.
  const result = await resolveProfile(db, hash, body, sessionId && kv ? { sessionId, kv } : undefined);
  if (result.error) {
    const isConflict =
      result.error.includes("already taken") ||
      result.error.includes("just claimed") ||
      result.error.includes("being activated");
    return c.json({ error: result.error }, isConflict ? 409 : 403);
  }

  // Profile claim succeeded — now provision the licenses row and KV quota.
  // This ordering ensures that failed syncs never produce orphaned active
  // licenses or quota entries.
  await commitSyncSideEffects(
    { db, kv, hash },
    { validationId: validation.id, limits, sessionId },
  );

  // Bind the session to the resolved username so /me can look it up.
  if (sessionId && result.profile?.username) {
    await kv.put(`session_user:${sessionId}`, result.profile.username, { expirationTtl: 60 * 60 * 24 * 365 });
  }

  const quotaPercent = await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: hash, limits });
  const profile = { ...result.profile, quota_percent: quotaPercent };

  return c.json({ success: true, hash, restored: result.restored, profile });
});

account.get("/me", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const sessionId = c.get("sessionId");
  if (!kv || !sessionId) return c.json({ found: false });

  const username = await kv.get(`session_user:${sessionId}`);
  if (!username) return c.json({ found: false });

  const db = c.env?.DB;
  const row = db ? await getProfileRow(db, username) : null;

  // A session_user mapping with no backing row is the username-only restore
  // case: the user's first chat 402'd before recordUsage could create a row,
  // so we have a session-bound username but no progress yet. Return found:
  // true with profile: null so the frontend can restore the username and
  // show truthful quota instead of inventing a fresh identity.
  const rawLicenseHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;

  // Verify the license is still active — a revoked license should be treated as free.
  // This prevents the UI from showing isPro: true with quotaPercent: 0 for revoked users.
  const licenseActive = rawLicenseHash && db ? await isLicenseActive(db, rawLicenseHash) : false;
  const isPro = Boolean(rawLicenseHash && licenseActive);

  const limits = getQuotaLimits(c.env);
  const quotaPercent = isPro
    ? await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: rawLicenseHash!, limits })
    : await getQuotaPercent(kv, { tier: "free", sessionId, limits });

  const profile = db ? await getProfile(db, username) : null;

  // Never expose the raw license hash — it's a credential that grants write
  // access to the account.  Return a boolean flag instead so the frontend
  // knows this is a Pro user and can prompt them to re-sync.
  // A revoked user has a license_hash but is no longer active — surface this
  // so the frontend can show "license revoked" instead of treating them as
  // a vanilla free user.
  const revoked = Boolean(rawLicenseHash && !licenseActive);
  return c.json({
    found: true,
    username,
    profile: profile ? { ...profile, quota_percent: quotaPercent } : null,
    quotaPercent,
    isPro,
    ...(revoked ? { revoked: true } : {}),
  });
});

account.post("/buy-generator", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; generatorId: string; amount: number; licenseKeyHash: string }>();
  if (!body.username || !body.generatorId || !body.amount || body.amount < 1 || !Number.isInteger(body.amount) || body.amount > 1000 || !body.licenseKeyHash) {
    return c.json({ error: "username, generatorId, amount (positive integer, max 1000), and licenseKeyHash are required" }, 400);
  }

  const generator = GENERATORS.find((g) => g.id === body.generatorId);
  if (!generator) return c.json({ error: "Unknown generator" }, 400);

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  const owned = profile.inventory[body.generatorId] ?? 0;
  const cost = calcBulkCost(generator.baseCost, owned, body.amount);

  if (profile.current_td < cost) {
    return c.json({ error: "Insufficient TD", required: cost, available: profile.current_td }, 400);
  }

  // Atomic update: use SQL-level TD guard and JSON functions to prevent
  // concurrent requests from overwriting each other or producing negative balances.
  // The COALESCE(..., 0) = ? guard ensures the inventory count hasn't changed
  // since we computed the price — two concurrent requests pricing against the
  // same ownership level will cause one to fail with a 409.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        inventory = json_set(COALESCE(inventory, '{}'), '$."' || ? || '"', COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) + ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ? AND license_hash = ?
        AND COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) = ?
        AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(cost, body.generatorId, body.generatorId, body.amount, body.username, cost, body.licenseKeyHash, body.generatorId, owned)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD (concurrent update)", required: cost }, 409);
  }

  const updated = await getProfile(db, body.username);

  if (cost > 1_000_000) {
    const purchaseMessage = `💰 ${body.username} bought ${body.amount}x ${generator.name} for ${cost.toLocaleString()} TD!`;
    broadcastPurchase(purchaseMessage, db, c.executionCtx);
  }

  return c.json({ success: true, profile: updated });
});

account.post("/buy-upgrade", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; upgradeId: string; licenseKeyHash: string }>();
  if (!body.username || !body.upgradeId || !body.licenseKeyHash) {
    return c.json({ error: "username, upgradeId, and licenseKeyHash are required" }, 400);
  }

  const upgrade = UPGRADES.find((u) => u.id === body.upgradeId);
  if (!upgrade) return c.json({ error: "Unknown upgrade" }, 400);

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  if (profile.upgrades.includes(body.upgradeId)) {
    return c.json({ error: "Upgrade already owned" }, 400);
  }
  if ((profile.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) {
    return c.json({ error: "Required generator not owned" }, 400);
  }
  if (profile.current_td < upgrade.cost) {
    return c.json({ error: "Insufficient TD", required: upgrade.cost, available: profile.current_td }, 400);
  }

  // Atomic update: SQL-level TD guard + JSON append + dedupe guard.
  // The NOT IN subquery prevents concurrent requests that both pass the
  // JS-level "already owned" check from both appending the same upgrade.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        upgrades = json_insert(COALESCE(upgrades, '[]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ? AND license_hash = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(upgrades, '[]')))
        AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(upgrade.cost, body.upgradeId, body.username, upgrade.cost, body.licenseKeyHash, body.upgradeId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD or upgrade already owned (concurrent update)", required: upgrade.cost }, 409);
  }

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

account.post("/buy-theme", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; themeId: string; licenseKeyHash: string }>();
  if (!body.username || !body.themeId || !body.licenseKeyHash) {
    return c.json({ error: "username, themeId, and licenseKeyHash are required" }, 400);
  }

  const theme = THEMES.find((t) => t.id === body.themeId);
  if (!theme) return c.json({ error: "Unknown theme" }, 400);

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  if (profile.unlocked_themes.includes(body.themeId)) {
    return c.json({ error: "Theme already unlocked" }, 400);
  }
  if (profile.current_td < theme.cost) {
    return c.json({ error: "Insufficient TD", required: theme.cost, available: profile.current_td }, 400);
  }

  // Atomic update: SQL-level TD guard + JSON append + dedupe guard.
  // The NOT IN subquery prevents concurrent requests that both pass the
  // JS-level "already unlocked" check from both appending the same theme.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        unlocked_themes = json_insert(COALESCE(unlocked_themes, '["default"]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ? AND license_hash = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(unlocked_themes, '["default"]')))
        AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(theme.cost, body.themeId, body.username, theme.cost, body.licenseKeyHash, body.themeId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD or theme already unlocked (concurrent update)", required: theme.cost }, 409);
  }

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

// Allowlists for client-supplied IDs in mutation routes are imported from
// @claude-cope/shared so frontend and backend share one source of truth —
// no manual sync required when the achievement/buddy lists evolve.

account.post("/unlock-achievement", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; achievementId: string; licenseKeyHash: string }>();
  if (!body.username || !body.achievementId || !body.licenseKeyHash) {
    return c.json({ error: "username, achievementId, and licenseKeyHash are required" }, 400);
  }
  if (!ACHIEVEMENT_IDS.has(body.achievementId)) {
    return c.json({ error: "Unknown achievementId" }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  if (profile.achievements.includes(body.achievementId)) {
    return c.json({ success: true, profile });
  }

  // Atomic update: SQL-level JSON append + dedupe guard prevents concurrent
  // requests from overwriting each other's achievements.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        achievements = json_insert(COALESCE(achievements, '[]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ? AND license_hash = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(achievements, '[]')))
        AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(body.achievementId, body.username, body.licenseKeyHash, body.achievementId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-buddy", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; buddyType: string | null; isShiny: boolean; licenseKeyHash: string }>();
  if (!body.username || !body.licenseKeyHash) {
    return c.json({ error: "username and licenseKeyHash are required" }, 400);
  }
  if (typeof body.isShiny !== "boolean") {
    return c.json({ error: "isShiny must be a boolean" }, 400);
  }
  if (body.buddyType !== null && body.buddyType !== undefined && !BUDDY_TYPE_SET.has(body.buddyType)) {
    return c.json({ error: "Unknown buddyType" }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }

  // Atomic: include license_hash + active-license subquery in WHERE to
  // prevent TOCTOU between verifyOwnership and the actual update.
  const result = await db
    .prepare(
      `UPDATE user_scores SET buddy_type = ?, buddy_is_shiny = ?, updated_at = datetime('now')
       WHERE username = ? AND license_hash = ?
         AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(body.buddyType ?? null, body.isShiny ? 1 : 0, body.username, body.licenseKeyHash)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-ticket", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    username: string;
    activeTicket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null;
    licenseKeyHash: string;
  }>();
  if (!body.username || !body.licenseKeyHash) {
    return c.json({ error: "username and licenseKeyHash are required" }, 400);
  }
  const ticketError = validateActiveTicket(body.activeTicket);
  if (ticketError) {
    return c.json({ error: ticketError }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }

  // Atomic: include license_hash + active-license subquery in WHERE to
  // prevent TOCTOU between verifyOwnership and the actual update.
  const result = await db
    .prepare(
      `UPDATE user_scores SET active_ticket = ?, updated_at = datetime('now')
       WHERE username = ? AND license_hash = ?
         AND EXISTS (SELECT 1 FROM licenses WHERE key_hash = user_scores.license_hash AND status = 'active')`,
    )
    .bind(body.activeTicket ? JSON.stringify(body.activeTicket) : null, body.username, body.licenseKeyHash)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

account.post("/shill", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) return c.json({ error: "KV storage is not configured" }, 500);

  const sessionId = c.get("sessionId");
  const shillKey = `shill:${sessionId}`;

  const alreadyShilled = await kv.get(shillKey);
  if (alreadyShilled) {
    return c.json({ error: "Shill credit already claimed" }, 409);
  }

  const usageKey = `free:${sessionId}`;
  const raw = await kv.get(usageKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  const updated = Math.max(0, current - SHILL_CREDIT);

  await kv.put(usageKey, String(updated));
  await kv.put(shillKey, "1");

  return c.json({ success: true, creditsGranted: SHILL_CREDIT });
});

export default account;
