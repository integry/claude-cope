import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { getSlashMenuItems, resolveSlashMenuSelection } from "./slashCommands";
import { useGameState, Message } from "../hooks/useGameState";
import { isFreeUser, isPaidUser } from "../hooks/gameStateUtils";
import { computeBuddyInterjection, mergeSuggestedReply, submitChatMessage } from "./chatApi";
import { BYOK_ENABLED } from "../config";
import { executeSlashCommand } from "./slashCommandExecutor";
import { applyAuthoritativeProfile as mergeAuthoritativeProfile, applyServerProfile, settlePendingCompletedRewards } from "../hooks/profileSync";
import { handleKeyCommand } from "./keyCommandHandler";
import { fetchRandomTicketPrompt } from "./ticketPrompt";
import { filterChatHistory } from "./filterChatHistory";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { useTerminalEffects } from "../hooks/useTerminalEffects";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { usePingAcknowledged } from "../hooks/usePingAcknowledged";
import { useOverlays } from "../hooks/useOverlays";
import { useHistoryCommitQueue } from "../hooks/useHistoryCommitQueue";
import { useTipManager } from "../hooks/useTipManager";
import { getRandomLoadingPhrase } from "./loadingPhrases";
import { runFreeTierDelay } from "./freeTierDelay";
import { buildSprintCallbacks } from "./buildChatSubmitArgs";
import type { SlashCommandAction } from "./slashCommandDetect";
import { triggerQuotaLockout, triggerInstantBan } from "./terminalHandlers";
import { useTerminalKeyboard } from "../hooks/useTerminalKeyboard";
import { handleBragSubmit, handleBuddyConfirm, tryOutageDamage } from "./terminalInputHandlers";
import { shouldShowNag } from "./winrarNag";
import { TerminalView } from "./TerminalView";
import { getPromptString, isAnyOverlayOpen } from "./terminalViewUtils";
import { useCheckoutLicenseSync } from "./useCheckoutLicenseSync";
import { usePromptSubmissionState } from "./usePromptSubmissionState";
import { useUpgradeNagState } from "./useUpgradeNagState";
import { STARTUP_TICKET_PROMPT_DELAY_MS, getNextTerminalInputValue, getSlashCommandClickSelection, syncMessageKeys } from "./terminalUtils";
import { useIsMobileViewport } from "./useIsMobileViewport";
export type { Message }; export { STARTUP_TICKET_PROMPT_DELAY_MS };
type PromptSubmission = { command: string; replayId: number | null; submissionId: number };
const createPromptLoadingMessage = (submissionId: number): Message => ({ id: submissionId, role: "loading", content: getRandomLoadingPhrase() });
const removePromptMessages = (submissionId: number) => (prev: Message[]) =>
  prev.filter((message) => !(message.id === submissionId && (message.role === "user" || message.role === "loading")));

