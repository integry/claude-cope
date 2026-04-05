import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import LeaderboardOverlay from "./LeaderboardOverlay";
import AchievementOverlay from "./AchievementOverlay";
import SynergizeOverlay from "./SynergizeOverlay";
import HeaderBar from "./HeaderBar";
import { useGameState, Message } from "../hooks/useGameState";
import { calculateTDpS } from "../hooks/gameStateUtils";
import { BUDDY_ICONS } from "./buddyConstants";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { executeSlashCommand, rollBuddy } from "./slashCommandExecutor";
import { buildAchievementBox } from "./achievementBox";
import { handleKeyCommand } from "./keyCommandHandler";
import Ticker from "./Ticker";
import { OutageBar, DAMAGE_COMMANDS } from "./OutageBar";
import SprintProgressBar from "./SprintProgressBar";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { useTerminalEffects } from "../hooks/useTerminalEffects";

export type { Message };

function BuddyDisplay({ type, isShiny }: { type: string | null; isShiny: boolean }) {
  if (!type) return null;
  return (
    <div className={`text-xs mb-1 ${isShiny ? "text-amber-300" : "text-yellow-400"}`}>
      <pre className="font-mono whitespace-pre inline-block">{BUDDY_ICONS[type] ?? "🐾"}</pre>
      <div>{isShiny ? `✨ Shiny ${type} ✨` : type} is watching...</div>
    </div>
  );
}

