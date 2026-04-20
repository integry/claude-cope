import { useState, useRef, useEffect, useCallback, type Dispatch, type SetStateAction, ChangeEvent, KeyboardEvent, memo } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import LeaderboardOverlay from "./LeaderboardOverlay";
import AchievementOverlay from "./AchievementOverlay";
import SynergizeOverlay from "./SynergizeOverlay";
import HelpOverlay from "./HelpOverlay";
import AboutOverlay from "./AboutOverlay";
import PrivacyOverlay from "./PrivacyOverlay";
import TermsOverlay from "./TermsOverlay";
import ContactOverlay from "./ContactOverlay";
import UserProfileOverlay from "./UserProfileOverlay";
import PartyOverlay from "./PartyOverlay";
import UpgradeOverlay from "./UpgradeOverlay";
import HeaderBar from "./HeaderBar";
import { useGameState, Message } from "../hooks/useGameState";
import { calculateActiveMultiplier } from "../hooks/gameStateUtils";
import { BuddyDisplay } from "./BuddyDisplay";
import { parseGlitchStyle } from "./parseGlitchStyle";
import { terminalContainerClassName } from "./terminalClassName";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { API_BASE, BYOK_ENABLED } from "../config";
import { supabase } from "../supabaseClient";
import { executeSlashCommand, rollBuddy } from "./slashCommandExecutor";
import { applyServerProfile } from "../hooks/profileSync";
import { handleKeyCommand } from "./keyCommandHandler";
import { fetchRandomTicketPrompt } from "./ticketPrompt";
import { buildAchievementBox } from "./achievementBox";
import { filterChatHistory } from "./filterChatHistory";
import Ticker from "./Ticker";
import { OutageBar, DAMAGE_COMMANDS } from "./OutageBar";
import SprintProgressBar from "./SprintProgressBar";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { useTerminalEffects } from "../hooks/useTerminalEffects";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { usePingAcknowledged } from "../hooks/usePingAcknowledged";
import { getRandomLoadingPhrase } from "./loadingPhrases";
import type { SlashCommandAction } from "./slashCommandDetect";

export type { Message };

