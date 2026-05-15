import type { MutableRefObject } from "react";
import {
  BACKLOG_REMINDER_TIPS,
  type ContextualTipTrigger,
  type TipDefinition,
} from "../game/tips";

const BACKLOG_REMINDER_MIN_MESSAGES = 6;
const BACKLOG_REMINDER_MAX_MESSAGES = 7;
const TIP_REPEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const TIP_HISTORY_STORAGE_KEY = "claude-cope.tip-history.v1";

export function toExcludedTipIds(...sources: Array<Iterable<string> | null | undefined>): string[] | undefined {
  const excluded = new Set<string>();
  for (const source of sources) {
    if (!source) continue;
    for (const value of source) excluded.add(value);
  }
  return excluded.size > 0 ? Array.from(excluded) : undefined;
}

export function readRecentTipHistory(now = Date.now()): Record<string, number> {
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

export function persistRecentTipHistory(history: Record<string, number>): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.setItem(TIP_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures and keep the in-memory cooldown alive for this session.
  }
}

export function markTipShown(
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

export function getNextBacklogReminderThreshold(): number {
  return BACKLOG_REMINDER_MIN_MESSAGES + Math.floor(Math.random() * (BACKLOG_REMINDER_MAX_MESSAGES - BACKLOG_REMINDER_MIN_MESSAGES + 1));
}

export function hasRecentBacklogReminder(history: Record<string, number>): boolean {
  return BACKLOG_REMINDER_TIPS.some((tip) => history[tip.id] !== undefined);
}

export function getInitialContextualTriggers(
  currentTD: number,
  quotaPercent: number,
  onlineCount: number,
): ContextualTipTrigger[] {
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