function parseGlitchStyle(regressionGlitch: string | null | undefined) {
  if (!regressionGlitch) return undefined;
  return Object.fromEntries(
    regressionGlitch.split(";").filter(Boolean).map((s) => {
      const [k, ...v] = s.split(":");
      return [k!.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(":").trim()];
    })
  );
}

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, buyUpgrade, drainQuota, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff, setChatHistory, offlineTDEarned, clearOfflineTDEarned, updateTicketProgress } = useGameState();
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
  const [showStore, setShowStore] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSynergize, setShowSynergize] = useState(false);
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [compactEffect, setCompactEffect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const brrrrrrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialHistoryLen = useRef(history.length);
  const lastEscapeRef = useRef<number>(0);
  const promptString = activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [history]);

  // Requirement 1: Auto-restore focus when terminal finishes processing/booting/quota lockout
  useEffect(() => {
    if (!isProcessing && !isBooting && !quotaLocked) {
      inputRef.current?.focus();
    }
  }, [isProcessing, isBooting, quotaLocked]);

  const triggerQuotaLockout = () => {
    setQuotaLocked(true);
    setIsProcessing(true);
    setHistory((prev) => [
      ...prev.filter((m) => m.role !== "loading"),
      { role: "error", content: "[HTTP 429] Limit Exceeded. You feel like Homer at an all-you-can-eat restaurant." },
      { role: "warning", content: "[⚙️] Upgrading to $200/mo Pro Tier..." },
    ]);
    setTimeout(() => {
      resetQuota();
      const newLockouts = state.economy.quotaLockouts + 1;
      const isNew = newLockouts >= 3 && unlockAchievement("homer_at_the_buffet");
      setQuotaLocked(false);
      setIsProcessing(false);
      // Only arm the ban trap on the first lockout — it's a one-time gag
      if (newLockouts === 1) setInstantBanReady(true);
      setHistory((prev) => {
        const messages: Message[] = [
          ...prev,
          { role: "system", content: "[SUCCESS] Pro Tier activated. You now have unlimited* access. (*subject to change without notice)" },
        ];
        if (isNew) {
          messages.push({ role: "warning", content: buildAchievementBox("homer_at_the_buffet") });
        }
        return messages;
      });
    }, 5000);
  };

  const triggerInstantBan = () => {
    setInstantBanReady(false); setQuotaLocked(true); setIsProcessing(true);
    setHistory((prev) => [...prev.filter((m) => m.role !== "loading"),
      { role: "error", content: "[ACCOUNT BANNED] Suspicious activity detected. Thanks for the $200." },
    ]);
    setTimeout(() => {
      setQuotaLocked(false); setIsProcessing(false);
      setHistory((prev) => [...prev, { role: "system", content: "[APPEAL ACCEPTED] Your ban has been overturned. We kept the $200." }]);
    }, 5000);
  };

  /** Drains quota and triggers lockout if depleted. Returns true if command was consumed by lockout. */
  const applyQuotaDrain = (): boolean => {
    if (instantBanReady) {
      triggerInstantBan();
      return true;
    }
    const remaining = drainQuota();
    if (remaining <= 0) {
      triggerQuotaLockout();
      return true;
    }
    return false;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (activeRegression === "backwards_typing" && value.length > inputValue.length) {
      const newChar = value.slice(inputValue.length);
      value = newChar + inputValue;
    }
    setInputValue(value);
    setHistoryIndex(-1);
    const newQuery = value.startsWith("/") ? value : "";
    setSlashQuery(newQuery);
    setSlashIndex(0);
  };

  const getFilteredSlashCommands = () =>
    SLASH_COMMANDS.filter((cmd) => {
      if (cmd === "/store" && state.economy.totalTDEarned < 1000) return false;
      return cmd.startsWith(slashQuery.toLowerCase());
    });

  const runSlashCommand = (command: string) => {
    executeSlashCommand(
      command,
      { state, setState, setHistory, setIsProcessing, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setBragPending, setBuddyPendingConfirm, unlockAchievement, clearCount, setClearCount, setInputValue, setSlashQuery, setSlashIndex, addActiveTD, applyQuotaDrain, onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, brrrrrrIntervalRef, triggerCompactEffect: () => { setCompactEffect(true); setTimeout(() => setCompactEffect(false), 500); } },
    );
  };

  const tryOutageDamage = (): boolean => {
    if (outageHp === null || !DAMAGE_COMMANDS.includes(inputValue.trim().toLowerCase())) return false;
    sendDamage();
    setHistory((prev) => [...prev, { role: "user", content: inputValue }, { role: "system", content: `[💥 HIT] Damage dealt to PROD OUTAGE!` }]);
    setInputValue("");
    return true;
  };

  const handleBragSubmit = () => {
    const username = inputValue.trim();
    setInputValue("");
    const generatorsOwned = Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
    const mostAbusedCommand = Object.entries(state.commandUsage).reduce(
      (best, [cmd, count]) => (count > best[1] ? [cmd, count] : best),
      ["/clear", 0] as [string, number],
    )[0];
    submitBrag({ username, currentRank: state.economy.currentRank, totalTDEarned: state.economy.totalTDEarned, generatorsOwned, mostAbusedCommand, setHistory, setBragPending });
  };

  const handleBuddyConfirm = () => {
    const answer = inputValue.trim().toLowerCase();
    setInputValue("");
    setBuddyPendingConfirm(false);
    if (answer === "y" || answer === "yes") {
      setHistory((prev) => [...prev, { role: "user", content: inputValue }]);
      rollBuddy(setState, setHistory);
    } else {
      setHistory((prev) => [...prev, { role: "user", content: inputValue }, { role: "system", content: "[✓] Buddy re-roll cancelled. Your current buddy is safe... for now." }]);
    }
  };

  const handleEnterSubmit = () => {
    // Handle outage damage commands — bypass normal LLM processing
    if (tryOutageDamage()) return;

    // Route all slash commands (including ones with args like /ping, /take, /ticket)
    if (inputValue.trim().startsWith("/")) {
      runSlashCommand(inputValue.trim());
      return;
    }

    if (bragPending) { handleBragSubmit(); return; }
    if (buddyPendingConfirm) { handleBuddyConfirm(); return; }

    if (handleKeyCommand(inputValue, setState, setHistory)) {
      setInputValue("");
      return;
    }

    const command = inputValue;
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setInputValue("");

    addActiveTD(Math.floor(Math.random() * 40) + 10);

    // Show the user's message in history before any lockout/ban kicks in
    if (applyQuotaDrain()) {
      setHistory((prev) => [...prev, { role: "user", content: command }]);
      return;
    }

    // Increment buddy interjection counter
    const buddyResult = computeBuddyInterjection(state.buddy);
    if (state.buddy.type) {
      const newCount = buddyResult ? 0 : state.buddy.promptsSinceLastInterjection + 1;
      setState((prev) => ({
        ...prev,
        buddy: { ...prev.buddy, promptsSinceLastInterjection: newCount },
      }));
    }

    const userMessage: Message = { role: "user", content: command };

    setHistory((prev) => [
      ...prev,
      userMessage,
      { role: "loading", content: "[⚙️] Coping with your request..." },
    ]);
    setIsProcessing(true);

    const chatMessages = [
      ...history.filter((m) => m.role === "user" || m.role === "system"),
      userMessage,
    ].map((m) => ({ role: m.role, content: m.content }));

    const onSprintProgress = (amount: number) => {
      if (!state.activeTicket) return;
      updateTicketProgress(amount);
      const newProgress = Math.min(
        state.activeTicket.sprintProgress + amount,
        state.activeTicket.sprintGoal,
      );
      if (newProgress >= state.activeTicket.sprintGoal) {
        const payout = state.activeTicket.sprintGoal;
        addActiveTD(payout);
        setHistory((prev) => [
          ...prev,
          { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${state.activeTicket!.id} "${state.activeTicket!.title}" delivered! You earned ${payout} TD. The board is pleased... for now.` },
        ]);
        setState((prev) => ({ ...prev, activeTicket: null }));
      }
    };

    submitChatMessage({ chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank: rank, apiKey: state.apiKey, modes: state.modes, activeTicket: state.activeTicket, onSprintProgress });
  };

  const setCursorToEnd = (val: string) => {
    setTimeout(() => {
      const el = inputRef.current;
      if (el) { el.selectionStart = el.selectionEnd = val.length; }
    }, 0);
  };

  const handleEscapeKey = () => {
    const now = Date.now();
    if (now - lastEscapeRef.current < 500) {
      if (inputValue.length > 0) {
        setHistory((prev) => [...prev, { role: "system", content: "[ESC ESC] Input cleared. Even your half-typed thoughts disappoint me." }]);
      }
      setInputValue("");
      setSlashQuery("");
      setSlashIndex(0);
      lastEscapeRef.current = 0;
    } else {
      lastEscapeRef.current = now;
    }
  };

  const handleArrowUp = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) {
      setSlashIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      return;
    }
    if (commandHistory.length === 0) return;
    const newIndex = historyIndex + 1;
    if (newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);
      const val = commandHistory[commandHistory.length - 1 - newIndex]!;
      setInputValue(val);
      setCursorToEnd(val);
    }
  };

  const handleArrowDown = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) {
      setSlashIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      return;
    }
    const newIndex = historyIndex - 1;
    if (newIndex < -1) return;
    setHistoryIndex(newIndex);
    const val = newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]!;
    setInputValue(val);
    setCursorToEnd(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "c" && e.ctrlKey && brrrrrrIntervalRef.current) {
      e.preventDefault();
      clearInterval(brrrrrrIntervalRef.current);
      brrrrrrIntervalRef.current = null;
      setHistory((prev) => [...prev, { role: "warning", content: "^C\n[✓] Process interrupted. Your CPU lives to fight another day." }]);
      setIsProcessing(false);
      return;
    }

    const filtered = getFilteredSlashCommands();
    const slashMenuOpen = slashQuery !== "" && filtered.length > 0;

    if (e.key === "Escape") {
      handleEscapeKey();
      return;
    }

    if (e.key === "Tab") {
      if (slashMenuOpen) {
        e.preventDefault();
        const selected = filtered[slashIndex];
        if (selected) {
          setInputValue(selected);
          setSlashQuery(selected);
        }
      }
      return;
    }

    if (e.key === "Enter") {
      if (slashMenuOpen) {
        e.preventDefault();
        const selected = filtered[slashIndex];
        if (selected) {
          runSlashCommand(selected);
        }
        return;
      }

      if (inputValue.trim() !== "" && !isProcessing) {
        handleEnterSubmit();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowUp(slashMenuOpen, filtered);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowDown(slashMenuOpen, filtered);
    }
  };

  return (
    <div
      className={`${activeRegression === "broken_scrollback" ? "h-screen overflow-hidden" : "min-h-screen"} w-full font-mono text-sm text-gray-100 leading-relaxed p-4 flex flex-col transition-all duration-300 ${outageHp !== null ? "bg-red-900" : "bg-[#0d1117]"} ${pendingPing ? "pvp-ping-flash" : ""}`}
      style={parseGlitchStyle(regressionGlitch)}
      onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}
    >
      {/* Mount the Ticker at the very top of the interface so it acts as a global broadcast banner */}
      <Ticker />
      {outageHp !== null && <OutageBar outageHp={outageHp} />}
      <HeaderBar rank={rank} totalTDEarned={state.economy.totalTDEarned} quotaPercent={state.economy.quotaPercent} outageHp={outageHp} tdps={calculateTDpS(state.inventory, state.upgrades)} />
      <div className={`flex-1 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"} ${compactEffect ? "compact-squeeze" : ""}`}>
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        {history.map((message, index) => (
          <OutputBlock key={index} message={message} isNew={index >= initialHistoryLen.current} promptString={promptString} activeTicketTitle={state.activeTicket?.title} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="relative">
        {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} totalTechnicalDebt={state.economy.totalTDEarned} onSelect={runSlashCommand} />}
        <BuddyDisplay type={state.buddy.type} isShiny={state.buddy.isShiny} />
        <CommandLine
          ref={inputRef}
          value={inputValue}
          disabled={isProcessing || isBooting || quotaLocked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          promptString={promptString}
        />
      </div>
      {state.activeTicket && (
        <SprintProgressBar id={state.activeTicket.id} title={state.activeTicket.title} sprintProgress={state.activeTicket.sprintProgress} sprintGoal={state.activeTicket.sprintGoal} />
      )}
      {showStore && (
        <StoreOverlay
          state={state}
          buyGenerator={buyGenerator}
          buyUpgrade={buyUpgrade}
          onClose={() => setShowStore(false)}
        />
      )}
      {showLeaderboard && (
        <LeaderboardOverlay
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      {showAchievements && (
        <AchievementOverlay
          unlockedIds={state.achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
      {showSynergize && (
        <SynergizeOverlay
          onClose={() => {
            setShowSynergize(false);
            setIsProcessing(false);
            setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived a simulated 15-minute meeting of corporate synergy. No action items assigned." }]);
          }}
        />
      )}
    </div>
  );
}

export default Terminal;
