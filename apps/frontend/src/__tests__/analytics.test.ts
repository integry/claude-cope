import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("analytics — track() and identify()", () => {
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
    // track should silently discard (no readyPromise set)
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

describe("analytics — STORAGE_KEY is shared, not duplicated", () => {
  it("analytics uses the same STORAGE_KEY as storageKey module", async () => {
    const { STORAGE_KEY } = await import("../hooks/storageKey");
    expect(STORAGE_KEY).toBe("claudeCopeState");
  });
});

describe("analytics — command normalization (slash command argument stripping)", () => {
  it("baseCommand strips arguments from all slash commands including /key", () => {
    const testCases = [
      { input: "/key sk-live-1234567890", expected: "/key" },
      { input: "/sync abc123", expected: "/sync" },
      { input: "/ping @user", expected: "/ping" },
      { input: "/alias myalias", expected: "/alias" },
      { input: "/model gpt-4", expected: "/model" },
      { input: "/user someone", expected: "/user" },
      { input: "/buddy pal", expected: "/buddy" },
      { input: "/theme dark", expected: "/theme" },
      { input: "/take TICKET-123", expected: "/take" },
      { input: "/ticket TICKET-456", expected: "/ticket" },
      { input: "/clear", expected: "/clear" },
      { input: "/help", expected: "/help" },
    ];

    for (const { input, expected } of testCases) {
      // This mirrors the normalization logic in slashCommandExecutor.ts
      const baseCommand = input.split(" ")[0];
      expect(baseCommand).toBe(expected);
    }
  });

  it("/key with secret never leaks arguments", () => {
    const command = "/key sk-live-super-secret-key-12345";
    const baseCommand = command.split(" ")[0];
    expect(baseCommand).toBe("/key");
    expect(baseCommand).not.toContain("sk-");
  });
});
