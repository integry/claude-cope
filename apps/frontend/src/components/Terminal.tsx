import { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent, memo } from "react";
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
import HeaderBar from "./HeaderBar";
import { useGameState, Message } from "../hooks/useGameState";
import { calculateActiveMultiplier } from "../hooks/gameStateUtils";
import { BuddyDisplay } from "./BuddyDisplay";
import { parseGlitchStyle } from "./parseGlitchStyle";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { executeSlashCommand, rollBuddy } from "./slashCommandExecutor";
import { handleKeyCommand } from "./keyCommandHandler";
import { fetchRandomTicketPrompt } from "./ticketPrompt";
import Ticker from "./Ticker";
import { OutageBar, DAMAGE_COMMANDS } from "./OutageBar";
import SprintProgressBar from "./SprintProgressBar";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { useTerminalEffects } from "../hooks/useTerminalEffects";
import { getRandomLoadingPhrase } from "./loadingPhrases";

export type { Message };

/** Memoized message list — only re-renders when history/keys/props actually change */
const MessageList = memo(function MessageList({ history, messageKeys, initialHistoryLen, promptString, activeTicketId }: {
  history: Message[];
  messageKeys: number[];
  initialHistoryLen: number;
  promptString: string;
  activeTicketId?: string | null;
}) {
  return (
    <>
      {history.map((message, index) => (
        <OutputBlock key={messageKeys[index]} message={message} isNew={index >= initialHistoryLen} promptString={promptString} activeTicketId={activeTicketId} />
      ))}
    </>
  );
});


/**
 * Build LLM context from chat history.
 * Pairs user messages with a short summary of the bot reply to maintain
 * conversation rhythm without leaking old content.
 */
