import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { GameState, Message } from "./useGameState";
import {
  BACKLOG_REMINDER_TIPS,
  selectBacklogReminder,
  selectContextualTip,
  selectIdleTip,
  selectMilestoneTip,
  type ContextualTipTrigger,
  type TipDefinition,
} from "../game/tips";

const IDLE_TIP_DELAY_MS = 45_000;
const MILESTONE_INTERVAL = 6;
const BACKLOG_REMINDER_MIN_MESSAGES = 6;
const BACKLOG_REMINDER_MAX_MESSAGES = 7;
const TIP_REPEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const TIP_HISTORY_STORAGE_KEY = "claude-cope.tip-history.v1";
const SINGLE_FIRE_CONTEXTUAL_TRIGGERS = new Set<ContextualTipTrigger>(["td_1000", "quota_exhausted"]);
type SetHistory = Dispatch<SetStateAction<Message[]>>;
interface UseTipManagerArgs {
  isBooting: boolean;
  isInteractionBlocked?: boolean;
  gameState: GameState;
  onlineCount: number;
  setHistory: SetHistory;
}
type RecordValidCommandOptions = { suppressTip?: boolean };
type MessageWithoutTicketRollback = () => void;
type PendingBacklogReminder = {
  tip: TipDefinition;
  previousCount: number;
  previousThreshold: number;
  previousTipId: string | null;
  previousRecentTipHistory: Record<string, number>;
  previousLastTipConversationRound: number | null;
};
type PreviousTipState = Pick<PendingBacklogReminder, "previousCount" | "previousThreshold" | "previousTipId">;
type ContextualStateSnapshot = { currentTD: number; quotaPercent: number; pendingCompletedTaskCount: number; onlineCount: number };
const getCompletedTaskCount = (gameState: GameState): number => gameState.pendingCompletedTaskIds?.length ?? 0;
const appendTip = (setHistory: SetHistory, content: string): void => setHistory((prev) => [...prev, { role: "system", content }]);

function readRecentTipHistory(now = Date.now()): Record<string, number> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(TIP_HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, number] => typeof entry[0] === "string" && typeof entry[1] === "number")
        .filter(([, timestamp]) => now - timestamp < TIP_REPEAT_WINDOW_MS),
    );
  } catch {
    return {};
  }
}

function persistRecentTipHistory(history: Record<string, number>): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(TIP_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures and keep the in-memory cooldown alive for this session.
  }
}

function markTipShown(
  recentTipHistoryRef: MutableRefObject<Record<string, number>>,
  tip: TipDefinition,
  timestamp = Date.now(),
): void {
  recentTipHistoryRef.current = { ...readRecentTipHistory(timestamp), [tip.id]: timestamp };
  persistRecentTipHistory(recentTipHistoryRef.current);
}
const getNextBacklogReminderThreshold = (): number => BACKLOG_REMINDER_MIN_MESSAGES + Math.floor(Math.random() * (BACKLOG_REMINDER_MAX_MESSAGES - BACKLOG_REMINDER_MIN_MESSAGES + 1));
const hasRecentBacklogReminder = (history: Record<string, number>): boolean => BACKLOG_REMINDER_TIPS.some((tip) => history[tip.id] !== undefined);

