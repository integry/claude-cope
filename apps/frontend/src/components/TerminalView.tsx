import type { ChangeEvent, Dispatch, KeyboardEvent as ReactKeyboardEvent, RefObject, SetStateAction } from "react";
import { useRef } from "react";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import HeaderBar from "./HeaderBar";
import { calculateActiveMultiplier, isPaidUser } from "../hooks/gameStateUtils";
import { parseGlitchStyle } from "./parseGlitchStyle";
import { terminalContainerClassName } from "./terminalClassName";
import { BYOK_ENABLED } from "../config";
import { TerminalFooter } from "./TerminalFooter";
import Ticker from "./Ticker";
import { OutageBar } from "./OutageBar";
import SprintProgressBar from "./SprintProgressBar";
import MessageList from "./MessageList";
import type { SlashCommandAction } from "./slashCommandDetect";
import { TerminalOverlays } from "./TerminalOverlays";
import { BuddyOverlay } from "./BuddyOverlay";
import type { GameState, Message } from "../hooks/useGameState";
import type { PendingReviewPing } from "../hooks/useMultiplayer";
import type { OverlayVisibility } from "./terminalViewUtils";
import type { UpgradeNagCloseEffect } from "./UpgradeOverlay";
import type { OutageScenario } from "@claude-cope/shared/multiplayer-types";

