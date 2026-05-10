import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { GameState, Message } from "./useGameState";
import { selectBacklogReminder, selectContextualTip, selectIdleTip, selectMilestoneTip, type ContextualTipTrigger, type TipDefinition } from "../game/tips";

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

  const emitIdleTip = useCallback(() => {
    idleTimerRef.current = null;
    idleDeadlineRef.current = null;
    recentTipHistoryRef.current = readRecentTipHistory();
    const tip = selectIdleTip(
      { totalTDEarned: totalTDEarnedRef.current },
      { excludeTipIds: Object.keys(recentTipHistoryRef.current) },
    );
    if (!tip) return;
    appendTip(setHistory, tip.text);
    markTipShown(recentTipHistoryRef, tip);
  }, [setHistory]);

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
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  const recordValidCommand = useCallback((baseCommand?: string, options?: RecordValidCommandOptions): string | null => {
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return null;
    if (options?.suppressTip) return null;

    let tip = selectMilestoneTip(
      usedCommandsRef.current,
      shownMilestoneTipIdsRef.current,
      { totalTDEarned: totalTDEarnedRef.current },
    );
    if (!tip && shownMilestoneTipIdsRef.current.size > 0) {
      shownMilestoneTipIdsRef.current.clear();
      tip = selectMilestoneTip(
        usedCommandsRef.current,
        shownMilestoneTipIdsRef.current,
        { totalTDEarned: totalTDEarnedRef.current },
      );
    }
    if (!tip) return null;

    shownMilestoneTipIdsRef.current.add(tip.id);
    appendTip(setHistory, tip.text);
    return tip.text;
  }, [setHistory]);

  const recordMessageWithoutTicket = useCallback((): MessageWithoutTicketRollback => {
    const previousCount = noTicketMessageCountRef.current;
    const previousThreshold = nextBacklogReminderThresholdRef.current;
    const previousTipId = lastBacklogReminderTipIdRef.current;

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

    const tip = selectBacklogReminder(
      lastBacklogReminderTipIdRef.current ?? undefined,
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
    lastBacklogReminderTipIdRef.current = tip.id;
    appendTip(setHistory, tip.text);
    noTicketMessageCountRef.current = 0;
    nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
    return () => {
      noTicketMessageCountRef.current = previousCount;
      nextBacklogReminderThresholdRef.current = previousThreshold;
      lastBacklogReminderTipIdRef.current = previousTipId;
      setHistory((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i]?.role === "system" && prev[i]?.content === tip.text) {
            return [...prev.slice(0, i), ...prev.slice(i + 1)];
          }
        }
        return prev;
      });
    };
  }, [setHistory]);

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

    if (isInteractionBlocked) {
      pendingContextualTriggersRef.current.push(...eligibleTriggers);
      previousStateRef.current = {
        currentTD,
        quotaPercent,
        pendingCompletedTaskCount: completedTaskCount,
        onlineCount,
      };
      return;
    }

    const newTips = [...pendingContextualTriggersRef.current, ...eligibleTriggers]
      .map((trigger) => {
        const tip = selectContextualTip(trigger, { totalTDEarned });
        if (!tip) return null;
        return tip.text;
      })
      .filter((tip): tip is string => Boolean(tip));
    pendingContextualTriggersRef.current = [];

    if (newTips.length > 0) {
      setHistory((prev) => [...prev, ...newTips.map((content) => ({ role: "system" as const, content }))]);
    }

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
    isBooting,
    isInteractionBlocked,
    onlineCount,
    setHistory,
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

  return { recordEnter, recordValidCommand, recordMessageWithoutTicket };
}
