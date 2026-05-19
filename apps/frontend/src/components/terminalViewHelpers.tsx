import type { Dispatch, RefObject, SetStateAction } from "react";
import { BuddyOverlay } from "./BuddyOverlay";
import type { GameState } from "../hooks/useGameState";

type OverlaySetter = Dispatch<SetStateAction<boolean>>;

function createOverlayOpener(closeAllOverlaysPreservingNag: () => void, setVisible: OverlaySetter) {
  return () => {
    closeAllOverlaysPreservingNag();
    setVisible(true);
  };
}

function createSlashMenuOpener(
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

function createUpgradeOpener(closeAllOverlaysPreservingNag: () => void, setShowUpgrade: OverlaySetter) {
  return () => {
    closeAllOverlaysPreservingNag();
    setShowUpgrade(true);
    window.history.pushState(null, "", "/upgrade");
  };
}

function createTickerCommandRunner(
  closeAllOverlaysPreservingNag: () => void,
  runSlashCommand: (command: string) => void,
) {
  return (command: string) => {
    closeAllOverlaysPreservingNag();
    runSlashCommand(command);
  };
}

export function focusTerminalInputIfEligible(
  isMobileViewport: boolean,
  anyOverlayOpen: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  if (!isMobileViewport && !anyOverlayOpen && !window.getSelection()?.toString()) {
    inputRef.current?.focus();
  }
}

export function getUpgradeDismissProps(
  pendingNagCommand: string | null,
  handleUpgradeNagClose: () => void,
  handleManualUpgradeDismiss: () => void,
) {
  const nagDismiss = pendingNagCommand !== null;
  return {
    onUpgradeDismiss: nagDismiss ? handleUpgradeNagClose : handleManualUpgradeDismiss,
    upgradeDismissMode: nagDismiss ? "nag" : "manual",
  } as const;
}

export function renderBuddyDock(buddy: GameState["buddy"]) {
  if (!buddy.type) return null;
  return <div className="terminal-buddy-dock hidden md:flex"><BuddyOverlay buddy={buddy} /></div>;
}

export function buildTerminalOpeners(args: {
  closeAllOverlaysPreservingNag: () => void;
  setShowHelp: OverlaySetter;
  setShowAbout: OverlaySetter;
  setShowStore: OverlaySetter;
  setShowLeaderboard: OverlaySetter;
  setShowAchievements: OverlaySetter;
  setShowContact: OverlaySetter;
  setShowParty: OverlaySetter;
  setShowUpgrade: OverlaySetter;
  setInputValue: Dispatch<SetStateAction<string>>;
  setSlashQuery: Dispatch<SetStateAction<string>>;
  setSlashIndex: Dispatch<SetStateAction<number>>;
  isMobileViewport: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  runSlashCommand: (command: string) => void;
}) {
  const { closeAllOverlaysPreservingNag, setShowHelp, setShowAbout, setShowStore, setShowLeaderboard, setShowAchievements, setShowContact, setShowParty, setShowUpgrade, setInputValue, setSlashQuery, setSlashIndex, isMobileViewport, inputRef, runSlashCommand } = args;
  return {
    openHelp: createOverlayOpener(closeAllOverlaysPreservingNag, setShowHelp),
    openAbout: createOverlayOpener(closeAllOverlaysPreservingNag, setShowAbout),
    openStore: createOverlayOpener(closeAllOverlaysPreservingNag, setShowStore),
    openLeaderboard: createOverlayOpener(closeAllOverlaysPreservingNag, setShowLeaderboard),
    openAchievements: createOverlayOpener(closeAllOverlaysPreservingNag, setShowAchievements),
    openContact: createOverlayOpener(closeAllOverlaysPreservingNag, setShowContact),
    openParty: createOverlayOpener(closeAllOverlaysPreservingNag, setShowParty),
    openUpgrade: createUpgradeOpener(closeAllOverlaysPreservingNag, setShowUpgrade),
    openSlashMenu: createSlashMenuOpener(setInputValue, setSlashQuery, setSlashIndex, isMobileViewport, inputRef),
    handleTickerCommand: createTickerCommandRunner(closeAllOverlaysPreservingNag, runSlashCommand),
  };
}
