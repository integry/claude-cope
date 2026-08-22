import { useRef, type RefObject } from "react";
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
import { TerminalOverlays } from "./TerminalOverlays";
import {
  buildTerminalOpeners,
  focusTerminalInputIfEligible,
  getUpgradeDismissProps,
  renderBuddyDock,
  type TerminalViewProps as SharedTerminalViewProps,
} from "./terminalViewHelpers";

type TerminalViewProps = SharedTerminalViewProps & {
  scrollContentRef?: RefObject<HTMLDivElement | null>;
};
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
  const upgradeDismissProps = getUpgradeDismissProps(
    pendingNagCommand,
    handleUpgradeNagClose,
    handleManualUpgradeDismiss,
  );
  const { openHelp, openAbout, openStore, openLeaderboard, openAchievements, openContact, openParty, openUpgrade, openSlashMenu, handleTickerCommand } = buildTerminalOpeners({
    closeAllOverlaysPreservingNag,
    setShowHelp,
    setShowAbout,
    setShowStore,
    setShowLeaderboard,
    setShowAchievements,
    setShowContact,
    setShowParty,
    setShowUpgrade,
    setInputValue,
    setSlashQuery,
    setSlashIndex,
    isMobileViewport,
    inputRef,
    runSlashCommand,
  });

  return (
    <div ref={terminalRef} className={`relative ${terminalContainerClassName({ activeRegression, outageHp, pendingReviewPing, pingAcknowledged, activeTheme })}`} style={{ ...parseGlitchStyle(regressionGlitch), backgroundColor: outageHp !== null ? undefined : "var(--color-bg)", color: "var(--color-text)" }} onClick={() => focusTerminalInputIfEligible(isMobileViewport, anyOverlayOpen, inputRef)}>
      <div className="shrink-0">
        <Ticker onExpand={openParty} onSlashCommand={handleTickerCommand} onlineCount={onlineCount} />
        {outageHp !== null && activeOutageScenario && <OutageBar outageHp={outageHp} scenario={activeOutageScenario} />}
        <HeaderBar
          rank={rank}
          currentTD={state.economy.currentTD}
          quotaPercent={state.economy.quotaPercent}
          quotaRemaining={state.economy.quotaRemaining}
          quotaTotal={state.economy.quotaTotal}
          outageHp={outageHp}
          activeMultiplier={
            calculateActiveMultiplier(state.inventory, state.upgrades) *
            state.economy.tdMultiplier
          }
          username={state.username}
          isBYOK={BYOK_ENABLED && !!state.apiKey}
          isMax={Boolean(state.proKey || state.proKeyHash || state.isPro || state.hasSessionPro)}
          isExecutiveSupporter={Boolean(state.isExecutiveSupporter)}
          hasVanityTitle={Boolean(state.displayRank)}
          byokTotalCost={state.byokTotalCost}
          onHomeClick={handleHomeClick}
          onProfileClick={handleProfileClick}
          onHelpClick={openHelp}
          onAboutClick={openAbout}
          onStoreClick={openStore}
          onLeaderboardClick={openLeaderboard}
          onAchievementsClick={openAchievements}
          onContactClick={openContact}
          onSlashMenuClick={openSlashMenu}
          onUpgradeClick={openUpgrade}
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
          <div className="terminal-command-shell relative">
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
