import { Hono } from "hono";
import { getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileRow, rowToProfile, isLicenseActive } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, ALIAS_CHANGES_PER_DAY, calcBulkCost, FREE_TIER_RANK_CAP } from "../gameConstants";
import { resolveProfile, verifyOwnership, broadcastPurchase, validateSyncRequest, commitSyncSideEffects, validateActiveTicket, validateAlias, checkAliasRateLimit, rollbackAliasRateToken, performAliasDbUpdate } from "./accountHelpers";
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
const SHILL_CREDIT = 5;

const account = new Hono<Env>();

async function buildMePayload(opts: {
  row: unknown;
  db: D1Database | undefined;
  kv: KVNamespace;
  env: Env["Bindings"];
  sessionId: string;
}) {
  const { row, db, kv, env, sessionId } = opts;
  const rawLicenseHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;
  const licenseActive = rawLicenseHash && db ? await isLicenseActive(db, rawLicenseHash) : false;
  const isPro = Boolean(rawLicenseHash && licenseActive);
  const limits = getQuotaLimits(env);
  const quotaPercent = isPro
    ? await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: rawLicenseHash!, limits })
    : await getQuotaPercent(kv, { tier: "free", sessionId, limits });
  const profile = row
    ? { ...rowToProfile(row as Parameters<typeof rowToProfile>[0]), quota_percent: quotaPercent, ...(!isPro ? { corporate_rank: FREE_TIER_RANK_CAP } : {}) }
    : null;
  const revoked = Boolean(rawLicenseHash && !licenseActive);
  return { isPro, quotaPercent, profile, revoked };
}

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
    { validationId: validation.id, proInitialQuota: limits.proInitialQuota, sessionId },
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

  let username = await kv.get(`session_user:${sessionId}`);
  if (!username) return c.json({ found: false });

  const db = c.env?.DB;
  let row = db ? await getProfileRow(db, username) : null;

  // If no DB row exists, check if the username was renamed by an alias change
  // in another session. Follow the redirect chain (up to 5 hops to handle
  // multiple renames like alice->bob->carol) and repair this session's mapping.
  if (!row && db) {
    let current = username;
    for (let i = 0; i < 5 && !row; i++) {
      const renamedTo = await kv.get(`renamed:${current}`);
      if (!renamedTo) break;
      row = await getProfileRow(db, renamedTo);
      if (row) {
        username = renamedTo;
        await kv.put(`session_user:${sessionId}`, renamedTo, { expirationTtl: 60 * 60 * 24 * 365 });
      }
      current = renamedTo;
    }
  }

  const { isPro, quotaPercent, profile, revoked } = await buildMePayload({ row, db, kv, env: c.env, sessionId });

  return c.json({
    found: true,
    username,
    profile,
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

account.post("/update-alias", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; newAlias: string; licenseKeyHash: string }>();
  if (!body.username || !body.newAlias) {
    return c.json({ error: "username and newAlias are required" }, 400);
  }
  if (!body.licenseKeyHash) {
    return c.json({ error: "Alias changes require an active Max license" }, 403);
  }

  const v = validateAlias(body.newAlias);
  if (v.error) return c.json({ error: v.error }, 400);
  const alias = v.alias!;

  if (alias.toLowerCase() === body.username.toLowerCase()) {
    return c.json({ error: "New alias is the same as the current username" }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }

  const rateLimit = await checkAliasRateLimit(db, body.licenseKeyHash, ALIAS_CHANGES_PER_DAY);
  if (!rateLimit.allowed) {
    return c.json({ error: `Alias change limit reached (max ${ALIAS_CHANGES_PER_DAY} per day)` }, 429);
  }

  const dbResult = await performAliasDbUpdate(db, body.username, alias, body.licenseKeyHash);
  if (!dbResult.success) {
    await rollbackAliasRateToken(db, body.licenseKeyHash);
    return c.json({ error: dbResult.error }, dbResult.status);
  }

  // The DB rename succeeded — KV session updates and profile fetch are
  // best-effort. If they fail the alias is already changed, so return
  // success with whatever profile data we can gather.
  const sessionId = c.get("sessionId");
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  let updated: Awaited<ReturnType<typeof getProfile>> = null;
  try {
    if (kv && sessionId) {
      await kv.put(`session_user:${sessionId}`, alias, { expirationTtl: 60 * 60 * 24 * 365 });
      await kv.put(`username_session:${alias}`, sessionId, { expirationTtl: 60 * 60 * 24 * 365 });
      await kv.delete(`username_session:${body.username}`);
      // Store a redirect so other active sessions following the old username
      // can discover the rename via /me and repair their own session mapping.
      await kv.put(`renamed:${body.username}`, alias, { expirationTtl: 60 * 60 * 24 * 30 });
    }
    updated = await getProfile(db, alias);
  } catch {
    // KV or profile fetch failed after a successful DB rename.
    // Return success so the client knows the alias changed.
  }
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
