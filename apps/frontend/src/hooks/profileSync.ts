import type { ServerProfile } from "@claude-cope/shared/profile";
import type { GameState } from "./gameStateUtils";
import { resolveRank } from "./gameStateUtils";

function getPendingRewardAmount(prev: GameState, ticketId: string): number {
  return prev.pendingCompletedTaskRewards?.[ticketId]?.rewardTD ?? 0;
}

export function getSettledPendingCompletedTaskIds(
  prev: GameState,
  profile: ServerProfile,
  candidateTaskIds: string[] = prev.pendingCompletedTaskIds,
): string[] {
  void prev;
  void profile;
  void candidateTaskIds;
  // Aggregate TD snapshots are not enough to prove which specific completed
  // ticket rewards were persisted. Only explicit confirmation from /api/score
  // should clear pending reward metadata.
  return [];
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
  const hasLegacyPendingRewards = unresolvedPendingTaskIds.some((ticketId) => getPendingRewardAmount(prev, ticketId) <= 0);
  const inferredLegacyPendingRewardTD = hasLegacyPendingRewards
    ? Math.max(0, prev.economy.totalTDEarned - profile.total_td - unresolvedKnownRewardTD)
    : 0;
  // Invariant: `currentTD` and `totalTDEarned` should preserve only unresolved
  // optimistic completed-ticket rewards. Any reward that /api/score has already
  // confirmed must be excluded here before we adopt the server profile, while
  // legacy pending entries without reward metadata fall back to a bounded delta
  // heuristic so older local state does not lose the bonus immediately.
  const unresolvedCompletedRewardTD = unresolvedKnownRewardTD + inferredLegacyPendingRewardTD;
  const localCurrentTDExcludingPendingReward = Math.max(0, prev.economy.currentTD - unresolvedCompletedRewardTD);
  const localTotalTDExcludingPendingReward = Math.max(0, prev.economy.totalTDEarned - unresolvedCompletedRewardTD);
  const canInferPositiveServerTDGain = localTotalTDExcludingPendingReward > 0;
  const confirmedNonRewardTDGain = canInferPositiveServerTDGain
    ? Math.max(0, profile.total_td - localTotalTDExcludingPendingReward)
    : 0;
  const serverCurrentDeltaExcludingPendingReward = profile.current_td - localCurrentTDExcludingPendingReward;
  const appliedCurrentDelta = serverCurrentDeltaExcludingPendingReward < 0
    ? serverCurrentDeltaExcludingPendingReward
    : Math.min(serverCurrentDeltaExcludingPendingReward, confirmedNonRewardTDGain);
  const currentTD = Math.max(0, prev.economy.currentTD + appliedCurrentDelta);
  const totalTDEarned = canInferPositiveServerTDGain
    ? profile.total_td + unresolvedCompletedRewardTD
    : Math.max(prev.economy.totalTDEarned, profile.total_td);
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
    settledPendingCompletedRewardTaskIds?: string[] | null;
  } = {},
): GameState {
  const pendingTaskIdsToPreserve = opts.preservePendingCompletedRewardTaskIds?.filter(
    (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
  ) ?? [];
  const settledTaskIdSet = new Set(
    (opts.settledPendingCompletedRewardTaskIds ?? pendingTaskIdsToPreserve).filter(
      (ticketId) => prev.pendingCompletedTaskIds.includes(ticketId),
    ),
  );
  const next = applyServerProfile(
    prev,
    profile,
    pendingTaskIdsToPreserve.length > 0
      ? {
        includeActiveTicket: opts.includeActiveTicket,
        preservePendingCompletedRewardTaskIds: pendingTaskIdsToPreserve,
        settledPendingCompletedRewardTaskIds: [...settledTaskIdSet],
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
