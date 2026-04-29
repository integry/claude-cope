// @vitest-environment jsdom
import type { Dispatch, SetStateAction } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { submitChatMessage, type BuddyInterjectionResult } from "../components/chatApi";
import type { Message } from "../hooks/gameStateUtils";
import { TURNSTILE_REQUIRED_EVENT } from "../turnstileEvents";

function createStateHarness(initial: Message[]) {
  let history = initial;
  let processing = true;
  const setHistory: Dispatch<SetStateAction<Message[]>> = (updater) => {
    history = typeof updater === "function" ? updater(history) : updater;
  };
  const setIsProcessing: Dispatch<SetStateAction<boolean>> = (updater) => {
    processing = typeof updater === "function" ? updater(processing) : updater;
  };

  return {
    getHistory: () => history,
    getProcessing: () => processing,
    setHistory: vi.fn(setHistory),
    setIsProcessing: vi.fn(setIsProcessing),
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("submitChatMessage turnstile recovery", () => {
  it("shows an infrastructure error when chat returns a bot-protection storage failure", async () => {
    const harness = createStateHarness([
      { role: "user", content: "hello" },
      { role: "loading", content: "..." },
    ]);
    const onError = vi.fn();
    const onReverify = vi.fn();
    window.addEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        error: "Bot protection storage is not available",
        reason: "storage_unavailable",
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    try {
      submitChatMessage({
        chatMessages: [{ role: "user", content: "hello" }],
        buddyResult: null as BuddyInterjectionResult | null,
        unlockAchievement: vi.fn(),
        setHistory: harness.setHistory,
        setIsProcessing: harness.setIsProcessing,
        currentRank: "Intern",
        onError,
      });

      await flushAsyncWork();

      expect(onError).toHaveBeenCalled();
      expect(onReverify).not.toHaveBeenCalled();
      expect(harness.getHistory()).toEqual([
        { role: "user", content: "hello" },
        { role: "error", content: "[❌ Error] Bot protection storage is not available" },
      ]);
      expect(harness.getProcessing()).toBe(false);
    } finally {
      window.removeEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    }
  });

  it("shows a normal 503 error when the reason is unrelated to bot protection", async () => {
    const harness = createStateHarness([
      { role: "user", content: "hello" },
      { role: "loading", content: "..." },
    ]);
    const onError = vi.fn();
    const onReverify = vi.fn();
    window.addEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Verification service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    try {
      submitChatMessage({
        chatMessages: [{ role: "user", content: "hello" }],
        buddyResult: null as BuddyInterjectionResult | null,
        unlockAchievement: vi.fn(),
        setHistory: harness.setHistory,
        setIsProcessing: harness.setIsProcessing,
        currentRank: "Intern",
        onError,
      });

      await flushAsyncWork();

      expect(onError).toHaveBeenCalled();
      expect(onReverify).not.toHaveBeenCalled();
      expect(harness.getHistory()).toEqual([
        { role: "user", content: "hello" },
        { role: "error", content: "[❌ Error] Verification service unavailable (HTTP 503)" },
      ]);
      expect(harness.getProcessing()).toBe(false);
    } finally {
      window.removeEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    }
  });

  it("shows a normal 403 error when the reason is unrelated to bot protection", async () => {
    const harness = createStateHarness([
      { role: "user", content: "hello" },
      { role: "loading", content: "..." },
    ]);
    const onError = vi.fn();
    const onReverify = vi.fn();
    window.addEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "CSRF token invalid" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    try {
      submitChatMessage({
        chatMessages: [{ role: "user", content: "hello" }],
        buddyResult: null as BuddyInterjectionResult | null,
        unlockAchievement: vi.fn(),
        setHistory: harness.setHistory,
        setIsProcessing: harness.setIsProcessing,
        currentRank: "Intern",
        onError,
      });

      await flushAsyncWork();

      expect(onError).toHaveBeenCalled();
      expect(onReverify).not.toHaveBeenCalled();
      expect(harness.getHistory()).toEqual([
        { role: "user", content: "hello" },
        { role: "error", content: "[❌ Error] CSRF token invalid (HTTP 403)" },
      ]);
      expect(harness.getProcessing()).toBe(false);
    } finally {
      window.removeEventListener(TURNSTILE_REQUIRED_EVENT, onReverify);
    }
  });
});
