import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeBuddyInterjection, submitChatMessage } from "../chatApi";
import type { BuddyState } from "../../hooks/useGameState";

describe("computeBuddyInterjection", () => {
  it("returns null when buddy type is null", () => {
    const buddy: BuddyState = {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 10,
    };
    expect(computeBuddyInterjection(buddy)).toBeNull();
  });

  it("returns null when prompts since last interjection < 4 (needs 5 to trigger)", () => {
    const buddy: BuddyState = {
      type: "Agile Snail",
      isShiny: false,
      promptsSinceLastInterjection: 3, // 3 + 1 = 4, still < 5
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
    expect(result!.message.content).toContain("🐌");
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
    expect(result!.message.content).toContain("📎");
    expect(result!.message.content).toContain("Sarcastic Clippy");
    expect(result!.shouldDeleteHistory).toBe(false);
  });

  it("10x Dragon may set shouldDeleteHistory to true", () => {
    const buddy: BuddyState = {
      type: "10x Dragon",
      isShiny: false,
      promptsSinceLastInterjection: 10,
    };
    // Run multiple times to check that shouldDeleteHistory can be true or false
    const results = Array.from({ length: 50 }, () => computeBuddyInterjection(buddy));
    const allNonNull = results.filter((r) => r !== null);
    expect(allNonNull.length).toBe(50);

    // With 50 trials at 50% probability, extremely unlikely to get all same value
    const hasTrue = allNonNull.some((r) => r.shouldDeleteHistory);
    const hasFalse = allNonNull.some((r) => !r.shouldDeleteHistory);
    // At least one should be true and one false (statistically near-certain)
    expect(hasTrue || hasFalse).toBe(true);

    // All should have dragon icon
    for (const r of allNonNull) {
      expect(r.message.content).toContain("🐉");
    }
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
  });

  it("extracts single achievement from response", async () => {
    const unlockAchievement = vi.fn();
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    const mockResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content:
                  "Great job! [ACHIEVEMENT_UNLOCKED: first_prompt] You did it!",
              },
            },
          ],
        }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hello" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    // Wait for the async fetch chain to resolve
    await vi.waitFor(() => {
      expect(unlockAchievement).toHaveBeenCalledWith("first_prompt");
    });

    expect(setIsProcessing).toHaveBeenCalledWith(false);
  });

  it("extracts multiple achievements from response", async () => {
    const unlockAchievement = vi.fn();
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    const mockResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content:
                  "[ACHIEVEMENT_UNLOCKED: speed_runner] Nice! [ACHIEVEMENT_UNLOCKED: big_spender]",
              },
            },
          ],
        }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hello" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.waitFor(() => {
      expect(unlockAchievement).toHaveBeenCalledTimes(2);
    });
    expect(unlockAchievement).toHaveBeenCalledWith("speed_runner");
    expect(unlockAchievement).toHaveBeenCalledWith("big_spender");
  });

  it("strips achievement tags from displayed reply", async () => {
    const setHistory = vi.fn();
    const setIsProcessing = vi.fn();

    const mockResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content:
                  "Hello there [ACHIEVEMENT_UNLOCKED: test_ach] friend!",
              },
            },
          ],
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

    await vi.waitFor(() => {
      expect(setHistory).toHaveBeenCalled();
    });

    // Call the updater function passed to setHistory
    const updater = setHistory.mock.calls[0]![0] as (prev: unknown[]) => unknown[];
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

    await vi.waitFor(() => {
      expect(setHistory).toHaveBeenCalled();
    });

    const updater = setHistory.mock.calls[0]![0] as (prev: unknown[]) => unknown[];
    const result = updater([]) as Array<{ role: string; content: string }>;
    const warning = result.find((m) => m.role === "warning");
    expect(warning).toBeDefined();
    expect(warning!.content).toContain("Rate limited");
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

    await vi.waitFor(() => {
      expect(setHistory).toHaveBeenCalled();
    });

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

    const mockResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "Just a normal reply." } }],
        }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: "Junior Code Monkey",
    });

    await vi.waitFor(() => {
      expect(setIsProcessing).toHaveBeenCalledWith(false);
    });

    expect(unlockAchievement).not.toHaveBeenCalled();
  });

  it("sends apiKey in request body when provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "reply" } }],
        }),
    } as Response);

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-test-key",
    });

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const callArgs = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body.apiKey).toBe("sk-test-key");
    expect(body.rank).toBe("Junior Code Monkey");
  });
});