function Terminal() {
  const { state, setState, getCurrentState, addActiveTD, buyGenerator, buyUpgrade, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, setChatHistory, setActiveTheme, buyTheme, offlineTDEarned, clearOfflineTDEarned, updateTicketProgress } = useGameState();
  const history = state.chatHistory;
  const setHistory = setChatHistory;
  const creditTD = useCallback((amount: number) => addActiveTD(amount, true), [addActiveTD]);
  const debitTD = useCallback((amount: number) => setState((prev) => ({ ...prev, economy: { ...prev.economy, currentTD: Math.max(0, prev.economy.currentTD - amount) } })), [setState]);
  const activeTicketRef = useRef(state.activeTicket);
  activeTicketRef.current = state.activeTicket;
  const applyReviewSprintBoost = useCallback((ticketId: string, boost: number) => {
    if (activeTicketRef.current?.id === ticketId) updateTicketProgress(boost);
  }, [updateTicketProgress]);
  const { onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, outageHp, activeOutageScenario, sendDamage } = useMultiplayer({
    username: state.username, setHistory, applyOutageReward, applyOutagePenalty, creditTD, debitTD, applyReviewSprintBoost,
  });
  const rank = state.economy.currentRank;
  const isMobileViewport = useIsMobileViewport();
  const { isBooting, regressionGlitch, activeRegression } = useTerminalEffects({ history, setHistory, setState, totalTDEarned: state.economy.totalTDEarned, offlineTDEarned, clearOfflineTDEarned });
  const { playError, playChime } = useSoundEffects(state.soundEnabled);
  const [instantBanReady, setInstantBanReady] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const overlays = useOverlays();
  const { closeAllOverlays, ...terminalOverlayProps } = overlays;
  const { showStore, showLeaderboard, showAchievements, showSynergize, showHelp, showAbout, showPrivacy, showTerms, showContact, showProfile, showParty, showUpgrade, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade } = terminalOverlayProps;
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [compactEffect, setCompactEffect] = useState(false);
  const [freeCommandCount, setFreeCommandCount] = useState(0);
  const pingAcknowledged = usePingAcknowledged(pendingReviewPing);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const brrrrrrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialHistoryLen = useRef(history.length);
  const messageKeys = useRef<number[]>([]);
  const nextKeyId = useRef(0);
  syncMessageKeys(messageKeys.current, nextKeyId, history.length);
  const freeTierDelayRef = useRef<{ cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null; batchId?: string }>({ cancelled: false, timeoutId: null });
  const startupTicketPromptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef(history);
  historyRef.current = history;
  const lastSuggestedReplyRef = useRef<string | null>(null);
  const nextPendingBacklogRollbackIdRef = useRef(0);
  const pendingBacklogRollbacksRef = useRef(new Map<number, () => void>());
  const nextPromptSubmissionIdRef = useRef(0);
  const commandHistoryEntriesRef = useRef<Array<{ submissionId: number; command: string }>>([]);
  const promptString = getPromptString(activeRegression);
  const isFreeTier = isFreeUser(state);
  const anyOverlayOpen = isAnyOverlayOpen(overlays);
  const {
    abortControllerRef,
    createPromptProcessingSetter,
    isProcessing,
    resetPromptProcessing,
    setIsProcessing,
    startPromptProcessing,
    trackAbortController,
    untrackAbortController,
  } = usePromptSubmissionState();
  const { recordConversationRound, recordEnter, recordValidCommand, recordMessageWithoutTicket } = useTipManager({ isBooting, isInteractionBlocked: anyOverlayOpen || isProcessing, gameState: state, onlineCount, setHistory });
  const scrollTerminalToBottom = useCallback(() => {
    if (typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, []);
  useEffect(() => () => {
    const ds = freeTierDelayRef.current;
    ds.cancelled = true;
    if (ds.timeoutId) clearTimeout(ds.timeoutId);
  }, []);
  useEffect(() => () => {
    if (startupTicketPromptTimeoutRef.current) clearTimeout(startupTicketPromptTimeoutRef.current);
  }, []);
  const scheduleHistoryCommitCallback = useHistoryCommitQueue(history.length);
  const setCommandHistoryEntries = useCallback((updater: (prev: Array<{ submissionId: number; command: string }>) => Array<{ submissionId: number; command: string }>) => {
    const nextEntries = updater(commandHistoryEntriesRef.current); commandHistoryEntriesRef.current = nextEntries; setCommandHistory(nextEntries.map(({ command }) => command));
  }, []);
  const unlockAchievementWithSound = useCallback((id: string): boolean => {
    const isNew = unlockAchievement(id);
    if (isNew) playChime();
    return isNew;
  }, [unlockAchievement, playChime]);
  const handleSuggestedReply = useCallback((suggestion: string) => { const merged = mergeSuggestedReply(lastSuggestedReplyRef.current, suggestion); if (!merged) return void setSuggestedReply(null); lastSuggestedReplyRef.current = merged; setSuggestedReply(merged); }, []);
  const processCommandRef = useRef<(submission: PromptSubmission) => void>(() => {});
  const submitPromptCommand = useCallback((command: string, replayId: number | null = null) => {
    const submissionId = nextPromptSubmissionIdRef.current++;
    setCommandHistoryEntries((prev) => [...prev, { submissionId, command }]);
    processCommandRef.current({ command, replayId, submissionId });
  }, [setCommandHistoryEntries]);
  const {
    closeAllOverlaysAndRestoreNag,
    closeAllOverlaysPreservingNag,
    dismissUpgradeOverlay: dismissUpgradeNagOverlay,
    handleUpgradeNagClose,
    nagArmedFromQuotaRef,
    openUpgradeNag,
    pendingNagCommand,
    pendingNagCommandRef,
    settleAcceptedNagReplay,
    upgradeNagDismissEffect,
    upgradeNagDismissPhase,
  } = useUpgradeNagState({
    closeAllOverlays,
    setInputValue,
    setShowUpgrade,
  });
  const handleProfileClick = useCallback(() => {
    closeAllOverlaysPreservingNag();
    setShowProfile(true);
    window.history.pushState(null, "", `/user/${encodeURIComponent(state.username)}`);
  }, [closeAllOverlaysPreservingNag, setShowProfile, state.username]);
  const handleHomeClick = useCallback(() => {
    dismissUpgradeNagOverlay();
    closeAllOverlays();
    if (window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
    scrollTerminalToBottom();
  }, [closeAllOverlays, dismissUpgradeNagOverlay, scrollTerminalToBottom]);
  useEffect(() => { scrollTerminalToBottom(); }, [history, scrollTerminalToBottom]);
  useEffect(() => {
    const onPopState = () => {
      if (pendingNagCommandRef.current !== null) return void setShowUpgrade(true);
      setShowUpgrade(window.location.pathname === "/upgrade");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pendingNagCommandRef, setShowUpgrade]);
  useEffect(() => {
    if (!isMobileViewport && !isProcessing && !isBooting && !anyOverlayOpen) inputRef.current?.focus();
  }, [isMobileViewport, isProcessing, isBooting, anyOverlayOpen]);
  useEffect(() => {
    if (isBooting || state.hasSeenTicketPrompt || state.activeTicket) return;
    startupTicketPromptTimeoutRef.current = setTimeout(() => {
      startupTicketPromptTimeoutRef.current = null;
      const currentState = getCurrentState();
      if (currentState.hasSeenTicketPrompt || currentState.activeTicket) return;
      setState((prev) => (prev.hasSeenTicketPrompt || prev.activeTicket ? prev : { ...prev, hasSeenTicketPrompt: true }));
      void fetchRandomTicketPrompt(setHistory, currentState.proKeyHash);
    }, STARTUP_TICKET_PROMPT_DELAY_MS);
    return () => {
      if (startupTicketPromptTimeoutRef.current) {
        clearTimeout(startupTicketPromptTimeoutRef.current);
        startupTicketPromptTimeoutRef.current = null;
      }
    };
  }, [getCurrentState, isBooting, state.hasSeenTicketPrompt, state.activeTicket, state.proKeyHash, setState, setHistory]);
  const handleQuotaLockout = useCallback((command?: string) => {
    if (!state.proKey && !state.proKeyHash) {
      nagArmedFromQuotaRef.current = true;
      if (command) openUpgradeNag(command);
    } else { triggerQuotaLockout({ playError, setHistory, state, unlockAchievementWithSound, resetQuota, setInstantBanReady, setState }); }
  }, [openUpgradeNag, playError, setHistory, state, unlockAchievementWithSound, resetQuota, setState, nagArmedFromQuotaRef]);
  const checkQuotaAndHandleExhaustion = useCallback((command: string, effectiveApiKey: string | undefined): boolean => {
    if (!shouldShowNag(effectiveApiKey, state.proKey, state.proKeyHash, state.economy.quotaPercent)) return false;
    if (BYOK_ENABLED && effectiveApiKey) return false;
    handleQuotaLockout(command);
    return true;
  }, [state.proKey, state.proKeyHash, state.economy.quotaPercent, handleQuotaLockout]);
  const handleInstantBan = useCallback(() => { triggerInstantBan({ setInstantBanReady, setIsProcessing, playError, setHistory }); }, [setIsProcessing, playError, setHistory]);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = getNextTerminalInputValue(inputValue, e.target.value, activeRegression === "backwards_typing");
    setInputValue(value);
    setHistoryIndex(-1);
    setSuggestedReply(null);
    setSlashQuery(value.startsWith("/") ? value : "");
    setSlashIndex(0);
  };
  const getFilteredSlashCommands = () =>
    getSlashMenuItems(slashQuery, state.economy.totalTDEarned, isPaidUser(state)).map((item) => item.value);
  const settlePendingBacklogRollback = useCallback((rollbackId: number, shouldRollback: boolean) => {
    const rollback = pendingBacklogRollbacksRef.current.get(rollbackId);
    if (!rollback) return;
    pendingBacklogRollbacksRef.current.delete(rollbackId);
    if (shouldRollback) rollback();
  }, []);
  const recordValidatedSlashCommand = useCallback((baseCommand: string) => {
    if (baseCommand === "/clear") {
      recordValidCommand(baseCommand, { suppressTip: true });
      return;
    }
    recordValidCommand(baseCommand);
  }, [recordValidCommand]);
  const runSlashCommand = useCallback((command: string) => {
    executeSlashCommand(command, { state, setState, setHistory, setIsProcessing, closeAllOverlays: closeAllOverlaysAndRestoreNag, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade, setBragPending, setBuddyPendingConfirm, unlockAchievement: unlockAchievementWithSound, clearCount, setClearCount, setInputValue, onSuggestedReply: handleSuggestedReply, setSlashQuery, setSlashIndex, addActiveTD, onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, brrrrrrIntervalRef, triggerCompactEffect: () => { setCompactEffect(true); setTimeout(() => setCompactEffect(false), 500); }, playChime, playError, setActiveTheme, onValidSlashCommand: recordValidatedSlashCommand });
  }, [state, setState, setHistory, setIsProcessing, closeAllOverlaysAndRestoreNag, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade, unlockAchievementWithSound, clearCount, addActiveTD, onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, playChime, playError, setActiveTheme, handleSuggestedReply, recordValidatedSlashCommand]);
  const runSlashCommandRef = useRef(runSlashCommand);
  runSlashCommandRef.current = runSlashCommand;
  useCheckoutLicenseSync({ isBooting, proKeyHash: state.proKeyHash, setHistory, runSlashCommand });
  const handlePromptAccepted = useCallback((rollbackId: number, replayId: number | null) => { settlePendingBacklogRollback(rollbackId, false); settleAcceptedNagReplay(replayId); }, [settleAcceptedNagReplay, settlePendingBacklogRollback]);
  const handlePromptError = useCallback((rollbackId: number) => { settlePendingBacklogRollback(rollbackId, true); playError(); }, [playError, settlePendingBacklogRollback]);
  const handleSlashCommandClick = useCallback((command: string, action: SlashCommandAction) => {
    const nextSelection = getSlashCommandClickSelection(command, action);
    if (nextSelection.mode === "execute") return void runSlashCommandRef.current(nextSelection.value);
    setInputValue(nextSelection.value); setSlashQuery(nextSelection.nextQuery); setSlashIndex(0); setSuggestedReply(null);
    if (!isMobileViewport) inputRef.current?.focus();
  }, [isMobileViewport]);
  const handleSlashMenuSelect = useCallback((command: string) => {
    const nextSelection = resolveSlashMenuSelection(command, "click");
    if (nextSelection.mode === "execute") return void runSlashCommandRef.current(nextSelection.value);
    setInputValue(nextSelection.value); setSlashQuery(nextSelection.nextQuery); setSlashIndex(0); setSuggestedReply(null);
    if (!isMobileViewport) inputRef.current?.focus();
  }, [isMobileViewport]);
  const handleBuddyInterjection = useCallback((buddyResult: ReturnType<typeof computeBuddyInterjection>) => {
    if (state.buddy.type) setState((prev) => ({ ...prev, buddy: { ...prev.buddy, promptsSinceLastInterjection: buddyResult ? 0 : prev.buddy.promptsSinceLastInterjection + 1 } }));
  }, [state.buddy.type, setState]);
  const applyProfileUpdate = useCallback((profile: ServerProfile) => {
    setState((prev) => applyServerProfile(prev, profile, prev.pendingCompletedTaskIds.length > 0 ? { preservePendingCompletedRewardTaskIds: prev.pendingCompletedTaskIds } : {}));
  }, [setState]);
  const applySettledCompletedReward = useCallback((ticketId: string, profile?: ServerProfile) => {
    setState((prev) => {
      if (!profile) return settlePendingCompletedRewards(prev, [ticketId]);
      return mergeAuthoritativeProfile(prev, profile, prev.pendingCompletedTaskIds.length > 0 ? { preservePendingCompletedRewardTaskIds: prev.pendingCompletedTaskIds, settledPendingCompletedRewardTaskIds: [ticketId] } : {});
    });
  }, [setState]);
  const processCommand = async ({ command, replayId, submissionId }: PromptSubmission) => {
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    if (!effectiveApiKey && instantBanReady) {
      setHistory((prev) => [...prev, { id: submissionId, role: "user", content: command }]);
      handleInstantBan();
      return;
    }
    const buddyResult = computeBuddyInterjection(state.buddy);
    handleBuddyInterjection(buddyResult);
    const userMessage: Message = { id: submissionId, role: "user", content: command };
    if (isFreeTier) {
      const newCount = freeCommandCount + 1;
      setFreeCommandCount(newCount);
      startPromptProcessing();
      const delayState = { cancelled: false, timeoutId: null as ReturnType<typeof setTimeout> | null };
      freeTierDelayRef.current = delayState;
      const completed = await runFreeTierDelay({ commandCount: newCount, userMessage, delayState, setHistory });
      if (!completed) return;
      freeTierDelayRef.current = { cancelled: false, timeoutId: null };
    } else {
      setHistory((prev) => [...prev, userMessage, createPromptLoadingMessage(submissionId)]);
      startPromptProcessing();
    }
    const rollbackId = nextPendingBacklogRollbackIdRef.current++;
    pendingBacklogRollbacksRef.current.set(rollbackId, recordMessageWithoutTicket());
    const contextMessages = filterChatHistory(historyRef.current);
    const chatMessages = isFreeTier ? contextMessages : [...contextMessages, { role: "user", content: userMessage.content }];
    const { onSprintProgress, getSprintCompleteMessage } = buildSprintCallbacks({
      getState: getCurrentState,
      updateTicketProgress,
      addActiveTD,
      playChime,
      setState,
      onCompletedRewardSettled: (ticketId, profile) => { applySettledCompletedReward(ticketId, profile); },
    });
    const controller = new AbortController();
    const setPromptProcessing = createPromptProcessingSetter(controller);
    controller.signal.addEventListener("abort", () => {
      settlePendingBacklogRollback(rollbackId, true);
      untrackAbortController(controller);
    }, { once: true });
    trackAbortController(controller);
    submitChatMessage({
      chatMessages, buddyResult, unlockAchievement: unlockAchievementWithSound, setHistory, setIsProcessing: setPromptProcessing,
      currentRank: rank, apiKey: effectiveApiKey, customModel: state.selectedModel, proKey: state.proKey, proKeyHash: state.proKeyHash,
      modes: state.modes, activeTicket: state.activeTicket, onSprintProgress, getSprintCompleteMessage, addActiveTD, onSuggestedReply: handleSuggestedReply,
      buddyType: state.buddy.type, username: state.username, inventory: state.inventory, upgrades: state.upgrades,
      onByokUsage: (usage) => setState((prev) => { const existing = prev.byokUsage?.[usage.model] ?? { prompt_tokens: 0, completion_tokens: 0, cost: 0 }; return { ...prev, byokTotalCost: (prev.byokTotalCost ?? 0) + (usage.cost ?? 0), byokUsage: { ...prev.byokUsage, [usage.model]: { prompt_tokens: existing.prompt_tokens + (usage.prompt_tokens ?? 0), completion_tokens: existing.completion_tokens + (usage.completion_tokens ?? 0), cost: existing.cost + (usage.cost ?? 0) } } }; }),
      onQuotaUpdate: (quotaPercent) => { setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent } })); if (quotaPercent <= 0 && isFreeTier && !effectiveApiKey) nagArmedFromQuotaRef.current = true; },
      loadingMessageId: isFreeTier ? undefined : submissionId,
      onQuotaExhausted: effectiveApiKey ? undefined : () => {
        untrackAbortController(controller);
        settlePendingBacklogRollback(rollbackId, true);
        setCommandHistoryEntries((prev) => prev.filter((entry) => entry.submissionId !== submissionId));
        setHistory(removePromptMessages(submissionId));
        handleQuotaLockout(command);
      },
      onProfileUpdate: applyProfileUpdate,
      onAccepted: () => {
        recordConversationRound();
        untrackAbortController(controller);
        handlePromptAccepted(rollbackId, replayId);
      },
      scheduleHistoryCommitCallback,
      onError: () => {
        untrackAbortController(controller);
        handlePromptError(rollbackId);
      },
      signal: controller.signal,
    });
  };
  processCommandRef.current = processCommand;
  const submitPromptCommandWithAccounting = useCallback((command: string, replayId: number | null = null) => {
    setInputValue("");
    setHistoryIndex(-1);
    submitPromptCommand(command, replayId);
  }, [submitPromptCommand]);
  const submitCommandValue = useCallback(async (commandValue: string) => {
    if (tryOutageDamage({ inputValue: commandValue, outageHp, activeOutageScenario, sendDamage, setHistory, setInputValue })) return;
    if (commandValue.trim().startsWith("/")) return void runSlashCommand(commandValue.trim());
    if (bragPending) { handleBragSubmit({ inputValue: commandValue, setInputValue, state, setHistory, setBragPending }); return; }
    if (buddyPendingConfirm) { handleBuddyConfirm({ inputValue: commandValue, setInputValue, setBuddyPendingConfirm, setState, setHistory, buddyType: state.buddy?.type ?? undefined }); return; }
    if (commandValue.trim().length === 0) {
      setInputValue(""); setHistoryIndex(-1); return;
    }
    if (BYOK_ENABLED && await handleKeyCommand(commandValue, setState, setHistory, state)) {
      setInputValue(""); return;
    }
    const command = commandValue;
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    if (nagArmedFromQuotaRef.current && pendingNagCommandRef.current === null) {
      openUpgradeNag(command);
      return;
    }
    if (checkQuotaAndHandleExhaustion(command, effectiveApiKey)) return;
    submitPromptCommandWithAccounting(command);
  }, [
    outageHp, activeOutageScenario, sendDamage, setHistory, setInputValue, runSlashCommand, bragPending, state, setBragPending,
    buddyPendingConfirm, setBuddyPendingConfirm, setState, setHistoryIndex, openUpgradeNag, checkQuotaAndHandleExhaustion,
    submitPromptCommandWithAccounting, nagArmedFromQuotaRef, pendingNagCommandRef,
  ]);
  const handleEnterSubmit = async () => { recordEnter(); await submitCommandValue(inputValue); };
  const handleUpgradeNagDismiss = useCallback(() => { handleUpgradeNagClose((command, replayId) => { submitPromptCommandWithAccounting(command, replayId); }); }, [handleUpgradeNagClose, submitPromptCommandWithAccounting]);
  const handleManualUpgradeDismiss = dismissUpgradeNagOverlay;
  const acceptSuggestedReply = useCallback((options?: { submit?: boolean }) => {
    if (!suggestedReply || inputValue) return;
    setSuggestedReply(null);
    if (options?.submit) return void submitCommandValue(suggestedReply);
    setInputValue(suggestedReply);
  }, [inputValue, suggestedReply, submitCommandValue]);
  const { handleKeyDown } = useTerminalKeyboard({
    slashQuery, slashIndex, suggestedReply, inputValue, isProcessing, commandHistory, historyIndex, showStore, showLeaderboard, showAchievements, showSynergize, showHelp, showAbout, showPrivacy, showTerms, showContact, showProfile, showParty, showUpgrade, brrrrrrIntervalRef, abortControllerRef,
    freeTierDelayRef, inputRef, setSlashIndex, setInputValue, setSuggestedReply, setSlashQuery, setHistoryIndex, setIsProcessing: resetPromptProcessing, setHistory, closeAllOverlays: closeAllOverlaysPreservingNag, handleUpgradeNagClose: handleUpgradeNagDismiss, runSlashCommand, handleEnterSubmit, getFilteredSlashCommands,
  });
  return (
    <TerminalView
      activeRegression={activeRegression} outageHp={outageHp} activeOutageScenario={activeOutageScenario} pendingReviewPing={pendingReviewPing} pingAcknowledged={pingAcknowledged}
      activeTheme={state.activeTheme} regressionGlitch={regressionGlitch} anyOverlayOpen={anyOverlayOpen} isMobileViewport={isMobileViewport} inputRef={inputRef} closeAllOverlaysPreservingNag={closeAllOverlaysPreservingNag}
      onlineCount={onlineCount} rank={rank} state={state} handleHomeClick={handleHomeClick} handleProfileClick={handleProfileClick} setShowHelp={setShowHelp} setShowAbout={setShowAbout} setInputValue={setInputValue}
      setSlashQuery={setSlashQuery} setSlashIndex={setSlashIndex} setShowUpgrade={setShowUpgrade} compactEffect={compactEffect} isBooting={isBooting} history={history}
      messageKeys={messageKeys.current} initialHistoryLen={initialHistoryLen.current} promptString={promptString} handleSlashCommandClick={handleSlashCommandClick} bottomRef={bottomRef}
      slashQuery={slashQuery} slashIndex={slashIndex} handleSlashMenuSelect={handleSlashMenuSelect} runSlashCommand={runSlashCommand} inputValue={inputValue} suggestedReply={suggestedReply} acceptSuggestedReply={acceptSuggestedReply}
      isProcessing={isProcessing} handleChange={handleChange} handleKeyDown={handleKeyDown} buyGenerator={buyGenerator} buyUpgrade={buyUpgrade} buyTheme={buyTheme} setActiveTheme={setActiveTheme}
      showStore={showStore} showLeaderboard={showLeaderboard} showAchievements={showAchievements} showSynergize={showSynergize} showHelp={showHelp} showAbout={showAbout} showPrivacy={showPrivacy}
      showTerms={showTerms} showContact={showContact} showProfile={showProfile} showParty={showParty} showUpgrade={showUpgrade} setShowStore={setShowStore} setShowLeaderboard={setShowLeaderboard}
      setShowAchievements={setShowAchievements} setShowPrivacy={setShowPrivacy} setShowTerms={setShowTerms} setShowContact={setShowContact} setShowProfile={setShowProfile} setShowParty={setShowParty}
      setShowSynergize={setShowSynergize} setIsProcessing={setIsProcessing} setHistory={setHistory} pendingNagCommand={pendingNagCommand} handleUpgradeNagClose={handleUpgradeNagDismiss}
      handleManualUpgradeDismiss={handleManualUpgradeDismiss} upgradeNagDismissPhase={upgradeNagDismissPhase} upgradeNagDismissEffect={upgradeNagDismissEffect} />
  );
}
export default Terminal;
