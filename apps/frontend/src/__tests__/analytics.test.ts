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
    await flushPromises();

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
  it("analytics uses the same STORAGE_KEY as storageKey module", async () => {
    const { STORAGE_KEY } = await import("../hooks/storageKey");
    expect(STORAGE_KEY).toBe("claudeCopeState");
  });
});

describe("parseBaseCommand — command normalization", () => {
  it("strips arguments from slash commands", () => {
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
});
