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
 * A missing row means the license hasn't been recorded in the DB yet (e.g., the
 * webhook hasn't fired or the /sync path hasn't inserted it); this is treated as
 * active to avoid rejecting legitimately linked users. Only an explicit non-active
 * status (e.g., 'revoked') causes this to return false.
 */
export async function isLicenseActive(db: D1Database, keyHash: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT status FROM licenses WHERE key_hash = ?")
    .bind(keyHash)
    .first<{ status: string }>();
  if (!row) return true; // Not yet recorded — assume active
  return row.status === "active";
}
