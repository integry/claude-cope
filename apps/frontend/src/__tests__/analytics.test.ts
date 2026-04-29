import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseBaseCommand } from "../parseBaseCommand";

/** Flush all pending microtasks / resolved promises (multiple ticks for CI reliability). */
const flushPromises = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setTimeout(r, 0));
  }
};

describe("analytics — disabled path (no POSTHOG_KEY)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_POSTHOG_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("track() does not throw when analytics is disabled", async () => {
    const { track } = await import("../analytics");
    expect(() => track("test_event", { foo: "bar" })).not.toThrow();
  });

  it("identify() does not throw when analytics is disabled", async () => {
    const { identify } = await import("../analytics");
    expect(() => identify({ username: "test" })).not.toThrow();
  });

  it("initPostHog() is a no-op when POSTHOG_KEY is empty", async () => {
    const { initPostHog, track } = await import("../analytics");
    expect(() => initPostHog()).not.toThrow();
    expect(() => track("should_discard")).not.toThrow();
  });

  it("double initPostHog() is safe", async () => {
    const { initPostHog } = await import("../analytics");
    expect(() => {
      initPostHog();
      initPostHog();
    }).not.toThrow();
  });
});

describe("analytics — enabled path (with POSTHOG_KEY)", () => {
  const mockCapture = vi.fn();
  const mockIdentify = vi.fn();
  const mockInit = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockCapture.mockClear();
    mockIdentify.mockClear();
    mockInit.mockClear();

    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_key_123");
    vi.stubEnv("VITE_POSTHOG_HOST", "https://ph.example.com");

    vi.doMock("posthog-js", () => ({
      default: {
        init: mockInit,
        capture: mockCapture,
        identify: mockIdentify,
      },
    }));

    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });

    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid-1234",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("initPostHog() dynamically imports and initializes posthog", async () => {
    const { initPostHog } = await import("../analytics");
    initPostHog();
    await flushPromises();

    expect(mockInit).toHaveBeenCalledWith("phc_test_key_123", expect.objectContaining({
      api_host: "https://ph.example.com",
      persistence: "memory",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
    }));
  });

  it("identify() is called with cope_id on init", async () => {
    const { initPostHog } = await import("../analytics");
    initPostHog();
    await flushPromises();

    expect(mockIdentify).toHaveBeenCalledWith("test-uuid-1234", expect.any(Object));
  });

  it("track() captures events after init completes", async () => {
    const { initPostHog, track } = await import("../analytics");
    initPostHog();
    // Wait until the dynamic import("posthog-js") resolves and init runs
    await vi.waitFor(() => expect(mockInit).toHaveBeenCalled());

    track("game_started", { level: 1 });
    expect(mockCapture).toHaveBeenCalledWith("game_started", { level: 1 });
  });

  it("track() buffers events before init completes, then flushes", async () => {
    const { initPostHog, track } = await import("../analytics");
    initPostHog();

    // Buffered before posthog-js finishes loading
    track("early_event_1", { a: 1 });
    track("early_event_2", { b: 2 });

    await flushPromises();

    expect(mockCapture).toHaveBeenCalledWith("early_event_1", { a: 1 });
    expect(mockCapture).toHaveBeenCalledWith("early_event_2", { b: 2 });
  });

  it("identify() buffers calls before init completes, then flushes", async () => {
    const { initPostHog, identify } = await import("../analytics");
    initPostHog();

    identify({ username: "player1" });

    await flushPromises();

    // Once for init identify, once for buffered identify
    expect(mockIdentify).toHaveBeenCalledTimes(2);
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid-1234", { username: "player1" });
  });

  it("falls back to an in-memory identity when storage access throws", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => { throw new Error("storage denied"); }),
      setItem: vi.fn(() => { throw new Error("storage denied"); }),
      removeItem: vi.fn(),
    });

    const { initPostHog, identify } = await import("../analytics");

    expect(() => initPostHog()).not.toThrow();
    await flushPromises();

    expect(mockInit).toHaveBeenCalled();
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid-1234", expect.any(Object));
    expect(() => identify({ username: "fallback-user" })).not.toThrow();
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid-1234", { username: "fallback-user" });
  });
});

