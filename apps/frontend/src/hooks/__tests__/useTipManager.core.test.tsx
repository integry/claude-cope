// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDLE_TIPS, MILESTONE_TIPS, getContextualTip } from "../../game/tips";
import { makeState, remountHarness, setupHarness, teardownHarness, type RenderHarnessResult } from "./useTipManagerTestHarness";

describe("useTipManager core behavior", () => {
  let harness: RenderHarnessResult;

  beforeEach(() => {
    harness = setupHarness();
  });

  afterEach(() => {
    teardownHarness(harness);
  });

  it("fires an idle-specific tip after 45 seconds of inactivity following Enter", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    const history = harness.ref.current?.getHistory() ?? [];
    expect(history[history.length - 1]?.content).toBe(IDLE_TIPS[0]?.text);
  });

  it("does not keep streaming idle tips during the same idle stretch", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(135_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);
  });

  it("does not repeat the same idle tip within 24 hours, even after a remount", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);

    harness = remountHarness(harness);

    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[2]?.text]);
  });

  it("allows a previously shown tip again after 24 hours have passed", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);

    act(() => {
      vi.setSystemTime(new Date("2026-05-11T00:00:46Z"));
    });

    harness = remountHarness(harness);

    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);
  });

  it("does not show backlog idle tips while an active ticket is in progress", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);

    harness = remountHarness(harness, {
      initialGameState: makeState({
        activeTicket: { id: "COPE-1", title: "Fix prod", sprintProgress: 50, sprintGoal: 100 },
      }),
    });

    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[3]?.text]);
  });

  it("does not fire idle tips while interaction is intentionally blocked", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      harness.ref.current?.setBlocked(true);
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      harness.ref.current?.setBlocked(false);
      vi.advanceTimersByTime(45_000);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);
  });

  it("preserves elapsed idle time across temporary blocked states", () => {
    act(() => {
      harness.ref.current?.recordEnter();
      vi.advanceTimersByTime(40_000);
      harness.ref.current?.setBlocked(true);
      vi.advanceTimersByTime(10_000);
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      harness.ref.current?.setBlocked(false);
      vi.advanceTimersByTime(250);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([IDLE_TIPS[0]?.text]);
  });

  it("shows a milestone tip on every sixth valid command for an unused command", () => {
    act(() => {
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, totalTDEarned: 1_000 },
      }));
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(1);
    expect(harness.ref.current?.getHistory()[0]?.content).toBe(MILESTONE_TIPS[1]?.text);
  });

  it("requires a completed conversation round before another milestone tip can fire", () => {
    act(() => {
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, totalTDEarned: 1_000 },
      }));
      for (let i = 0; i < 12; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(1);

    act(() => {
      harness.ref.current?.recordConversationRound();
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      vi.runOnlyPendingTimers();
    });

    const history = harness.ref.current?.getHistory() ?? [];
    expect(history).toHaveLength(2);
    expect(history[0]?.content).toBe(MILESTONE_TIPS[1]?.text);
    expect(history[1]?.content).toBe(MILESTONE_TIPS[2]?.text);
  });

  it("still advances milestone accounting when tip rendering is suppressed", () => {
    act(() => {
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, totalTDEarned: 1_000 },
      }));
      for (let i = 0; i < 5; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      harness.ref.current?.recordValidCommand("/clear", { suppressTip: true });
      harness.ref.current?.recordValidCommand("/help");
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      for (let i = 0; i < 5; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(1);
    expect(harness.ref.current?.getHistory()[0]?.content).toBe(MILESTONE_TIPS[1]?.text);
  });

  it("does not report blocked milestone tips as emitted before the conversation round completes", () => {
    let returnValue: string | null | undefined;

    act(() => {
      harness.ref.current?.setBlocked(true);
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, totalTDEarned: 1_000 },
      }));
      for (let i = 0; i < 5; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      returnValue = harness.ref.current?.recordValidCommand("/help");
    });

    expect(returnValue).toBeNull();
    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      harness.ref.current?.setBlocked(false);
      harness.ref.current?.recordConversationRound();
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([MILESTONE_TIPS[1]?.text]);
  });

  it("fires contextual tips when tracked game states are reached", () => {
    act(() => {
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, currentTD: 1_200, totalTDEarned: 1_200 },
      }));
      harness.ref.current?.setOnlineCount(1);
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000", { totalTDEarned: 1_200 }),
    ]);
  });

  it("fires state-based contextual tips when loading directly into those states", () => {
    harness = remountHarness(harness, {
      initialGameState: makeState({
        economy: {
          currentTD: 1_200,
          totalTDEarned: 1_200,
          currentRank: "Junior Code Monkey",
          quotaPercent: 0,
          quotaLockouts: 0,
          tdMultiplier: 1,
        },
      }),
      initialOnlineCount: 1,
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000", { totalTDEarned: 1_200 }),
    ]);
  });

  it("re-fires event-based contextual tips when the triggering event happens again", () => {
    act(() => {
      harness.ref.current?.setOnlineCount(1);
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        pendingCompletedTaskIds: ["COPE-1"],
      }));
    });

    act(() => {
      harness.ref.current?.setOnlineCount(2);
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        pendingCompletedTaskIds: ["COPE-1", "COPE-2"],
      }));
    });

    act(() => {
      harness.ref.current?.recordConversationRound();
      harness.ref.current?.setOnlineCount(1);
      harness.ref.current?.recordValidCommand("/help");
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("ticket_completed"),
      getContextualTip("lone_user_online"),
    ]);
  });

  it("releases pending contextual tips one per conversation round", () => {
    act(() => {
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, currentTD: 1_200, totalTDEarned: 1_200 },
      }));
      harness.ref.current?.setOnlineCount(1);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000", { totalTDEarned: 1_200 }),
    ]);

    act(() => {
      harness.ref.current?.recordConversationRound();
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000", { totalTDEarned: 1_200 }),
    ]);

    act(() => {
      harness.ref.current?.recordValidCommand("/help");
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000", { totalTDEarned: 1_200 }),
      getContextualTip("lone_user_online"),
    ]);
  });

  it("does not repeat the same contextual tip back-to-back", () => {
    act(() => {
      harness.ref.current?.setOnlineCount(1);
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("lone_user_online"),
    ]);

    act(() => {
      harness.ref.current?.recordConversationRound();
      harness.ref.current?.setOnlineCount(2);
      harness.ref.current?.setOnlineCount(1);
      harness.ref.current?.recordValidCommand("/help");
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("lone_user_online"),
    ]);
  });

  it("does not show /store milestone or contextual tips before the store is unlocked", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordValidCommand("/help");
      }
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, currentTD: 1_200, totalTDEarned: 999 },
      }));
      vi.runOnlyPendingTimers();
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([MILESTONE_TIPS[2]?.text]);
  });
});
