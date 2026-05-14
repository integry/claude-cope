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

type RecordValidCommandOptions = {
  suppressTip?: boolean;
};

type MessageWithoutTicketRollback = () => void;

function getCompletedTaskCount(gameState: GameState): number {
  return gameState.pendingCompletedTaskIds?.length ?? 0;
}

function appendTip(setHistory: SetHistory, content: string): void {
  setHistory((prev) => [...prev, { role: "system", content }]);
}

function toExcludedTipIds(...sources: Array<Iterable<string> | null | undefined>): string[] | undefined {
  const excluded = new Set<string>();
  for (const source of sources) {
    if (!source) continue;
    for (const value of source) excluded.add(value);
  }
  return excluded.size > 0 ? Array.from(excluded) : undefined;
}

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
  recentTipHistoryRef.current = {
    ...readRecentTipHistory(timestamp),
    [tip.id]: timestamp,
  };
  persistRecentTipHistory(recentTipHistoryRef.current);
}

function getNextBacklogReminderThreshold(): number {
  return BACKLOG_REMINDER_MIN_MESSAGES + Math.floor(Math.random() * (BACKLOG_REMINDER_MAX_MESSAGES - BACKLOG_REMINDER_MIN_MESSAGES + 1));
}

function hasRecentBacklogReminder(history: Record<string, number>): boolean {
  return BACKLOG_REMINDER_TIPS.some((tip) => history[tip.id] !== undefined);
}

