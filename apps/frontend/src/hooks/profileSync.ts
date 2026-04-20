import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";

/**
 * Merge a server-authoritative profile onto local game state.
 * Server wins for all authoritative fields; local-only fields are preserved.
 */
export function applyServerProfile(prev: GameState, profile: ServerProfile): GameState {
  return {
    ...prev,
    username: profile.username,
    economy: {
      ...prev.economy,
      currentTD: profile.current_td,
      totalTDEarned: profile.total_td,
      currentRank: profile.corporate_rank,
      tdMultiplier: profile.td_multiplier,
      ...(profile.quota_percent != null ? { quotaPercent: profile.quota_percent } : {}),
    },
    inventory: profile.inventory,
    upgrades: profile.upgrades,
    achievements: profile.achievements,
    buddy: {
      ...prev.buddy,
      type: profile.buddy_type,
      isShiny: profile.buddy_is_shiny,
    },
    unlockedThemes: profile.unlocked_themes,
    activeTheme: profile.active_theme,
    activeTicket: profile.active_ticket,
  };
}
