import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GameState, Message } from "./useGameState";
import { getContextualTip, getRandomBacklogReminder, getRandomIdleTip, selectMilestoneTip, type ContextualTipTrigger } from "../game/tips";

const IDLE_TIP_DELAY_MS = 45_000;
const MILESTONE_INTERVAL = 6;
const BACKLOG_REMINDER_MIN_MESSAGES = 6;
const BACKLOG_REMINDER_MAX_MESSAGES = 7;
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

function getCompletedTaskCount(gameState: GameState): number {
  return gameState.pendingCompletedTaskIds?.length ?? 0;
}

function appendTip(setHistory: SetHistory, content: string): void {
  setHistory((prev) => [...prev, { role: "system", content }]);
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
  const isBootingRef = useRef(isBooting);
  const isInteractionBlockedRef = useRef(isInteractionBlocked);
  const previousStateRef = useRef({
    currentTD: gameState.economy.currentTD,
    quotaPercent: gameState.economy.quotaPercent,
    pendingCompletedTaskCount: getCompletedTaskCount(gameState),
    onlineCount,
  });

  isBootingRef.current = isBooting;
  isInteractionBlockedRef.current = isInteractionBlocked;

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
      idleTimerRef.current = null;
      idleDeadlineRef.current = null;
      appendTip(setHistory, getRandomIdleTip());
    }, delayMs);
  }, [clearIdleTimer, setHistory]);

  const recordEnter = useCallback(() => {
    hasInteractedRef.current = true;
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  const recordValidCommand = useCallback((baseCommand?: string, options?: RecordValidCommandOptions): string | null => {
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return null;
    if (options?.suppressTip) return null;

    const tip = selectMilestoneTip(usedCommandsRef.current, shownMilestoneTipIdsRef.current);
    if (!tip) return null;

    shownMilestoneTipIdsRef.current.add(tip.id);
    appendTip(setHistory, tip.text);
    return tip.text;
  }, [setHistory]);

  const recordMessageWithoutTicket = useCallback((): string | null => {
    if (gameState.activeTicket) {
      noTicketMessageCountRef.current = 0;
      nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
      return null;
    }

    noTicketMessageCountRef.current += 1;
    if (noTicketMessageCountRef.current < nextBacklogReminderThresholdRef.current) return null;

    const tip = getRandomBacklogReminder(lastBacklogReminderTipIdRef.current ?? undefined);
    lastBacklogReminderTipIdRef.current = tip.id;
    appendTip(setHistory, tip.text);
    noTicketMessageCountRef.current = 0;
    nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
    return tip.text;
  }, [gameState.activeTicket, setHistory]);

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
      .map((trigger) => getContextualTip(trigger))
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
