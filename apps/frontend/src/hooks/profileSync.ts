import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";
import { resolveRank } from "./gameStateUtils";

export type PendingCompletedRewardMerge = {
  minimumCurrentTD: number;
  minimumTotalTDEarned: number;
  pendingTaskIds: string[];
};

/**
 * Merge a server-authoritative profile onto local game state.
 * Server wins for all authoritative fields; local-only fields are preserved.
 *
 * `activeTicket` is intentionally excluded by default. The server's snapshot is
 * taken at request-start, so any chat that completes a sprint locally would
 * see the stale ticket re-applied here. Pass `includeActiveTicket: true` only
 * at `/sync` time for cross-device restore.
 */
export function applyServerProfile(
  prev: GameState,
  profile: ServerProfile,
  opts: {
    includeActiveTicket?: boolean;
    preservePendingCompletedReward?: PendingCompletedRewardMerge | null;
  } = {},
): GameState {
  const pendingReward = opts.preservePendingCompletedReward;
  const shouldPreservePendingReward = Boolean(
    pendingReward
      && pendingReward.pendingTaskIds.some((ticketId) => prev.pendingCompletedTaskIds.includes(ticketId)),
  );
  const currentTD = shouldPreservePendingReward
    ? Math.max(profile.current_td, pendingReward!.minimumCurrentTD)
    : profile.current_td;
  const totalTDEarned = shouldPreservePendingReward
    ? Math.max(profile.total_td, pendingReward!.minimumTotalTDEarned)
    : profile.total_td;
  const currentRank = shouldPreservePendingReward && totalTDEarned > profile.total_td
    ? resolveRank(totalTDEarned, prev.economy.currentRank)
    : profile.corporate_rank;

  return {
    ...prev,
    username: profile.username,
    economy: {
      ...prev.economy,
      currentTD,
      totalTDEarned,
      currentRank,
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
    ...(opts.includeActiveTicket ? { activeTicket: profile.active_ticket && profile.active_ticket.sprintProgress < profile.active_ticket.sprintGoal ? profile.active_ticket : null } : {}),
  };
}
