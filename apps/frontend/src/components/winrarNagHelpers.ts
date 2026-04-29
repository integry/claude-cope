/**
 * WinRAR nag screen helpers (issue #736).
 *
 * Extracted from Terminal.tsx so the logic can be tested directly
 * against the production code paths rather than duplicated in tests.
 *
 * Product decision: ALL dismiss affordances (ESC key, backdrop click,
 * [x] button, mobile footer tap) replay the pending command. The
 * original WinRAR requirement specified ESC, but review broadened this
 * to every close path so that mobile users (who lack a physical ESC
 * key) are not left in a dead-end state. This is intentional.
 */

import type { MutableRefObject } from "react";

/* ── Types ────────────────────────────────────────────────────── */

export interface NagRefs {
  pendingNagCommandRef: MutableRefObject<string | null>;
  processCommandRef: MutableRefObject<(command: string) => void>;
}

export interface QuotaCheckParams {
  effectiveApiKey: string | undefined;
  proKey: string | null | undefined;
  proKeyHash: string | null | undefined;
  quotaPercent: number;
}

/* ── Quota gate ───────────────────────────────────────────────── */

/**
 * Returns `true` if free-tier quota is exhausted and the nag should
 * be shown (command is deferred behind the overlay). Returns `false`
 * if the command should proceed normally.
 */
export function shouldShowNag(params: QuotaCheckParams): boolean {
  const { effectiveApiKey, proKey, proKeyHash, quotaPercent } = params;
  return !effectiveApiKey && !proKey && !proKeyHash && quotaPercent <= 0;
}

/**
 * Stores the command in the pending ref and signals that the upgrade
 * overlay should be shown. Called when `shouldShowNag` returns true.
 */
export function armNagCommand(
  command: string,
  pendingNagCommandRef: MutableRefObject<string | null>,
  setShowUpgrade: (show: boolean) => void,
): void {
  pendingNagCommandRef.current = command;
  setShowUpgrade(true);
}

/* ── Dismiss handler ──────────────────────────────────────────── */

/**
 * Unified dismiss handler for the WinRAR nag overlay. Called by every
 * close affordance: ESC key, backdrop click, [x] button, mobile footer.
 *
 * If a pending command exists, it is replayed and recorded in command
 * history. If no pending command exists (e.g. opened via /upgrade),
 * the overlay is simply closed.
 */
export function dismissNagAndReplay(
  refs: NagRefs,
  setShowUpgrade: (show: boolean) => void,
  setCommandHistory: (updater: (prev: string[]) => string[]) => void,
): void {
  setShowUpgrade(false);
  if (window.location.pathname === "/upgrade") {
    window.history.pushState(null, "", "/");
  }
  if (refs.pendingNagCommandRef.current !== null) {
    const command = refs.pendingNagCommandRef.current;
    refs.pendingNagCommandRef.current = null;
    // Record the replayed command in command history so arrow-up navigation works
    setCommandHistory((prev) => [...prev, command]);
    refs.processCommandRef.current(command);
  }
}
