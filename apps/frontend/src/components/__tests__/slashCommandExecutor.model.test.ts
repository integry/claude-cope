// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SetStateAction } from "react";
import type { GameState } from "../../hooks/useGameState";

vi.mock("../../analytics", () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => null),
  clearPendingOffer: vi.fn(),
}));

import { executeSlashCommand, type SlashCommandContext } from "../slashCommandExecutor";

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
  };
  return { ...base, ...overrides };
}

function makeCtx(state: GameState): SlashCommandContext {
  const ctx = {
    state,
    setState: vi.fn((update: SetStateAction<GameState>) => {
      ctx.state = typeof update === "function" ? update(ctx.state) : update;
    }),
    setHistory: vi.fn(),
    setIsProcessing: vi.fn(),
    closeAllOverlays: vi.fn(),
    setShowStore: vi.fn(),
    setShowLeaderboard: vi.fn(),
    setShowAchievements: vi.fn(),
    setShowSynergize: vi.fn(),
    setShowHelp: vi.fn(),
    setShowAbout: vi.fn(),
    setShowPrivacy: vi.fn(),
    setShowTerms: vi.fn(),
    setShowContact: vi.fn(),
    setShowProfile: vi.fn(),
    setShowParty: vi.fn(),
    setShowUpgrade: vi.fn(),
    setBragPending: vi.fn(),
    setBuddyPendingConfirm: vi.fn(),
    unlockAchievement: vi.fn(),
    clearCount: 0,
    setClearCount: vi.fn(),
    setInputValue: vi.fn(),
    onSuggestedReply: vi.fn(),
    setSlashQuery: vi.fn(),
    setSlashIndex: vi.fn(),
    addActiveTD: vi.fn(),
    onlineCount: 1,
    onlineUsers: [],
    sendPing: vi.fn(),
    pendingReviewPing: null,
    acceptReviewPing: vi.fn(),
    brrrrrrIntervalRef: { current: null },
    triggerCompactEffect: vi.fn(),
    playChime: vi.fn(),
    playError: vi.fn(),
    setActiveTheme: vi.fn(),
    onValidSlashCommand: vi.fn(),
  } satisfies SlashCommandContext;

  return ctx;
}

function getLastReply(ctx: SlashCommandContext): string {
  const setHistoryMock = ctx.setHistory as ReturnType<typeof vi.fn>;
  const replyCall = setHistoryMock.mock.calls[setHistoryMock.mock.calls.length - 1]?.[0] as
    | ((prev: unknown[]) => unknown[])
    | undefined;
  expect(replyCall).toBeTypeOf("function");
  if (!replyCall) {
    throw new Error("Expected slash command to enqueue a history update");
  }
  const history = replyCall([]) as Array<{ role: string; content: string }>;
  return history[0]?.content ?? "";
}

describe("/model command", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lists the renamed cope models and shows regret as the default", async () => {
    const ctx = makeCtx(makeGameState());

    executeSlashCommand("/model", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    const reply = getLastReply(ctx);

    expect(reply).toContain("Current model: **regret**");
    expect(reply).toContain("`regret`");
    expect(reply).toContain("`copus`");
    expect(reply).toContain("`psychos`");
    expect(reply).not.toContain("x cost");
    expect(reply).toContain("`copus` — **Cope Copus 4.69** 🔒 Max");
    expect(reply).toContain("reset to the default model");
  });

  it("does not show the Max lock marker in the model list for Max users", async () => {
    const ctx = makeCtx(makeGameState({ proKey: "pro-test-key" }));

    executeSlashCommand("/model", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    const reply = getLastReply(ctx);

    expect(reply).toContain("`copus` — **Cope Copus 4.69**");
    expect(reply).toContain("`psychos` — **Cope Psychos (Red-Teamed)**");
    expect(reply).not.toContain("🔒 Max");
  });

  it("migrates legacy selected models when listing the current setting", async () => {
    const ctx = makeCtx(makeGameState({ selectedModel: "bogus" }));

    executeSlashCommand("/model", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBe("copus");
    const reply = getLastReply(ctx);
    expect(reply).toContain("Current model: **copus**");
    expect(reply).toContain("Migrated legacy model `bogus` to `copus`");
  });

  it("resets the selected model back to default semantics", async () => {
    const ctx = makeCtx(makeGameState({ selectedModel: "psychos" }));

    executeSlashCommand("/model clear", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBeUndefined();

    expect(getLastReply(ctx)).toContain("Model reset to the default setting");
  });

  it("selects canonical premium cope models by their new ids", async () => {
    const ctx = makeCtx(makeGameState({ proKey: "pro-test-key" }));

    executeSlashCommand("/model copus", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBe("copus");
    expect(getLastReply(ctx)).toContain("Model switched to **Cope Copus 4.69**");
    expect(getLastReply(ctx)).not.toContain("x cost");

    executeSlashCommand("/model psychos", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBe("psychos");
    expect(getLastReply(ctx)).toContain("Model switched to **Cope Psychos (Red-Teamed)**");
    expect(getLastReply(ctx)).not.toContain("x cost");
  });

  it("maps legacy selection aliases onto canonical cope ids", async () => {
    const ctx = makeCtx(makeGameState({ proKey: "pro-test-key" }));

    executeSlashCommand("/model enterprise", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBe("psychos");
    const reply = getLastReply(ctx);
    expect(reply).toContain("Legacy alias `enterprise` now maps to `psychos`");
  });
});

describe("/buddy command", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } satisfies Partial<Response> as Response)
    ));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("persists buddy removal to the server", async () => {
    const ctx = makeCtx(makeGameState({
      username: "TestUser0",
      buddy: { type: "Agile Snail", isShiny: false, promptsSinceLastInterjection: 3 },
    }));

    executeSlashCommand("/buddy remove", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();
    await Promise.resolve();

    expect(ctx.state.buddy).toEqual({ type: null, isShiny: false, promptsSinceLastInterjection: 0 });
    expect(fetch).toHaveBeenCalledWith("/api/account/update-buddy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "TestUser0", buddyType: null, isShiny: false }),
    });
    expect(getLastReply(ctx)).toContain("has been dismissed");
  });
});
