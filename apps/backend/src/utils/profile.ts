import type { ServerProfile } from "@claude-cope/shared/profile";
import { computeMultiplier, CORPORATE_RANKS } from "../gameConstants";

interface UserScoreRow {
  username: string;
  total_td: number;
  current_td: number;
  corporate_rank: string;
  inventory: string;
  upgrades: string;
  achievements: string;
  buddy_type: string | null;
  buddy_is_shiny: number;
  unlocked_themes: string;
  active_theme: string;
  active_ticket: string | null;
  td_multiplier: number;
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function resolveRank(totalTD: number): string {
  let rank = CORPORATE_RANKS[0]!.title;
  for (const r of CORPORATE_RANKS) {
    if (totalTD >= r.threshold) rank = r.title;
  }
  return rank;
}

export function rowToProfile(row: UserScoreRow, quotaPercent?: number): ServerProfile {
  const inventory = parseJSON<Record<string, number>>(row.inventory, {});
  const upgrades = parseJSON<string[]>(row.upgrades, []);
  const achievements = parseJSON<string[]>(row.achievements, []);
  const unlockedThemes = parseJSON<string[]>(row.unlocked_themes, ["default"]);
  const activeTicket = row.active_ticket
    ? parseJSON<{ id: string; title: string; sprintProgress: number; sprintGoal: number } | null>(row.active_ticket, null)
    : null;

  return {
    username: row.username,
    total_td: row.total_td,
    current_td: row.current_td,
    corporate_rank: row.corporate_rank,
    inventory,
    upgrades,
    achievements,
    buddy_type: row.buddy_type,
    buddy_is_shiny: row.buddy_is_shiny === 1,
    unlocked_themes: unlockedThemes,
    active_theme: row.active_theme,
    active_ticket: activeTicket,
    td_multiplier: row.td_multiplier,
    multiplier: computeMultiplier(inventory, upgrades),
    ...(quotaPercent != null ? { quota_percent: quotaPercent } : {}),
  };
}

const PROFILE_COLUMNS = "username, total_td, current_td, corporate_rank, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier";

export async function getProfile(db: D1Database, username: string): Promise<ServerProfile | null> {
  const row = await db
    .prepare(`SELECT ${PROFILE_COLUMNS} FROM user_scores WHERE username = ?`)
    .bind(username)
    .first<UserScoreRow>();
  return row ? rowToProfile(row) : null;
}

export async function getProfileByLicenseHash(db: D1Database, hash: string): Promise<ServerProfile | null> {
  const row = await db
    .prepare(`SELECT ${PROFILE_COLUMNS} FROM user_scores WHERE license_hash = ?`)
    .bind(hash)
    .first<UserScoreRow>();
  return row ? rowToProfile(row) : null;
}

export async function getProfileRow(db: D1Database, username: string): Promise<UserScoreRow | null> {
  return db
    .prepare(`SELECT ${PROFILE_COLUMNS}, license_hash FROM user_scores WHERE username = ?`)
    .bind(username)
    .first<UserScoreRow & { license_hash: string | null }>();
}

/**
 * Check whether a license key hash corresponds to an active (non-revoked) license.
 * A missing row means the hash is unknown — return false (fail closed).  Legitimate
 * users always have a row created by /sync or the Polar webhook before they can use
 * Pro features, so an unknown hash is either a timing bug or an attacker probing.
 */
export async function isLicenseActive(db: D1Database, keyHash: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT status FROM licenses WHERE key_hash = ?")
    .bind(keyHash)
    .first<{ status: string }>();
  if (!row) return false; // Unknown hash — fail closed
  return row.status === "active";
}

/**
 * Shared helper that resolves a client-supplied proKeyHash to a server profile.
 * Both /api/chat and /api/score must call this and handle the error case explicitly
 * instead of silently degrading to the free-user write path.
 *
 * Returns either { profile } on success, or { error, code } describing why
 * resolution failed (revoked license, not yet synced, username mismatch).
 */
export type ResolveProUserResult =
  | { profile: ServerProfile; error?: undefined; code?: undefined }
  | { profile: null; error: string; code: "revoked" | "not_synced" | "username_mismatch" };

export async function resolveProUser(
  db: D1Database,
  proKeyHash: string,
  username: string,
): Promise<ResolveProUserResult> {
  const active = await isLicenseActive(db, proKeyHash);
  if (!active) {
    return { profile: null, error: "License has been revoked or is not active", code: "revoked" };
  }

  const profile = await getProfileByLicenseHash(db, proKeyHash);
  if (!profile) {
    return { profile: null, error: "License is not linked to a profile — please /sync first", code: "not_synced" };
  }

  if (profile.username !== username) {
    return { profile: null, error: "Username does not match the license owner", code: "username_mismatch" };
  }

  return { profile };
}
