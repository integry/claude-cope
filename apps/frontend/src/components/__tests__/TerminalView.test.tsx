// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import type { ComponentProps } from "react";
import { createRoot } from "react-dom/client";

import { TerminalView } from "../TerminalView";
import type { GameState } from "../../hooks/useGameState";
import { loadState } from "../../hooks/gameStateUtils";

vi.mock("../CommandLine", () => ({ default: () => <div data-testid="command-line" /> }));
vi.mock("../SlashMenu", () => ({ default: () => <div data-testid="slash-menu" /> }));
vi.mock("../HeaderBar", () => ({ default: () => <div data-testid="header-bar" /> }));
vi.mock("../TerminalFooter", () => ({ TerminalFooter: () => <div data-testid="terminal-footer" /> }));
vi.mock("../OutageBar", () => ({ OutageBar: () => <div data-testid="outage-bar" /> }));
vi.mock("../SprintProgressBar", () => ({ default: () => <div data-testid="sprint-progress" /> }));
vi.mock("../MessageList", () => ({ default: () => <div data-testid="message-list" /> }));
vi.mock("../TerminalOverlays", () => ({ TerminalOverlays: () => <div data-testid="terminal-overlays" /> }));
vi.mock("../BuddyDisplay", () => ({
  BuddyDisplay: () => <div data-testid="buddy-display" />,
  BuddyWatcherStatus: () => <div data-testid="buddy-status" />,
}));
vi.mock("../BuddyOverlay", () => ({ BuddyOverlay: () => <div data-testid="buddy-overlay" /> }));

vi.mock("../Ticker", () => ({
  default: ({ onSlashCommand }: { onSlashCommand: (command: string) => void }) => (
    <div>
      <button type="button" onClick={() => onSlashCommand("/who")}>who</button>
      <button type="button" onClick={() => onSlashCommand("/party")}>party</button>
      <button type="button" onClick={() => onSlashCommand("/leaderboard")}>leaderboard</button>
    </div>
  ),
}));

function createGameState(overrides: Partial<GameState> = {}): GameState {
  localStorage.clear();
  const baseState = loadState();
  return {
    ...baseState,
    username: "alice",
    lastLogin: 0,
    ...overrides,
  };
}

describe("TerminalView ticker shortcuts", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const renderTerminalView = (props: ComponentProps<typeof TerminalView>) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(<TerminalView {...props} />);
    });
  };

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  const createProps = (overrides: Partial<ComponentProps<typeof TerminalView>> = {}): ComponentProps<typeof TerminalView> => ({
    activeRegression: null,
    outageHp: null,
    activeOutageScenario: null,
    pendingReviewPing: null,
    pingAcknowledged: false,
    activeTheme: "default",
    regressionGlitch: null,
    anyOverlayOpen: false,
    isMobileViewport: false,
    inputRef: { current: null },
    closeAllOverlaysPreservingNag: vi.fn(),
    onlineCount: 3,
    rank: "Junior",
    state: createGameState({
      activeTheme: "default",
      economy: {
        currentTD: 0,
        totalTDEarned: 0,
        currentRank: "Junior",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
    }),
    handleHomeClick: vi.fn(),
    handleProfileClick: vi.fn(),
    setShowHelp: vi.fn(),
    setShowAbout: vi.fn(),
    setInputValue: vi.fn(),
    setSlashQuery: vi.fn(),
    setSlashIndex: vi.fn(),
    setShowUpgrade: vi.fn(),
    compactEffect: false,
    isBooting: false,
    history: [],
    messageKeys: [],
    initialHistoryLen: 0,
    promptString: ">",
    handleSlashCommandClick: vi.fn(),
    bottomRef: { current: null },
    slashQuery: "",
    slashIndex: 0,
    handleSlashMenuSelect: vi.fn(),
    runSlashCommand: vi.fn(),
    inputValue: "",
    suggestedReply: null,
    acceptSuggestedReply: vi.fn(),
    isProcessing: false,
    handleChange: vi.fn(),
    handleKeyDown: vi.fn(),
    handleSubmit: vi.fn(),
    buyGenerator: vi.fn(() => false),
    buyUpgrade: vi.fn(() => false),
    buyTheme: vi.fn(() => false),
    setActiveTheme: vi.fn(),
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
    setShowStore: vi.fn(),
    setShowLeaderboard: vi.fn(),
    setShowAchievements: vi.fn(),
    setShowPrivacy: vi.fn(),
    setShowTerms: vi.fn(),
    setShowContact: vi.fn(),
    setShowProfile: vi.fn(),
    setShowParty: vi.fn(),
    setShowSynergize: vi.fn(),
    setIsProcessing: vi.fn(),
    setHistory: vi.fn(),
    pendingNagCommand: null,
    handleUpgradeNagClose: vi.fn(),
    handleManualUpgradeDismiss: vi.fn(),
    upgradeNagDismissPhase: "idle",
    upgradeNagDismissEffect: "death-spiral",
    ...overrides,
  });

  it("opens party and leaderboard directly from ticker shortcuts", () => {
    const closeAllOverlaysPreservingNag = vi.fn();
    const runSlashCommand = vi.fn();

    renderTerminalView(createProps({
      closeAllOverlaysPreservingNag,
      runSlashCommand,
    }));

    const [whoButton, partyButton, leaderboardButton] = Array.from(container.querySelectorAll("button"));

    act(() => {
      whoButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      partyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      leaderboardButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(closeAllOverlaysPreservingNag).toHaveBeenCalledTimes(3);
    expect(runSlashCommand).toHaveBeenNthCalledWith(1, "/who");
    expect(runSlashCommand).toHaveBeenNthCalledWith(2, "/party");
    expect(runSlashCommand).toHaveBeenNthCalledWith(3, "/leaderboard");
  });
});
