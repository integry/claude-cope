import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import HeaderBar from "./HeaderBar";
import { useGameState, Message } from "../hooks/useGameState";
import { calculateActiveMultiplier } from "../hooks/gameStateUtils";
import { BuddyDisplay } from "./BuddyDisplay";
import { parseGlitchStyle } from "./parseGlitchStyle";
import { terminalContainerClassName } from "./terminalClassName";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { BYOK_ENABLED } from "../config";
import { executeSlashCommand } from "./slashCommandExecutor";
import { applyServerProfile } from "../hooks/profileSync";
import { handleKeyCommand } from "./keyCommandHandler";
import { fetchRandomTicketPrompt } from "./ticketPrompt";
import { filterChatHistory } from "./filterChatHistory";
import { TerminalFooter } from "./TerminalFooter";
import Ticker from "./Ticker";
import { OutageBar, DAMAGE_COMMANDS } from "./OutageBar";
import SprintProgressBar from "./SprintProgressBar";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { useTerminalEffects } from "../hooks/useTerminalEffects";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { usePingAcknowledged } from "../hooks/usePingAcknowledged";
import { useOverlays } from "../hooks/useOverlays";
import { getRandomLoadingPhrase } from "./loadingPhrases";
import { runFreeTierDelay } from "./freeTierDelay";
import { buildSprintCallbacks } from "./buildChatSubmitArgs";
import MessageList from "./MessageList";
import type { SlashCommandAction } from "./slashCommandDetect";
import { triggerQuotaLockout, triggerInstantBan } from "./terminalHandlers";
import { TerminalOverlays } from "./TerminalOverlays";
import { useTerminalKeyboard } from "../hooks/useTerminalKeyboard";
import { handleBragSubmit, handleBuddyConfirm, tryOutageDamage } from "./terminalInputHandlers";

