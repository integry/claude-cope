import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SetStateAction,
} from "react";
import { useLayoutEffect, useRef, useState } from "react";
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
  inputRef: RefObject<HTMLInputElement | null>;
  closeAllOverlaysPreservingNag: () => void;
  onlineCount: number;
  rank: GameState["economy"]["currentRank"];
  state: GameState;
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
  bottomRef: RefObject<HTMLDivElement | null>;
  slashQuery: string;
  slashIndex: number;
  handleSlashMenuSelect: (command: string) => void;
  runSlashCommand: (command: string) => void;
  inputValue: string;
  suggestedReply: string | null;
  isProcessing: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
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

const BUDDY_OVERLAY_BOTTOM_GAP = 8;

function getBuddyBottomOffset(
  bottomChromeNode: HTMLDivElement | null,
  footerNode: HTMLDivElement | null,
) {
  const bottomChromeHeight =
    bottomChromeNode?.getBoundingClientRect().height ?? 0;
  const footerHeight = footerNode?.getBoundingClientRect().height ?? 0;
  return Math.ceil(bottomChromeHeight + footerHeight) + BUDDY_OVERLAY_BOTTOM_GAP;
}

function getUpgradeDismissProps(
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

export function TerminalView({
  activeRegression,
  outageHp,
  activeOutageScenario,
  pendingReviewPing,
  pingAcknowledged,
  activeTheme,
  regressionGlitch,
  anyOverlayOpen,
  inputRef,
  closeAllOverlaysPreservingNag,
  onlineCount,
  rank,
  state,
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
  bottomRef,
  slashQuery,
  slashIndex,
  handleSlashMenuSelect,
  runSlashCommand,
  inputValue,
  suggestedReply,
  isProcessing,
  handleChange,
  handleKeyDown,
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
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomChromeRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [buddyBottomOffset, setBuddyBottomOffset] = useState(
    BUDDY_OVERLAY_BOTTOM_GAP,
  );

  useLayoutEffect(() => {
    const bottomChromeNode = bottomChromeRef.current;
    const footerNode = footerRef.current;
    if (!bottomChromeNode && !footerNode) {
      return undefined;
    }

    const updateBottomOffset = () => {
      const nextOffset = getBuddyBottomOffset(
        bottomChromeRef.current,
        footerRef.current,
      );
      setBuddyBottomOffset((currentOffset) =>
        currentOffset === nextOffset ? currentOffset : nextOffset,
      );
    };

    updateBottomOffset();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateBottomOffset);

      if (bottomChromeNode) {
        resizeObserver.observe(bottomChromeNode);
      }
      if (footerNode) {
        resizeObserver.observe(footerNode);
      }
    }
    window.addEventListener("resize", updateBottomOffset);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBottomOffset);
    };
  }, []);

  const upgradeDismissProps = getUpgradeDismissProps(
    pendingNagCommand,
    handleUpgradeNagClose,
    handleManualUpgradeDismiss,
  );

  const handleTickerCommand = (command: string) => {
    closeAllOverlaysPreservingNag();
    runSlashCommand(command);
  };

  return (
    <div
      ref={terminalContainerRef}
      className={`relative ${terminalContainerClassName({ activeRegression, outageHp, pendingReviewPing, pingAcknowledged, activeTheme })}`}
      style={{
        ...parseGlitchStyle(regressionGlitch),
        backgroundColor: outageHp !== null ? undefined : "var(--color-bg)",
        color: "var(--color-text)",
      }}
      onClick={() => {
        if (!anyOverlayOpen && !window.getSelection()?.toString()) {
          inputRef.current?.focus();
        }
      }}
    >
      <div className="shrink-0">
        <Ticker
          onExpand={() => {
            closeAllOverlaysPreservingNag();
            setShowParty(true);
          }}
          onSlashCommand={handleTickerCommand}
          onlineCount={onlineCount}
        />
        {outageHp !== null && activeOutageScenario && (
          <OutageBar outageHp={outageHp} scenario={activeOutageScenario} />
        )}
        <HeaderBar
          rank={rank}
          currentTD={state.economy.currentTD}
          quotaPercent={state.economy.quotaPercent}
          outageHp={outageHp}
          activeMultiplier={
            calculateActiveMultiplier(state.inventory, state.upgrades) *
            state.economy.tdMultiplier
          }
          username={state.username}
          isBYOK={BYOK_ENABLED && !!state.apiKey}
          isMax={!!state.proKey || !!state.proKeyHash}
          byokTotalCost={state.byokTotalCost}
          onProfileClick={handleProfileClick}
          onHelpClick={() => {
            closeAllOverlaysPreservingNag();
            setShowHelp(true);
          }}
          onAboutClick={() => {
            closeAllOverlaysPreservingNag();
            setShowAbout(true);
          }}
          onSlashMenuClick={() => {
            setInputValue("/");
            setSlashQuery("/");
            setSlashIndex(0);
            inputRef.current?.focus();
          }}
          onUpgradeClick={() => {
            closeAllOverlaysPreservingNag();
            setShowUpgrade(true);
            window.history.pushState(null, "", "/upgrade");
          }}
        />
      </div>
      <div
        className={`flex-1 min-h-0 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}
      >
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        <MessageList
          history={history}
          messageKeys={messageKeys}
          initialHistoryLen={initialHistoryLen}
          promptString={promptString}
          activeTicketId={state.activeTicket?.id}
          username={state.username}
          onSlashCommand={handleSlashCommandClick}
        />
        <div ref={bottomRef} />
      </div>
      <BuddyOverlay buddy={state.buddy} bottomOffset={buddyBottomOffset} containerRef={terminalContainerRef} />
      <div ref={bottomChromeRef} className="shrink-0" data-terminal-bottom-chrome="true">
        <SprintProgressBar
          id={state.activeTicket?.id}
          title={state.activeTicket?.title}
          sprintProgress={state.activeTicket?.sprintProgress}
          sprintGoal={state.activeTicket?.sprintGoal}
          onSlashCommand={handleSlashCommandClick}
        />
        <div className="terminal-command-shell relative border-b border-white/20">
          {slashQuery && (
            <SlashMenu
              query={slashQuery}
              activeIndex={slashIndex}
              totalTechnicalDebt={state.economy.totalTDEarned}
              paidUser={isPaidUser(state)}
              onSelect={handleSlashMenuSelect}
            />
          )}
          <CommandLine
            ref={inputRef}
            value={inputValue}
            disabled={isProcessing || isBooting || anyOverlayOpen}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            promptString={promptString}
            placeholder={suggestedReply ?? undefined}
          />
        </div>
      </div>
      <TerminalOverlays
        showStore={showStore}
        showLeaderboard={showLeaderboard}
        showAchievements={showAchievements}
        showHelp={showHelp}
        showAbout={showAbout}
        showPrivacy={showPrivacy}
        showTerms={showTerms}
        showContact={showContact}
        showProfile={showProfile}
        showParty={showParty}
        showSynergize={showSynergize}
        showUpgrade={showUpgrade}
        state={state}
        buyGenerator={buyGenerator}
        buyUpgrade={buyUpgrade}
        buyTheme={buyTheme}
        setActiveTheme={setActiveTheme}
        setShowStore={setShowStore}
        setShowLeaderboard={setShowLeaderboard}
        setShowAchievements={setShowAchievements}
        setShowHelp={setShowHelp}
        setShowAbout={setShowAbout}
        setShowPrivacy={setShowPrivacy}
        setShowTerms={setShowTerms}
        setShowContact={setShowContact}
        setShowProfile={setShowProfile}
        setShowParty={setShowParty}
        setShowSynergize={setShowSynergize}
        setIsProcessing={setIsProcessing}
        setHistory={setHistory}
        onUpgradeDismiss={upgradeDismissProps.onUpgradeDismiss}
        upgradeDismissMode={upgradeDismissProps.upgradeDismissMode}
        upgradeDismissPhase={upgradeNagDismissPhase}
        upgradeDismissEffect={upgradeNagDismissEffect}
      />
      <div ref={footerRef}>
        <TerminalFooter
          closeAllOverlays={closeAllOverlaysPreservingNag}
          setShowTerms={setShowTerms}
          setShowPrivacy={setShowPrivacy}
          setShowAbout={setShowAbout}
          setShowHelp={setShowHelp}
          setShowContact={setShowContact}
        />
      </div>
    </div>
  );
}
