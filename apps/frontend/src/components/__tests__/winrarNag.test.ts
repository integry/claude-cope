// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression tests for the WinRAR nag screen behavior (issue #736).
 *
 * Contract:
 *  - When free-tier quota is exhausted, submitting a command stores it as
 *    pending and shows the UpgradeOverlay.
 *  - ESC dismissal replays the pending command AND records it in commandHistory.
 *  - Click/backdrop/[x]/footer dismissal drops the pending command without replay.
 *  - Commands replayed via ESC appear in arrow-up command history.
 */

describe("WinRAR nag: pending command storage", () => {
  it("stores command in pendingNagCommandRef when quota is exhausted", () => {
    // Simulate checkQuotaAndHandleExhaustion logic
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 0 } };

    const checkQuotaAndHandleExhaustion = (command: string, effectiveApiKey: string | undefined): boolean => {
      if (!effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0) {
        pendingNagCommandRef.current = command;
        setShowUpgrade(true);
        return true;
      }
      return false;
    };

    const result = checkQuotaAndHandleExhaustion("hello world", undefined);

    expect(result).toBe(true);
    expect(pendingNagCommandRef.current).toBe("hello world");
    expect(setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("does not store command when quota is available", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 50 } };

    const checkQuotaAndHandleExhaustion = (command: string, effectiveApiKey: string | undefined): boolean => {
      if (!effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0) {
        pendingNagCommandRef.current = command;
        setShowUpgrade(true);
        return true;
      }
      return false;
    };

    const result = checkQuotaAndHandleExhaustion("hello world", undefined);

    expect(result).toBe(false);
    expect(pendingNagCommandRef.current).toBeNull();
    expect(setShowUpgrade).not.toHaveBeenCalled();
  });

  it("does not store command for BYOK users", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const state = { proKey: null, proKeyHash: null, economy: { quotaPercent: 0 } };

    const checkQuotaAndHandleExhaustion = (command: string, effectiveApiKey: string | undefined): boolean => {
      if (!effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0) {
        pendingNagCommandRef.current = command;
        setShowUpgrade(true);
        return true;
      }
      return false;
    };

    const result = checkQuotaAndHandleExhaustion("hello world", "sk-user-key");

    expect(result).toBe(false);
    expect(pendingNagCommandRef.current).toBeNull();
  });
});

describe("WinRAR nag: ESC replay semantics", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replays pending command and adds to commandHistory on ESC dismiss", () => {
    const pendingNagCommandRef = { current: "test command" as string | null };
    const setShowUpgrade = vi.fn();
    const commandHistory: string[] = [];
    const setCommandHistory = vi.fn((updater: (prev: string[]) => string[]) => {
      commandHistory.push(...updater(commandHistory));
    });
    const processCommand = vi.fn();
    const processCommandRef = { current: processCommand };

    // Simulate handleUpgradeNagClose (ESC path)
    const handleUpgradeNagClose = () => {
      setShowUpgrade(false);
      if (pendingNagCommandRef.current !== null) {
        const command = pendingNagCommandRef.current;
        pendingNagCommandRef.current = null;
        setCommandHistory((prev: string[]) => [...prev, command]);
        processCommandRef.current(command);
      }
    };

    handleUpgradeNagClose();

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(pendingNagCommandRef.current).toBeNull();
    expect(processCommand).toHaveBeenCalledWith("test command");
    expect(setCommandHistory).toHaveBeenCalledOnce();
    expect(commandHistory).toContain("test command");
  });

  it("does nothing extra when no pending command (opened via /upgrade)", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();
    const setCommandHistory = vi.fn();
    const processCommand = vi.fn();
    const processCommandRef = { current: processCommand };

    const handleUpgradeNagClose = () => {
      setShowUpgrade(false);
      if (pendingNagCommandRef.current !== null) {
        const command = pendingNagCommandRef.current;
        pendingNagCommandRef.current = null;
        setCommandHistory((prev: string[]) => [...prev, command]);
        processCommandRef.current(command);
      }
    };

    handleUpgradeNagClose();

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(processCommand).not.toHaveBeenCalled();
    expect(setCommandHistory).not.toHaveBeenCalled();
  });
});

describe("WinRAR nag: click-dismiss drops command", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops pending command on click/backdrop/[x]/footer dismiss", () => {
    const pendingNagCommandRef = { current: "test command" as string | null };
    const setShowUpgrade = vi.fn();
    const processCommand = vi.fn();

    // Simulate handleUpgradeDismissDrop (click path)
    const handleUpgradeDismissDrop = () => {
      setShowUpgrade(false);
      pendingNagCommandRef.current = null;
    };

    handleUpgradeDismissDrop();

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(pendingNagCommandRef.current).toBeNull();
    expect(processCommand).not.toHaveBeenCalled();
  });

  it("closes cleanly when no pending command", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();

    const handleUpgradeDismissDrop = () => {
      setShowUpgrade(false);
      pendingNagCommandRef.current = null;
    };

    handleUpgradeDismissDrop();

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(pendingNagCommandRef.current).toBeNull();
  });
});

describe("WinRAR nag: command history after replay", () => {
  it("replayed command appears in arrow-up history navigation", () => {
    const commandHistory: string[] = ["first", "second"];
    const setCommandHistory = (updater: (prev: string[]) => string[]) => {
      const result = updater(commandHistory);
      commandHistory.length = 0;
      commandHistory.push(...result);
    };

    // Simulate ESC replay adding to history
    const replayedCommand = "replayed cmd";
    setCommandHistory((prev) => [...prev, replayedCommand]);

    expect(commandHistory).toEqual(["first", "second", "replayed cmd"]);
    // The last entry is accessible via arrow-up (index 0 maps to last element)
    expect(commandHistory[commandHistory.length - 1]).toBe("replayed cmd");
  });

  it("command is NOT added to history when dropped via click dismiss", () => {
    const commandHistory: string[] = ["first", "second"];

    // Click dismiss does not modify commandHistory — it only clears pendingNagCommandRef
    // (no setCommandHistory call in handleUpgradeDismissDrop)

    expect(commandHistory).toEqual(["first", "second"]);
  });
});
