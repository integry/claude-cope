/* eslint-disable react-refresh/only-export-components */
import { act } from "react";
import { createRef, forwardRef, useImperativeHandle, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { vi } from "vitest";
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

export type HarnessHandle = {
  recordConversationRound: () => void;
  recordEnter: () => void;
  recordValidCommand: (baseCommand?: string, options?: { suppressTip?: boolean }) => string | null;
  recordMessageWithoutTicket: () => (() => void);
  setBlocked: (value: boolean) => void;
  setOnlineCount: (value: number) => void;
  setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
  setHistory: (updater: Message[] | ((prev: Message[]) => Message[])) => void;
  getHistory: () => Message[];
};

type HarnessProps = {
  initialGameState?: GameState;
  initialOnlineCount?: number;
};

const Harness = forwardRef<HarnessHandle, HarnessProps>(function Harness({
  initialGameState = makeState(),
  initialOnlineCount = 2,
}, ref) {
  const [history, setHistory] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [onlineCount, setOnlineCount] = useState(initialOnlineCount);
  const [isBlocked, setBlocked] = useState(false);
  const manager = useTipManager({ isBooting: false, isInteractionBlocked: isBlocked, gameState, onlineCount, setHistory });

  useImperativeHandle(ref, () => ({
    ...manager,
    setBlocked: (value) => {
      flushSync(() => {
        setBlocked(value);
      });
    },
    setOnlineCount,
    setHistory,
    setGameState: (updater) => {
      flushSync(() => {
        setGameState(updater);
      });
    },
    getHistory: () => history,
  }), [history, manager]);

  return null;
});

export type RenderHarnessResult = {
  container: HTMLDivElement;
  root: Root;
  ref: RefObject<HarnessHandle | null>;
};

export function setupHarness(props: HarnessProps = {}): RenderHarnessResult {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  vi.setSystemTime(new Date("2026-05-10T00:00:00Z"));
  window.localStorage.clear();

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HarnessHandle>();

  act(() => {
    root.render(<Harness ref={ref} {...props} />);
  });

  return { container, root, ref };
}

export function teardownHarness({ container, root }: Pick<RenderHarnessResult, "container" | "root">): void {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
}

export function remountHarness(
  current: RenderHarnessResult,
  props: HarnessProps = {},
): RenderHarnessResult {
  act(() => {
    current.root.unmount();
  });

  const root = createRoot(current.container);
  const ref = createRef<HarnessHandle>();

  act(() => {
    root.render(<Harness ref={ref} {...props} />);
  });

  return { container: current.container, root, ref };
}

export { makeState };