type TerminalViewProps = OverlayVisibility & {
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
  handleSlashCommandClick: (command: string, action: SlashCommandAction) => void;
  scrollViewportRef?: RefObject<HTMLDivElement | null>;
  scrollContentRef?: RefObject<HTMLDivElement | null>;
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

function getUpgradeDismissProps(pendingNagCommand: string | null, handleUpgradeNagClose: () => void, handleManualUpgradeDismiss: () => void) {
  const nagDismiss = pendingNagCommand !== null;
  return {
    onUpgradeDismiss: nagDismiss ? handleUpgradeNagClose : handleManualUpgradeDismiss,
    upgradeDismissMode: nagDismiss ? "nag" : "manual",
  } as const;
}

function focusTerminalInputIfEligible(isMobileViewport: boolean, anyOverlayOpen: boolean, inputRef: RefObject<HTMLInputElement | null>) {
  if (!isMobileViewport && !anyOverlayOpen && !window.getSelection()?.toString()) {
    inputRef.current?.focus();
  }
}

function createOverlayOpener(closeAllOverlaysPreservingNag: () => void, setVisible: Dispatch<SetStateAction<boolean>>) {
  return () => {
    closeAllOverlaysPreservingNag();
    setVisible(true);
  };
}

function createSlashMenuOpener(setInputValue: Dispatch<SetStateAction<string>>, setSlashQuery: Dispatch<SetStateAction<string>>, setSlashIndex: Dispatch<SetStateAction<number>>, isMobileViewport: boolean, inputRef: RefObject<HTMLInputElement | null>) {
  return () => {
    setInputValue("/");
    setSlashQuery("/");
    setSlashIndex(0);
    if (!isMobileViewport) inputRef.current?.focus();
  };
}

function createUpgradeOpener(closeAllOverlaysPreservingNag: () => void, setShowUpgrade: Dispatch<SetStateAction<boolean>>) {
  return () => {
    closeAllOverlaysPreservingNag();
    setShowUpgrade(true);
    window.history.pushState(null, "", "/upgrade");
  };
}

function createTickerCommandRunner(closeAllOverlaysPreservingNag: () => void, runSlashCommand: (command: string) => void) {
  return (command: string) => {
    closeAllOverlaysPreservingNag();
    runSlashCommand(command);
  };
}

function renderBuddyDock(buddy: GameState["buddy"]) {
  if (!buddy.type) return null;
  return <div className="terminal-buddy-dock hidden md:flex"><BuddyOverlay buddy={buddy} /></div>;
}

export function TerminalView({
  activeRegression,
  outageHp,
  activeOutageScenario,
  pendingReviewPing,
  pingAcknowledged,
  activeTheme,
  regressionGlitch,
  anyOverlayOpen,
  isMobileViewport,
  inputRef,
  closeAllOverlaysPreservingNag,
  onlineCount,
  rank,
  state,
  handleHomeClick,
  handleProfileClick,
  setShowHelp,
  setShowAbout,
  setInputValue,
  setSlashQuery,
  setSlashIndex,
  setShowUpgrade,
  compactEffect,
  isBooting,
  history,
  messageKeys,
  initialHistoryLen,
  promptString,
  handleSlashCommandClick,
  scrollViewportRef,
  scrollContentRef,
  bottomRef,
  slashQuery,
  slashIndex,
  handleSlashMenuSelect,
  runSlashCommand,
  inputValue,
  suggestedReply,
  acceptSuggestedReply,
  isProcessing,
  handleChange,
  handleKeyDown,
  handleSubmit,
  buyGenerator,
  buyUpgrade,
  buyTheme,
  setActiveTheme,
  showStore,
  showLeaderboard,
  showAchievements,
  showSynergize,
  showHelp,
  showAbout,
  showPrivacy,
  showTerms,
  showContact,
  showProfile,
  showParty,
  showUpgrade,
  setShowStore,
  setShowLeaderboard,
  setShowAchievements,
  setShowPrivacy,
  setShowTerms,
  setShowContact,
  setShowProfile,
  setShowParty,
  setShowSynergize,
  setIsProcessing,
  setHistory,
  pendingNagCommand,
  handleUpgradeNagClose,
  handleManualUpgradeDismiss,
  upgradeNagDismissPhase,
  upgradeNagDismissEffect,
}: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const bottomChromeRef = useRef<HTMLDivElement | null>(null);
  const upgradeDismissProps = getUpgradeDismissProps(pendingNagCommand, handleUpgradeNagClose, handleManualUpgradeDismiss);
  const openHelp = createOverlayOpener(closeAllOverlaysPreservingNag, setShowHelp);
  const openAbout = createOverlayOpener(closeAllOverlaysPreservingNag, setShowAbout);
  const openStore = createOverlayOpener(closeAllOverlaysPreservingNag, setShowStore);
  const openLeaderboard = createOverlayOpener(closeAllOverlaysPreservingNag, setShowLeaderboard);
  const openAchievements = createOverlayOpener(closeAllOverlaysPreservingNag, setShowAchievements);
  const openContact = createOverlayOpener(closeAllOverlaysPreservingNag, setShowContact);
  const openParty = createOverlayOpener(closeAllOverlaysPreservingNag, setShowParty);
  const openUpgrade = createUpgradeOpener(closeAllOverlaysPreservingNag, setShowUpgrade);
  const openSlashMenu = createSlashMenuOpener(setInputValue, setSlashQuery, setSlashIndex, isMobileViewport, inputRef);
  const handleTickerCommand = createTickerCommandRunner(closeAllOverlaysPreservingNag, runSlashCommand);

  return (
    <div ref={terminalRef} className={`relative ${terminalContainerClassName({ activeRegression, outageHp, pendingReviewPing, pingAcknowledged, activeTheme })}`} style={{ ...parseGlitchStyle(regressionGlitch), backgroundColor: outageHp !== null ? undefined : "var(--color-bg)", color: "var(--color-text)" }} onClick={() => focusTerminalInputIfEligible(isMobileViewport, anyOverlayOpen, inputRef)}>
      <div className="shrink-0">
        <Ticker onExpand={openParty} onSlashCommand={handleTickerCommand} onlineCount={onlineCount} />
        {outageHp !== null && activeOutageScenario && <OutageBar outageHp={outageHp} scenario={activeOutageScenario} />}
        <HeaderBar
          rank={rank} currentTD={state.economy.currentTD} quotaPercent={state.economy.quotaPercent} outageHp={outageHp}
          activeMultiplier={calculateActiveMultiplier(state.inventory, state.upgrades) * state.economy.tdMultiplier}
          username={state.username} isBYOK={BYOK_ENABLED && !!state.apiKey} isMax={Boolean(state.proKey || state.proKeyHash || state.isPro || state.hasSessionPro)}
          isExecutiveSupporter={Boolean(state.isExecutiveSupporter)} byokTotalCost={state.byokTotalCost} onHomeClick={handleHomeClick} onProfileClick={handleProfileClick}
          onHelpClick={openHelp} onAboutClick={openAbout} onStoreClick={openStore} onLeaderboardClick={openLeaderboard} onAchievementsClick={openAchievements} onContactClick={openContact}
          onSlashMenuClick={openSlashMenu} onUpgradeClick={openUpgrade}
        />
      </div>
      <div ref={scrollViewportRef} data-terminal-scroll-viewport="true" className={`flex-1 min-h-0 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}>
        <div ref={scrollContentRef} data-terminal-scroll-content="true">
          {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
          <MessageList history={history} messageKeys={messageKeys} initialHistoryLen={initialHistoryLen} promptString={promptString} activeTicketId={state.activeTicket?.id} username={state.username} onSlashCommand={handleSlashCommandClick} />
          <div ref={bottomRef} />
        </div>
      </div>
      <div ref={bottomChromeRef} className="terminal-bottom-chrome shrink-0 gap-4 md:flex md:items-end md:justify-between" data-terminal-bottom-chrome="true">
        <div className="min-w-0 flex-1">
          <SprintProgressBar id={state.activeTicket?.id} title={state.activeTicket?.title} sprintProgress={state.activeTicket?.sprintProgress} sprintGoal={state.activeTicket?.sprintGoal} onSlashCommand={handleSlashCommandClick} />
          <div className="terminal-command-shell relative border-b border-white/20">
            {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} totalTechnicalDebt={state.economy.totalTDEarned} paidUser={isPaidUser(state)} isExecutiveSupporter={Boolean(state.isExecutiveSupporter)} onSelect={handleSlashMenuSelect} />}
            <CommandLine ref={inputRef} value={inputValue} disabled={isProcessing || isBooting || anyOverlayOpen} onChange={handleChange} onKeyDown={handleKeyDown} onSubmit={handleSubmit} promptString={promptString} placeholder={suggestedReply ?? undefined} onPlaceholderAccept={acceptSuggestedReply} />
          </div>
        </div>
        {renderBuddyDock(state.buddy)}
      </div>
      <TerminalOverlays
        showStore={showStore} showLeaderboard={showLeaderboard} showAchievements={showAchievements} showHelp={showHelp} showAbout={showAbout} showPrivacy={showPrivacy} showTerms={showTerms}
        showContact={showContact} showProfile={showProfile} showParty={showParty} showSynergize={showSynergize} showUpgrade={showUpgrade} state={state} buyGenerator={buyGenerator}
        buyUpgrade={buyUpgrade} buyTheme={buyTheme} setActiveTheme={setActiveTheme} setShowStore={setShowStore} setShowLeaderboard={setShowLeaderboard} setShowAchievements={setShowAchievements}
        setShowHelp={setShowHelp} setShowAbout={setShowAbout} setShowPrivacy={setShowPrivacy} setShowTerms={setShowTerms} setShowContact={setShowContact} setShowProfile={setShowProfile}
        setShowParty={setShowParty} setShowSynergize={setShowSynergize} setIsProcessing={setIsProcessing} setHistory={setHistory} onUpgradeDismiss={upgradeDismissProps.onUpgradeDismiss}
        upgradeDismissMode={upgradeDismissProps.upgradeDismissMode} upgradeDismissPhase={upgradeNagDismissPhase} upgradeDismissEffect={upgradeNagDismissEffect}
      />
      <TerminalFooter closeAllOverlays={closeAllOverlaysPreservingNag} buddyType={state.buddy.type} buddyIsShiny={state.buddy.isShiny} setShowTerms={setShowTerms} setShowPrivacy={setShowPrivacy} setShowAbout={setShowAbout} setShowHelp={setShowHelp} setShowContact={setShowContact} />
    </div>
  );
}
