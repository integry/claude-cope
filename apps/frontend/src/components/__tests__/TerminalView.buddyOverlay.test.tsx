// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement, createRef } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { TerminalView } from "../TerminalView";
import type { GameState } from "../../hooks/useGameState";
import { DEFAULT_CLOSE_EFFECT } from "../upgradeOverlayEffects";

vi.mock("../CommandLine", () => ({
  default: () => null,
}));
vi.mock("../SlashMenu", () => ({ default: () => null }));
vi.mock("../HeaderBar", () => ({ default: () => null }));
vi.mock("../TerminalFooter", () => ({
  TerminalFooter: ({
    buddyType,
  }: {
    buddyType: string | null;
  }) => createElement(
    "div",
    { "data-testid": "terminal-footer" },
    buddyType
      ? createElement("div", { className: "terminal-buddy-status" }, `${buddyType} is watching...`)
      : null,
  ),
}));
vi.mock("../Ticker", () => ({ default: () => null }));
vi.mock("../OutageBar", () => ({ OutageBar: () => null }));
vi.mock("../SprintProgressBar", () => ({ default: () => null }));
vi.mock("../MessageList", () => ({ default: () => null }));
vi.mock("../TerminalOverlays", () => ({ TerminalOverlays: () => null }));

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
    isMobileViewport: false,
    inputRef: createRef<HTMLInputElement>(),
    closeAllOverlaysPreservingNag: noop,
    onlineCount: 0,
    rank: state.economy.currentRank,
    state,
    handleHomeClick: noop,
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
    runSlashCommand: noop,
    inputValue: "",
    suggestedReply: null,
    acceptSuggestedReply: noop,
    isProcessing: false,
    handleChange: noop,
    handleKeyDown: noop,
    handleSubmit: noop,
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

describe("TerminalView buddy layout", () => {
  it("renders docked buddy chrome only when a buddy exists", () => {
    const withoutBuddy = renderTerminalView(createState(null));
    expect(withoutBuddy.querySelector(".terminal-buddy-dock")).toBeNull();
    expect(withoutBuddy.querySelector(".terminal-buddy-overlay")).toBeNull();
    expect(withoutBuddy.querySelector(".terminal-buddy-status")).toBeNull();

    act(() => {
      root!.render(createElement(TerminalView, createProps(createState("Sarcastic Clippy"))));
    });

    const watcherStatus = withoutBuddy.querySelector(".terminal-buddy-status");
    const overlay = withoutBuddy.querySelector(".terminal-buddy-overlay");

    expect(watcherStatus).not.toBeNull();
    expect(overlay).not.toBeNull();
  });

  it("keeps the buddy art in bottom chrome and moves watcher status into the footer", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const commandShell = view.querySelector(".terminal-command-shell");
    const bottomChrome = view.querySelector("[data-terminal-bottom-chrome='true']");
    const buddyDock = view.querySelector(".terminal-buddy-dock");
    const watcherStatus = view.querySelector("[data-testid='terminal-footer'] .terminal-buddy-status");
    const overlay = view.querySelector(".terminal-buddy-overlay");
    const overlayBuddy = overlay?.querySelector(".terminal-buddy-display");

    expect(buddyDock).not.toBeNull();
    expect(watcherStatus?.textContent).toContain("Sarcastic Clippy is watching...");
    expect(watcherStatus?.textContent).not.toContain("[BUDDY]");
    expect(bottomChrome?.contains(watcherStatus!)).toBe(false);
    expect(overlayBuddy).not.toBeNull();
    expect(overlayBuddy?.textContent).not.toContain("Sarcastic Clippy is watching...");
    expect(bottomChrome?.contains(overlay!)).toBe(true);
    expect(commandShell?.querySelector(".terminal-buddy-display")).toBeNull();
    expect(commandShell?.textContent).not.toContain("Sarcastic Clippy is watching...");
  });

  it("renders the buddy dock in bottom chrome and the watcher line in the footer", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const bottomChrome = view.querySelector("[data-terminal-bottom-chrome='true']");
    const buddyDock = view.querySelector(".terminal-buddy-dock");
    const overlay = view.querySelector(".terminal-buddy-overlay");
    const footer = view.querySelector("[data-testid='terminal-footer']");
    const watcherStatus = footer?.querySelector(".terminal-buddy-status");

    expect(bottomChrome).not.toBeNull();
    expect(buddyDock).not.toBeNull();
    expect(bottomChrome?.contains(buddyDock!)).toBe(true);
    expect(overlay).not.toBeNull();
    expect(bottomChrome?.contains(overlay!)).toBe(true);
    expect(footer).not.toBeNull();
    expect(watcherStatus).not.toBeNull();
  });
});
