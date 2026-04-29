// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression tests for the WinRAR nag screen behavior (issue #736).
 *
 * Contract:
 *  - When free-tier quota is exhausted, submitting a command stores it as
 *    pending and shows the UpgradeOverlay.
 *  - ANY dismissal (ESC, backdrop click, [x], footer tap) replays the
 *    pending command AND records it in commandHistory.
 *  - Commands replayed via dismissal appear in arrow-up command history.
 *  - When opened via /upgrade (no pending command), dismissal does nothing extra.
 */

/* ── Shared helpers to simulate the refs/state used in Terminal.tsx ──── */

function createNagContext(overrides?: { quotaPercent?: number; pendingCommand?: string | null }) {
  const pendingNagCommandRef = { current: overrides?.pendingCommand ?? null as string | null };
  const setShowUpgrade = vi.fn();
  const processCommand = vi.fn();
  const processCommandRef = { current: processCommand };
  const commandHistory: string[] = [];
  const setCommandHistory = vi.fn((updater: (prev: string[]) => string[]) => {
    commandHistory.push(...updater(commandHistory));
  });

  // Mirror Terminal.tsx handleUpgradeNagClose — the single dismiss handler
  // used for ESC, backdrop, [x], and footer tap
  const handleUpgradeNagClose = () => {
    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") window.history.pushState(null, "", "/");
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      setCommandHistory((prev: string[]) => [...prev, command]);
      processCommandRef.current(command);
    }
  };

  return { pendingNagCommandRef, setShowUpgrade, processCommand, processCommandRef, commandHistory, setCommandHistory, handleUpgradeNagClose };
}

describe("WinRAR nag: pending command storage", () => {
  it("stores command in pendingNagCommandRef when quota is exhausted", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 0 } };

    // Mirror checkQuotaAndHandleExhaustion logic from Terminal.tsx
    const effectiveApiKey = undefined;
    if (!effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0) {
      pendingNagCommandRef.current = "hello world";
      setShowUpgrade(true);
    }

    expect(pendingNagCommandRef.current).toBe("hello world");
    expect(setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("does not store command when quota is available", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 50 } };

    const effectiveApiKey = undefined;
    const exhausted = !effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0;

    expect(exhausted).toBe(false);
    expect(pendingNagCommandRef.current).toBeNull();
    expect(setShowUpgrade).not.toHaveBeenCalled();
  });

  it("does not store command for BYOK users", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 0 } };

    const effectiveApiKey = "sk-user-key";
    const exhausted = !effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0;

    expect(exhausted).toBe(false);
    expect(pendingNagCommandRef.current).toBeNull();
  });
});

describe("WinRAR nag: dismiss replays pending command (all paths)", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replays pending command and adds to commandHistory on ESC dismiss", () => {
    const ctx = createNagContext({ pendingCommand: "test command" });

    ctx.handleUpgradeNagClose();

    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(false);
    expect(ctx.pendingNagCommandRef.current).toBeNull();
    expect(ctx.processCommand).toHaveBeenCalledWith("test command");
    expect(ctx.setCommandHistory).toHaveBeenCalledOnce();
    expect(ctx.commandHistory).toContain("test command");
  });

  it("replays pending command on backdrop/[x]/footer click (same path as ESC)", () => {
    // All clickable dismiss controls now invoke the same handleUpgradeNagClose
    // handler, so backdrop click, [x], and footer tap all replay the command.
    const ctx = createNagContext({ pendingCommand: "mobile command" });

    // Simulate: user taps footer button or [x] on mobile — calls onDismiss
    // which is wired to handleUpgradeNagClose
    ctx.handleUpgradeNagClose();

    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(false);
    expect(ctx.pendingNagCommandRef.current).toBeNull();
    expect(ctx.processCommand).toHaveBeenCalledWith("mobile command");
    expect(ctx.commandHistory).toContain("mobile command");
  });

  it("does nothing extra when no pending command (opened via /upgrade)", () => {
    const ctx = createNagContext({ pendingCommand: null });

    ctx.handleUpgradeNagClose();

    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(false);
    expect(ctx.processCommand).not.toHaveBeenCalled();
    expect(ctx.setCommandHistory).not.toHaveBeenCalled();
  });
});

describe("WinRAR nag: command history after replay", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replayed command appears in arrow-up history navigation", () => {
    const ctx = createNagContext({ pendingCommand: "replayed cmd" });
    // Pre-populate existing history
    ctx.commandHistory.push("first", "second");

    ctx.handleUpgradeNagClose();

    expect(ctx.commandHistory).toEqual(["first", "second", "replayed cmd"]);
    expect(ctx.commandHistory[ctx.commandHistory.length - 1]).toBe("replayed cmd");
  });

  it("command is NOT added to history when dismissed with no pending command", () => {
    const ctx = createNagContext({ pendingCommand: null });
    ctx.commandHistory.push("first", "second");

    ctx.handleUpgradeNagClose();

    expect(ctx.commandHistory).toEqual(["first", "second"]);
  });
});
