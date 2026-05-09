import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";
import { resolveRank } from "./gameStateUtils";

const MAX_EXACT_REWARD_SUBSET_SEARCH_ENTRIES = 12;

function getPendingRewardAmount(prev: GameState, ticketId: string): number {
  return prev.pendingCompletedTaskRewards?.[ticketId]?.rewardTD ?? 0;
}

function getKnownPendingRewardEntries(prev: GameState, pendingTaskIds: string[]) {
  return pendingTaskIds
    .map((ticketId) => ({ ticketId, rewardTD: getPendingRewardAmount(prev, ticketId) }))
    .filter((entry) => entry.rewardTD > 0);
}

function getConfirmedKnownPendingRewardTD(
  prev: GameState,
  profile: ServerProfile,
  pendingRewardEntries: Array<{ ticketId: string; rewardTD: number }>,
): number {
  const totalKnownPendingRewardTD = pendingRewardEntries.reduce((sum, entry) => sum + entry.rewardTD, 0);
  if (totalKnownPendingRewardTD <= 0) return 0;

  const localTotalExcludingKnownPendingRewards = Math.max(0, prev.economy.totalTDEarned - totalKnownPendingRewardTD);
  return Math.max(0, Math.min(totalKnownPendingRewardTD, profile.total_td - localTotalExcludingKnownPendingRewards));
}

function collectExactRewardSubsets(
  pendingRewardEntries: Array<{ ticketId: string; rewardTD: number }>,
  targetRewardTD: number,
): string[][] {
  if (pendingRewardEntries.length > MAX_EXACT_REWARD_SUBSET_SEARCH_ENTRIES) {
    return [];
  }

  const exactSubsets: string[][] = [];
  const currentSubset: string[] = [];

  const visit = (entryIndex: number, runningRewardTD: number) => {
    if (runningRewardTD === targetRewardTD) {
      exactSubsets.push([...currentSubset]);
      return;
    }

    if (entryIndex >= pendingRewardEntries.length || runningRewardTD > targetRewardTD) {
      return;
    }

    const entry = pendingRewardEntries[entryIndex]!;
    currentSubset.push(entry.ticketId);
    visit(entryIndex + 1, runningRewardTD + entry.rewardTD);
    currentSubset.pop();
    visit(entryIndex + 1, runningRewardTD);
  };

  visit(0, 0);
  return exactSubsets;
}

export function getSettledPendingCompletedTaskIds(
  prev: GameState,
  profile: ServerProfile,
  candidateTaskIds: string[] = prev.pendingCompletedTaskIds,
): string[] {
  const pendingTaskIds = candidateTaskIds.filter((ticketId) => prev.pendingCompletedTaskIds.includes(ticketId));
  if (pendingTaskIds.length === 0) return [];

  if (profile.total_td >= prev.economy.totalTDEarned) {
    return pendingTaskIds;
  }

  const pendingRewardEntries = getKnownPendingRewardEntries(prev, pendingTaskIds);
  const confirmedPendingRewardTD = getConfirmedKnownPendingRewardTD(prev, profile, pendingRewardEntries);
  if (confirmedPendingRewardTD <= 0) return [];

  const exactSubsets = collectExactRewardSubsets(pendingRewardEntries, confirmedPendingRewardTD);
  if (exactSubsets.length === 0) return [];

  return exactSubsets[0]!.filter((ticketId) => exactSubsets.every((subset) => subset.includes(ticketId)));
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
  const settledTaskIdSet = new Set(getSettledPendingCompletedTaskIds(prev, profile, pendingTaskIds));
  const unresolvedKnownRewardTD = pendingTaskIds.reduce((sum, ticketId) => (
    settledTaskIdSet.has(ticketId) ? sum : sum + getPendingRewardAmount(prev, ticketId)
  ), 0);
  const hasLegacyPendingRewards = pendingTaskIds.some((ticketId) => getPendingRewardAmount(prev, ticketId) <= 0);
  const inferredLegacyPendingRewardTD = hasLegacyPendingRewards
    ? Math.max(0, prev.economy.totalTDEarned - profile.total_td - unresolvedKnownRewardTD)
    : 0;
  const unresolvedCompletedRewardTD = unresolvedKnownRewardTD + inferredLegacyPendingRewardTD;
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

export function applyAuthoritativeProfile(
  prev: GameState,
  profile: ServerProfile,
  opts: {
    includeActiveTicket?: boolean;
    preservePendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  const pendingTaskIdsToPreserve = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  const settledTaskIdSet = new Set(getSettledPendingCompletedTaskIds(prev, profile, pendingTaskIdsToPreserve));
  const next = applyServerProfile(
    prev,
    profile,
    pendingTaskIdsToPreserve.length > 0
      ? {
        includeActiveTicket: opts.includeActiveTicket,
        preservePendingCompletedRewardTaskIds: pendingTaskIdsToPreserve,
      }
      : { includeActiveTicket: opts.includeActiveTicket },
  );

  if (settledTaskIdSet.size === 0) {
    return next;
  }

  return {
    ...next,
    pendingCompletedTaskIds: prev.pendingCompletedTaskIds.filter((id) => !settledTaskIdSet.has(id)),
    pendingCompletedTaskRewards: Object.fromEntries(
      Object.entries(prev.pendingCompletedTaskRewards ?? {}).filter(([ticketId]) => !settledTaskIdSet.has(ticketId)),
    ),
  };
}
