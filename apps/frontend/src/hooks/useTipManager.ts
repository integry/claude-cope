import { useCallback, useEffect, useRef } from "react";
import type { GameState } from "./useGameState";
import {
  selectBacklogReminder,
  selectContextualTip,
  selectIdleTip,
  selectMilestoneTip,
  type ContextualTipTrigger,
  type TipDefinition,
} from "../game/tips";
import {
  getInitialContextualTriggers,
  getNextBacklogReminderThreshold,
  hasRecentBacklogReminder,
  markTipShown,
  persistRecentTipHistory,
  readRecentTipHistory,
  toExcludedTipIds,
} from "./tipManagerUtils";
import {
  appendTip,
  createContextualStateSnapshot,
  getCompletedTaskCount,
  getPreviousTipState,
  type MessageWithoutTicketRollback,
  type PendingBacklogReminder,
  type PendingMilestoneTip,
  removeTipFromHistory,
  resetBacklogReminderProgress,
  restorePendingBacklogReminderSelection,
  restorePendingBacklogReminderState,
  restorePreviousTipState,
  type SetHistory,
} from "./useTipManagerHelpers";

const IDLE_TIP_DELAY_MS = 45_000;
const MILESTONE_INTERVAL = 6;
const SINGLE_FIRE_CONTEXTUAL_TRIGGERS = new Set<ContextualTipTrigger>(["td_1000", "quota_exhausted"]);

interface UseTipManagerArgs {
  isBooting: boolean;
  isInteractionBlocked?: boolean;
  gameState: GameState;
  onlineCount: number;
  setHistory: SetHistory;
}
type RecordValidCommandOptions = { suppressTip?: boolean };