function getInitialContextualTriggers(currentTD: number, quotaPercent: number, onlineCount: number): ContextualTipTrigger[] {
  const triggers: ContextualTipTrigger[] = [];

  if (currentTD > 1_000) {
    triggers.push("td_1000");
  }
  if (quotaPercent <= 0) {
    triggers.push("quota_exhausted");
  }
  if (onlineCount === 1) {
    triggers.push("lone_user_online");
  }

  return triggers;
}

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
  const interactionCountRef = useRef(0);
  const conversationRoundsRef = useRef(0);
  const lastTipInteractionCountRef = useRef<number | null>(null);
  const lastTipConversationRoundRef = useRef<number | null>(null);
  const lastShownTipIdRef = useRef<string | null>(null);
  const isBootingRef = useRef(isBooting);
  const isInteractionBlockedRef = useRef(isInteractionBlocked);
  const gameStateRef = useRef(gameState);
  const totalTDEarnedRef = useRef(totalTDEarned);
  const previousStateRef = useRef({
    currentTD: gameState.economy.currentTD,
    quotaPercent: gameState.economy.quotaPercent,
    pendingCompletedTaskCount: getCompletedTaskCount(gameState),
    onlineCount,
  });

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

  const flushPendingContextualTip = useCallback(() => {
    if (!canEmitTip()) return;

    const pending = pendingContextualTriggersRef.current;
    while (pending.length > 0) {
      const trigger = pending.shift();
      if (!trigger) continue;
      const tip = selectContextualTip(trigger, {
        totalTDEarned: totalTDEarnedRef.current,
        hasActiveTicket: Boolean(gameStateRef.current.activeTicket),
      }, { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) });
      if (!tip) continue;
      if (appendManagedTip(tip)) break;
    }
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
      if (isBootingRef.current) {
        idleTimerRef.current = null;
        return;
      }
      if (isInteractionBlockedRef.current) {
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
    flushPendingContextualTip();
  }, [flushPendingContextualTip]);

  const recordValidCommand = useCallback((baseCommand?: string, options?: RecordValidCommandOptions): string | null => {
    interactionCountRef.current += 1;
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    flushPendingContextualTip();
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return null;
    if (options?.suppressTip) return null;
    if (!canEmitTip()) return null;

    let tip = selectMilestoneTip(
      usedCommandsRef.current,
      shownMilestoneTipIdsRef.current,
      { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
    );
    if (!tip && shownMilestoneTipIdsRef.current.size > 0) {
      shownMilestoneTipIdsRef.current.clear();
      tip = selectMilestoneTip(
        usedCommandsRef.current,
        shownMilestoneTipIdsRef.current,
        { totalTDEarned: totalTDEarnedRef.current, hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
        { excludeTipIds: toExcludedTipIds(lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
      );
    }
    if (!tip) return null;

    shownMilestoneTipIdsRef.current.add(tip.id);
    if (!appendManagedTip(tip)) return null;
    return tip.text;
  }, [appendManagedTip, canEmitTip, flushPendingContextualTip]);

  const recordMessageWithoutTicket = useCallback((): MessageWithoutTicketRollback => {
    interactionCountRef.current += 1;
    const previousCount = noTicketMessageCountRef.current;
    const previousThreshold = nextBacklogReminderThresholdRef.current;
    const previousTipId = lastBacklogReminderTipIdRef.current;
    const previousLastShownTipId = lastShownTipIdRef.current;

    flushPendingContextualTip();

    if (gameStateRef.current.activeTicket) {
      noTicketMessageCountRef.current = 0;
      nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
      };
    }

    noTicketMessageCountRef.current += 1;
    if (noTicketMessageCountRef.current < nextBacklogReminderThresholdRef.current) {
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
      };
    }

    recentTipHistoryRef.current = readRecentTipHistory();
    const previousRecentTipHistory = recentTipHistoryRef.current;
    const previousLastTipConversationRound = lastTipConversationRoundRef.current;
    const previousLastTipInteractionCount = lastTipInteractionCountRef.current;
    if (hasRecentBacklogReminder(recentTipHistoryRef.current)) {
      noTicketMessageCountRef.current = 0;
      nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
      };
    }

    const tip = selectBacklogReminder(
      lastBacklogReminderTipIdRef.current ?? undefined,
      { hasActiveTicket: Boolean(gameStateRef.current.activeTicket) },
      { excludeTipIds: toExcludedTipIds(Object.keys(recentTipHistoryRef.current), lastShownTipIdRef.current ? [lastShownTipIdRef.current] : undefined) },
    );
    if (!tip) {
      noTicketMessageCountRef.current = 0;
      nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
      };
    }
    if (!canEmitTip()) {
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
      };
    }
    lastBacklogReminderTipIdRef.current = tip.id;
    if (!appendManagedTip(tip)) {
      lastBacklogReminderTipIdRef.current = previousTipId;
      return () => {
        noTicketMessageCountRef.current = previousCount;
        nextBacklogReminderThresholdRef.current = previousThreshold;
        lastBacklogReminderTipIdRef.current = previousTipId;
        lastShownTipIdRef.current = previousLastShownTipId;
      };
    }
    markTipShown(recentTipHistoryRef, tip);
    noTicketMessageCountRef.current = 0;
    nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
    return () => {
      noTicketMessageCountRef.current = previousCount;
      nextBacklogReminderThresholdRef.current = previousThreshold;
      lastBacklogReminderTipIdRef.current = previousTipId;
      recentTipHistoryRef.current = previousRecentTipHistory;
      lastShownTipIdRef.current = previousLastShownTipId;
      lastTipInteractionCountRef.current = previousLastTipInteractionCount;
      lastTipConversationRoundRef.current = previousLastTipConversationRound;
      persistRecentTipHistory(previousRecentTipHistory);
      setHistory((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i]?.role === "system" && prev[i]?.content === tip.text) {
            return [...prev.slice(0, i), ...prev.slice(i + 1)];
          }
        }
        return prev;
      });
    };
  }, [appendManagedTip, canEmitTip, flushPendingContextualTip, setHistory]);

  useEffect(() => {
    if (!gameState.activeTicket) return;
    noTicketMessageCountRef.current = 0;
    nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
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

    if (isInteractionBlocked || !canEmitTip()) {
      pendingContextualTriggersRef.current.push(...eligibleTriggers);
      previousStateRef.current = {
        currentTD,
        quotaPercent,
        pendingCompletedTaskCount: completedTaskCount,
        onlineCount,
      };
      return;
    }

    pendingContextualTriggersRef.current.push(...eligibleTriggers);
    flushPendingContextualTip();

    previousStateRef.current = {
      currentTD,
      quotaPercent,
      pendingCompletedTaskCount: completedTaskCount,
      onlineCount,
    };
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