function getInitialContextualTriggers(currentTD: number, quotaPercent: number, onlineCount: number): ContextualTipTrigger[] {
  const triggers: ContextualTipTrigger[] = [];
  if (currentTD > 1_000) triggers.push("td_1000");
  if (quotaPercent <= 0) triggers.push("quota_exhausted");
  if (onlineCount === 1) triggers.push("lone_user_online");
  return triggers;
}
const getPreviousTipState = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>,
): PreviousTipState => ({
  previousCount: noTicketMessageCountRef.current,
  previousThreshold: nextBacklogReminderThresholdRef.current,
  previousTipId: lastBacklogReminderTipIdRef.current,
});
const restorePreviousTipState = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
  lastBacklogReminderTipIdRef: MutableRefObject<string | null>,
  previous: PreviousTipState,
): void => {
  noTicketMessageCountRef.current = previous.previousCount;
  nextBacklogReminderThresholdRef.current = previous.previousThreshold;
  lastBacklogReminderTipIdRef.current = previous.previousTipId;
};
const resetBacklogReminderProgress = (
  noTicketMessageCountRef: MutableRefObject<number>,
  nextBacklogReminderThresholdRef: MutableRefObject<number>,
): void => {
  noTicketMessageCountRef.current = 0;
  nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
};
const createContextualStateSnapshot = (
  currentTD: number,
  quotaPercent: number,
  pendingCompletedTaskCount: number,
  onlineCount: number,
): ContextualStateSnapshot => ({ currentTD, quotaPercent, pendingCompletedTaskCount, onlineCount });
const removeTipFromHistory = (setHistory: SetHistory, content: string): void => {
  setHistory((prev) => {
    for (let i = prev.length - 1; i >= 0; i -= 1) {
      if (prev[i]?.role === "system" && prev[i]?.content === content) return [...prev.slice(0, i), ...prev.slice(i + 1)];
    }
    return prev;
  });
};

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
  const hasEvaluatedContextualStateRef = useRef(false);
  const noTicketMessageCountRef = useRef(0);
  const nextBacklogReminderThresholdRef = useRef(getNextBacklogReminderThreshold());
  const lastBacklogReminderTipIdRef = useRef<string | null>(null);
  const recentTipHistoryRef = useRef<Record<string, number>>(readRecentTipHistory());
  const conversationRoundsRef = useRef(0);
  const lastTipConversationRoundRef = useRef<number | null>(null);
  const pendingBacklogReminderRef = useRef<PendingBacklogReminder | null>(null);
  const isBootingRef = useRef(isBooting), isInteractionBlockedRef = useRef(isInteractionBlocked), gameStateRef = useRef(gameState), totalTDEarnedRef = useRef(totalTDEarned);
  const previousStateRef = useRef(createContextualStateSnapshot(gameState.economy.currentTD, gameState.economy.quotaPercent, getCompletedTaskCount(gameState), onlineCount));
  isBootingRef.current = isBooting;
  isInteractionBlockedRef.current = isInteractionBlocked;
  gameStateRef.current = gameState;
  totalTDEarnedRef.current = totalTDEarned;
  const canEmitTip = useCallback(() => lastTipConversationRoundRef.current === null || conversationRoundsRef.current > lastTipConversationRoundRef.current, []);
  const noteTipEmitted = useCallback(() => { lastTipConversationRoundRef.current = conversationRoundsRef.current; }, []);
  const appendManagedTip = useCallback((content: string): boolean => {
    if (!canEmitTip()) return false;
    appendTip(setHistory, content);
    noteTipEmitted();
    return true;
  }, [canEmitTip, noteTipEmitted, setHistory]);

  const flushPendingBacklogReminder = useCallback(() => {
    if (!canEmitTip()) return;
    const pendingReminder = pendingBacklogReminderRef.current;
    if (!pendingReminder) return;
    if (gameStateRef.current.activeTicket) {
      pendingBacklogReminderRef.current = null;
      return;
    }

    pendingBacklogReminderRef.current = null;
    appendManagedTip(pendingReminder.tip.text);
    markTipShown(recentTipHistoryRef, pendingReminder.tip);
  }, [appendManagedTip, canEmitTip]);

  const flushPendingContextualTip = useCallback(() => {
    if (!canEmitTip()) return;
    const pending = pendingContextualTriggersRef.current;
    while (pending.length > 0) {
      const trigger = pending.shift();
      if (!trigger) continue;
      const tip = selectContextualTip(trigger, {
        totalTDEarned: totalTDEarnedRef.current,
        hasActiveTicket: Boolean(gameStateRef.current.activeTicket),
      });
      if (!tip) continue;
      appendManagedTip(tip.text);
      break;
    }
  }, [appendManagedTip, canEmitTip]);

  const emitIdleTip = useCallback(() => {
    idleTimerRef.current = null;
    idleDeadlineRef.current = null;
    if (!canEmitTip()) return;
    recentTipHistoryRef.current = readRecentTipHistory();
    const tip = selectIdleTip({ totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) }, { excludeTipIds: Object.keys(recentTipHistoryRef.current) });
    if (!tip) return;
    appendManagedTip(tip.text);
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
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  const recordConversationRound = useCallback(() => {
    conversationRoundsRef.current += 1;
    flushPendingBacklogReminder();
    flushPendingContextualTip();
  }, [flushPendingBacklogReminder, flushPendingContextualTip]);
  const recordValidCommand = useCallback((baseCommand?: string, options?: RecordValidCommandOptions): string | null => {
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return null;
    if (options?.suppressTip) return null;
    if (!canEmitTip()) return null;
    const context = { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) };
    let tip = selectMilestoneTip(usedCommandsRef.current, shownMilestoneTipIdsRef.current, context);
    if (!tip && shownMilestoneTipIdsRef.current.size > 0) {
      shownMilestoneTipIdsRef.current.clear();
      tip = selectMilestoneTip(usedCommandsRef.current, shownMilestoneTipIdsRef.current, context);
    }
    if (!tip) return null;
    shownMilestoneTipIdsRef.current.add(tip.id);
    appendManagedTip(tip.text);
    return tip.text;
  }, [appendManagedTip, canEmitTip]);

  const recordMessageWithoutTicket = useCallback((): MessageWithoutTicketRollback => {
    const previous = getPreviousTipState(noTicketMessageCountRef, nextBacklogReminderThresholdRef, lastBacklogReminderTipIdRef);
    const rollback = () => restorePreviousTipState(noTicketMessageCountRef, nextBacklogReminderThresholdRef, lastBacklogReminderTipIdRef, previous);
    if (gameStateRef.current.activeTicket) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollback;
    }
    noTicketMessageCountRef.current += 1;
    if (noTicketMessageCountRef.current < nextBacklogReminderThresholdRef.current) return rollback;
    recentTipHistoryRef.current = readRecentTipHistory();
    if (pendingBacklogReminderRef.current || hasRecentBacklogReminder(recentTipHistoryRef.current)) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollback;
    }
    const tip = selectBacklogReminder(
      lastBacklogReminderTipIdRef.current ?? undefined,
      { hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: Object.keys(recentTipHistoryRef.current) },
    );
    if (!tip) {
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return rollback;
    }
    const previousRecentTipHistory = recentTipHistoryRef.current;
    const previousLastTipConversationRound = lastTipConversationRoundRef.current;
    if (isInteractionBlockedRef.current) {
      lastBacklogReminderTipIdRef.current = tip.id;
      pendingBacklogReminderRef.current = {
        tip,
        ...previous,
        previousRecentTipHistory,
        previousLastTipConversationRound,
      };
      resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
      return () => {
        if (pendingBacklogReminderRef.current?.tip.id === tip.id) pendingBacklogReminderRef.current = null;
        rollback();
        recentTipHistoryRef.current = previousRecentTipHistory;
        lastTipConversationRoundRef.current = previousLastTipConversationRound;
        persistRecentTipHistory(previousRecentTipHistory);
      };
    }
    if (!canEmitTip()) return rollback;
    lastBacklogReminderTipIdRef.current = tip.id;
    appendManagedTip(tip.text);
    markTipShown(recentTipHistoryRef, tip);
    resetBacklogReminderProgress(noTicketMessageCountRef, nextBacklogReminderThresholdRef);
    return () => {
      rollback();
      recentTipHistoryRef.current = previousRecentTipHistory;
      lastTipConversationRoundRef.current = previousLastTipConversationRound;
      persistRecentTipHistory(previousRecentTipHistory);
      removeTipFromHistory(setHistory, tip.text);
    };
  }, [appendManagedTip, canEmitTip, setHistory]);

  useEffect(() => {
    if (!gameState.activeTicket) return;
    pendingBacklogReminderRef.current = null;
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
