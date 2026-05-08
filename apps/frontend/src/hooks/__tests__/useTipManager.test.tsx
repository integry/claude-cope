// @vitest-environment jsdom
import { act } from "react";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BACKLOG_REMINDER_TIPS, IDLE_TIPS, MILESTONE_TIPS, getContextualTip } from "../../game/tips";
import { useTipManager } from "../useTipManager";
import type { GameState, Message } from "../useGameState";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    ...overrides,
  };
}

type HarnessHandle = {
  recordEnter: () => void;
  recordValidCommand: (baseCommand?: string) => void;
  recordMessageWithoutTicket: () => void;
  setOnlineCount: (value: number) => void;
  setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
  getHistory: () => Message[];
};

const Harness = forwardRef<HarnessHandle>(function Harness(_, ref) {
  const [history, setHistory] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>(() => makeState());
  const [onlineCount, setOnlineCount] = useState(2);
  const manager = useTipManager({ isBooting: false, gameState, onlineCount, setHistory });

  useImperativeHandle(ref, () => ({
    ...manager,
    setOnlineCount,
    setGameState,
    getHistory: () => history,
  }), [history, manager]);

  return null;
});

describe("useTipManager", () => {
  let container: HTMLDivElement;
  let root: Root;
  let ref: React.RefObject<HarnessHandle | null>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    ref = React.createRef<HarnessHandle>();
    act(() => {
      root.render(<Harness ref={ref} />);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("fires an idle-specific tip after 45 seconds of inactivity following Enter", () => {
    act(() => {
      ref.current?.recordEnter();
      vi.advanceTimersByTime(45_000);
    });

    const history = ref.current?.getHistory() ?? [];
    expect(history[history.length - 1]?.content).toBe(IDLE_TIPS[0]?.text);
  });

  it("shows a milestone tip on every sixth valid command for an unused command", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        ref.current?.recordValidCommand("/help");
      }
      vi.runOnlyPendingTimers();
    });

    expect(ref.current?.getHistory()).toHaveLength(1);
    expect(ref.current?.getHistory()[0]?.content).toBe(MILESTONE_TIPS[1]?.text);
  });

  it("fires contextual tips when tracked game states are reached", () => {
    act(() => {
      ref.current?.setGameState((prev) => ({
        ...prev,
        economy: { ...prev.economy, currentTD: 1_200 },
      }));
      ref.current?.setOnlineCount(1);
      vi.runOnlyPendingTimers();
    });

    expect(ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("td_1000"),
      getContextualTip("lone_user_online"),
    ]);
  });

  it("reminds the user to use the backlog after 6-7 chat messages without an active ticket", () => {
    act(() => {
      for (let i = 0; i < 6; i++) {
        ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(ref.current?.getHistory().map((message) => message.content)).toEqual([
      BACKLOG_REMINDER_TIPS[0]?.text,
    ]);
  });

  it("resets the backlog reminder streak when an active ticket is opened", () => {
    act(() => {
      for (let i = 0; i < 5; i++) {
        ref.current?.recordMessageWithoutTicket();
      }
    });

    act(() => {
      ref.current?.setGameState((prev) => ({
        ...prev,
        activeTicket: { id: "COPE-1", title: "Fix prod", sprintProgress: 0, sprintGoal: 100 },
      }));
    });

    act(() => {
      ref.current?.recordMessageWithoutTicket();
      ref.current?.setGameState((prev) => ({ ...prev, activeTicket: null }));
    });

    act(() => {
      ref.current?.recordMessageWithoutTicket();
    });

    expect(ref.current?.getHistory()).toHaveLength(0);
  });

  it("does not repeat the same backlog reminder back-to-back", () => {
    act(() => {
      for (let i = 0; i < 12; i++) {
        ref.current?.recordMessageWithoutTicket();
      }
    });

    expect(ref.current?.getHistory().map((message) => message.content)).toEqual([
      BACKLOG_REMINDER_TIPS[0]?.text,
      BACKLOG_REMINDER_TIPS[1]?.text,
    ]);
  });

  it("re-fires event-based contextual tips when the triggering event happens again", () => {
    act(() => {
      ref.current?.setOnlineCount(1);
      ref.current?.setGameState((prev) => ({
        ...prev,
        pendingCompletedTaskIds: ["COPE-1"],
      }));
    });

    act(() => {
      ref.current?.setOnlineCount(2);
      ref.current?.setGameState((prev) => ({
        ...prev,
        pendingCompletedTaskIds: ["COPE-1", "COPE-2"],
      }));
    });

    act(() => {
      ref.current?.setOnlineCount(1);
    });

    expect(ref.current?.getHistory().map((message) => message.content)).toEqual([
      getContextualTip("ticket_completed"),
      getContextualTip("lone_user_online"),
      getContextualTip("ticket_completed"),
      getContextualTip("lone_user_online"),
    ]);
  });
});
