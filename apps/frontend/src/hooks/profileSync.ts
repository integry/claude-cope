import type { ServerProfile } from "@claude-cope/shared/profile";
import type { AuthoritativeProfileFloor, GameState } from "./gameStateUtils";
import { resolveRank } from "./gameStateUtils";

function getPendingRewardAmount(prev: GameState, ticketId: string): number {
  return prev.pendingCompletedTaskRewards?.[ticketId]?.rewardTD ?? 0;
}

export function settlePendingCompletedRewards(
  prev: GameState,
  settledPendingCompletedRewardTaskIds: string[] | null | undefined,
): GameState {
  const settledTaskIdSet = new Set(
    (settledPendingCompletedRewardTaskIds ?? []).filter((ticketId) => prev.pendingCompletedTaskIds.includes(ticketId)),
  );
  if (settledTaskIdSet.size === 0) return prev;

  return {
    ...prev,
    pendingCompletedTaskIds: prev.pendingCompletedTaskIds.filter((id) => !settledTaskIdSet.has(id)),
    pendingCompletedTaskRewards: Object.fromEntries(
      Object.entries(prev.pendingCompletedTaskRewards ?? {}).filter(([ticketId]) => !settledTaskIdSet.has(ticketId)),
    ),
  };
}

export function createAuthoritativeProfileFloor(profile: ServerProfile): AuthoritativeProfileFloor {
  return {
    totalTD: profile.total_td,
    currentTD: profile.current_td,
  };
}

export function mergeAuthoritativeProfileFloor(
  floor: AuthoritativeProfileFloor | null | undefined,
  nextFloor: AuthoritativeProfileFloor,
): AuthoritativeProfileFloor {
  if (!floor) return nextFloor;
  if (nextFloor.totalTD > floor.totalTD) return nextFloor;
  if (nextFloor.totalTD < floor.totalTD) return floor;

  return {
    totalTD: floor.totalTD,
    currentTD: Math.min(floor.currentTD, nextFloor.currentTD),
  };
}

export function isServerProfileStaleAgainstFloor(
  profile: ServerProfile,
  floor: AuthoritativeProfileFloor | null | undefined,
): boolean {
  if (floor == null) return false;
  if (profile.total_td < floor.totalTD) return true;
  return profile.total_td === floor.totalTD && profile.current_td > floor.currentTD;
}

function resolvePendingRewardEconomyMerge(
  prev: GameState,
  profile: ServerProfile,
  pendingTaskIds: string[],
  settledTaskIds: string[] | null | undefined,
): Pick<GameState["economy"], "currentTD" | "totalTDEarned" | "currentRank"> {
  const settledTaskIdSet = new Set((settledTaskIds ?? []).filter((ticketId) => pendingTaskIds.includes(ticketId)));
  const unresolvedPendingTaskIds = pendingTaskIds.filter((ticketId) => !settledTaskIdSet.has(ticketId));
  const unresolvedKnownRewardTD = unresolvedPendingTaskIds.reduce(
    (sum, ticketId) => sum + getPendingRewardAmount(prev, ticketId),
    0,
  );
  const hasLegacyPendingRewardWithoutMetadata = unresolvedPendingTaskIds.length > 0 && unresolvedKnownRewardTD === 0;
  const hasAuthoritativeEconomyAdvance = profile.total_td > prev.economy.totalTDEarned;

  if (hasLegacyPendingRewardWithoutMetadata) {
    return {
      currentTD: hasAuthoritativeEconomyAdvance ? profile.current_td : prev.economy.currentTD,
      totalTDEarned: hasAuthoritativeEconomyAdvance ? profile.total_td : prev.economy.totalTDEarned,
      currentRank: hasAuthoritativeEconomyAdvance ? profile.corporate_rank : prev.economy.currentRank,
    };
  }

  const optimisticLocalBaselineTD = Math.max(0, prev.economy.currentTD - unresolvedKnownRewardTD);
  const unresolvedCompletedRewardTD = unresolvedKnownRewardTD;
  const shouldPreserveOptimisticTotals = unresolvedCompletedRewardTD > 0;
  const hasKnownRewardAuthoritativeAdvance = shouldPreserveOptimisticTotals && hasAuthoritativeEconomyAdvance;
  const hasReliableLocalCurrentBaseline = optimisticLocalBaselineTD > 0;
  const isServerTotalCloseToOptimisticLocalTotal = profile.total_td >= (
    prev.economy.totalTDEarned - (unresolvedCompletedRewardTD / 2)
  );

  let currentTD = profile.current_td;
  if (shouldPreserveOptimisticTotals && !hasKnownRewardAuthoritativeAdvance) {
    currentTD = hasReliableLocalCurrentBaseline && !isServerTotalCloseToOptimisticLocalTotal
      ? Math.max(0, profile.current_td + unresolvedCompletedRewardTD)
      : prev.economy.currentTD;
  }

  const totalTDEarned = hasKnownRewardAuthoritativeAdvance
    ? profile.total_td
    : shouldPreserveOptimisticTotals
    ? Math.max(prev.economy.totalTDEarned, profile.total_td)
    : profile.total_td;
  const currentRank = hasKnownRewardAuthoritativeAdvance
    ? profile.corporate_rank
    : shouldPreserveOptimisticTotals && unresolvedCompletedRewardTD > 0 && totalTDEarned > profile.total_td
    ? resolveRank(totalTDEarned, prev.economy.currentRank)
    : profile.corporate_rank;

  return {
    currentTD,
    totalTDEarned,
    currentRank,
  };
}

