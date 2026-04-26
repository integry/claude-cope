import { getProfile, getProfileByLicenseHash, getProfileRow, resolveRank } from "../utils/profile";

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
    td_multiplier?: number;
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
    tdMultiplier: cp?.td_multiplier ?? 1.0,
  };
}

type CreateProfileResult =
  | { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined }
  | { profile: null; error: string };

async function createProfileFromClient(db: D1Database, hash: string, body: SyncBody): Promise<CreateProfileResult> {
  const newUsername = body.username || "anonymous";

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
      // Preserve the server-authoritative profile data (TD, inventory, etc.).
      await db
        .prepare("UPDATE user_scores SET license_hash = ?, updated_at = datetime('now') WHERE username = ? AND license_hash IS NULL")
        .bind(hash, newUsername)
        .run();
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

  const profile = await getProfile(db, newUsername);
  if (!profile) return { profile: null, error: "Failed to create profile" };
  return { profile };
}

type ResolveProfileResult =
  | { restored: boolean; profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>; error?: undefined }
  | { restored: false; profile: null; error: string };

export async function resolveProfile(db: D1Database, hash: string, body: SyncBody): Promise<ResolveProfileResult> {
  // Case 1: Existing profile with this license_hash → restore (cross-device sync)
  const existingByHash = await getProfileByLicenseHash(db, hash);
  if (existingByHash) {
    return { restored: true, profile: existingByHash };
  }

  // Case 2: No profile for this license → create a new one, or upgrade an
  // existing free (unlicensed) profile if the username matches.
  const created = await createProfileFromClient(db, hash, body);
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
