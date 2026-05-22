import type { ChangeEvent, Dispatch, KeyboardEvent as ReactKeyboardEvent, RefObject, SetStateAction } from "react";
import { BuddyOverlay } from "./BuddyOverlay";
import type { SlashCommandAction } from "./slashCommandDetect";
import type { PendingReviewPing } from "../hooks/useMultiplayer";
import type { GameState, Message } from "../hooks/useGameState";
import type { OverlayVisibility } from "./terminalViewUtils";
import type { UpgradeNagCloseEffect } from "./UpgradeOverlay";
import type { OutageScenario } from "@claude-cope/shared/multiplayer-types";

export type TerminalViewProps = OverlayVisibility & {
  activeRegression: string | null;
  outageHp: number | null;
  activeOutageScenario: OutageScenario | null;
  pendingReviewPing: PendingReviewPing;
  pingAcknowledged: boolean;
  activeTheme: GameState["activeTheme"];
  regressionGlitch: string | null | undefined;
  anyOverlayOpen: boolean;
  isMobileViewport: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  closeAllOverlaysPreservingNag: () => void;
  onlineCount: number;
  rank: GameState["economy"]["currentRank"];
  state: GameState;
  handleHomeClick: () => void;
  handleProfileClick: () => void;
  setShowHelp: Dispatch<SetStateAction<boolean>>;
  setShowAbout: Dispatch<SetStateAction<boolean>>;
  setInputValue: Dispatch<SetStateAction<string>>;
  setSlashQuery: Dispatch<SetStateAction<string>>;
  setSlashIndex: Dispatch<SetStateAction<number>>;
  setShowUpgrade: Dispatch<SetStateAction<boolean>>;
  compactEffect: boolean;
  isBooting: boolean;
  history: Message[];
  messageKeys: number[];
  initialHistoryLen: number;
  promptString: string;
  handleSlashCommandClick: (
    command: string,
    action: SlashCommandAction,
  ) => void;
  scrollViewportRef?: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  slashQuery: string;
  slashIndex: number;
  handleSlashMenuSelect: (command: string) => void;
  runSlashCommand: (command: string) => void;
  inputValue: string;
  suggestedReply: string | null;
  acceptSuggestedReply: (options?: { submit?: boolean }) => void;
  isProcessing: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  buyGenerator: (generatorId: string, amount?: number) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  buyTheme: (themeId: string) => boolean;
  setActiveTheme: (id: string) => void;
  setShowStore: Dispatch<SetStateAction<boolean>>;
  setShowLeaderboard: Dispatch<SetStateAction<boolean>>;
  setShowAchievements: Dispatch<SetStateAction<boolean>>;
  setShowPrivacy: Dispatch<SetStateAction<boolean>>;
  setShowTerms: Dispatch<SetStateAction<boolean>>;
  setShowContact: Dispatch<SetStateAction<boolean>>;
  setShowProfile: Dispatch<SetStateAction<boolean>>;
  setShowParty: Dispatch<SetStateAction<boolean>>;
  setShowSynergize: Dispatch<SetStateAction<boolean>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  pendingNagCommand: string | null;
  handleUpgradeNagClose: () => void;
  handleManualUpgradeDismiss: () => void;
  upgradeNagDismissPhase: "idle" | "closing";
  upgradeNagDismissEffect: UpgradeNagCloseEffect;
};

export function getUpgradeDismissProps(
  pendingNagCommand: string | null,
  handleUpgradeNagClose: () => void,
  handleManualUpgradeDismiss: () => void,
) {
  const nagDismiss = pendingNagCommand !== null;
  return {
    onUpgradeDismiss: nagDismiss
      ? handleUpgradeNagClose
      : handleManualUpgradeDismiss,
    upgradeDismissMode: nagDismiss ? "nag" : "manual",
  } as const;
}

export function focusTerminalInputIfEligible(
  isMobileViewport: boolean,
  anyOverlayOpen: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  if (
    !isMobileViewport &&
    !anyOverlayOpen &&
    !window.getSelection()?.toString()
  ) {
    inputRef.current?.focus();
  }
}

export function createOverlayOpener(
  closeAllOverlaysPreservingNag: () => void,
  setVisible: Dispatch<SetStateAction<boolean>>,
) {
  return () => {
    closeAllOverlaysPreservingNag();
    setVisible(true);
  };
}

export function createSlashMenuOpener(
  setInputValue: Dispatch<SetStateAction<string>>,
  setSlashQuery: Dispatch<SetStateAction<string>>,
  setSlashIndex: Dispatch<SetStateAction<number>>,
  isMobileViewport: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  return () => {
    setInputValue("/");
    setSlashQuery("/");
    setSlashIndex(0);
    if (!isMobileViewport) inputRef.current?.focus();
  };
}

export function createUpgradeOpener(
  closeAllOverlaysPreservingNag: () => void,
  setShowUpgrade: Dispatch<SetStateAction<boolean>>,
) {
  return () => {
    closeAllOverlaysPreservingNag();
    setShowUpgrade(true);
    window.history.pushState(null, "", "/upgrade");
  };
}

export function createTickerCommandRunner(
  closeAllOverlaysPreservingNag: () => void,
  runSlashCommand: (command: string) => void,
) {
  return (command: string) => {
    closeAllOverlaysPreservingNag();
    runSlashCommand(command);
  };
}

export function renderBuddyDock(buddy: GameState["buddy"]) {
  if (!buddy.type) return null;
  return <div className="terminal-buddy-dock hidden md:flex"><BuddyOverlay buddy={buddy} /></div>;
}