function getMergedAuthoritativeProfileFloor(
  prev: GameState,
  profile: ServerProfile,
  settledPendingCompletedRewardTaskIds: string[] | null | undefined,
): AuthoritativeProfileFloor | null | undefined {
  const nextFloor = createAuthoritativeProfileFloor(profile);
  if ((settledPendingCompletedRewardTaskIds?.length ?? 0) > 0) {
    return mergeAuthoritativeProfileFloor(prev.authoritativeProfileFloor, nextFloor);
  }
  if (prev.authoritativeProfileFloor) {
    return mergeAuthoritativeProfileFloor(prev.authoritativeProfileFloor, nextFloor);
  }
  return prev.authoritativeProfileFloor;
}

/**
 * Merge a server-authoritative profile onto local game state.
 * Server wins for all authoritative fields; local-only fields are preserved.
 *
 * `activeTicket` is intentionally excluded by default. The server's snapshot is
 * taken at request-start, so any chat that completes a sprint locally would
 * see the stale ticket re-applied here. Pass `includeActiveTicket: true` only
 * at `/sync` time for cross-device restore.
 *
 * Merge contract for completed-ticket rewards:
 * while a ticket ID remains in `preservePendingCompletedRewardTaskIds`, this
 * function may preserve optimistic local TD totals when a server profile could
 * still be missing that reward. Once an authoritative settlement profile is
 * applied and the pending ID is cleared elsewhere, callers should treat later
 * profiles with lower aggregate `total_td` as stale and ignore them.
 */
export function applyServerProfile(
  prev: GameState,
  profile: ServerProfile,
  opts: {
    includeActiveTicket?: boolean;
    preservePendingCompletedRewardTaskIds?: string[] | null;
    settledPendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  if (isServerProfileStaleAgainstFloor(profile, prev.authoritativeProfileFloor)) {
    return prev;
  }

  const pendingTaskIds = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  // Aggregate TD snapshots are not enough to prove whether a pending completed
  // ticket reward is already included in the server totals. Preserve the local
  // optimistic total only while the ticket is still unsettled; once `/api/score`
  // succeeds, later merges should converge back to plain server truth.
  const { currentTD, totalTDEarned, currentRank } = resolvePendingRewardEconomyMerge(
    prev,
    profile,
    pendingTaskIds,
    opts.settledPendingCompletedRewardTaskIds,
  );
  const authoritativeProfileFloor = getMergedAuthoritativeProfileFloor(
    prev,
    profile,
    opts.settledPendingCompletedRewardTaskIds,
  );

  return {
    ...prev,
    username: profile.username,
    isExecutiveSupporter: profile.is_executive_supporter,
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
    authoritativeProfileFloor,
    ...(opts.includeActiveTicket ? { activeTicket: profile.active_ticket && profile.active_ticket.sprintProgress < profile.active_ticket.sprintGoal ? profile.active_ticket : null } : {}),
  };
}

export function applyAuthoritativeProfile(
  prev: GameState,
  profile: ServerProfile,
  opts: {
    includeActiveTicket?: boolean;
    preservePendingCompletedRewardTaskIds?: string[] | null;
    settledPendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  const pendingTaskIdsToPreserve = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  const settledPendingCompletedRewardTaskIds = (opts.settledPendingCompletedRewardTaskIds ?? []).filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  );
  const next = applyServerProfile(
    prev,
    profile,
    pendingTaskIdsToPreserve.length > 0
      ? {
        includeActiveTicket: opts.includeActiveTicket,
        preservePendingCompletedRewardTaskIds: pendingTaskIdsToPreserve,
        settledPendingCompletedRewardTaskIds,
      }
      : { includeActiveTicket: opts.includeActiveTicket },
  );
  return settlePendingCompletedRewards(next, settledPendingCompletedRewardTaskIds);
}
