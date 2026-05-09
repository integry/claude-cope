import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";
import { resolveRank } from "./gameStateUtils";

function getPendingRewardAmount(prev: GameState, ticketId: string): number {
  return prev.pendingCompletedTaskRewards?.[ticketId]?.rewardTD ?? 0;
}

function inferLegacyPendingRewardAmount(
  prev: GameState,
  profile: ServerProfile,
  pendingTaskIds: string[],
): number {
  if (pendingTaskIds.length !== 1) return 0;
  const [ticketId] = pendingTaskIds;
  if (!ticketId || getPendingRewardAmount(prev, ticketId) > 0) return 0;

  return Math.max(0, prev.economy.totalTDEarned - profile.total_td);
}

export function getSettledPendingCompletedTaskIds(
  prev: GameState,
  profile: ServerProfile,
  candidateTaskIds: string[] = prev.pendingCompletedTaskIds,
): string[] {
  const pendingTaskIds = candidateTaskIds.filter((ticketId) => prev.pendingCompletedTaskIds.includes(ticketId));
  const totalPendingRewardTD = pendingTaskIds.reduce((sum, ticketId) => sum + getPendingRewardAmount(prev, ticketId), 0);

  if (totalPendingRewardTD <= 0) return [];

  const localTotalExcludingPendingRewards = Math.max(0, prev.economy.totalTDEarned - totalPendingRewardTD);
  let confirmedPendingRewardTD = Math.max(0, profile.total_td - localTotalExcludingPendingRewards);
  const settledTaskIds: string[] = [];

  for (const ticketId of pendingTaskIds) {
    const rewardTD = getPendingRewardAmount(prev, ticketId);
    if (rewardTD <= 0 || confirmedPendingRewardTD < rewardTD) continue;
    settledTaskIds.push(ticketId);
    confirmedPendingRewardTD -= rewardTD;
  }

  return settledTaskIds;
}

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
    preservePendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  const pendingTaskIds = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  const legacyPendingRewardTD = inferLegacyPendingRewardAmount(prev, profile, pendingTaskIds);
  const settledTaskIds = getSettledPendingCompletedTaskIds(prev, profile, pendingTaskIds);
  const settledTaskIdSet = new Set(settledTaskIds);
  const unresolvedCompletedRewardTD = pendingTaskIds.reduce((sum, ticketId) => (
    settledTaskIdSet.has(ticketId) ? sum : sum + getPendingRewardAmount(prev, ticketId)
  ), 0) || legacyPendingRewardTD;
  const preservedCurrentRewardTD = Math.min(
    unresolvedCompletedRewardTD,
    Math.max(0, prev.economy.currentTD - profile.current_td),
  );
  const currentTD = profile.current_td + preservedCurrentRewardTD;
  const totalTDEarned = profile.total_td + unresolvedCompletedRewardTD;
  const currentRank = unresolvedCompletedRewardTD > 0 && totalTDEarned > profile.total_td
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
