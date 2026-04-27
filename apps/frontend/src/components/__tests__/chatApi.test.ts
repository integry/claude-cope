import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeBuddyInterjection, submitChatMessage } from "../chatApi";
import type { BuddyState } from "../../hooks/useGameState";

/**
 * Creates a mock ReadableStream that simulates an SSE streamed response
 * from the OpenRouter API. Each content string becomes a separate SSE chunk.
 */
function createMockStream(contents: string[], usage?: { prompt_tokens: number; completion_tokens: number }): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = contents.map(
    (content) =>
      `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
  );
  if (usage) {
    chunks.push(`data: ${JSON.stringify({ usage, choices: [] })}\n\n`);
  }
  chunks.push("data: [DONE]\n\n");

  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]!));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function createMockStreamResponse(contents: string[], usage?: { prompt_tokens: number; completion_tokens: number }) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "text/event-stream" }),
    body: createMockStream(contents, usage),
    json: () => Promise.reject(new Error("Should not call json on stream")),
  } as unknown as Response;
}

describe("computeBuddyInterjection", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when buddy type is null", () => {
    const buddy: BuddyState = {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 10,
    };
    expect(computeBuddyInterjection(buddy)).toBeNull();
  });

  it("returns null when prompts since last interjection < 4 (needs 5 to trigger)", () => {
    // Mock Math.random to return >= 0.33 so the early-exit check triggers
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const buddy: BuddyState = {
      type: "Agile Snail",
      isShiny: false,
      promptsSinceLastInterjection: 3, // 3 + 1 = 4, still < 7 and random >= 0.33 → null
    };
    expect(computeBuddyInterjection(buddy)).toBeNull();
  });

  it("returns an interjection when prompts reaches threshold (4 + 1 >= 5)", () => {
    const buddy: BuddyState = {
      type: "Agile Snail",
      isShiny: false,
      promptsSinceLastInterjection: 4,
    };
    const result = computeBuddyInterjection(buddy);
    expect(result).not.toBeNull();
    expect(result!.message.role).toBe("warning");
    expect(result!.message.content).toContain("@..@");
    expect(result!.message.content).toContain("Agile Snail");
  });

  it("returns interjection for Sarcastic Clippy with correct icon", () => {
    const buddy: BuddyState = {
      type: "Sarcastic Clippy",
      isShiny: false,
      promptsSinceLastInterjection: 5,
    };
    const result = computeBuddyInterjection(buddy);
    expect(result).not.toBeNull();
    expect(result!.message.content).toContain("| o |");
    expect(result!.message.content).toContain("Sarcastic Clippy");
    expect(result!.shouldDeleteHistory).toBe(false);
  });

  it("10x Dragon may set shouldDeleteHistory to true", () => {
    const buddy: BuddyState = {
      type: "10x Dragon",
      isShiny: false,
      promptsSinceLastInterjection: 10,
    };

    // Mock Math.random to return 0.3 (< 0.5) so shouldDeleteHistory is true
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    const resultTrue = computeBuddyInterjection(buddy);
    expect(resultTrue).not.toBeNull();
    expect(resultTrue!.shouldDeleteHistory).toBe(true);
    expect(resultTrue!.message.content).toContain("o.o");

    // Mock Math.random to return 0.7 (>= 0.5) so shouldDeleteHistory is false
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const resultFalse = computeBuddyInterjection(buddy);
    expect(resultFalse).not.toBeNull();
    expect(resultFalse!.shouldDeleteHistory).toBe(false);
    expect(resultFalse!.message.content).toContain("o.o");
  });

  it("non-Dragon buddies never set shouldDeleteHistory", () => {
    const buddy: BuddyState = {
      type: "Agile Snail",
      isShiny: false,
      promptsSinceLastInterjection: 20,
    };
    for (let i = 0; i < 20; i++) {
      const result = computeBuddyInterjection(buddy);
      expect(result!.shouldDeleteHistory).toBe(false);
    }
  });

  it("uses fallback icon for unknown buddy type", () => {
    const buddy: BuddyState = {
      type: "Unknown Creature",
      isShiny: false,
      promptsSinceLastInterjection: 5,
    };
    const result = computeBuddyInterjection(buddy);
    expect(result).not.toBeNull();
    expect(result!.message.content).toContain("🐾");
  });
});

describe("submitChatMessage - achievement parsing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("extracts single achievement from response", async () => {
    const unlockAchievement = vi.fn();
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse(["Great job! [ACHIEVEMENT_UNLOCKED: first_prompt] You did it!"])
    );

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hello" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    // Advance past the setTimeout delay
    await vi.advanceTimersByTimeAsync(3000);

    expect(unlockAchievement).toHaveBeenCalledWith("first_prompt");

    expect(setIsProcessing).toHaveBeenCalledWith(false);
  });

  it("extracts first achievement from response (capped at 1 per reply)", async () => {
    const unlockAchievement = vi.fn();
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse([
        "[ACHIEVEMENT_UNLOCKED: speed_runner] Nice! ",
        "[ACHIEVEMENT_UNLOCKED: big_spender]",
      ])
    );

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hello" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    // Capped at 1 achievement per response to prevent LLM dumping all triggers at once
    expect(unlockAchievement).toHaveBeenCalledTimes(1);
    expect(unlockAchievement).toHaveBeenCalledWith("speed_runner");
  });

  it("strips achievement tags from displayed reply", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse(["Hello there [ACHIEVEMENT_UNLOCKED: test_ach] friend!"])
    );

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    // Get the final setHistory call (the last one after streaming completes)
    const lastCall = setHistory.mock.calls[setHistory.mock.calls.length - 1]!;
    const updater = lastCall[0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string }>;
    const systemMsg = result.find((m) => m.role === "system");
    expect(systemMsg).toBeDefined();
    expect(systemMsg!.content).toBe("Hello there  friend!");
    expect(systemMsg!.content).not.toContain("ACHIEVEMENT_UNLOCKED");
  });

  it("handles 429 rate limit response", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    const mockResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    const updater = setHistory.mock.calls[0]![0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string }>;
    const warning = result.find((m) => m.role === "warning");
    expect(warning).toBeDefined();
    expect(warning!.content).toContain("OpenRouter rate-limited");
  });

  it("includes upstream details on 429 from OpenRouter", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    const mockResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({
        error: {
          message: "Provider returned error",
          code: 429,
          metadata: {
            raw: "google/gemma-4-31b-it:free is temporarily rate-limited upstream. Please retry shortly.",
            provider_name: "Google AI Studio",
            is_byok: false,
          },
        },
      }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    const updater = setHistory.mock.calls[0]![0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string }>;
    const warning = result.find((m) => m.role === "warning");
    expect(warning).toBeDefined();
    expect(warning!.content).toContain("OpenRouter rate-limited");
    expect(warning!.content).toContain("gemma-4-31b-it");
    expect(warning!.content).toContain("temporarily rate-limited upstream");
    // Should NOT include the structured prefix lines
    expect(warning!.content).not.toContain("Provider:");
    expect(warning!.content).not.toContain("Upstream:");
  });

  it("handles network error", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network failure"));

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    const updater = setHistory.mock.calls[0]![0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string }>;
    const errorMsg = result.find((m) => m.role === "error");
    expect(errorMsg).toBeDefined();
    expect(errorMsg!.content).toContain("Network error");
  });

  it("handles response with no achievements", async () => {
    const unlockAchievement = vi.fn();
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse(["Just a normal reply."])
    );

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    expect(setIsProcessing).toHaveBeenCalledWith(false);
    expect(unlockAchievement).not.toHaveBeenCalled();
  });

  it("passes real token counts from stream usage to final message", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse(["Hello!"], { prompt_tokens: 150, completion_tokens: 42 })
    );

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.advanceTimersByTimeAsync(3000);

    // Get the final setHistory call
    const lastCall = setHistory.mock.calls[setHistory.mock.calls.length - 1]!;
    const updater = lastCall[0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string; tokensSent?: number; tokensReceived?: number }>;
    const systemMsg = result.find((m) => m.role === "system");
    expect(systemMsg).toBeDefined();
    expect(systemMsg!.tokensSent).toBe(150);
    expect(systemMsg!.tokensReceived).toBe(42);
  });

  it("sends apiKey in request body when provided", async () => {
    // BYOK direct-to-OpenRouter path requires VITE_ENABLE_BYOK=true.
    // .env.local pins it to false in dev, so reload the module under a stub.
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BYOK", "true");
    const { submitChatMessage: submitWithByok } = await import("../chatApi");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockStreamResponse(["reply"])
    );

    submitWithByok({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-test-key",
    });

    await vi.advanceTimersByTimeAsync(3000);

    expect(fetchSpy).toHaveBeenCalled();
    const callArgs = fetchSpy.mock.calls[0]!;
    const reqInit = callArgs[1] as RequestInit;
    const headers = reqInit.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk-test-key");
    expect(callArgs[0]).toBe("https://openrouter.ai/api/v1/chat/completions");

    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
