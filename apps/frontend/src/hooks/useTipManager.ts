import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GameState, Message } from "./useGameState";
import { getContextualTip, getRandomIdleTip, selectMilestoneTip, type ContextualTipTrigger } from "../game/tips";

const IDLE_TIP_DELAY_MS = 45_000;
const MILESTONE_INTERVAL = 6;

type SetHistory = Dispatch<SetStateAction<Message[]>>;

interface UseTipManagerArgs {
  isBooting: boolean;
  gameState: GameState;
  onlineCount: number;
  setHistory: SetHistory;
}

function getCompletedTaskCount(gameState: GameState): number {
  return gameState.pendingCompletedTaskIds?.length ?? 0;
}

function appendTip(setHistory: SetHistory, content: string): void {
  window.setTimeout(() => {
    setHistory((prev) => [...prev, { role: "system", content }]);
  }, 0);
}

export function useTipManager({ isBooting, gameState, onlineCount, setHistory }: UseTipManagerArgs) {
  const completedTaskCount = getCompletedTaskCount(gameState);
  const idleTimerRef = useRef<number | null>(null);
  const hasInteractedRef = useRef(false);
  const actionCountRef = useRef(0);
  const usedCommandsRef = useRef<Set<string>>(new Set());
  const shownMilestoneTipIdsRef = useRef<Set<string>>(new Set());
  const firedContextualTipsRef = useRef<Set<ContextualTipTrigger>>(new Set());
  const previousStateRef = useRef({
    currentTD: gameState.economy.currentTD,
    quotaPercent: gameState.economy.quotaPercent,
    pendingCompletedTaskCount: getCompletedTaskCount(gameState),
    onlineCount,
  });

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleTip = useCallback(() => {
    clearIdleTimer();
    if (isBooting || !hasInteractedRef.current) return;
    idleTimerRef.current = window.setTimeout(() => {
      appendTip(setHistory, getRandomIdleTip());
      scheduleIdleTip();
    }, IDLE_TIP_DELAY_MS);
  }, [clearIdleTimer, isBooting, setHistory]);

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

  useEffect(() => {
    if (!hasInteractedRef.current) return;
    scheduleIdleTip();
  }, [scheduleIdleTip]);

  useEffect(() => {
    if (isBooting) return;

    const previous = previousStateRef.current;
    const triggers: ContextualTipTrigger[] = [];

    if (previous.currentTD <= 1_000 && gameState.economy.currentTD > 1_000) {
      triggers.push("td_1000");
    }
    if (previous.quotaPercent > 0 && gameState.economy.quotaPercent <= 0) {
      triggers.push("quota_exhausted");
    }
    if (completedTaskCount > previous.pendingCompletedTaskCount) {
      triggers.push("ticket_completed");
    }
    if (previous.onlineCount !== 1 && onlineCount === 1) {
      triggers.push("lone_user_online");
    }

    const newTips = triggers
      .filter((trigger) => !firedContextualTipsRef.current.has(trigger))
      .map((trigger) => {
        firedContextualTipsRef.current.add(trigger);
        return getContextualTip(trigger);
      })
      .filter((tip): tip is string => Boolean(tip));

    if (newTips.length > 0) {
      window.setTimeout(() => {
        setHistory((prev) => [...prev, ...newTips.map((content) => ({ role: "system" as const, content }))]);
      }, 0);
    }

    previousStateRef.current = {
      currentTD: gameState.economy.currentTD,
      quotaPercent: gameState.economy.quotaPercent,
      pendingCompletedTaskCount: completedTaskCount,
      onlineCount,
    };
  }, [
    completedTaskCount,
    gameState.economy.currentTD,
    gameState.economy.quotaPercent,
    isBooting,
    onlineCount,
    setHistory,
  ]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return { recordEnter, recordValidCommand };
}
