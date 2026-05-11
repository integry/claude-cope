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
  TerminalFooter: () => createElement("div", { "data-testid": "terminal-footer" }),
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
    runSlashCommand: noop,
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
  it("renders a docked buddy only when a buddy exists", () => {
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

  it("renders the buddy as a root-level overlay instead of a bottom chrome child", () => {
    const view = renderTerminalView(createState("Sarcastic Clippy"));
    const overlay = view.querySelector(".terminal-buddy-overlay");
    const bottomChrome = view.querySelector("[data-terminal-bottom-chrome='true']");
    const terminalRoot = view.firstElementChild;

    expect(overlay).not.toBeNull();
    expect(bottomChrome).not.toBeNull();
    expect(terminalRoot).not.toBeNull();
    expect(bottomChrome?.contains(overlay!)).toBe(false);
    expect(overlay?.parentElement).toBe(terminalRoot);
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(view.querySelector("[data-testid='terminal-footer']")).not.toBeNull();
  });
});