export function useTipManager({ isBooting, isInteractionBlocked = false, gameState, onlineCount, setHistory }: UseTipManagerArgs) {
  const completedTaskCount = getCompletedTaskCount(gameState);
  const currentTD = gameState.economy.currentTD;
  const totalTDEarned = gameState.economy.totalTDEarned;
  const quotaPercent = gameState.economy.quotaPercent;
  const hasActiveTicket = Boolean(gameState.activeTicket);
  const idleTimerRef = useRef<number | null>(null);
  const idleDeadlineRef = useRef<number | null>(null);
  const hasInteractedRef = useRef(false);
  const actionCountRef = useRef(0);
  const usedCommandsRef = useRef<Set<string>>(new Set());
  const shownMilestoneTipIdsRef = useRef<Set<string>>(new Set());
  const firedContextualTipsRef = useRef<Set<ContextualTipTrigger>>(new Set());
  const pendingContextualTriggersRef = useRef<ContextualTipTrigger[]>([]);
  const pendingContextualRequiresConversationRoundRef = useRef(false);
  const hasEvaluatedContextualStateRef = useRef(false);
  const noTicketMessageCountRef = useRef(0);
  const nextBacklogReminderThresholdRef = useRef(getNextBacklogReminderThreshold());
  const lastBacklogReminderTipIdRef = useRef<string | null>(null);
  const recentTipHistoryRef = useRef<Record<string, number>>(readRecentTipHistory());
  const interactionCountRef = useRef(0);
  const conversationRoundsRef = useRef(0);
  const lastTipInteractionCountRef = useRef<number | null>(null);
  const lastTipConversationRoundRef = useRef<number | null>(null);
  const pendingBacklogReminderRef = useRef<PendingBacklogReminder | null>(null);
  const pendingMilestoneTipRef = useRef<PendingMilestoneTip | null>(null);
  const lastShownTipIdRef = useRef<string | null>(null);
  const isBootingRef = useRef(isBooting);
  const isInteractionBlockedRef = useRef(isInteractionBlocked);
  const gameStateRef = useRef(gameState);
  const totalTDEarnedRef = useRef(totalTDEarned);
  const previousStateRef = useRef(createContextualStateSnapshot(
    gameState.economy.currentTD,
    gameState.economy.quotaPercent,
    getCompletedTaskCount(gameState),
    onlineCount,
  ));
  isBootingRef.current = isBooting;
  isInteractionBlockedRef.current = isInteractionBlocked;
  gameStateRef.current = gameState;
  totalTDEarnedRef.current = totalTDEarned;

  const canEmitTip = useCallback(() => (
    (
      lastTipInteractionCountRef.current === null
      || interactionCountRef.current > lastTipInteractionCountRef.current
    )
    && (
      lastTipConversationRoundRef.current === null
      || conversationRoundsRef.current > lastTipConversationRoundRef.current
    )
  ), []);

  const noteTipEmitted = useCallback(() => {
    lastTipInteractionCountRef.current = interactionCountRef.current;
    lastTipConversationRoundRef.current = conversationRoundsRef.current;
  }, []);

  const appendManagedTip = useCallback((tip: TipDefinition): boolean => {
    if (!canEmitTip()) return false;
    if (lastShownTipIdRef.current === tip.id) return false;
    appendTip(setHistory, tip.text);
    lastShownTipIdRef.current = tip.id;
    noteTipEmitted();
    return true;
  }, [canEmitTip, noteTipEmitted, setHistory]);

  const flushPendingBacklogReminder = useCallback(() => {
    if (!canEmitTip()) return;
    const pendingReminder = pendingBacklogReminderRef.current;
    if (!pendingReminder) return;
    pendingBacklogReminderRef.current = null;
    if (gameStateRef.current.activeTicket) {
      restorePendingBacklogReminderSelection(
        lastBacklogReminderTipIdRef,
        recentTipHistoryRef,
        lastTipConversationRoundRef,
        pendingReminder,
      );
      return;
    }
    lastBacklogReminderTipIdRef.current = pendingReminder.tip.id;
    if (!appendManagedTip(pendingReminder.tip)) {
      restorePendingBacklogReminderState(
        {
          noTicketMessageCountRef,
          nextBacklogReminderThresholdRef,
          lastBacklogReminderTipIdRef,
          recentTipHistoryRef,
          lastTipConversationRoundRef,
          previous: pendingReminder,
        },
      );
      return;
    }
    markTipShown(recentTipHistoryRef, pendingReminder.tip);
  }, [appendManagedTip, canEmitTip]);

  const flushPendingContextualTip = useCallback((options?: { allowDeferredBlockedTip?: boolean }) => {
    if (!canEmitTip()) return;
    if (pendingContextualRequiresConversationRoundRef.current && !options?.allowDeferredBlockedTip) return;
    const pending = pendingContextualTriggersRef.current;
    let emittedTip = false;
    while (pending.length > 0) {
      const trigger = pending.shift();
      if (!trigger) continue;
      const tip = selectContextualTip(trigger, {
        totalTDEarned: totalTDEarnedRef.current,
        hasActiveTicket: Boolean(gameStateRef.current.activeTicket),
      }, { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) });
      if (!tip) continue;
      if (appendManagedTip(tip)) {
        emittedTip = true;
        break;
      }
    }
    if (options?.allowDeferredBlockedTip || emittedTip || pending.length === 0) {
      pendingContextualRequiresConversationRoundRef.current = false;
    }
  }, [appendManagedTip, canEmitTip]);

  const flushPendingMilestoneTip = useCallback(() => {
    if (!canEmitTip()) return;
    const pending = pendingMilestoneTipRef.current;
    if (!pending) return;
    pendingMilestoneTipRef.current = null;
    shownMilestoneTipIdsRef.current.add(pending.tip.id);
    if (appendManagedTip(pending.tip)) return;
    shownMilestoneTipIdsRef.current.delete(pending.tip.id);
    if (pending.shouldResetShownMilestones) shownMilestoneTipIdsRef.current.clear();
  }, [appendManagedTip, canEmitTip]);

  const emitIdleTip = useCallback(() => {
    idleTimerRef.current = null;
    idleDeadlineRef.current = null;
    if (!canEmitTip()) return;
    recentTipHistoryRef.current = readRecentTipHistory();
    const tip = selectIdleTip(
      { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: toExcludedTipIds(Object.keys(recentTipHistoryRef.current), lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
    );
    if (!tip) return;
    if (!appendManagedTip(tip)) return;
    markTipShown(recentTipHistoryRef, tip);
  }, [appendManagedTip, canEmitTip]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);
  const scheduleIdleTip = useCallback((delayMs = IDLE_TIP_DELAY_MS) => {
    clearIdleTimer();
    if (!hasInteractedRef.current) return;
    idleDeadlineRef.current = Date.now() + delayMs;
    idleTimerRef.current = window.setTimeout(function fireIdleTip() {
      if (isBootingRef.current || isInteractionBlockedRef.current) {
        idleTimerRef.current = null;
        return;
      }
      emitIdleTip();
    }, delayMs);
  }, [clearIdleTimer, emitIdleTip]);

  const recordEnter = useCallback(() => {
    hasInteractedRef.current = true;
    interactionCountRef.current += 1;
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  const recordConversationRound = useCallback(() => {
    conversationRoundsRef.current += 1;
    flushPendingBacklogReminder();
    flushPendingMilestoneTip();
    flushPendingContextualTip({ allowDeferredBlockedTip: true });
  }, [flushPendingBacklogReminder, flushPendingContextualTip, flushPendingMilestoneTip]);
  const recordValidCommand = useCallback((baseCommand?: string, options?: RecordValidCommandOptions): string | null => {
    interactionCountRef.current += 1;
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    if (!isInteractionBlockedRef.current) flushPendingContextualTip();
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return null;
    if (options?.suppressTip) return null;
    if (!canEmitTip()) return null;

    let shouldResetShownMilestones = false;
    let tip = selectMilestoneTip(
      usedCommandsRef.current,
      shownMilestoneTipIdsRef.current,
      { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
    );
    if (!tip && shownMilestoneTipIdsRef.current.size > 0) {
      shownMilestoneTipIdsRef.current.clear();
      shouldResetShownMilestones = true;
      tip = selectMilestoneTip(
        usedCommandsRef.current,
        shownMilestoneTipIdsRef.current,
        { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
        { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
      );
    }
    if (!tip) return null;
    if (isInteractionBlockedRef.current) {
      pendingMilestoneTipRef.current = { tip, shouldResetShownMilestones };
      return null;
    }
    shownMilestoneTipIdsRef.current.add(tip.id);
    if (!appendManagedTip(tip)) return null;
    return tip.text;
  }, [appendManagedTip, canEmitTip, flushPendingContextualTip]);

  const recordMessageWithoutTicket = useCallback((): MessageWithoutTicketRollback => {
    const previous = getPreviousTipState(noTicketMessageCountRef, nextBacklogReminderThresholdRef, lastBacklogReminderTipIdRef);
    interactionCountRef.current += 1;
    const rollbackReminderState = () => restorePreviousTipState(
      noTicketMessageCountRef,
      nextBacklogReminderThresholdRef,
      lastBacklogReminderTipIdRef,
      previous,
    );
    const previousLastShownTipId = lastShownTipIdRef.current;
    const previousLastTipConversationRound = lastTipConversationRoundRef.current;
    const previousLastTipInteractionCount = lastTipInteractionCountRef.current;

    if (!isInteractionBlockedRef.current) flushPendingContextualTip();

    if (gameStateRef.current.activeTicket) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollbackReminderState;
    }
    noTicketMessageCountRef.current += 1;
    if (noTicketMessageCountRef.current < nextBacklogReminderThresholdRef.current) {
      return rollbackReminderState;
    }
    recentTipHistoryRef.current = readRecentTipHistory();
    if (pendingBacklogReminderRef.current || hasRecentBacklogReminder(recentTipHistoryRef.current)) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollbackReminderState;
    }
    const reminderHistoryBeforeShow = recentTipHistoryRef.current;
    const tip = selectBacklogReminder(
      lastBacklogReminderTipIdRef.current ?? undefined,
      { hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: toExcludedTipIds(Object.keys(recentTipHistoryRef.current), lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
    );
    if (!tip) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollbackReminderState;
    }
    if (isInteractionBlockedRef.current) {
      lastBacklogReminderTipIdRef.current = tip.id;
      pendingBacklogReminderRef.current = {
        tip,
        ...previous,
        previousRecentTipHistory: reminderHistoryBeforeShow,
        previousLastTipConversationRound,
      };
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return () => {
        if (pendingBacklogReminderRef.current?.tip.id === tip.id) pendingBacklogReminderRef.current = null;
        rollbackReminderState();
        restorePendingBacklogReminderSelection(
          lastBacklogReminderTipIdRef,
          recentTipHistoryRef,
          lastTipConversationRoundRef,
          {
            previousTipId: previous.previousTipId,
            previousRecentTipHistory: reminderHistoryBeforeShow,
            previousLastTipConversationRound,
          },
        );
      };
    }
    if (!canEmitTip()) {
      return rollbackReminderState;
    }
    lastBacklogReminderTipIdRef.current = tip.id;
    if (!appendManagedTip(tip)) {
      rollbackReminderState();
      return () => {
        lastShownTipIdRef.current = previousLastShownTipId;
      };
    }
    markTipShown(recentTipHistoryRef, tip);
    resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
    return () => {
      rollbackReminderState();
      recentTipHistoryRef.current = reminderHistoryBeforeShow;
      lastShownTipIdRef.current = previousLastShownTipId;
      lastTipInteractionCountRef.current = previousLastTipInteractionCount;
      lastTipConversationRoundRef.current = previousLastTipConversationRound;
      persistRecentTipHistory(reminderHistoryBeforeShow);
      removeTipFromHistory(setHistory, tip.text);
    };
  }, [appendManagedTip, canEmitTip, flushPendingContextualTip, setHistory]);

  useEffect(() => {
    if (!gameState.activeTicket) return;
    if (pendingBacklogReminderRef.current) {
      restorePendingBacklogReminderSelection(
        lastBacklogReminderTipIdRef,
        recentTipHistoryRef,
        lastTipConversationRoundRef,
        pendingBacklogReminderRef.current,
      );
      pendingBacklogReminderRef.current = null;
    }
    resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
  }, [gameState.activeTicket]);

  useEffect(() => {
    if (isBooting) return;
    const previous = previousStateRef.current;
    const triggers: ContextualTipTrigger[] = [];
    if (!hasEvaluatedContextualStateRef.current) {
      triggers.push(...getInitialContextualTriggers(currentTD, quotaPercent, onlineCount));
      hasEvaluatedContextualStateRef.current = true;
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
    const eligibleTriggers = Array.from(new Set(triggers))
      .filter((trigger) => !SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger) || !firedContextualTipsRef.current.has(trigger))
      .map((trigger) => {
        if (SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger)) firedContextualTipsRef.current.add(trigger);
        return trigger;
      });
    const nextState = createContextualStateSnapshot(currentTD, quotaPercent, completedTaskCount, onlineCount);
    pendingContextualTriggersRef.current.push(...eligibleTriggers);
    if (isInteractionBlocked && eligibleTriggers.length > 0) {
      pendingContextualRequiresConversationRoundRef.current = true;
    }
    if (!isInteractionBlocked && canEmitTip()) flushPendingContextualTip();
    previousStateRef.current = nextState;
  }, [
    completedTaskCount,
    currentTD,
    quotaPercent,
    totalTDEarned,
    hasActiveTicket,
    isBooting,
    isInteractionBlocked,
    onlineCount,
    canEmitTip,
    flushPendingContextualTip,
  ]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  useEffect(() => {
    if (!hasInteractedRef.current) return;
    if (isInteractionBlocked) {
      clearIdleTimer();
      return;
    }
    if (idleTimerRef.current !== null || idleDeadlineRef.current === null) return;
    const remainingDelayMs = idleDeadlineRef.current - Date.now();
    scheduleIdleTip(remainingDelayMs > 0 ? remainingDelayMs : 250);
  }, [clearIdleTimer, isInteractionBlocked, scheduleIdleTip]);

  return { recordConversationRound, recordEnter, recordValidCommand, recordMessageWithoutTicket };
}