/** Memoized message list — only re-renders when history/keys/props actually change */
const MessageList = memo(function MessageList({ history, messageKeys, initialHistoryLen, promptString, activeTicketId, username, onSlashCommand }: {
  history: Message[];
  messageKeys: number[];
  initialHistoryLen: number;
  promptString: string;
  activeTicketId?: string | null;
  username: string;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}) {
  return (
    <>
      {history.map((message, index) => (
        <OutputBlock key={messageKeys[index]} message={message} previousMessage={history[index - 1]} nextMessage={history[index + 1]} isNew={index >= initialHistoryLen} promptString={promptString} activeTicketId={activeTicketId} username={username} onSlashCommand={onSlashCommand} />
      ))}
    </>
  );
});


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
  const [showStore, setShowStore] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSynergize, setShowSynergize] = useState(false);
  const [showHelp, setShowHelp] = useState(() => window.location.pathname === "/help");
  const [showAbout, setShowAbout] = useState(() => window.location.pathname === "/about");
  const [showPrivacy, setShowPrivacy] = useState(() => window.location.pathname === "/privacy");
  const [showTerms, setShowTerms] = useState(() => window.location.pathname === "/terms");
  const [showContact, setShowContact] = useState(() => window.location.pathname === "/contact");
  const [showProfile, setShowProfile] = useState(() => window.location.pathname.startsWith("/user/"));
  const [showParty, setShowParty] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(() => window.location.pathname === "/upgrade");
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [compactEffect, setCompactEffect] = useState(false);
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
  const lastEscapeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const promptString = activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";

  // Wrap unlockAchievement to also play a chime sound on success
  const unlockAchievementWithSound = useCallback((id: string): boolean => {
    const isNew = unlockAchievement(id);
    if (isNew) playChime();
    return isNew;
  }, [unlockAchievement, playChime]);

  const closeAllOverlays = useCallback(() => { setShowStore(false); setShowLeaderboard(false); setShowAchievements(false); setShowSynergize(false); setShowHelp(false); setShowAbout(false); setShowPrivacy(false); setShowTerms(false); setShowContact(false); setShowProfile(false); setShowParty(false); setShowUpgrade(false); }, []);
  const handleProfileClick = useCallback(() => { closeAllOverlays(); setShowProfile(true); window.history.pushState(null, "", `/user/${encodeURIComponent(state.username)}`); }, [closeAllOverlays, state.username]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "auto" }); }, [history]);

  useEffect(() => {
    const onPopState = () => { setShowHelp(window.location.pathname === "/help"); setShowAbout(window.location.pathname === "/about"); setShowPrivacy(window.location.pathname === "/privacy"); setShowTerms(window.location.pathname === "/terms"); setShowContact(window.location.pathname === "/contact"); setShowProfile(window.location.pathname.startsWith("/user/")); setShowUpgrade(window.location.pathname === "/upgrade"); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => { if (!isProcessing && !isBooting) inputRef.current?.focus(); }, [isProcessing, isBooting]);

  useEffect(() => {
    if (isBooting || state.hasSeenTicketPrompt || state.activeTicket) return;
    setState((prev) => ({ ...prev, hasSeenTicketPrompt: true }));
    fetchRandomTicketPrompt(setHistory);
  }, [isBooting, state.hasSeenTicketPrompt, state.activeTicket, setState, setHistory]);

  const triggerQuotaLockout = () => {
    playError();
    setHistory((prev) => [...prev.filter((m) => m.role !== "loading"), { role: "error", content: "[HTTP 429] Limit Exceeded. You feel like Homer at an all-you-can-eat restaurant." }, { role: "warning", content: "[⚙️] Upgrading to $200/mo Max Tier..." }]);
    setTimeout(() => {
      const newLockouts = state.economy.quotaLockouts + 1;
      const isNew = newLockouts >= 3 && unlockAchievementWithSound("homer_at_the_buffet");
      const achievementMsg: Message[] = isNew ? [{ role: "warning", content: buildAchievementBox("homer_at_the_buffet") }] : [];
      if (state.proKey) {
        resetQuota();
        if (newLockouts === 1) setInstantBanReady(true);
        setHistory((prev) => [...prev, { role: "system", content: "[SUCCESS] Max Tier activated. Quota refilled. Your paid plan limit applies — check the header bar." }, ...achievementMsg]);
      } else {
        setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent: 0, quotaLockouts: prev.economy.quotaLockouts + 1 } }));
        setHistory((prev) => [...prev, { role: "error", content: "[QUOTA EXHAUSTED] Free tier API quota depleted. Purchase Max to continue." }, ...achievementMsg]);
      }
    }, 5000);
  };

  const triggerInstantBan = () => {
    setInstantBanReady(false); setIsProcessing(true);
    playError();
    setHistory((prev) => [...prev.filter((m) => m.role !== "loading"), { role: "error", content: "[ACCOUNT BANNED] Suspicious activity detected. Thanks for the $200." }]);
    setTimeout(() => { setIsProcessing(false); setHistory((prev) => [...prev, { role: "system", content: "[APPEAL ACCEPTED] Your ban has been overturned. We kept the $200." }]); }, 5000);
  };

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
    executeSlashCommand(command, { state, setState, setHistory, setIsProcessing, closeAllOverlays, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade, setBragPending, setBuddyPendingConfirm, unlockAchievement: unlockAchievementWithSound, clearCount, setClearCount, setInputValue, onSuggestedReply: setSuggestedReply, setSlashQuery, setSlashIndex, addActiveTD, onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, brrrrrrIntervalRef, triggerCompactEffect: () => { setCompactEffect(true); setTimeout(() => setCompactEffect(false), 500); }, playChime, playError, setActiveTheme });
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

  const tryOutageDamage = (): boolean => {
    if (outageHp === null || !DAMAGE_COMMANDS.includes(inputValue.trim().toLowerCase())) return false;
    sendDamage();
    setHistory((prev) => [...prev, { role: "user", content: inputValue }, { role: "system", content: `[💥 HIT] Damage dealt to PROD OUTAGE!` }]);
    setInputValue(""); return true;
  };

  const handleBragSubmit = () => {
    const username = inputValue.trim(); setInputValue("");
    const generatorsOwned = Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
    const mostAbusedCommand = Object.entries(state.commandUsage).reduce((best, [cmd, count]) => (count > best[1] ? [cmd, count] : best), ["/clear", 0] as [string, number])[0];
    submitBrag({ username, currentRank: state.economy.currentRank, totalTDEarned: state.economy.totalTDEarned, generatorsOwned, mostAbusedCommand, setHistory, setBragPending });
  };

  const handleBuddyConfirm = () => {
    const answer = inputValue.trim().toLowerCase(); setInputValue(""); setBuddyPendingConfirm(false);
    if (answer === "y" || answer === "yes") { setHistory((prev) => [...prev, { role: "user", content: inputValue }]); rollBuddy(setState, setHistory, state.buddy?.type ?? undefined); }
    else { setHistory((prev) => [...prev, { role: "user", content: inputValue }, { role: "system", content: "[✓] Buddy re-roll cancelled. Your current buddy is safe... for now." }]); }
  };

  const handleEnterSubmit = async () => {
    if (tryOutageDamage()) return;
    if (inputValue.trim().startsWith("/")) { runSlashCommand(inputValue.trim()); return; }
    if (bragPending) { handleBragSubmit(); return; }
    if (buddyPendingConfirm) { handleBuddyConfirm(); return; }
    if (BYOK_ENABLED && await handleKeyCommand(inputValue, setState, setHistory, state)) { setInputValue(""); return; }
    const command = inputValue;
    setCommandHistory((prev) => [...prev, command]); setHistoryIndex(-1); setInputValue("");
    // Effective BYOK status for request routing — a stale apiKey must be
    // ignored when the operator has disabled BYOK.
    const effectiveApiKey = BYOK_ENABLED ? state.apiKey : undefined;
    // Block submission when quota is exhausted and user has no BYOK or pro key
    if (!effectiveApiKey && !state.proKey && state.economy.quotaPercent <= 0) {
      const byokHint = BYOK_ENABLED ? " or use `/key <your-openrouter-key>`" : "";
      setHistory((prev) => [...prev, { role: "user", content: command }, { role: "error", content: `[QUOTA EXHAUSTED] Free tier API quota depleted. Purchase Max${byokHint} to continue.` }]);
      playError();
      return;
    }
    // Handle instant ban scenario (user fires command right after upgrade)
    if (!effectiveApiKey && instantBanReady) { setHistory((prev) => [...prev, { role: "user", content: command }]); triggerInstantBan(); return; }
    const buddyResult = computeBuddyInterjection(state.buddy);
    if (state.buddy.type) {
      const newCount = buddyResult ? 0 : state.buddy.promptsSinceLastInterjection + 1;
      setState((prev) => ({ ...prev, buddy: { ...prev.buddy, promptsSinceLastInterjection: newCount } }));
    }
    const userMessage: Message = { role: "user", content: command };
    setHistory((prev) => [...prev, userMessage, { role: "loading", content: getRandomLoadingPhrase() }]);
    setIsProcessing(true);
    const contextMessages = filterChatHistory(history);
    const chatMessages = [...contextMessages, { role: "user", content: userMessage.content }];
    let sprintCompleteMessage: Message | null = null;
    const onSprintProgress = (rawAmount: number) => {
      if (!state.activeTicket) return;
      const amount = Math.round(rawAmount * 1.5);
      updateTicketProgress(amount);
      if (Math.min(state.activeTicket.sprintProgress + amount, state.activeTicket.sprintGoal) >= state.activeTicket.sprintGoal) {
        const payout = state.activeTicket.sprintGoal * 10;
        addActiveTD(payout); playChime();
        sprintCompleteMessage = { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${state.activeTicket!.id} "${state.activeTicket!.title}" delivered! You earned **${payout.toLocaleString()} TD**. The board is pleased... for now.` };
        setState((prev) => ({
          ...prev,
          activeTicket: null,
          pendingCompletedTaskIds: [...prev.pendingCompletedTaskIds, state.activeTicket!.id],
        }));
        const completedMessage = `✅ ${state.username || "A player"} completed ticket "${state.activeTicket!.title}" and earned ${payout.toLocaleString()} TD!`;
        fetch(`${API_BASE}/api/recent-events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: completedMessage }) }).catch(() => {});
        supabase?.channel('global_incidents').send({ type: 'broadcast', event: 'new_incident', payload: { message: completedMessage } }).catch(() => {});
      }
    };
    const controller = new AbortController();
    abortControllerRef.current = controller;
    submitChatMessage({
      chatMessages,
      buddyResult,
      unlockAchievement: unlockAchievementWithSound,
      setHistory,
      setIsProcessing,
      currentRank: rank,
      apiKey: effectiveApiKey,
      customModel: state.selectedModel,
      proKey: state.proKey,
      modes: state.modes,
      activeTicket: state.activeTicket,
      onSprintProgress,
      getSprintCompleteMessage: () => { const msg = sprintCompleteMessage; sprintCompleteMessage = null; return msg; },
      addActiveTD,
      onSuggestedReply: setSuggestedReply,
      buddyType: state.buddy.type,
      username: state.username,
      inventory: state.inventory,
      upgrades: state.upgrades,
      onByokUsage: (usage) => setState((prev) => {
        const existing = prev.byokUsage?.[usage.model] ?? { prompt_tokens: 0, completion_tokens: 0, cost: 0 };
        return { ...prev, byokTotalCost: (prev.byokTotalCost ?? 0) + (usage.cost ?? 0), byokUsage: { ...prev.byokUsage, [usage.model]: { prompt_tokens: existing.prompt_tokens + (usage.prompt_tokens ?? 0), completion_tokens: existing.completion_tokens + (usage.completion_tokens ?? 0), cost: existing.cost + (usage.cost ?? 0) } } };
      }),
      onQuotaUpdate: (quotaPercent) => setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent } })),
      onQuotaExhausted: triggerQuotaLockout,
      onProfileUpdate: (profile) => setState((prev) => applyServerProfile(prev, profile)),
      onError: playError,
      signal: controller.signal,
    });
  };

  const setCursorToEnd = (val: string) => { setTimeout(() => { const el = inputRef.current; if (el) { el.focus(); el.selectionStart = el.selectionEnd = val.length; } }, 0); };

  const handleEscapeKey = () => {
    const anyOverlayOpen = showStore || showLeaderboard || showAchievements || showSynergize || showHelp || showAbout || showPrivacy || showTerms || showContact || showProfile || showParty || showUpgrade;
    if (anyOverlayOpen) { closeAllOverlays(); return; }
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort(); abortControllerRef.current = null; setIsProcessing(false);
      setHistory((prev) => [...prev.filter((msg) => msg.role !== "loading"), { role: "warning", content: "[⚠️ ABORTED] Generation cancelled. Your mass-produced cope has been recalled." }]);
      if (commandHistory.length > 0) { const lastCmd = commandHistory[commandHistory.length - 1]!; setInputValue(lastCmd); setCursorToEnd(lastCmd); }
      return;
    }
    const now = Date.now();
    if (now - lastEscapeRef.current < 500) {
      if (inputValue.length > 0) setHistory((prev) => [...prev, { role: "system", content: "[ESC ESC] Input cleared. Even your half-typed thoughts disappoint me." }]);
      setInputValue(""); setSlashQuery(""); setSlashIndex(0); lastEscapeRef.current = 0;
    } else { lastEscapeRef.current = now; }
  };

  // Global Escape listener so it works even when input is disabled during processing
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") handleEscapeKey(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const handleArrowUp = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) { setSlashIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1)); return; }
    if (commandHistory.length === 0) return;
    const newIndex = historyIndex + 1;
    if (newIndex < commandHistory.length) { setHistoryIndex(newIndex); const val = commandHistory[commandHistory.length - 1 - newIndex]!; setInputValue(val); setCursorToEnd(val); }
  };

  const handleArrowDown = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) { setSlashIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0)); return; }
    const newIndex = historyIndex - 1;
    if (newIndex < -1) return;
    setHistoryIndex(newIndex);
    const val = newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]!;
    setInputValue(val); setCursorToEnd(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "c" && e.ctrlKey && brrrrrrIntervalRef.current) {
      e.preventDefault(); clearInterval(brrrrrrIntervalRef.current); brrrrrrIntervalRef.current = null;
      setHistory((prev) => [...prev, { role: "warning", content: "^C\n[✓] Process interrupted. Your CPU lives to fight another day." }]);
      setIsProcessing(false); return;
    }
    const filtered = getFilteredSlashCommands();
    const slashMenuOpen = slashQuery !== "" && filtered.length > 0;
    if (e.key === "Escape") return; // handled by global listener
    if (e.key === "Tab") {
      if (slashMenuOpen) { e.preventDefault(); const selected = filtered[slashIndex]; if (selected) { setInputValue(selected); setSlashQuery(selected); } }
      else if (suggestedReply && !inputValue) { e.preventDefault(); setInputValue(suggestedReply); setSuggestedReply(null); }
      return;
    }
    if (e.key === "Enter") {
      if (slashMenuOpen) { e.preventDefault(); const selected = filtered[slashIndex]; if (selected) runSlashCommand(selected); return; }
      if (inputValue.trim() !== "" && !isProcessing) handleEnterSubmit();
    } else if (e.key === "ArrowUp") { e.preventDefault(); handleArrowUp(slashMenuOpen, filtered); }
    else if (e.key === "ArrowDown") { e.preventDefault(); handleArrowDown(slashMenuOpen, filtered); }
  };

  const renderOverlays = () => (<>
    {showStore && <StoreOverlay state={state} buyGenerator={buyGenerator} buyUpgrade={buyUpgrade} buyTheme={buyTheme} equipTheme={setActiveTheme} onClose={() => setShowStore(false)} />}
    {showLeaderboard && <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />}
    {showAchievements && <AchievementOverlay unlockedIds={state.achievements} onClose={() => setShowAchievements(false)} />}
    {showHelp && <HelpOverlay onClose={() => { setShowHelp(false); window.history.pushState(null, "", "/"); }} />}
    {showAbout && <AboutOverlay onClose={() => { setShowAbout(false); window.history.pushState(null, "", "/"); }} />}
    {showPrivacy && <PrivacyOverlay onClose={() => { setShowPrivacy(false); window.history.pushState(null, "", "/"); }} />}
    {showTerms && <TermsOverlay onClose={() => { setShowTerms(false); window.history.pushState(null, "", "/"); }} />}
    {showContact && <ContactOverlay onClose={() => { setShowContact(false); window.history.pushState(null, "", "/"); }} />}
    {showProfile && <UserProfileOverlay state={state} onClose={() => { setShowProfile(false); if (window.location.pathname.startsWith("/user/")) window.history.pushState(null, "", "/"); }} />}
    {showParty && <PartyOverlay onClose={() => setShowParty(false)} />}
    {showSynergize && <SynergizeOverlay onClose={() => { setShowSynergize(false); setIsProcessing(false); setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived a simulated 15-minute meeting of corporate synergy. No action items assigned." }]); }} />}
    {showUpgrade && <UpgradeOverlay isUpgraded={!!state.proKey} onClose={() => { setShowUpgrade(false); if (window.location.pathname === "/upgrade") window.history.pushState(null, "", "/"); }} />}
  </>);

  return (
    <div
      className={terminalContainerClassName({ activeRegression, outageHp, pendingReviewPing, pingAcknowledged, activeTheme: state.activeTheme })}
      style={{ ...parseGlitchStyle(regressionGlitch), backgroundColor: outageHp !== null ? undefined : 'var(--color-bg)', color: 'var(--color-text)' }}
      onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}
    >
      <div className="shrink-0">
        <Ticker onExpand={() => { closeAllOverlays(); setShowParty(true); }} onlineCount={onlineCount} />
        {outageHp !== null && <OutageBar outageHp={outageHp} />}
        <HeaderBar rank={rank} currentTD={state.economy.currentTD} quotaPercent={state.economy.quotaPercent} outageHp={outageHp} activeMultiplier={calculateActiveMultiplier(state.inventory, state.upgrades) * state.economy.tdMultiplier} username={state.username} isBYOK={BYOK_ENABLED && !!state.apiKey} isMax={!!state.proKey} byokTotalCost={state.byokTotalCost} onProfileClick={handleProfileClick} onHelpClick={() => { closeAllOverlays(); setShowHelp(true); }} onAboutClick={() => { closeAllOverlays(); setShowAbout(true); }} onSlashMenuClick={() => { setInputValue("/"); setSlashQuery("/"); setSlashIndex(0); inputRef.current?.focus(); }} onUpgradeClick={() => { closeAllOverlays(); setShowUpgrade(true); window.history.pushState(null, "", "/upgrade"); }} />
      </div>
      <div className={`flex-1 min-h-0 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}>
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        <MessageList history={history} messageKeys={messageKeys.current} initialHistoryLen={initialHistoryLen.current} promptString={promptString} activeTicketId={state.activeTicket?.id} username={state.username} onSlashCommand={handleSlashCommandClick} />
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
      {renderOverlays()}
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-1 backdrop-blur-sm font-mono hidden sm:flex sm:flex-col gap-1" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)' }}>
        <div className="flex items-center justify-between"><span>This is a parody project and is not affiliated with Anthropic.</span><span className="ml-auto text-right">&copy; Rinalds Uzkalns 2026 | made with&nbsp;<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></span></div>
        <div className="flex items-center justify-between">
          <span className="flex gap-4">{([["terms", setShowTerms], ["privacy", setShowPrivacy], ["about", setShowAbout], ["help", setShowHelp], ["contact", setShowContact]] as [string, Dispatch<SetStateAction<boolean>>][]).map(([key, setter]: [string, Dispatch<SetStateAction<boolean>>]) => (<button key={key} onClick={() => { closeAllOverlays(); setter(true); if (key !== "about" && key !== "help") window.history.pushState(null, "", `/${key}`); }} className="text-gray-400 hover:text-white">/{key}</button>))}</span>
          <span className="flex gap-4">{[["https://github.com/integry/claude-cope", "/github"], ["https://reddit.com/r/claudecope", "/reddit"], ["https://discord.gg/claudecope", "/discord"], ["https://x.com/claudecope", "/x"]].map(([href, label]) => (<a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">{label}</a>))}</span>
        </div>
      </footer>
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-2 backdrop-blur-sm font-mono sm:hidden text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)' }}><span className="leading-tight">Parody project, no Anthropic affiliation.</span></footer>
    </div>
  );
}

export default Terminal;
