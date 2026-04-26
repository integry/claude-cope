import { Hono } from "hono";
import { validatePolarKey } from "../utils/polar";
import { hashKey, getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileByLicenseHash, getProfileRow, resolveRank } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, calcBulkCost } from "../gameConstants";


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

// ─── Cross-device restore / license linking ─────────────────────────

type SyncBody = {
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
    td_multiplier?: number;
  };
};

async function linkExistingProfile(db: D1Database, hash: string, username: string) {
  await db
    .prepare("UPDATE user_scores SET license_hash = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(hash, username)
    .run();
  return getProfile(db, username);
}

function buildProfileScoring(cp: SyncBody["currentProfile"]) {
  const totalTD = cp?.total_td ?? 0;
  return {
    totalTD,
    currentTD: cp?.current_td ?? 0,
    rank: resolveRank(totalTD),
    inventory: JSON.stringify(cp?.inventory ?? {}),
    upgrades: JSON.stringify(cp?.upgrades ?? []),
    achievements: JSON.stringify(cp?.achievements ?? []),
  };
}

function buildProfileCosmetics(cp: SyncBody["currentProfile"]) {
  return {
    buddyType: cp?.buddy_type ?? null,
    buddyIsShiny: cp?.buddy_is_shiny ? 1 : 0,
    unlockedThemes: JSON.stringify(cp?.unlocked_themes ?? ["default"]),
    activeTheme: cp?.active_theme ?? "default",
    activeTicket: cp?.active_ticket ? JSON.stringify(cp.active_ticket) : null,
    tdMultiplier: cp?.td_multiplier ?? 1.0,
  };
}

async function createProfileFromClient(db: D1Database, hash: string, body: SyncBody) {
  const newUsername = body.username || "anonymous";
  const s = buildProfileScoring(body.currentProfile);
  const c = buildProfileCosmetics(body.currentProfile);

  await db
    .prepare(
      `INSERT INTO user_scores (username, total_td, current_td, corporate_rank, license_hash, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(username) DO UPDATE SET license_hash = ?, updated_at = datetime('now')`,
    )
    .bind(
      newUsername, s.totalTD, s.currentTD, s.rank, hash,
      s.inventory, s.upgrades, s.achievements,
      c.buddyType, c.buddyIsShiny, c.unlockedThemes,
      c.activeTheme, c.activeTicket, c.tdMultiplier,
      hash,
    )
    .run();

  return getProfile(db, newUsername);
}

async function resolveProfile(db: D1Database, hash: string, body: SyncBody): Promise<{ restored: boolean; profile: Awaited<ReturnType<typeof getProfile>> | null; error?: string }> {
  // Case 1: Existing profile with this license_hash → restore
  const existingByHash = await getProfileByLicenseHash(db, hash);
  if (existingByHash) {
    return { restored: true, profile: existingByHash };
  }

  // Case 2: User has a user_scores row by username → link license_hash
  // Only allow linking if the profile has no existing license (prevents hijack)
  if (body.username) {
    const existingByName = await getProfileRow(db, body.username);
    if (existingByName) {
      const row = existingByName as unknown as { license_hash: string | null };
      if (row.license_hash && row.license_hash !== hash) {
        // Profile already belongs to a different license — refuse to rebind
        return { restored: false, profile: null, error: "This username is already linked to a different license" };
      }
      const profile = await linkExistingProfile(db, hash, body.username);
      return { restored: false, profile };
    }
  }

  // Case 3: No profile at all → create from client-provided currentProfile
  const profile = await createProfileFromClient(db, hash, body);
  return { restored: false, profile };
}

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
  const kvKey = `polar:${hash}`;

  const limits = getQuotaLimits(c.env);
  const existingQuota = await kv.get(kvKey);
  if (existingQuota === null) {
    await kv.put(kvKey, String(limits.proInitialQuota));
  }

  // Cache the Polar license_key UUID so chat.ts can mirror usage to Polar
  // without needing the raw license key.
  if (validation.id) {
    await kv.put(`polar_id:${hash}`, validation.id);
  }

  const db = c.env?.DB;
  if (!db) {
    return c.json({ success: true, hash, restored: false });
  }

  // Record license activation in DB for admin purchase stats
  await db
    .prepare(
      "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active'",
    )
    .bind(hash)
    .run();

  const result = await resolveProfile(db, hash, body);
  if (result.error) {
    return c.json({ error: result.error }, 403);
  }
  const quotaPercent = await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: hash, limits });
  if (result.profile) {
    result.profile = { ...result.profile, quota_percent: quotaPercent };
  }
  return c.json({ success: true, hash, ...result });
});

// ─── Ownership verification ─────────────────────────────────────────

