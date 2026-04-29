import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("analytics — init failure recovery", () => {
  let initShouldFail: boolean;
  const mockCapture = vi.fn();
  const mockIdentify = vi.fn();
  const mockInit = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    initShouldFail = false;
    mockCapture.mockClear();
    mockIdentify.mockClear();
    mockInit.mockClear();

    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_key_123");

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
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("automatically retries after initialization failure", async () => {
    initShouldFail = true;

    const { initPostHog } = await import("../analytics");
    initPostHog();
    await flushMicrotasks();

    initShouldFail = false;
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockInit).toHaveBeenCalledTimes(2);
  });

  it("preserves pending events across init failure for retry flush", async () => {
    initShouldFail = true;

    const { initPostHog, track, identify } = await import("../analytics");
    initPostHog();

    track("early_event", { key: "value" });
    identify({ username: "player1" });

    await flushMicrotasks();

    initShouldFail = false;
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockCapture).toHaveBeenCalledWith("early_event", { key: "value" });
    expect(mockIdentify).toHaveBeenCalledWith("test-uuid", { username: "player1" });
  });
});
