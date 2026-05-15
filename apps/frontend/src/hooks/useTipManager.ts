import { useCallback, useEffect, useRef } from "react";
import type { GameState } from "./useGameState";
import {
  selectBacklogReminder,
  selectContextualTip,
  selectIdleTip,
  type ContextualTipTrigger,
  type TipDefinition,
} from "../game/tips";
import {
  getNextBacklogReminderThreshold,
  hasRecentBacklogReminder,
  markTipShown,
  persistRecentTipHistory,
  reconcilePersistedTipHistory,
  readRecentTipHistory,
  toExcludedTipIds,
} from "./tipManagerUtils";
import {
  appendTip,
  createContextualStateSnapshot,
  getEligibleContextualTriggers,
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
  selectNextMilestoneTip,
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
  const persistedTipState = reconcilePersistedTipHistory(gameState.chatHistory);
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
  const recentTipHistoryRef = useRef<Record<string, number>>(persistedTipState.recentTipHistory);
  const interactionCountRef = useRef(0);
  const conversationRoundsRef = useRef(0);
  const lastTipInteractionCountRef = useRef<number | null>(null);
  const lastTipConversationRoundRef = useRef<number | null>(null);
  const pendingBacklogReminderRef = useRef<PendingBacklogReminder | null>(null);
  const pendingMilestoneTipRef = useRef<PendingMilestoneTip | null>(null);
  const lastShownTipIdRef = useRef<string | null>(persistedTipState.lastShownTipId);
  const isBootingRef = useRef(isBooting);
  const isInteractionBlockedRef = useRef(isInteractionBlocked);
  const gameStateRef = useRef(gameState);
  const totalTDEarnedRef = useRef(totalTDEarned);
  const previousStateRef = useRef(
    createContextualStateSnapshot(gameState.economy.currentTD, gameState.economy.quotaPercent, getCompletedTaskCount(gameState), onlineCount),
  );
  isBootingRef.current = isBooting;
  isInteractionBlockedRef.current = isInteractionBlocked;
  gameStateRef.current = gameState;
  totalTDEarnedRef.current = totalTDEarned;

  const canEmitTip = useCallback(() => (
    (lastTipInteractionCountRef.current === null || interactionCountRef.current > lastTipInteractionCountRef.current)
    && (lastTipConversationRoundRef.current === null || conversationRoundsRef.current > lastTipConversationRoundRef.current)
  ), []);

  const noteTipEmitted = useCallback(() => {
    lastTipInteractionCountRef.current = interactionCountRef.current;
    lastTipConversationRoundRef.current = conversationRoundsRef.current;
  }, []);

  const noteContextualTipRendered = useCallback((trigger: ContextualTipTrigger) => {
    if (SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger)) {
      firedContextualTipsRef.current.add(trigger);
    }
  }, []);

  const appendManagedTip = useCallback((tip: TipDefinition): boolean => {
    if (!canEmitTip()) return false;
    if (lastShownTipIdRef.current === tip.id) return false;
    appendTip(setHistory, tip.text);
    lastShownTipIdRef.current = tip.id;
    markTipShown(recentTipHistoryRef, tip);
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
      restorePendingBacklogReminderState({
        noTicketMessageCountRef,
        nextBacklogReminderThresholdRef,
        lastBacklogReminderTipIdRef,
        recentTipHistoryRef,
        lastTipConversationRoundRef,
        previous: pendingReminder,
      });
      return;
    }
  }, [appendManagedTip, canEmitTip]);

  const flushPendingContextualTip = useCallback((options?: { allowDeferredBlockedTip?: boolean }) => {
    if (!canEmitTip()) return;
    if (pendingContextualRequiresConversationRoundRef.current && !options?.allowDeferredBlockedTip) return;
    const pending = pendingContextualTriggersRef.current;
    let emittedTip = false;
    const pendingCount = pending.length;
    for (let i = 0; i < pendingCount; i += 1) {
      const trigger = pending.shift();
      if (!trigger) continue;
      const tip = selectContextualTip(
        trigger,
        { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
        { excludeTipIds: toExcludedTipIds(Object.keys(recentTipHistoryRef.current), lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
      );
      if (!tip) {
        if (SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger) && !firedContextualTipsRef.current.has(trigger)) {
          pending.push(trigger);
        }
        continue;
      }
      if (appendManagedTip(tip)) {
        noteContextualTipRendered(trigger);
        emittedTip = true;
        break;
      }
    }
    if (options?.allowDeferredBlockedTip || emittedTip || pending.length === 0) {
      pendingContextualRequiresConversationRoundRef.current = false;
    }
  }, [appendManagedTip, canEmitTip, noteContextualTipRendered]);

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
    const tip = selectIdleTip({ totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) }, {
      excludeTipIds: toExcludedTipIds(Object.keys(recentTipHistoryRef.current), lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined),
    });
    if (!tip) return;
    if (!appendManagedTip(tip)) return;
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

    const { shouldResetShownMilestones, tip } = selectNextMilestoneTip(
      usedCommandsRef.current,
      shownMilestoneTipIdsRef.current,
      { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      lastShownTipIdRef.current,
    );
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
    const eligibleTriggers = getEligibleContextualTriggers({
      completedTaskCount,
      currentTD,
      onlineCount,
      previous,
      quotaPercent,
      hasEvaluatedContextualState: hasEvaluatedContextualStateRef.current,
      firedContextualTips: firedContextualTipsRef.current,
      singleFireTriggers: SINGLE_FIRE_CONTEXTUAL_TRIGGERS,
    });
    const nextState = createContextualStateSnapshot(currentTD, quotaPercent, completedTaskCount, onlineCount);
    hasEvaluatedContextualStateRef.current = true;
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
