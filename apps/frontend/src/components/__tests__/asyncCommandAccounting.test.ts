// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SetStateAction } from "react";
import type { GameState } from "../../hooks/useGameState";
import type { Message } from "../Terminal";
import { ALL_SLASH_COMMANDS } from "../slashCommands";

vi.mock("../../analytics", () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => null),
  clearPendingOffer: vi.fn(),
  fetchRandomTicketPrompt: vi.fn(),
}));
vi.mock("../ticketCommands", async () => {
  const actual = await vi.importActual<typeof import("../ticketCommands")>("../ticketCommands");
  return {
    ...actual,
    handleTicketCommand: vi.fn(actual.handleTicketCommand),
    handleTakeCommand: vi.fn(actual.handleTakeCommand),
  };
});

import { SLASH_COMMAND_ACCOUNTING_POLICY, executeSlashCommand, type SlashCommandContext } from "../slashCommandExecutor";
import { handleTakeCommand, handleTicketCommand } from "../ticketCommands";

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

function makeCtx(state: GameState): SlashCommandContext & { getHistory: () => Message[] } {
  let history: Message[] = [];
  const ctx = {
    state,
    setState: vi.fn((update: SetStateAction<GameState>) => {
      ctx.state = typeof update === "function" ? update(ctx.state) : update;
    }),
    setHistory: vi.fn((update: SetStateAction<Message[]>) => {
      history = typeof update === "function" ? update(history) : update;
    }),
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
    onValidSlashCommand: vi.fn((baseCommand: string) => {
      ctx.setHistory((prev) => [...prev, { role: "system", content: `tip:${baseCommand}` }]);
    }),
  } satisfies SlashCommandContext;

  return Object.assign(ctx, {
    getHistory: () => history,
  });
}

describe("async slash-command accounting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("counts /sync once the command passes client-side validation, even if the request fails", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/sync COPE-123", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/sync": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/sync");
  });

  it("counts /backlog even when fetching the backlog fails", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/backlog", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/backlog": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/backlog");
  });

  it("counts plain /ticket usage as a valid command", async () => {
    const ctx = makeCtx(makeGameState());
    vi.mocked(handleTicketCommand).mockResolvedValueOnce(true);

    executeSlashCommand("/ticket", ctx);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/ticket": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/ticket");
  });

  it("does not append an extra random tip when /clear finishes", async () => {
    const ctx = makeCtx(makeGameState());

    executeSlashCommand("/clear", ctx);
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    expect(ctx.setHistory).toHaveBeenLastCalledWith([]);
    expect(ctx.state.commandUsage).toEqual({ "/clear": 1 });
    expect(ctx.onValidSlashCommand).not.toHaveBeenCalled();
  });

  it("counts async streaming commands even when they do not reply through reply()", async () => {
    const ctx = makeCtx(makeGameState({ isPro: true, proKeyHash: "hash" }));

    executeSlashCommand("/brrrrrr", ctx);
    await vi.advanceTimersByTimeAsync(1500);

    expect(ctx.state.commandUsage).toEqual({ "/brrrrrr": 1 });
    expect(ctx.getHistory().map((message) => message.content)).toContain("tip:/brrrrrr");
  });

  it("applies tracked command accounting from the policy after the command row is in history", async () => {
    const ctx = makeCtx(makeGameState());

    executeSlashCommand("/help", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/help": 1 });
    expect(ctx.getHistory().map((message) => message.content)).toEqual([
      "/help",
      "tip:/help",
    ]);
  });

  it("flushes conditional command accounting after async slash-command replies", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/backlog", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/backlog": 1 });
    expect(ctx.getHistory()[0]?.role).toBe("user");
    expect(ctx.getHistory()[0]?.content).toBe("/backlog");
    expect(ctx.getHistory()[1]?.role).toBe("error");
    expect(ctx.getHistory()[2]?.content).toBe("tip:/backlog");
  });

  it("does not count locked /take attempts as /upgrade usage", async () => {
    const ctx = makeCtx(makeGameState());
    vi.mocked(handleTakeCommand).mockImplementationOnce((_command, _state, _setState, reply, opts) => {
      reply({ role: "system", content: "locked" });
      opts.onLocked?.({
        id: "COPE-123",
        title: "Locked ticket",
        category_prefix: null,
        category_label: null,
        is_locked: true,
        tier: "premium",
        upgrade_teaser: "unlock it",
      });
      return true;
    });

    executeSlashCommand("/take 1", ctx);
    await vi.runAllTimersAsync();

    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(true);
    expect(ctx.state.commandUsage).not.toHaveProperty("/upgrade");
    expect(ctx.onValidSlashCommand).not.toHaveBeenCalledWith("/upgrade");
  });

  it("documents an explicit accounting policy for every supported slash command", () => {
    expect(Object.keys(SLASH_COMMAND_ACCOUNTING_POLICY).sort()).toEqual([...ALL_SLASH_COMMANDS].sort());
    expect(new Set(Object.values(SLASH_COMMAND_ACCOUNTING_POLICY))).toEqual(new Set(["tracked", "conditional"]));
  });
});