async function verifyOwnership(db: D1Database, username: string, licenseKeyHash: string): Promise<{ profile: Awaited<ReturnType<typeof getProfile>>; error?: string }> {
  const row = await getProfileRow(db, username);
  if (!row) return { profile: null, error: "Profile not found" };
  const rowWithHash = row as unknown as { license_hash: string | null };
  if (!rowWithHash.license_hash || rowWithHash.license_hash !== licenseKeyHash) {
    return { profile: null, error: "Unauthorized: license key does not match this profile" };
  }
  const profile = await getProfile(db, username);
  return { profile };
}

// ─── Purchase endpoints ─────────────────────────────────────────────

function broadcastPurchase(message: string, db: D1Database | undefined, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
  if (db) {
    ctx.waitUntil(
      db.prepare("INSERT INTO recent_events (message) VALUES (?)").bind(message).run(),
    );
  }
}

account.post("/buy-generator", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; generatorId: string; amount: number; licenseKeyHash: string }>();
  if (!body.username || !body.generatorId || !body.amount || body.amount < 1 || !body.licenseKeyHash) {
    return c.json({ error: "username, generatorId, amount, and licenseKeyHash are required" }, 400);
  }

  const generator = GENERATORS.find((g) => g.id === body.generatorId);
  if (!generator) return c.json({ error: "Unknown generator" }, 400);

  const { profile, error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, profile === null ? 403 : 404);
  if (!profile) return c.json({ error: "Profile not found" }, 404);

  const owned = profile.inventory[body.generatorId] ?? 0;
  const cost = calcBulkCost(generator.baseCost, owned, body.amount);

  if (profile.current_td < cost) {
    return c.json({ error: "Insufficient TD", required: cost, available: profile.current_td }, 400);
  }

  const newInventory = { ...profile.inventory, [body.generatorId]: owned + body.amount };
  const newCurrentTD = profile.current_td - cost;

  await db
    .prepare("UPDATE user_scores SET current_td = ?, inventory = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(newCurrentTD, JSON.stringify(newInventory), body.username)
    .run();

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

  const { profile, error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, profile === null ? 403 : 404);
  if (!profile) return c.json({ error: "Profile not found" }, 404);

  if (profile.upgrades.includes(body.upgradeId)) {
    return c.json({ error: "Upgrade already owned" }, 400);
  }
  if ((profile.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) {
    return c.json({ error: "Required generator not owned" }, 400);
  }
  if (profile.current_td < upgrade.cost) {
    return c.json({ error: "Insufficient TD", required: upgrade.cost, available: profile.current_td }, 400);
  }

  const newUpgrades = [...profile.upgrades, body.upgradeId];
  const newCurrentTD = profile.current_td - upgrade.cost;

  await db
    .prepare("UPDATE user_scores SET current_td = ?, upgrades = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(newCurrentTD, JSON.stringify(newUpgrades), body.username)
    .run();

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

  const { profile, error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, profile === null ? 403 : 404);
  if (!profile) return c.json({ error: "Profile not found" }, 404);

  if (profile.unlocked_themes.includes(body.themeId)) {
    return c.json({ error: "Theme already unlocked" }, 400);
  }
  if (profile.current_td < theme.cost) {
    return c.json({ error: "Insufficient TD", required: theme.cost, available: profile.current_td }, 400);
  }

  const newThemes = [...profile.unlocked_themes, body.themeId];
  const newCurrentTD = profile.current_td - theme.cost;

  await db
    .prepare("UPDATE user_scores SET current_td = ?, unlocked_themes = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(newCurrentTD, JSON.stringify(newThemes), body.username)
    .run();

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

// ─── Minor state update endpoints ───────────────────────────────────

account.post("/unlock-achievement", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; achievementId: string; licenseKeyHash: string }>();
  if (!body.username || !body.achievementId || !body.licenseKeyHash) {
    return c.json({ error: "username, achievementId, and licenseKeyHash are required" }, 400);
  }

  const { profile, error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, profile === null ? 403 : 404);
  if (!profile) return c.json({ error: "Profile not found" }, 404);

  if (profile.achievements.includes(body.achievementId)) {
    return c.json({ success: true, profile });
  }

  const newAchievements = [...profile.achievements, body.achievementId];
  await db
    .prepare("UPDATE user_scores SET achievements = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(JSON.stringify(newAchievements), body.username)
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

  const { error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, 403);

  await db
    .prepare("UPDATE user_scores SET buddy_type = ?, buddy_is_shiny = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(body.buddyType ?? null, body.isShiny ? 1 : 0, body.username)
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

  const { error } = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (error) return c.json({ error }, 403);

  await db
    .prepare("UPDATE user_scores SET active_ticket = ?, updated_at = datetime('now') WHERE username = ?")
    .bind(body.activeTicket ? JSON.stringify(body.activeTicket) : null, body.username)
    .run();

  const updated = await getProfile(db, body.username);
  return c.json({ success: true, profile: updated });
});

// ─── Shill credits ──────────────────────────────────────────────────

account.post("/shill", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

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
