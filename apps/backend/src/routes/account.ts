import { Hono } from "hono";
import { validatePolarKey } from "../utils/polar";
import { hashKey, getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileRow, isLicenseActive } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, calcBulkCost } from "../gameConstants";
import { resolveProfile, verifyOwnership, broadcastPurchase } from "./accountHelpers";
import type { SyncBody } from "./accountHelpers";
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

/** Ensure the KV quota entry exists for a license hash, restoring revoked quota if available. */
async function ensureQuota(kv: KVNamespace, hash: string, proInitialQuota: number): Promise<void> {
  const kvKey = `polar:${hash}`;
  const existingQuota = await kv.get(kvKey);
  if (existingQuota !== null) return;

  // If the license was previously revoked, restore the saved remaining
  // quota instead of granting a fresh allocation.
  const revokedKey = `polar_revoked:${hash}`;
  const savedQuota = await kv.get(revokedKey);
  if (savedQuota !== null) {
    await kv.put(kvKey, savedQuota);
    await kv.delete(revokedKey);
  } else {
    await kv.put(kvKey, String(proInitialQuota));
  }
}

const account = new Hono<Env>();

account.post("/sync", async (c) => {
  const body = await c.req.json<SyncBody>();

  if (!body.licenseKey) {
    return c.json({ error: "licenseKey is required" }, 400);
  }

  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) {
    return c.json({ error: "Polar integration is not configured" }, 500);
  }

  const validation = await validatePolarKey(body.licenseKey, accessToken, organizationId);
  if (!validation.valid) {
    return c.json({ error: "Invalid or inactive license key", status: validation.status }, 403);
  }

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

  const hash = await hashKey(body.licenseKey);

  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database not configured" }, 500);
  }

  // Resolve the profile FIRST — if this fails (e.g. username taken, ownership
  // check rejects) we don't want orphaned KV quota or license rows with no
  // associated profile.
  const sessionId = c.get("sessionId");
  const result = await resolveProfile(db, hash, body, sessionId && kv ? { sessionId, kv } : undefined);
  if (result.error) {
    return c.json({ error: result.error }, 403);
  }

  // Profile resolved successfully — now commit the side-effect state writes.
  // Record license activation in DB for admin purchase stats.
  await db
    .prepare(
      "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')",
    )
    .bind(hash)
    .run();

  const limits = getQuotaLimits(c.env);
  await ensureQuota(kv, hash, limits.proInitialQuota);

  // Cache the Polar license_key UUID so chat.ts can mirror usage to Polar
  // without needing the raw license key.
  if (validation.id) {
    await kv.put(`polar_id:${hash}`, validation.id);
  }

  const quotaPercent = await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: hash, limits });
  const profile = { ...result.profile, quota_percent: quotaPercent };

  // Cache the session → username mapping so a user with cleared localStorage
  // but the same browser cookie can be restored via GET /me.
  if (sessionId && profile.username) {
    await kv.put(`session_user:${sessionId}`, profile.username, { expirationTtl: 60 * 60 * 24 * 365 });
  }

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
  return c.json({
    found: true,
    username,
    profile: profile ? { ...profile, quota_percent: quotaPercent } : null,
    quotaPercent,
    isPro,
  });
});

account.post("/buy-generator", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; generatorId: string; amount: number; licenseKeyHash: string }>();
  if (!body.username || !body.generatorId || !body.amount || body.amount < 1 || !Number.isInteger(body.amount) || !body.licenseKeyHash) {
    return c.json({ error: "username, generatorId, amount (positive integer), and licenseKeyHash are required" }, 400);
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
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        inventory = json_set(COALESCE(inventory, '{}'), '$.' || ?, COALESCE(json_extract(inventory, '$.' || ?), 0) + ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ?`,
    )
    .bind(cost, body.generatorId, body.generatorId, body.amount, body.username, cost)
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
      WHERE username = ? AND current_td >= ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(upgrades, '[]')))`,
    )
    .bind(upgrade.cost, body.upgradeId, body.username, upgrade.cost, body.upgradeId)
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
      WHERE username = ? AND current_td >= ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(unlocked_themes, '["default"]')))`,
    )
    .bind(theme.cost, body.themeId, body.username, theme.cost, body.themeId)
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

const MAX_TICKET_TITLE_LEN = 200;
const MAX_TICKET_ID_LEN = 100;

function validateActiveTicket(ticket: unknown): string | null {
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
  await db
    .prepare(
      `UPDATE user_scores SET
        achievements = json_insert(COALESCE(achievements, '[]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(achievements, '[]')))`,
    )
    .bind(body.achievementId, body.username, body.achievementId)
    .run();

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
  if (body.buddyType !== null && body.buddyType !== undefined && !BUDDY_TYPE_SET.has(body.buddyType)) {
    return c.json({ error: "Unknown buddyType" }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }

  // Atomic: include license_hash in WHERE to prevent TOCTOU between
  // verifyOwnership and the actual update.
  await db
    .prepare("UPDATE user_scores SET buddy_type = ?, buddy_is_shiny = ?, updated_at = datetime('now') WHERE username = ? AND license_hash = ?")
    .bind(body.buddyType ?? null, body.isShiny ? 1 : 0, body.username, body.licenseKeyHash)
    .run();

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

  // Atomic: include license_hash in WHERE to prevent TOCTOU between
  // verifyOwnership and the actual update.
  await db
    .prepare("UPDATE user_scores SET active_ticket = ?, updated_at = datetime('now') WHERE username = ? AND license_hash = ?")
    .bind(body.activeTicket ? JSON.stringify(body.activeTicket) : null, body.username, body.licenseKeyHash)
    .run();

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
