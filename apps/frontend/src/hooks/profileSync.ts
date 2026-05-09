import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";
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
    settledPendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  const pendingTaskIds = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  const settledTaskIdSet = new Set(
    (opts.settledPendingCompletedRewardTaskIds ?? []).filter((ticketId) => pendingTaskIds.includes(ticketId)),
  );
  const unresolvedPendingTaskIds = pendingTaskIds.filter((ticketId) => !settledTaskIdSet.has(ticketId));
  const unresolvedKnownRewardTD = unresolvedPendingTaskIds.reduce(
    (sum, ticketId) => sum + getPendingRewardAmount(prev, ticketId),
    0,
  );
  const hasLegacyPendingRewards = unresolvedPendingTaskIds.length > 0
    && Object.keys(prev.pendingCompletedTaskRewards ?? {}).length === 0;
  const inferredLegacyPendingRewardTD = hasLegacyPendingRewards
    ? Math.max(0, prev.economy.totalTDEarned - profile.total_td - unresolvedKnownRewardTD)
    : 0;
  const unresolvedCompletedRewardTD = unresolvedKnownRewardTD + inferredLegacyPendingRewardTD;
  const shouldPreserveOptimisticTotals = unresolvedPendingTaskIds.length > 0;
  const hasReliableLocalCurrentBaseline = prev.economy.currentTD > unresolvedCompletedRewardTD;
  // Only treat the local pre-reward balance as a baseline when the user still
  // has enough TD left for that subtraction to mean something. Otherwise the
  // optimistic reward may already have been spent, or it may dominate the whole
  // local balance, so the safest merge is to preserve the local current TD.
  const currentTD = !shouldPreserveOptimisticTotals
    ? profile.current_td
    : profile.total_td >= prev.economy.totalTDEarned
      ? profile.current_td
      : hasReliableLocalCurrentBaseline
        ? Math.max(
          0,
          prev.economy.currentTD + (profile.current_td - (prev.economy.currentTD - unresolvedCompletedRewardTD)),
        )
        : prev.economy.currentTD;
  // Aggregate TD snapshots are not enough to prove whether a pending completed
  // ticket reward is already included in the server totals. Preserve the local
  // optimistic total only while the ticket is still unsettled; once `/api/score`
  // succeeds, later merges should converge back to plain server truth.
  const totalTDEarned = shouldPreserveOptimisticTotals
    ? Math.max(prev.economy.totalTDEarned, profile.total_td)
    : profile.total_td;
  const currentRank = shouldPreserveOptimisticTotals && unresolvedCompletedRewardTD > 0 && totalTDEarned > profile.total_td
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
