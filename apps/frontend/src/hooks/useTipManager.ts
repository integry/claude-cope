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
  const hasInteractedRef = useRef(false);
  const actionCountRef = useRef(0);
  const usedCommandsRef = useRef<Set<string>>(new Set());
  const shownMilestoneTipIdsRef = useRef<Set<string>>(new Set());
  const firedContextualTipsRef = useRef<Set<ContextualTipTrigger>>(new Set());
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

  const scheduleIdleTip = useCallback(() => {
    clearIdleTimer();
    if (!hasInteractedRef.current) return;
    idleTimerRef.current = window.setTimeout(function fireIdleTip() {
      if (isBootingRef.current) {
        idleTimerRef.current = null;
        return;
      }
      if (isInteractionBlockedRef.current) {
        idleTimerRef.current = window.setTimeout(fireIdleTip, 250);
        return;
      }
      idleTimerRef.current = null;
      appendTip(setHistory, getRandomIdleTip());
    }, IDLE_TIP_DELAY_MS);
  }, [clearIdleTimer, setHistory]);

  const recordEnter = useCallback(() => {
    hasInteractedRef.current = true;
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  const recordValidCommand = useCallback((baseCommand?: string) => {
    actionCountRef.current += 1;
    if (baseCommand) usedCommandsRef.current.add(baseCommand);
    if (actionCountRef.current % MILESTONE_INTERVAL !== 0) return;

    const tip = selectMilestoneTip(usedCommandsRef.current, shownMilestoneTipIdsRef.current);
    if (!tip) return;

    shownMilestoneTipIdsRef.current.add(tip.id);
    appendTip(setHistory, tip.text);
  }, [setHistory]);

  const recordMessageWithoutTicket = useCallback(() => {
    if (gameState.activeTicket) {
      noTicketMessageCountRef.current = 0;
      nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
      return;
    }

    noTicketMessageCountRef.current += 1;
    if (noTicketMessageCountRef.current < nextBacklogReminderThresholdRef.current) return;

    const tip = getRandomBacklogReminder(lastBacklogReminderTipIdRef.current ?? undefined);
    lastBacklogReminderTipIdRef.current = tip.id;
    appendTip(setHistory, tip.text);
    noTicketMessageCountRef.current = 0;
    nextBacklogReminderThresholdRef.current = getNextBacklogReminderThreshold();
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

    const newTips = Array.from(new Set(triggers))
      .filter((trigger) => !SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger) || !firedContextualTipsRef.current.has(trigger))
      .map((trigger) => {
        if (SINGLE_FIRE_CONTEXTUAL_TRIGGERS.has(trigger)) firedContextualTipsRef.current.add(trigger);
        return getContextualTip(trigger);
      })
      .filter((tip): tip is string => Boolean(tip));

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
    onlineCount,
    setHistory,
  ]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return { recordEnter, recordValidCommand, recordMessageWithoutTicket };
}
