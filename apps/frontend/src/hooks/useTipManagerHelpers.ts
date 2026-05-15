import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { GameState, Message } from "./useGameState";
import {
  selectMilestoneTip,
  type ContextualTipTrigger,
  type TipDefinition,
} from "../game/tips";
import {
  getNextBacklogReminderThreshold,
  getInitialContextualTriggers,
  persistRecentTipHistory,
  toExcludedTipIds,
} from "./tipManagerUtils";

export type SetHistory = Dispatch<SetStateAction<Message[]>>;
export type MessageWithoutTicketRollback = () => void;

export type PendingBacklogReminder = {
  tip: TipDefinition;
  previousCount: number;
  previousThreshold: number;
  previousTipId: string | null;
  previousRecentTipHistory: Record<string, number>;
  previousLastTipConversationRound: number | null;
};

export type PendingMilestoneTip = {
  tip: TipDefinition;
  shouldResetShownMilestones: boolean;
};

type PreviousTipState = Pick<PendingBacklogReminder, "previousCount" | "previousThreshold" | "previousTipId">;

export type ContextualStateSnapshot = {
  currentTD: number;
  quotaPercent: number;
  pendingCompletedTaskCount: number;
  onlineCount: number;
};

type MilestoneTipContext = {
  totalTDEarned: number;
  hasActiveTicket: boolean;
};

export const getCompletedTaskCount = (gameState: GameState): number => gameState.pendingCompletedTaskIds?.length ?? 0;

export const appendTip = (setHistory: SetHistory, content: string): void => {
  setHistory((prev) => [...prev, { role: "system", content, displayType: "tip" }]);
};

export const getPreviousTipState = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>,
): PreviousTipState => ({
  previousCount: noTicketMessageCountRef.current,
  previousThreshold: nextBacklogReminderThresholdRef.current,
  previousTipId: lastBacklogReminderTipIdRef.current,
});

export const restorePreviousTipState = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>,
  previous: PreviousTipState,
): void => {
  noTicketMessageCountRef.current = previous.previousCount;
  nextBacklogReminderThresholdRef.current = previous.previousThreshold;
  lastBacklogReminderTipIdRef.current = previous.previousTipId;
};

export const restorePendingBacklogReminderSelection = (
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>,
  recentTipHistoryRef: MutableRefObject<Record<string, number>>,
  lastTipConversationRoundRef: MutableRefObject<number | null>,
  previous: Pick<PendingBacklogReminder, "previousTipId" | "previousRecentTipHistory" | "previousLastTipConversationRound">,
): void => {
  lastBacklogReminderTipIdRef.current = previous.previousTipId;
  recentTipHistoryRef.current = previous.previousRecentTipHistory;
  lastTipConversationRoundRef.current = previous.previousLastTipConversationRound;
  persistRecentTipHistory(previous.previousRecentTipHistory);
};

export const restorePendingBacklogReminderState = ({
  noTicketMessageCountRef,
  nextBacklogReminderThresholdRef,
  lastBacklogReminderTipIdRef,
  recentTipHistoryRef,
  lastTipConversationRoundRef,
  previous,
}: {
  noTicketMessageCountRef: MutableRefObject<number>;
  nextBacklogReminderThresholdRef: MutableRefObject<number>;
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>;
  recentTipHistoryRef: MutableRefObject<Record<string, number>>;
  lastTipConversationRoundRef: MutableRefObject<number | null>;
  previous: PendingBacklogReminder;
}): void => {
  restorePreviousTipState(noTicketMessageCountRef, nextBacklogReminderThresholdRef, lastBacklogReminderTipIdRef, previous);
  restorePendingBacklogReminderSelection(lastBacklogReminderTipIdRef, recentTipHistoryRef, lastTipConversationRoundRef, previous);
};

export const resetBacklogReminderProgress = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
): void => {
  noTicketMessageCountRef.current = 0;
  nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
};

export const createContextualStateSnapshot = (
  currentTD: number,
  quotaPercent: number,
  pendingCompletedTaskCount: number,
  onlineCount: number,
): ContextualStateSnapshot => ({ currentTD, quotaPercent, pendingCompletedTaskCount, onlineCount });

export const selectNextMilestoneTip = (
  usedCommands: Set<string>,
  shownMilestoneTipIds: Set<string>,
  context: MilestoneTipContext,
  lastShownTipId: string | null,
): { shouldResetShownMilestones: boolean; tip: TipDefinition | null } => {
  const excludeTipIds = toExcludedTipIds(lastShownTipId ? [lastShownTipId] : undefined);
  let shouldResetShownMilestones = false;
  let tip = selectMilestoneTip(usedCommands, shownMilestoneTipIds, context, { excludeTipIds });

  if (!tip && shownMilestoneTipIds.size > 0) {
    shownMilestoneTipIds.clear();
    shouldResetShownMilestones = true;
    tip = selectMilestoneTip(usedCommands, shownMilestoneTipIds, context, { excludeTipIds });
  }

  return { shouldResetShownMilestones, tip };
};

export const getEligibleContextualTriggers = ({
  completedTaskCount,
  currentTD,
  onlineCount,
  previous,
  quotaPercent,
  hasEvaluatedContextualState,
  firedContextualTips,
  singleFireTriggers,
}: {
  completedTaskCount: number;
  currentTD: number;
  onlineCount: number;
  previous: ContextualStateSnapshot;
  quotaPercent: number;
  hasEvaluatedContextualState: boolean;
  firedContextualTips: Set<ContextualTipTrigger>;
  singleFireTriggers: Set<ContextualTipTrigger>;
}): ContextualTipTrigger[] => {
  const triggers: ContextualTipTrigger[] = [];

  if (!hasEvaluatedContextualState) {
    triggers.push(...getInitialContextualTriggers(currentTD, quotaPercent, onlineCount));
  }
  if (previous.currentTD <= 1_000 && currentTD > 1_000) {
    triggers.push("td_1000");
  }
  if (previous.quotaPercent > 0 && quotaPercent <= 0) {
    triggers.push("quota_exhausted");
  }
  if (completedTaskCount > previous.pendingCompletedTaskCount) {
    triggers.push("ticket_completed");
  }
  if (previous.onlineCount !== 1 && onlineCount === 1) {
    triggers.push("lone_user_online");
  }

  return Array.from(new Set(triggers))
    .filter((trigger) => !singleFireTriggers.has(trigger) || !firedContextualTips.has(trigger));
};

export const removeTipFromHistory = (setHistory: SetHistory, content: string): void => {
  setHistory((prev) => {
    for (let i = prev.length - 1; i >= 0; i -= 1) {
      if (
        prev[i]?.role === "system"
        && prev[i]?.displayType === "tip"
        && prev[i]?.content === content
      ) {
        return [...prev.slice(0, i), ...prev.slice(i + 1)];
      }
    }
    return prev;
  });
};