export type { Message };

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, buyUpgrade, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, setChatHistory, setActiveTheme, buyTheme, offlineTDEarned, clearOfflineTDEarned, updateTicketProgress } = useGameState();
  const history = state.chatHistory;
  const setHistory = setChatHistory;
  // Review-ping payouts and refunds are server-decided TD; pass `raw=true` so
  // we don't double-apply the local generator multiplier on top of them.
  const creditTD = useCallback((amount: number) => addActiveTD(amount, true), [addActiveTD]);
  // Debit only `currentTD` (spendable balance). Do NOT touch `totalTDEarned`,
  // which is a monotonic lifetime counter used for rank — paying for a review
  // shouldn't lower your rank.
  const debitTD = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        currentTD: Math.max(0, prev.economy.currentTD - amount),
      },
    }));
  }, [setState]);
  // Sender's sprint-progress boost only applies if their *current* active
  // ticket still matches the one that was reviewed — in case they've abandoned
  // and taken a different ticket between sending and acceptance.
  const activeTicketRef = useRef(state.activeTicket);
  activeTicketRef.current = state.activeTicket;
  const applyReviewSprintBoost = useCallback((ticketId: string, boost: number) => {
    if (activeTicketRef.current?.id === ticketId) updateTicketProgress(boost);
  }, [updateTicketProgress]);
  const { onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, outageHp, sendDamage } = useMultiplayer({ username: state.username, setHistory, applyOutageReward, applyOutagePenalty, creditTD, debitTD, applyReviewSprintBoost });
  const rank = state.economy.currentRank;
  const { isBooting, regressionGlitch, activeRegression } = useTerminalEffects({ history, setHistory, setState, offlineTDEarned, clearOfflineTDEarned });
  const { playError, playChime } = useSoundEffects(state.soundEnabled);
  const [instantBanReady, setInstantBanReady] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const {
    showStore, showLeaderboard, showAchievements, showSynergize,
    showHelp, showAbout, showPrivacy, showTerms, showContact,
    showProfile, showParty, showUpgrade,
    setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize,
    setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact,
    setShowProfile, setShowParty, setShowUpgrade,
    closeAllOverlays,
  } = useOverlays();
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [compactEffect, setCompactEffect] = useState(false);
  const [freeCommandCount, setFreeCommandCount] = useState(0);
  // Stop the incoming-ping screen flash once the target has noticed the ping
  // (any mouse move, tap, or keypress). The ping itself remains pending until
  // /accept or expiry — only the flashing attention-grab is dismissed.
  const pingAcknowledged = usePingAcknowledged(pendingReviewPing);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const brrrrrrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialHistoryLen = useRef(history.length);
  // Stable keys for messages — assign once, persist across re-renders
  const messageKeys = useRef<number[]>([]);
  const nextKeyId = useRef(0);
  // Grow the keys array to match history length (new messages get new IDs)
  while (messageKeys.current.length < history.length) {
    messageKeys.current.push(nextKeyId.current++);
  }
  // Shrink if history was truncated (e.g. /clear, /compact)
  if (messageKeys.current.length > history.length) {
    messageKeys.current.length = history.length;
  }
  const abortControllerRef = useRef<AbortController | null>(null);
  const freeTierDelayRef = useRef<{ cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null; batchId?: string }>({ cancelled: false, timeoutId: null });
  const pendingNagCommandRef = useRef<string | null>(null);
  const historyRef = useRef(history);
  historyRef.current = history;
  const promptString = activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";
  const isFreeTier = !state.proKey && !state.proKeyHash && !(BYOK_ENABLED && state.apiKey);

  useEffect(() => {
    return () => { const ds = freeTierDelayRef.current; ds.cancelled = true; if (ds.timeoutId) clearTimeout(ds.timeoutId); };
  }, []);

  const unlockAchievementWithSound = useCallback((id: string): boolean => {
    const isNew = unlockAchievement(id); if (isNew) playChime(); return isNew;
  }, [unlockAchievement, playChime]);

  const clearPendingNagCommand = useCallback(() => {
    pendingNagCommandRef.current = null;
  }, []);
  const closeAllOverlaysAndClearNag = useCallback(() => {
    closeAllOverlays();
    clearPendingNagCommand();
  }, [clearPendingNagCommand, closeAllOverlays]);
  const handleProfileClick = useCallback(() => {
    closeAllOverlaysAndClearNag();
    setShowProfile(true);
    window.history.pushState(null, "", `/user/${encodeURIComponent(state.username)}`);
  }, [closeAllOverlaysAndClearNag, setShowProfile, state.username]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "auto" }); }, [history]);
  // Clear pending nag command when navigating away from /upgrade via browser back/forward
  useEffect(() => {
    const onPopState = () => { if (window.location.pathname !== "/upgrade") clearPendingNagCommand(); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [clearPendingNagCommand]);

  useEffect(() => { if (!isProcessing && !isBooting) inputRef.current?.focus(); }, [isProcessing, isBooting]);

  useEffect(() => {
    if (isBooting || state.hasSeenTicketPrompt || state.activeTicket) return;
    setState((prev) => ({ ...prev, hasSeenTicketPrompt: true }));
    fetchRandomTicketPrompt(setHistory);
  }, [isBooting, state.hasSeenTicketPrompt, state.activeTicket, setState, setHistory]);

  const handleQuotaLockout = useCallback((command?: string) => {
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    // BYOK users should never be gated by platform quota
    if (effectiveApiKey) return;
    if (!state.proKey && !state.proKeyHash) {
      if (command) pendingNagCommandRef.current = command;
      // WinRAR nag: show upgrade overlay instead of the old lockout messages
      setShowUpgrade(true);
    } else {
      // Pro users: run the normal lockout flow (quota refill, etc.)
      triggerQuotaLockout({ playError, setHistory, state, unlockAchievementWithSound, resetQuota, setInstantBanReady, setState });
    }
  }, [playError, setHistory, state, unlockAchievementWithSound, resetQuota, setState, setShowUpgrade]);

  // WinRAR nag: check free tier quota exhaustion and defer command behind the nag overlay
  const checkQuotaAndHandleExhaustion = useCallback((command: string, effectiveApiKey: string | undefined): boolean => {
    if (!effectiveApiKey && !state.proKey && !state.proKeyHash && state.economy.quotaPercent <= 0) {
      handleQuotaLockout(command);
      return true;
    }
    return false;
  }, [state.proKey, state.proKeyHash, state.economy.quotaPercent, handleQuotaLockout]);

  const handleInstantBan = useCallback(() => {
    triggerInstantBan({ setInstantBanReady, setIsProcessing, playError, setHistory });
  }, [setIsProcessing, playError, setHistory]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (activeRegression === "backwards_typing" && value.length > inputValue.length) { value = value.slice(inputValue.length) + inputValue; }
    setInputValue(value); setHistoryIndex(-1); setSuggestedReply(null);
    setSlashQuery(value.startsWith("/") ? value : ""); setSlashIndex(0);
  };

  const getFilteredSlashCommands = () => SLASH_COMMANDS.filter((cmd) => {
    if (cmd === "/store" && state.economy.totalTDEarned < 1000) return false;
    return cmd.startsWith(slashQuery.toLowerCase());
  });

  const runSlashCommand = (command: string) => {
    executeSlashCommand(command, { state, setState, setHistory, setIsProcessing, closeAllOverlays: closeAllOverlaysAndClearNag, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade, setBragPending, setBuddyPendingConfirm, unlockAchievement: unlockAchievementWithSound, clearCount, setClearCount, setInputValue, onSuggestedReply: setSuggestedReply, setSlashQuery, setSlashIndex, addActiveTD, onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, brrrrrrIntervalRef, triggerCompactEffect: () => { setCompactEffect(true); setTimeout(() => setCompactEffect(false), 500); }, playChime, playError, setActiveTheme });
  };

  const runSlashCommandRef = useRef(runSlashCommand);
  runSlashCommandRef.current = runSlashCommand;

  const handleSlashCommandClick = useCallback((command: string, action: SlashCommandAction) => {
    if (action === "execute") {
      runSlashCommandRef.current(command);
    } else {
      // Prefill: write command + trailing space into input, update slash state, focus
      const prefill = command + " ";
      setInputValue(prefill);
      setSlashQuery("");
      setSlashIndex(0);
      setSuggestedReply(null);
      inputRef.current?.focus();
    }
  }, []);

  const handleBuddyInterjection = useCallback((buddyResult: ReturnType<typeof computeBuddyInterjection>) => {
    if (state.buddy.type) {
      const newCount = buddyResult ? 0 : state.buddy.promptsSinceLastInterjection + 1;
      setState((prev) => ({ ...prev, buddy: { ...prev.buddy, promptsSinceLastInterjection: newCount } }));
    }
  }, [state.buddy.type, state.buddy.promptsSinceLastInterjection, setState]);

  const processCommandRef = useRef<(command: string) => void>(() => {});
  const processCommand = async (command: string) => {
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    if (!effectiveApiKey && instantBanReady) { setHistory((prev) => [...prev, { role: "user", content: command }]); handleInstantBan(); return; }
    const buddyResult = computeBuddyInterjection(state.buddy);
    handleBuddyInterjection(buddyResult);
    const userMessage: Message = { role: "user", content: command };

    // Free-tier artificial scarcity: fake queueing delay + terminal ads
    if (isFreeTier) {
      const newCount = freeCommandCount + 1;
      setFreeCommandCount(newCount);
      setIsProcessing(true);
      const delayState = { cancelled: false, timeoutId: null as ReturnType<typeof setTimeout> | null };
      freeTierDelayRef.current = delayState;
      const completed = await runFreeTierDelay({ commandCount: newCount, userMessage, delayState, setHistory });
      if (!completed) return;
      freeTierDelayRef.current = { cancelled: false, timeoutId: null };
    } else {
      setHistory((prev) => [...prev, userMessage, { role: "loading", content: getRandomLoadingPhrase() }]);
      setIsProcessing(true);
    }
    const contextMessages = filterChatHistory(historyRef.current);
    const chatMessages = isFreeTier
      ? contextMessages
      : [...contextMessages, { role: "user", content: userMessage.content }];
    const { onSprintProgress, getSprintCompleteMessage } = buildSprintCallbacks({ state, updateTicketProgress, addActiveTD, playChime, setState });
    const controller = new AbortController();
    abortControllerRef.current = controller;
    submitChatMessage({
      chatMessages, buddyResult, unlockAchievement: unlockAchievementWithSound, setHistory, setIsProcessing,
      currentRank: rank, apiKey: effectiveApiKey, customModel: state.selectedModel, proKey: state.proKey,
      proKeyHash: state.proKeyHash, modes: state.modes, activeTicket: state.activeTicket,
      onSprintProgress, getSprintCompleteMessage, addActiveTD, onSuggestedReply: setSuggestedReply,
      buddyType: state.buddy.type, username: state.username, inventory: state.inventory, upgrades: state.upgrades,
      onByokUsage: (usage) => setState((prev) => {
        const existing = prev.byokUsage?.[usage.model] ?? { prompt_tokens: 0, completion_tokens: 0, cost: 0 };
        return { ...prev, byokTotalCost: (prev.byokTotalCost ?? 0) + (usage.cost ?? 0), byokUsage: { ...prev.byokUsage, [usage.model]: { prompt_tokens: existing.prompt_tokens + (usage.prompt_tokens ?? 0), completion_tokens: existing.completion_tokens + (usage.completion_tokens ?? 0), cost: existing.cost + (usage.cost ?? 0) } } };
      }),
      onQuotaUpdate: (quotaPercent) => setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent } })),
      onQuotaExhausted: () => {
        // Do NOT re-arm the command here — it was already submitted to the backend.
        // Re-arming would cause a nag → ESC → resubmit → quota-exhausted → nag loop.
        // Just show the upgrade overlay without storing a pending command.
        handleQuotaLockout();
      },
      onProfileUpdate: (profile) => setState((prev) => applyServerProfile(prev, profile)),
      onError: playError, signal: controller.signal,
    });
  };
  processCommandRef.current = processCommand;

  const handleEnterSubmit = async () => {
    if (tryOutageDamage({ inputValue, outageHp, DAMAGE_COMMANDS, sendDamage, setHistory, setInputValue })) return;
    if (inputValue.trim().startsWith("/")) { runSlashCommand(inputValue.trim()); return; }
    if (bragPending) { handleBragSubmit({ inputValue, setInputValue, state, setHistory, setBragPending }); return; }
    if (buddyPendingConfirm) { handleBuddyConfirm({ inputValue, setInputValue, setBuddyPendingConfirm, setState, setHistory, buddyType: state.buddy?.type ?? undefined }); return; }
    if (BYOK_ENABLED && await handleKeyCommand(inputValue, setState, setHistory, state)) { setInputValue(""); return; }
    const command = inputValue;
    setInputValue(""); setHistoryIndex(-1);
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    // Check quota before adding to history — if the nag is dismissed without
    // replaying, the command should not appear in command history.
    if (checkQuotaAndHandleExhaustion(command, effectiveApiKey)) return;
    setCommandHistory((prev) => [...prev, command]);
    processCommand(command);
  };

  // WinRAR nag: any dismissal (ESC, backdrop click, [x], footer tap) replays
  // the pending command. The user must dismiss every time — faithful to WinRAR UX.
  const handleUpgradeNagClose = useCallback(() => {
    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") window.history.pushState(null, "", "/");
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      // Record the replayed command in command history so arrow-up navigation works
      setCommandHistory((prev) => [...prev, command]);
      processCommandRef.current(command);
    }
  }, [setShowUpgrade]);

  const { handleKeyDown } = useTerminalKeyboard({
    slashQuery,
    slashIndex,
    suggestedReply,
    inputValue,
    isProcessing,
    commandHistory,
    historyIndex,
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
    brrrrrrIntervalRef,
    abortControllerRef,
    freeTierDelayRef,
    inputRef,
    setSlashIndex,
    setInputValue,
    setSuggestedReply,
    setSlashQuery,
    setHistoryIndex,
    setIsProcessing,
    setHistory,
    closeAllOverlays: closeAllOverlaysAndClearNag,
    handleUpgradeNagClose,
    runSlashCommand,
    handleEnterSubmit,
    getFilteredSlashCommands,
  });


  return (
    <div
      className={terminalContainerClassName({ activeRegression, outageHp, pendingReviewPing, pingAcknowledged, activeTheme: state.activeTheme })}
      style={{ ...parseGlitchStyle(regressionGlitch), backgroundColor: outageHp !== null ? undefined : 'var(--color-bg)', color: 'var(--color-text)' }}
      onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}
    >
      <div className="shrink-0">
        <Ticker onExpand={() => { closeAllOverlaysAndClearNag(); setShowParty(true); }} onlineCount={onlineCount} />
        {outageHp !== null && <OutageBar outageHp={outageHp} />}
        <HeaderBar rank={rank} currentTD={state.economy.currentTD} quotaPercent={state.economy.quotaPercent} outageHp={outageHp} activeMultiplier={calculateActiveMultiplier(state.inventory, state.upgrades) * state.economy.tdMultiplier} username={state.username} isBYOK={BYOK_ENABLED && !!state.apiKey} isMax={!!state.proKey || !!state.proKeyHash} byokTotalCost={state.byokTotalCost} onProfileClick={handleProfileClick} onHelpClick={() => { closeAllOverlaysAndClearNag(); setShowHelp(true); }} onAboutClick={() => { closeAllOverlaysAndClearNag(); setShowAbout(true); }} onSlashMenuClick={() => { setInputValue("/"); setSlashQuery("/"); setSlashIndex(0); inputRef.current?.focus(); }} onUpgradeClick={() => { closeAllOverlaysAndClearNag(); setShowUpgrade(true); window.history.pushState(null, "", "/upgrade"); }} />
      </div>
      <div className={`flex-1 min-h-0 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}>
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        <MessageList history={history} messageKeys={messageKeys.current} initialHistoryLen={initialHistoryLen.current} promptString={promptString} activeTicketId={state.activeTicket?.id} username={state.username} isFreeTier={isFreeTier} onSlashCommand={handleSlashCommandClick} />
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0">
        {state.activeTicket && <SprintProgressBar id={state.activeTicket.id} title={state.activeTicket.title} sprintProgress={state.activeTicket.sprintProgress} sprintGoal={state.activeTicket.sprintGoal} />}
        <div className="relative border-b border-white">
          {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} totalTechnicalDebt={state.economy.totalTDEarned} onSelect={runSlashCommand} />}
          <BuddyDisplay type={state.buddy.type} isShiny={state.buddy.isShiny} />
          <CommandLine ref={inputRef} value={inputValue} disabled={isProcessing || isBooting} onChange={handleChange} onKeyDown={handleKeyDown} promptString={promptString} placeholder={suggestedReply ?? undefined} />
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
        onUpgradeDismiss={handleUpgradeNagClose}
      />
      <TerminalFooter closeAllOverlays={closeAllOverlaysAndClearNag} setShowTerms={setShowTerms} setShowPrivacy={setShowPrivacy} setShowAbout={setShowAbout} setShowHelp={setShowHelp} setShowContact={setShowContact} />
    </div>
  );
}

export default Terminal;
