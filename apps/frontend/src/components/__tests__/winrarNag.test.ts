// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  shouldShowNag,
  armNagCommand,
  dismissNagAndReplay,
} from "../winrarNagHelpers";
import type { NagRefs, QuotaCheckParams } from "../winrarNagHelpers";

/**
 * Tests for the WinRAR nag screen behavior (issue #736).
 *
 * These tests import and exercise the real production helpers from
 * winrarNagHelpers.ts — NOT local copies of the logic.
 *
 * Contract:
 *  - shouldShowNag returns true only for free-tier users with depleted quota.
 *  - armNagCommand stores the pending command in the ref and shows the overlay.
 *  - dismissNagAndReplay replays the pending command through ALL dismiss paths
 *    (ESC, backdrop, [x], mobile footer) and records it in command history.
 *  - When no pending command exists (opened via /upgrade), dismiss does nothing extra.
 */

describe("shouldShowNag (quota gate)", () => {
  it("returns true when free-tier quota is exhausted", () => {
    const params: QuotaCheckParams = {
      effectiveApiKey: undefined,
      proKey: null,
      proKeyHash: null,
      quotaPercent: 0,
    };
    expect(shouldShowNag(params)).toBe(true);
  });

  it("returns true when quota is negative", () => {
    expect(shouldShowNag({
      effectiveApiKey: undefined,
      proKey: null,
      proKeyHash: null,
      quotaPercent: -5,
    })).toBe(true);
  });

  it("returns false when quota is available", () => {
    expect(shouldShowNag({
      effectiveApiKey: undefined,
      proKey: null,
      proKeyHash: null,
      quotaPercent: 50,
    })).toBe(false);
  });

  it("returns false for BYOK users even with zero quota", () => {
    expect(shouldShowNag({
      effectiveApiKey: "sk-user-key",
      proKey: null,
      proKeyHash: null,
      quotaPercent: 0,
    })).toBe(false);
  });

  it("returns false for pro users with a proKey", () => {
    expect(shouldShowNag({
      effectiveApiKey: undefined,
      proKey: "pro-key-123",
      proKeyHash: null,
      quotaPercent: 0,
    })).toBe(false);
  });

  it("returns false for pro users with a proKeyHash", () => {
    expect(shouldShowNag({
      effectiveApiKey: undefined,
      proKey: null,
      proKeyHash: "hash-abc",
      quotaPercent: 0,
    })).toBe(false);
  });
});

describe("armNagCommand (stores pending command)", () => {
  it("stores command in ref and calls setShowUpgrade(true)", () => {
    const ref = { current: null as string | null };
    const setShowUpgrade = vi.fn();

    armNagCommand("hello world", ref, setShowUpgrade);

    expect(ref.current).toBe("hello world");
    expect(setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("overwrites a previously pending command", () => {
    const ref = { current: "old command" };
    const setShowUpgrade = vi.fn();

    armNagCommand("new command", ref, setShowUpgrade);

    expect(ref.current).toBe("new command");
  });
});

describe("dismissNagAndReplay (all dismiss paths)", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createRefs(pendingCommand: string | null): {
    refs: NagRefs;
    processCommand: ReturnType<typeof vi.fn>;
    setShowUpgrade: ReturnType<typeof vi.fn>;
    commandHistory: string[];
    setCommandHistory: ReturnType<typeof vi.fn>;
  } {
    const processCommand = vi.fn();
    const commandHistory: string[] = [];
    const setCommandHistory = vi.fn((updater: (prev: string[]) => string[]) => {
      // Correctly simulate React's functional updater: replace contents
      const next = updater([...commandHistory]);
      commandHistory.length = 0;
      commandHistory.push(...next);
    });

    return {
      refs: {
        pendingNagCommandRef: { current: pendingCommand },
        processCommandRef: { current: processCommand },
      },
      processCommand,
      setShowUpgrade: vi.fn(),
      commandHistory,
      setCommandHistory,
    };
  }

  it("replays pending command and adds to commandHistory on dismiss", () => {
    const { refs, processCommand, setShowUpgrade, commandHistory, setCommandHistory } =
      createRefs("test command");

    dismissNagAndReplay(refs, setShowUpgrade, setCommandHistory);

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(refs.pendingNagCommandRef.current).toBeNull();
    expect(processCommand).toHaveBeenCalledWith("test command");
    expect(setCommandHistory).toHaveBeenCalledOnce();
    expect(commandHistory).toEqual(["test command"]);
  });

  it("appends replayed command after existing history entries", () => {
    const { refs, commandHistory, setCommandHistory, setShowUpgrade } =
      createRefs("replayed cmd");
    // Pre-populate existing history
    commandHistory.push("first", "second");

    dismissNagAndReplay(refs, setShowUpgrade, setCommandHistory);

    expect(commandHistory).toEqual(["first", "second", "replayed cmd"]);
    expect(commandHistory[commandHistory.length - 1]).toBe("replayed cmd");
  });

  it("does nothing extra when no pending command (opened via /upgrade)", () => {
    const { refs, processCommand, setShowUpgrade, commandHistory, setCommandHistory } =
      createRefs(null);

    dismissNagAndReplay(refs, setShowUpgrade, setCommandHistory);

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(processCommand).not.toHaveBeenCalled();
    expect(setCommandHistory).not.toHaveBeenCalled();
    expect(commandHistory).toEqual([]);
  });

  it("does not modify command history when dismissed with no pending command", () => {
    const { refs, setShowUpgrade, commandHistory, setCommandHistory } =
      createRefs(null);
    commandHistory.push("first", "second");

    dismissNagAndReplay(refs, setShowUpgrade, setCommandHistory);

    expect(commandHistory).toEqual(["first", "second"]);
  });

  it("navigates away from /upgrade path on dismiss", () => {
    const { refs, setShowUpgrade, setCommandHistory } = createRefs(null);
    // Simulate being on /upgrade
    Object.defineProperty(window, "location", {
      value: { pathname: "/upgrade" },
      writable: true,
      configurable: true,
    });

    dismissNagAndReplay(refs, setShowUpgrade, setCommandHistory);

    expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/");
  });
});
