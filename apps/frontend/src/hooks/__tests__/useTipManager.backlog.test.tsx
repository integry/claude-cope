// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BACKLOG_REMINDER_TIPS } from "../../game/tips";
import {
  remountHarness,
  setupHarness,
  teardownHarness,
  type HarnessHandle,
  type RenderHarnessResult,
} from "./useTipManagerTestHarness";

describe("useTipManager backlog reminders", () => {
  let harness: RenderHarnessResult;
  let rollback: ReturnType<HarnessHandle["recordMessageWithoutTicket"]> | undefined;

  beforeEach(() => {
    harness = setupHarness();
    rollback = undefined;
  });

  afterEach(() => {
    teardownHarness(harness);
  });

  it("reminds the user to use the backlog after 6-7 chat messages without an active ticket", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });

  it("does not show another backlog reminder within 24 hours, even after a remount", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);

    act(() => {
      for (let i = 0; i < 12; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);

    harness = remountHarness(harness);

    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);
  });

  it("allows backlog reminders again after 24 hours have passed", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);

    act(() => {
      vi.setSystemTime(new Date("2026-05-11T00:00:01Z"));
    });

    harness = remountHarness(harness);

    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });

  it("restores backlog reminder eligibility when a pending prompt rollback removes the tip", () => {
    act(() => {
      harness.ref.current?.setBlocked(true);
      for (let i = 0; i < 6; i++) {
        const nextRollback = harness.ref.current?.recordMessageWithoutTicket();
        if (nextRollback) {
          rollback = nextRollback;
        }
      }
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      rollback?.();
      harness.ref.current?.setBlocked(false);
      harness.ref.current?.recordConversationRound();
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });

  it("resets the backlog reminder streak when an active ticket is opened", () => {
    act(() => {
      for (let i = 0; i < 5; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        activeTicket: { id: "COPE-1", title: "Fix prod", sprintProgress: 0, sprintGoal: 100 },
      }));
      harness.ref.current?.recordMessageWithoutTicket();
      harness.ref.current?.setGameState((prev) => ({ ...prev, activeTicket: null }));
      harness.ref.current?.recordMessageWithoutTicket();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);
  });

  it("does not stream backlog reminders on every message after the first threshold", () => {
    act(() => {
      for (let i = 0; i < 20; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });

  it("requires a completed conversation round before another backlog reminder can be shown", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
      for (let i = 0; i < 12; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);

    act(() => {
      harness.ref.current?.recordConversationRound();
      vi.setSystemTime(new Date("2026-05-11T00:00:01Z"));
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([
      BACKLOG_REMINDER_TIPS[0]?.text,
      BACKLOG_REMINDER_TIPS[1]?.text,
    ]);
  });

  it("defers blocked backlog reminders until after a completed conversation round", () => {
    act(() => {
      harness.ref.current?.setBlocked(true);
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      harness.ref.current?.setBlocked(false);
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);

    act(() => {
      harness.ref.current?.recordConversationRound();
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });

  it("drops a deferred backlog reminder when an active ticket becomes relevant before the round commits", () => {
    act(() => {
      harness.ref.current?.setBlocked(true);
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        activeTicket: { id: "COPE-1", title: "Fix prod", sprintProgress: 0, sprintGoal: 100 },
      }));
      harness.ref.current?.setBlocked(false);
      harness.ref.current?.recordConversationRound();
    });

    expect(harness.ref.current?.getHistory()).toHaveLength(0);
  });

  it("restores the skipped deferred tip to the rotation after an active ticket invalidates it", () => {
    act(() => {
      harness.ref.current?.setBlocked(true);
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
      harness.ref.current?.setGameState((prev) => ({
        ...prev,
        activeTicket: { id: "COPE-1", title: "Fix prod", sprintProgress: 0, sprintGoal: 100 },
      }));
      harness.ref.current?.setBlocked(false);
      harness.ref.current?.recordConversationRound();
      harness.ref.current?.setGameState((prev) => ({ ...prev, activeTicket: null }));
      for (let i = 0; i < 6; i++) {
        harness.ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(harness.ref.current?.getHistory().map((message) => message.content)).toEqual([BACKLOG_REMINDER_TIPS[0]?.text]);
  });
});
