import type { Dispatch, SetStateAction } from "react";
import type { Message } from "../hooks/useGameState";
import { getRandomAd } from "./terminalAds";
import { getRandomLoadingPhrase } from "./loadingPhrases";

type DelayState = { cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null };

function cancellableDelay(ms: number, delayState: DelayState): Promise<void> {
  return new Promise((resolve) => {
    if (delayState.cancelled) { resolve(); return; }
    delayState.timeoutId = setTimeout(() => { delayState.timeoutId = null; resolve(); }, ms);
  });
}

/**
 * Runs the free-tier artificial scarcity sequence: optional ad + fake queue delay.
 * Returns true if the delay completed, false if it was cancelled.
 */
export async function runFreeTierDelay(opts: {
  commandCount: number;
  userMessage: Message;
  delayState: DelayState;
  setHistory: Dispatch<SetStateAction<Message[]>>;
}): Promise<boolean> {
  const { commandCount, userMessage, delayState, setHistory } = opts;

  const queueMsgId = `__queue_${Date.now()}_${Math.random()}`;

  // Every 4th command: show a terminal ad before processing
  if (commandCount % 4 === 0) {
    const ad = getRandomAd();
    setHistory((prev) => [...prev, userMessage, { role: "warning", content: ad }]);
    await cancellableDelay(2000, delayState);
    if (delayState.cancelled) return false;
  }

  // Simulated queueing: show bureaucratic message and wait 3 seconds
  const queueContent = "[INFO] Free tier detected. Yielding compute to paying customers. Please hold...";
  setHistory((prev) => [...prev, ...(commandCount % 4 === 0 ? [] : [userMessage]), { role: "warning", content: queueContent, _queueId: queueMsgId } as Message & { _queueId: string }]);
  await cancellableDelay(3000, delayState);
  if (delayState.cancelled) return false;

  // Remove queue message and add loading indicator
  setHistory((prev) => [...prev.filter((m) => (m as Message & { _queueId?: string })._queueId !== queueMsgId), { role: "loading", content: getRandomLoadingPhrase() }]);
  return true;
}
