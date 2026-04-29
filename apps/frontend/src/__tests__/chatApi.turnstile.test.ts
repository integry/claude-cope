// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { submitChatMessage, type BuddyInterjectionResult } from "../components/chatApi";
import { TURNSTILE_REQUIRED_EVENT } from "../turnstileEvents";

type Message = {
  role: string;
  content: string;
};

function createStateHarness(initial: Message[]) {
  let history = initial;
  let processing = true;

  return {
    getHistory: () => history,
    getProcessing: () => processing,
    setHistory: vi.fn((updater: Message[] | ((prev: Message[]) => Message[])) => {
      history = typeof updater === "function" ? updater(history) : updater;
    }),
    setIsProcessing: vi.fn((updater: boolean | ((prev: boolean) => boolean)) => {
      processing = typeof updater === "function" ? updater(processing) : updater;
    }),
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
  it("re-triggers verification when chat returns a bot-protection storage failure", async () => {
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
      expect(onReverify).toHaveBeenCalledTimes(1);
      expect(harness.getHistory()).toEqual([{ role: "user", content: "hello" }]);
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
});