describe("analytics — init failure recovery", () => {
  let initShouldFail: boolean;
  const mockCapture = vi.fn();
  const mockIdentify = vi.fn();
  const mockInit = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    initShouldFail = false;
    mockCapture.mockClear();
    mockIdentify.mockClear();
    mockInit.mockClear();

    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_key_123");

    // Use a single mock where init() conditionally throws, avoiding vitest
    // module-cache issues that arise when re-mocking posthog-js via vi.doMock.
    vi.doMock("posthog-js", () => ({
      default: {
        init: mockInit.mockImplementation(() => {
          if (initShouldFail) throw new Error("init failed");
        }),
        capture: mockCapture,
        identify: mockIdentify,
      },
    }));

    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("allows retry after initialization failure", async () => {
    initShouldFail = true;

    const { initPostHog } = await import("../analytics");
    initPostHog();
    await flushPromises();

    // init() threw inside .then(), catch handler reset the initialized flag
    initShouldFail = false;

    // Second attempt should not be blocked by initialized flag
    expect(() => initPostHog()).not.toThrow();
  });

  it("preserves pending events across init failure for retry flush", async () => {
    initShouldFail = true;

    const { initPostHog, track, identify } = await import("../analytics");
    initPostHog();

    // Queue events while init is in progress (readyPromise exists)
    track("early_event", { key: "value" });
    identify({ username: "player1" });

    await flushPromises();
    // First attempt failed — pending events should be preserved

    // Switch to success and retry
    initShouldFail = false;
    initPostHog();
    track("retry_event", { retry: true });

    await flushPromises();

    // Events from before the failure should have been flushed on successful retry
    expect(mockCapture).toHaveBeenCalledWith("early_event", { key: "value" });
    expect(mockCapture).toHaveBeenCalledWith("retry_event", { retry: true });
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid", { username: "player1" });
  });
});

describe("analytics — STORAGE_KEY is shared, not duplicated", () => {
  it("getUsernameFromGameState reads from the same STORAGE_KEY used by game state", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_key_123");

    const mockCapture = vi.fn();
    const mockIdentify = vi.fn();
    const mockInit = vi.fn();

    vi.doMock("posthog-js", () => ({
      default: {
        init: mockInit,
        capture: mockCapture,
        identify: mockIdentify,
      },
    }));

    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });

    // Write game state under the canonical STORAGE_KEY
    const { STORAGE_KEY } = await import("../hooks/storageKey");
    store[STORAGE_KEY] = JSON.stringify({ username: "shared_key_user" });

    const { initPostHog } = await import("../analytics");
    initPostHog();
    await vi.waitFor(() => expect(mockInit).toHaveBeenCalled());

    // The identify call should include the username read via STORAGE_KEY
    expect(mockIdentify).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ username: "shared_key_user" }),
    );

    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
});

describe("analytics — /key disabled (BYOK off) fires SLASH_COMMAND_FAILED", () => {
  const mockTrack = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockTrack.mockClear();

    // Disable BYOK so /key is rejected
    vi.stubEnv("VITE_ENABLE_BYOK", "false");
    vi.stubEnv("VITE_POSTHOG_KEY", "");

    // Mock analytics to capture track() calls
    vi.doMock("../analytics", () => ({
      track: mockTrack,
      identify: vi.fn(),
      initPostHog: vi.fn(),
    }));

    // Mock heavy transitive dependencies that aren't installed in test env
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

    // Stub localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });

    // Stub window.history.pushState
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

    // Advance past the setTimeout in executeSlashCommand (1500-3000ms)
    vi.advanceTimersByTime(4000);

    // Should have tracked SLASH_COMMAND_ATTEMPTED and SLASH_COMMAND_FAILED
    expect(mockTrack).toHaveBeenCalledWith(
      AnalyticsEvents.SLASH_COMMAND_ATTEMPTED,
      { command: "/key" },
    );
    expect(mockTrack).toHaveBeenCalledWith(
      AnalyticsEvents.SLASH_COMMAND_FAILED,
      { command: "/key", reason: "disabled" },
    );

    // Ensure no duplicate SLASH_COMMAND_FAILED tracking (only one call)
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
      "/help", "/clear", "/store", "/synergize", "/user", "/compact",
      "/buddy", "/ping", "/theme", "/support", "/preworkout", "/who",
      "/about", "/privacy", "/terms", "/contact", "/fast", "/voice",
      "/blame", "/brrrrrr", "/ticket", "/backlog", "/sync", "/shill",
      "/key", "/feedback", "/bug", "/upgrade", "/take", "/accept",
      "/abandon", "/alias", "/model",
      "/leaderboard", "/achievements", "/profile", "/party",
    ];
    for (const cmd of knownCommands) {
      expect(parseBaseCommand(cmd)).toBe(cmd);
    }
  });
});
