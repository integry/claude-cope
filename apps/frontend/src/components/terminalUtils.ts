import type { Message } from "../hooks/useGameState";
import { DEFAULT_CLOSE_EFFECT, UPGRADE_NAG_CLOSE_EFFECTS, type UpgradeNagCloseEffect } from "./upgradeOverlayEffects";

export const NAG_MINIMUM_OPEN_MS = 3000;
export const NAG_FORCED_CLOSE_MS = 3000;
export const STARTUP_TICKET_PROMPT_DELAY_MS = 300;

export function pickRandomUpgradeNagCloseEffect(): UpgradeNagCloseEffect {
  return UPGRADE_NAG_CLOSE_EFFECTS[Math.floor(Math.random() * UPGRADE_NAG_CLOSE_EFFECTS.length)] ?? DEFAULT_CLOSE_EFFECT;
}

export function syncMessageKeys(messageKeys: number[], nextKeyId: { current: number }, historyLength: number) {
  while (messageKeys.length < historyLength) messageKeys.push(nextKeyId.current++);
  if (messageKeys.length > historyLength) messageKeys.length = historyLength;
}

export function removeCommandFromHistory(history: string[], command: string) {
  const idx = history.lastIndexOf(command);
  return idx >= 0 ? [...history.slice(0, idx), ...history.slice(idx + 1)] : history;
}

export function removeUserCommandMessage(history: Message[], command: string) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]?.role === "user" && history[i]?.content === command) {
      return [...history.slice(0, i), ...history.slice(i + 1)];
    }
  }
  return history;
}

export function getNextTerminalInputValue(currentValue: string, nextValue: string, isBackwardsTyping: boolean) {
  const isAppending = nextValue.length > currentValue.length;
  return isBackwardsTyping && isAppending
    ? nextValue.slice(currentValue.length) + currentValue
    : nextValue;
}
