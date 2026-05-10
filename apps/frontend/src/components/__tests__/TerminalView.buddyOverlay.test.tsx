// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement, createRef } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { TerminalView } from "../TerminalView";
import type { GameState } from "../../hooks/gameStateUtils";
import { DEFAULT_CLOSE_EFFECT } from "../upgradeOverlayEffects";

vi.mock("../CommandLine", () => ({
  default: () => null,
}));
vi.mock("../SlashMenu", () => ({ default: () => null }));
vi.mock("../HeaderBar", () => ({ default: () => null }));
vi.mock("../TerminalFooter", () => ({
  TerminalFooter: () => createElement("div", { "data-testid": "terminal-footer" }),
}));
vi.mock("../Ticker", () => ({ default: () => null }));
vi.mock("../OutageBar", () => ({ OutageBar: () => null }));
vi.mock("../SprintProgressBar", () => ({ default: () => null }));
vi.mock("../MessageList", () => ({ default: () => null }));
vi.mock("../TerminalOverlays", () => ({ TerminalOverlays: () => null }));

class ResizeObserverMock {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const isFooterWrapper = target.firstElementChild?.getAttribute("data-testid") === "terminal-footer";
    const isBottomChrome = target.classList.contains("shrink-0");
    const height = isFooterWrapper ? 40 : isBottomChrome ? 96 : 0;
    Object.defineProperty(target, "getBoundingClientRect", {
      value: () => ({ height }),
      configurable: true,
    });
    this.callback([{ contentRect: { height } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }

  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function createState(buddyType: string | null): GameState {
  return {
    version: "1.0",
    username: "Tester",
    lastLogin: 0,
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Intern",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: {
      type: buddyType,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    pendingCompletedTaskRewards: {},
    authoritativeProfileFloor: null,
  };
}

function noop() {}

function createProps(state: GameState): React.ComponentProps<typeof TerminalView> {
  return {
    activeRegression: null,
    outageHp: null,
    activeOutageScenario: null,
    pendingReviewPing: null,
    pingAcknowledged: true,
    activeTheme: "default",
    regressionGlitch: null,
    anyOverlayOpen: false,
    inputRef: createRef<HTMLInputElement>(),
    closeAllOverlaysPreservingNag: noop,
    onlineCount: 0,
    rank: state.economy.currentRank,
    state,
    handleProfileClick: noop,
    setShowHelp: noop,
    setShowAbout: noop,
    setInputValue: noop,
    setSlashQuery: noop,
    setSlashIndex: noop,
    setShowUpgrade: noop,
    compactEffect: false,
    isBooting: true,
    history: [],
    messageKeys: [],
    initialHistoryLen: 0,
    promptString: "❯ ",
    handleSlashCommandClick: noop,
    bottomRef: createRef<HTMLDivElement>(),
    slashQuery: "",
    slashIndex: 0,
    handleSlashMenuSelect: noop,
    inputValue: "",
    suggestedReply: null,
    isProcessing: false,
    handleChange: noop,
    handleKeyDown: noop,
    buyGenerator: () => false,
    buyUpgrade: () => false,
    buyTheme: () => false,
    setActiveTheme: noop,
    showStore: false,
    showLeaderboard: false,
    showAchievements: false,
    showSynergize: false,
    showHelp: false,
    showAbout: false,
    showPrivacy: false,
    showTerms: false,
    showContact: false,
    showProfile: false,
    showParty: false,
    showUpgrade: false,
    setShowStore: noop,
    setShowLeaderboard: noop,
    setShowAchievements: noop,
    setShowPrivacy: noop,
    setShowTerms: noop,
    setShowContact: noop,
    setShowProfile: noop,
    setShowParty: noop,
    setShowSynergize: noop,
    setIsProcessing: noop,
    setHistory: noop,
    pendingNagCommand: null,
    handleUpgradeNagClose: noop,
    handleManualUpgradeDismiss: noop,
    upgradeNagDismissPhase: "idle",
    upgradeNagDismissEffect: DEFAULT_CLOSE_EFFECT,
  };
}

function renderTerminalView(state: GameState) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  const props = createProps(state);

  act(() => {
    root!.render(createElement(TerminalView, props));
  });

  return container;
}

afterEach(() => {
  if (root) {
    act(() => {
      root!.unmount();
    });
  }
  if (container) {
    document.body.removeChild(container);
  }
  root = null;
  container = null;
  vi.clearAllMocks();
});

describe("TerminalView buddy overlay", () => {
  it("renders a floating buddy overlay only when a buddy exists", () => {
    const withoutBuddy = renderTerminalView(createState(null));
    expect(withoutBuddy.querySelector(".terminal-buddy-overlay")).toBeNull();

    act(() => {
      root!.render(createElement(TerminalView, createProps(createState("Sarcastic Clippy"))));
    });

    const overlay = withoutBuddy.querySelector(".terminal-buddy-overlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.querySelector(".terminal-buddy-display")).not.toBeNull();
  });

  it("keeps buddy markup out of the inline command shell", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const overlay = view.querySelector(".terminal-buddy-overlay");
    const commandShell = view.querySelector(".terminal-command-shell");

    expect(overlay).not.toBeNull();
    expect(overlay?.textContent).toContain("Sarcastic Clippy is watching...");
    expect(commandShell?.querySelector(".terminal-buddy-display")).toBeNull();
    expect(commandShell?.textContent).not.toContain("Sarcastic Clippy is watching...");
  });

  it("anchors the overlay with a measured bottom offset instead of inline layout space", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const overlay = view.querySelector(".terminal-buddy-overlay");

    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("style")).toContain("--terminal-buddy-offset: 144px");
    expect(view.querySelector(".terminal-command-shell")?.querySelector(".terminal-buddy-overlay")).toBeNull();
    expect(view.querySelector("[data-testid='terminal-footer']")).not.toBeNull();
  });

  it("scales the overlay down against the terminal container width on narrow layouts", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const overlay = view.querySelector(".terminal-buddy-overlay") as HTMLDivElement | null;
    const terminal = view.firstElementChild as HTMLDivElement | null;

    expect(overlay).not.toBeNull();
    expect(terminal).not.toBeNull();

    Object.defineProperty(overlay!, "scrollWidth", {
      value: 440,
      configurable: true,
    });
    Object.defineProperty(terminal!, "getBoundingClientRect", {
      value: () => ({
        width: 240,
        right: 240,
      }),
      configurable: true,
    });
    Object.defineProperty(overlay!, "getBoundingClientRect", {
      value: () => ({
        right: 232,
      }),
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(overlay?.getAttribute("style")).toContain("--terminal-buddy-scale: 0.5");
  });
});
