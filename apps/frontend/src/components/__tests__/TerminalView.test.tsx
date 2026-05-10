// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import type { ComponentProps } from "react";
import { createRoot } from "react-dom/client";

import { TerminalView } from "../TerminalView";

vi.mock("../CommandLine", () => ({ default: () => <div data-testid="command-line" /> }));
vi.mock("../SlashMenu", () => ({ default: () => <div data-testid="slash-menu" /> }));
vi.mock("../HeaderBar", () => ({ default: () => <div data-testid="header-bar" /> }));
vi.mock("../TerminalFooter", () => ({ TerminalFooter: () => <div data-testid="terminal-footer" /> }));
vi.mock("../OutageBar", () => ({ OutageBar: () => <div data-testid="outage-bar" /> }));
vi.mock("../SprintProgressBar", () => ({ default: () => <div data-testid="sprint-progress" /> }));
vi.mock("../MessageList", () => ({ default: () => <div data-testid="message-list" /> }));
vi.mock("../TerminalOverlays", () => ({ TerminalOverlays: () => <div data-testid="terminal-overlays" /> }));
vi.mock("../BuddyDisplay", () => ({ BuddyDisplay: () => <div data-testid="buddy-display" /> }));

vi.mock("../Ticker", () => ({
  default: ({ onSlashCommand }: { onSlashCommand?: (command: string) => void }) => (
    <div>
      <button type="button" onClick={() => onSlashCommand?.("/who")}>who</button>
      <button type="button" onClick={() => onSlashCommand?.("/party")}>party</button>
      <button type="button" onClick={() => onSlashCommand?.("/leaderboard")}>leaderboard</button>
    </div>
  ),
}));

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

  it("opens party and leaderboard directly from ticker shortcuts", () => {
    const closeAllOverlaysPreservingNag = vi.fn();
    const runSlashCommand = vi.fn();
    const setShowParty = vi.fn();
    const setShowLeaderboard = vi.fn();

    renderTerminalView({
      activeRegression: null,
      outageHp: null,
      pendingReviewPing: null,
      pingAcknowledged: false,
      activeTheme: "default",
      regressionGlitch: null,
      anyOverlayOpen: false,
      inputRef: { current: null },
      closeAllOverlaysPreservingNag,
      onlineCount: 3,
      rank: "Junior",
      state: {
        activeTheme: "default",
        economy: { currentRank: "Junior", currentTD: 0, quotaPercent: 100, tdMultiplier: 1, totalTDEarned: 0 },
        activeTicket: null,
        username: "alice",
        buddy: { type: null, isShiny: false },
      } as ComponentProps<typeof TerminalView>["state"],
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
      runSlashCommand,
      inputValue: "",
      suggestedReply: null,
      isProcessing: false,
      handleChange: vi.fn(),
      handleKeyDown: vi.fn(),
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
      setShowLeaderboard,
      setShowAchievements: vi.fn(),
      setShowPrivacy: vi.fn(),
      setShowTerms: vi.fn(),
      setShowContact: vi.fn(),
      setShowProfile: vi.fn(),
      setShowParty,
      setShowSynergize: vi.fn(),
      setIsProcessing: vi.fn(),
      setHistory: vi.fn(),
      pendingNagCommand: null,
      handleUpgradeNagClose: vi.fn(),
      handleManualUpgradeDismiss: vi.fn(),
      upgradeNagDismissPhase: "idle",
      upgradeNagDismissEffect: "death-spiral",
    });

    const [whoButton, partyButton, leaderboardButton] = Array.from(container.querySelectorAll("button"));

    act(() => {
      whoButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      partyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      leaderboardButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(closeAllOverlaysPreservingNag).toHaveBeenCalledTimes(3);
    expect(runSlashCommand).toHaveBeenCalledTimes(1);
    expect(runSlashCommand).toHaveBeenCalledWith("/who");
    expect(setShowParty).toHaveBeenCalledTimes(1);
    expect(setShowParty).toHaveBeenCalledWith(true);
    expect(setShowLeaderboard).toHaveBeenCalledTimes(1);
    expect(setShowLeaderboard).toHaveBeenCalledWith(true);
  });
});