function filterChatHistory(history: Message[]): { role: string; content: string }[] {
  // Filter out slash commands and their responses, then map UI roles to LLM roles.
  // History windowing and assistant-reply trimming happen in shared buildChatMessages.
  const isSlashCmd = (content: string) => content.startsWith("/");
  return history.filter((m, i) => {
    if (m.role === "user") return !isSlashCmd(m.content);
    if (m.role === "system") {
      const prev = history[i - 1];
      if (prev?.role === "user" && isSlashCmd(prev.content)) return false;
      return true;
    }
    return false;
  }).map((m) => ({
    role: m.role === "system" ? "assistant" : "user",
    content: m.content,
  }));
}

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, buyUpgrade, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff, setChatHistory, offlineTDEarned, clearOfflineTDEarned, updateTicketProgress } = useGameState();
  const history = state.chatHistory;
  const setHistory = setChatHistory;
  const { onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, outageHp, sendDamage } = useMultiplayer({ setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff });
  const rank = state.economy.currentRank;
  const { isBooting, regressionGlitch, activeRegression } = useTerminalEffects({ history, setHistory, setState, offlineTDEarned, clearOfflineTDEarned });
  const [quotaLocked, setQuotaLocked] = useState(false);
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
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [compactEffect, setCompactEffect] = useState(false);
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

  const closeAllOverlays = useCallback(() => { setShowStore(false); setShowLeaderboard(false); setShowAchievements(false); setShowSynergize(false); setShowHelp(false); setShowAbout(false); setShowPrivacy(false); setShowTerms(false); setShowContact(false); setShowProfile(false); }, []);
  const handleProfileClick = useCallback(() => { closeAllOverlays(); setShowProfile(true); window.history.pushState(null, "", `/user/${encodeURIComponent(state.username)}`); }, [closeAllOverlays, state.username]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "auto" }); }, [history]);

  useEffect(() => {
    const onPopState = () => { setShowHelp(window.location.pathname === "/help"); setShowAbout(window.location.pathname === "/about"); setShowPrivacy(window.location.pathname === "/privacy"); setShowTerms(window.location.pathname === "/terms"); setShowContact(window.location.pathname === "/contact"); setShowProfile(window.location.pathname.startsWith("/user/")); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => { if (!isProcessing && !isBooting && !quotaLocked) inputRef.current?.focus(); }, [isProcessing, isBooting, quotaLocked]);

  useEffect(() => {
    if (isBooting || state.hasSeenTicketPrompt || state.activeTicket) return;
    setState((prev) => ({ ...prev, hasSeenTicketPrompt: true }));
    fetchRandomTicketPrompt(setHistory);
  }, [isBooting, state.hasSeenTicketPrompt, state.activeTicket, setState, setHistory]);

  const triggerInstantBan = () => {
    setInstantBanReady(false); setQuotaLocked(true); setIsProcessing(true);
    setHistory((prev) => [...prev.filter((m) => m.role !== "loading"), { role: "error", content: "[ACCOUNT BANNED] Suspicious activity detected. Thanks for the $200." }]);
    setTimeout(() => { setQuotaLocked(false); setIsProcessing(false); setHistory((prev) => [...prev, { role: "system", content: "[APPEAL ACCEPTED] Your ban has been overturned. We kept the $200." }]); }, 5000);
  };

  const applyQuotaDrain = (): boolean => {
    if (state.apiKey) return false;
    if (instantBanReady) { triggerInstantBan(); return true; }
    return false;
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
    executeSlashCommand(command, { state, setState, setHistory, setIsProcessing, closeAllOverlays, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setBragPending, setBuddyPendingConfirm, unlockAchievement, clearCount, setClearCount, setInputValue, setSlashQuery, setSlashIndex, addActiveTD, applyQuotaDrain, onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, brrrrrrIntervalRef, triggerCompactEffect: () => { setCompactEffect(true); setTimeout(() => setCompactEffect(false), 500); } });
  };

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

  const handleEnterSubmit = () => {
    if (tryOutageDamage()) return;
    if (inputValue.trim().startsWith("/")) { runSlashCommand(inputValue.trim()); return; }
    if (bragPending) { handleBragSubmit(); return; }
    if (buddyPendingConfirm) { handleBuddyConfirm(); return; }
    if (handleKeyCommand(inputValue, setState, setHistory)) { setInputValue(""); return; }
    const command = inputValue;
    setCommandHistory((prev) => [...prev, command]); setHistoryIndex(-1); setInputValue("");
    if (applyQuotaDrain()) { setHistory((prev) => [...prev, { role: "user", content: command }]); return; }
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
    const onSprintProgress = (rawAmount: number) => {
      if (!state.activeTicket) return;
      const amount = Math.round(rawAmount * 1.5);
      updateTicketProgress(amount);
      const newProgress = Math.min(state.activeTicket.sprintProgress + amount, state.activeTicket.sprintGoal);
      if (newProgress >= state.activeTicket.sprintGoal) {
        const payout = state.activeTicket.sprintGoal * 10;
        addActiveTD(payout);
        setHistory((prev) => [...prev, { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${state.activeTicket!.id} "${state.activeTicket!.title}" delivered! You earned **${payout.toLocaleString()} TD**. The board is pleased... for now.` }]);
        setState((prev) => ({ ...prev, activeTicket: null }));
      }
    };
    const controller = new AbortController();
    abortControllerRef.current = controller;
    submitChatMessage({
      chatMessages,
      buddyResult,
      unlockAchievement,
      setHistory,
      setIsProcessing,
      currentRank: rank,
      apiKey: state.apiKey,
      customModel: state.selectedModel,
      proKey: state.proKey,
      modes: state.modes,
      activeTicket: state.activeTicket,
      onSprintProgress,
      addActiveTD,
      onSuggestedReply: setSuggestedReply,
      buddyType: state.buddy.type,
      username: state.username,
      inventory: state.inventory,
      upgrades: state.upgrades,
      onByokUsage: (usage) => setState((prev) => ({ ...prev, byokTotalCost: (prev.byokTotalCost ?? 0) + (usage.cost ?? 0) })),
      onQuotaUpdate: (quotaPercent) => setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent } })),
      onQuotaExhausted: () => {
        setQuotaLocked(true);
        setHistory((prev) => [...prev, { role: "warning", content: "[🚫 Quota Exceeded] You've used all your available tokens.\n\n• Downgrade your expectations\n• Upgrade to Pro for 1,000 tokens\n• Shill us on Twitter for bonus tokens" }]);
      },
      signal: controller.signal,
    });
  };

  const setCursorToEnd = (val: string) => { setTimeout(() => { const el = inputRef.current; if (el) { el.focus(); el.selectionStart = el.selectionEnd = val.length; } }, 0); };

  const handleEscapeKey = () => {
    // Priority 1: Close any open overlay
    const anyOverlayOpen = showStore || showLeaderboard || showAchievements || showSynergize || showHelp || showAbout || showPrivacy || showTerms || showContact || showProfile;
    if (anyOverlayOpen) { closeAllOverlays(); return; }

    // Priority 2: Abort active API request
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsProcessing(false);
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "warning", content: "[⚠️ ABORTED] Generation cancelled. Your mass-produced cope has been recalled." },
      ]);
      // Restore the last command the user typed
      if (commandHistory.length > 0) {
        const lastCmd = commandHistory[commandHistory.length - 1]!;
        setInputValue(lastCmd);
        setCursorToEnd(lastCmd);
      }
      return;
    }

    // Priority 3: Double-tap escape to clear input
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

  const renderOverlays = () => (
    <>
      {showStore && <StoreOverlay state={state} buyGenerator={buyGenerator} buyUpgrade={buyUpgrade} onClose={() => setShowStore(false)} />}
      {showLeaderboard && <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />}
      {showAchievements && <AchievementOverlay unlockedIds={state.achievements} onClose={() => setShowAchievements(false)} />}
      {showHelp && <HelpOverlay onClose={() => { setShowHelp(false); window.history.pushState(null, "", "/"); }} />}
      {showAbout && <AboutOverlay onClose={() => { setShowAbout(false); window.history.pushState(null, "", "/"); }} />}
      {showPrivacy && <PrivacyOverlay onClose={() => { setShowPrivacy(false); window.history.pushState(null, "", "/"); }} />}
      {showTerms && <TermsOverlay onClose={() => { setShowTerms(false); window.history.pushState(null, "", "/"); }} />}
      {showContact && <ContactOverlay onClose={() => { setShowContact(false); window.history.pushState(null, "", "/"); }} />}
      {showProfile && <UserProfileOverlay state={state} onClose={() => { setShowProfile(false); if (window.location.pathname.startsWith("/user/")) window.history.pushState(null, "", "/"); }} />}
      {showSynergize && (
        <SynergizeOverlay onClose={() => { setShowSynergize(false); setIsProcessing(false); setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived a simulated 15-minute meeting of corporate synergy. No action items assigned." }]); }} />
      )}
    </>
  );

  return (
    <div
      className={`${activeRegression === "broken_scrollback" ? "h-screen overflow-hidden" : "h-[100dvh] overflow-hidden"} w-full font-mono text-sm text-gray-100 leading-snug sm:leading-relaxed p-4 pb-0 flex flex-col transition-all duration-300 ${outageHp !== null ? "bg-red-900" : "bg-[#0d1117]"} ${pendingPing ? "pvp-ping-flash" : ""}`}
      style={parseGlitchStyle(regressionGlitch)}
      onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}
    >
      <div className="shrink-0">
        <Ticker />
        {outageHp !== null && <OutageBar outageHp={outageHp} />}
        <HeaderBar rank={rank} currentTD={state.economy.currentTD} quotaPercent={state.economy.quotaPercent} outageHp={outageHp} activeMultiplier={calculateActiveMultiplier(state.inventory, state.upgrades) * state.economy.tdMultiplier} username={state.username} isBYOK={!!state.apiKey} isPro={!!state.proKey} byokTotalCost={state.byokTotalCost} onProfileClick={handleProfileClick} onHelpClick={() => { closeAllOverlays(); setShowHelp(true); }} onAboutClick={() => { closeAllOverlays(); setShowAbout(true); }} onSlashMenuClick={() => { setInputValue("/"); setSlashQuery("/"); setSlashIndex(0); inputRef.current?.focus(); }} />
      </div>
      <div className={`flex-1 min-h-0 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}>
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        <MessageList history={history} messageKeys={messageKeys.current} initialHistoryLen={initialHistoryLen.current} promptString={promptString} activeTicketId={state.activeTicket?.id} />
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0">
        {state.activeTicket && <SprintProgressBar id={state.activeTicket.id} title={state.activeTicket.title} sprintProgress={state.activeTicket.sprintProgress} sprintGoal={state.activeTicket.sprintGoal} />}
        <div className="relative border-b border-white">
          {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} totalTechnicalDebt={state.economy.totalTDEarned} onSelect={runSlashCommand} />}
          <BuddyDisplay type={state.buddy.type} isShiny={state.buddy.isShiny} />
          <CommandLine ref={inputRef} value={inputValue} disabled={isProcessing || isBooting || quotaLocked} onChange={handleChange} onKeyDown={handleKeyDown} promptString={promptString} placeholder={suggestedReply ?? undefined} />
        </div>
      </div>
      {renderOverlays()}
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-1 bg-[#0d1117]/80 backdrop-blur-sm font-mono hidden sm:flex sm:flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>This is a parody project and is not affiliated with Anthropic.</span>
          <span className="ml-auto text-right">&copy; Rinalds Uzkalns 2026 | made with&nbsp;<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex gap-4">
            <button onClick={() => { closeAllOverlays(); setShowTerms(true); window.history.pushState(null, "", "/terms"); }} className="text-gray-400 hover:text-white">/terms</button>
            <button onClick={() => { closeAllOverlays(); setShowPrivacy(true); window.history.pushState(null, "", "/privacy"); }} className="text-gray-400 hover:text-white">/privacy</button>
            <button onClick={() => { closeAllOverlays(); setShowAbout(true); }} className="text-gray-400 hover:text-white">/about</button>
            <button onClick={() => { closeAllOverlays(); setShowHelp(true); }} className="text-gray-400 hover:text-white">/help</button>
            <button onClick={() => { closeAllOverlays(); setShowContact(true); window.history.pushState(null, "", "/contact"); }} className="text-gray-400 hover:text-white">/contact</button>
          </span>
          <span className="flex gap-4">
            <a href="https://github.com/integry/claude-cope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">/github</a>
            <a href="https://reddit.com/r/claudecope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">/reddit</a>
            <a href="https://discord.gg/claudecope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">/discord</a>
            <a href="https://x.com/claudecope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">/x</a>
          </span>
        </div>
      </footer>
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-2 bg-[#0d1117]/80 backdrop-blur-sm font-mono sm:hidden text-center">
        <span className="leading-tight">Parody project, no Anthropic affiliation.</span>
      </footer>
    </div>
  );
}

export default Terminal;
