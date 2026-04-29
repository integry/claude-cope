import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      setItem: vi.fn((key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
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

    expect(mockInit).toHaveBeenCalledWith(
      "phc_test_key_123",
      expect.objectContaining({
        api_host: "https://ph.example.com",
        persistence: "memory",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
      }),
    );
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
    await vi.waitFor(() => expect(mockInit).toHaveBeenCalled());

    track("game_started", { level: 1 });
    expect(mockCapture).toHaveBeenCalledWith("game_started", { level: 1 });
  });

  it("track() buffers events before init completes, then flushes", async () => {
    const { initPostHog, track } = await import("../analytics");
    initPostHog();

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

    expect(mockIdentify).toHaveBeenCalledTimes(2);
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid-1234", { username: "player1" });
  });

  it("falls back to an in-memory identity when storage access throws", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new Error("storage denied");
      }),
      setItem: vi.fn(() => {
        throw new Error("storage denied");
      }),
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
      setItem: vi.fn((key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
    });
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });

    const { STORAGE_KEY } = await import("../hooks/storageKey");
    store[STORAGE_KEY] = JSON.stringify({ username: "shared_key_user" });

    const { initPostHog } = await import("../analytics");
    initPostHog();
    await vi.waitFor(() => expect(mockInit).toHaveBeenCalled());

    expect(mockIdentify).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ username: "shared_key_user" }),
    );

    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
});
