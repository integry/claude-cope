import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseBaseCommand } from "../parseBaseCommand";

describe("analytics — /key disabled (BYOK off) fires SLASH_COMMAND_FAILED", () => {
  const mockTrack = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockTrack.mockClear();

    vi.stubEnv("VITE_ENABLE_BYOK", "false");
    vi.stubEnv("VITE_POSTHOG_KEY", "");

    vi.doMock("../analytics", () => ({
      track: mockTrack,
      identify: vi.fn(),
      initPostHog: vi.fn(),
    }));

    vi.doMock("../game/constants", () => ({
      PING_COST: 100,
      THEMES: [],
    }));
    vi.doMock("@claude-cope/shared/models", () => ({
      COPE_MODELS: [],
    }));
    vi.doMock("../api/profileApi", () => ({
      updateTicketServer: vi.fn(),
    }));
    vi.doMock("../hooks/profileSync", () => ({
      applyServerProfile: vi.fn(),
    }));
    vi.doMock("../components/ticketCommands", () => ({
      handleTicketCommand: vi.fn(),
      handleBacklogCommand: vi.fn(),
      handleTakeCommand: vi.fn(),
      handleAbandonCommand: vi.fn(),
    }));
    vi.doMock("../components/ticketPrompt", () => ({
      getPendingOffer: vi.fn(() => null),
      clearPendingOffer: vi.fn(),
    }));
    vi.doMock("../components/loadingPhrases", () => ({
      getRandomLoadingPhrase: () => "Loading...",
    }));
    vi.doMock("../game/tips", () => ({
      getRandomTip: () => "Tip",
    }));
    vi.doMock("../components/achievementBox", () => ({
      buildAchievementBox: vi.fn(() => ""),
    }));
    vi.doMock("../components/sabotageParams", () => ({
      parseSabotageParams: vi.fn(),
    }));

    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
    });

    vi.stubGlobal("history", { pushState: vi.fn() });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("tracks SLASH_COMMAND_FAILED when /key is used with BYOK disabled", async () => {
    const { executeSlashCommand } = await import("../components/slashCommandExecutor");
    const { AnalyticsEvents } = await import("../analyticsEvents");

    const ctx = {
      state: {
        username: "test",
        economy: { currentTD: 0, totalTDEarned: 0, tdMultiplier: 1, currentRank: "" },
        modes: { fast: false, voice: false },
        commandUsage: {} as Record<string, number>,
        achievements: [],
        inventory: {},
        upgrades: [],
        unlockedThemes: [],
        activeTheme: "default",
        buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
        activeTicket: null,
        apiKey: "",
        proKey: "",
        proKeyHash: "",
        selectedModel: undefined,
        hasSeenTicketPrompt: false,
      },
      setState: vi.fn(),
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
      onlineCount: 0,
      onlineUsers: [] as string[],
      sendPing: vi.fn(),
      pendingReviewPing: null,
      acceptReviewPing: vi.fn(),
      brrrrrrIntervalRef: { current: null },
      triggerCompactEffect: vi.fn(),
      playChime: vi.fn(),
      playError: vi.fn(),
      setActiveTheme: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    executeSlashCommand("/key sk-live-secret", ctx);

    vi.advanceTimersByTime(4000);

    expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvents.SLASH_COMMAND_ATTEMPTED, { command: "/key" });
    expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvents.SLASH_COMMAND_FAILED, {
      command: "/key",
      reason: "disabled",
    });

    const failedCalls = mockTrack.mock.calls.filter(
      (call: unknown[]) => call[0] === AnalyticsEvents.SLASH_COMMAND_FAILED,
    );
    expect(failedCalls).toHaveLength(1);
  });
});

describe("parseBaseCommand — command normalization", () => {
  it("strips arguments from known slash commands", () => {
    expect(parseBaseCommand("/key sk-live-1234567890")).toBe("/key");
    expect(parseBaseCommand("/sync abc123")).toBe("/sync");
    expect(parseBaseCommand("/ping @user")).toBe("/ping");
    expect(parseBaseCommand("/model gpt-4")).toBe("/model");
    expect(parseBaseCommand("/clear")).toBe("/clear");
    expect(parseBaseCommand("/help")).toBe("/help");
  });

  it("/key with secret never leaks arguments", () => {
    const result = parseBaseCommand("/key sk-live-super-secret-key-12345");
    expect(result).toBe("/key");
    expect(result).not.toContain("sk-");
  });

  it("handles leading/trailing whitespace", () => {
    expect(parseBaseCommand("  /key sk-live-1234")).toBe("/key");
    expect(parseBaseCommand("/help  ")).toBe("/help");
    expect(parseBaseCommand("  /clear  ")).toBe("/clear");
  });

  it("handles tabs and multiple spaces between tokens", () => {
    expect(parseBaseCommand("/key\tsk-live-1234")).toBe("/key");
    expect(parseBaseCommand("/sync   abc123")).toBe("/sync");
  });

  it("maps unknown slash commands to /unknown to prevent secret leakage", () => {
    expect(parseBaseCommand("/sk-live-super-secret")).toBe("/unknown");
    expect(parseBaseCommand("/COPE-SECRET-12345")).toBe("/unknown");
    expect(parseBaseCommand("/randomgarbage")).toBe("/unknown");
    expect(parseBaseCommand("/phc_test_key_123")).toBe("/unknown");
  });

  it("returns /unknown for malformed or empty input", () => {
    expect(parseBaseCommand("")).toBe("/unknown");
    expect(parseBaseCommand("   ")).toBe("/unknown");
    expect(parseBaseCommand("noSlash")).toBe("/unknown");
  });

  it("recognises all known game commands", () => {
    const knownCommands = [
      "/help",
      "/clear",
      "/store",
      "/synergize",
      "/user",
      "/compact",
      "/buddy",
      "/ping",
      "/theme",
      "/support",
      "/preworkout",
      "/who",
      "/about",
      "/privacy",
      "/terms",
      "/contact",
      "/fast",
      "/voice",
    ];
    knownCommands.push(
      "/blame",
      "/brrrrrr",
      "/ticket",
      "/backlog",
      "/sync",
      "/shill",
      "/key",
      "/feedback",
      "/bug",
      "/upgrade",
      "/take",
      "/accept",
      "/abandon",
      "/alias",
      "/model",
      "/leaderboard",
      "/achievements",
      "/profile",
      "/party",
    );
    for (const cmd of knownCommands) {
      expect(parseBaseCommand(cmd)).toBe(cmd);
    }
  });
});
