import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import { useGameState, Message } from "../hooks/useGameState";
import { BUDDY_ICONS } from "./buddyConstants";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { executeSlashCommand, parseSabotageParams, rollBuddy } from "./slashCommandExecutor";
import { handleKeyCommand } from "./keyCommandHandler";
import Ticker from "./Ticker";
import { useMultiplayer } from "../hooks/useMultiplayer";

export type { Message };

function HeaderBar({ rank, totalTDEarned, quotaPercent, outageHp }: { rank: string; totalTDEarned: number; quotaPercent: number; outageHp: number | null }) {
  if (totalTDEarned < 100) return null;
  return (
    <div className={`sticky top-0 z-10 border-b pb-2 mb-2 ${outageHp !== null ? "bg-red-900 border-red-500" : "bg-[#0d1117] border-green-800"}`}>
      <div className="flex justify-between text-green-400 mb-1">
        <span>Rank: {rank}</span>
        <span>Technical Debt: {totalTDEarned.toLocaleString()} TD</span>
      </div>
      <div className={`text-xs font-mono ${quotaPercent > 50 ? "text-green-400" : quotaPercent > 20 ? "text-yellow-400" : "text-red-400"}`}>
        {(() => {
          const totalBlocks = 20;
          const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
          const emptyBlocks = totalBlocks - filledBlocks;
          return `[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)} ${quotaPercent}%]`;
        })()}
      </div>
    </div>
  );
}

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, buyUpgrade, drainQuota, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff, setChatHistory } = useGameState();
  const history = state.chatHistory;
  const setHistory = setChatHistory;
  const { onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, outageHp, sendDamage } = useMultiplayer({ setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff });
  const rank = state.economy.currentRank;
  const [quotaLocked, setQuotaLocked] = useState(false);
  const [instantBanReady, setInstantBanReady] = useState(false);

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showStore, setShowStore] = useState(false);
  const [bragPending, setBragPending] = useState(false);
  const [buddyPendingConfirm, setBuddyPendingConfirm] = useState(false);
  const [isBooting, setIsBooting] = useState<boolean>(() => {
    if (history.length > 0) return false; // Skip boot if chat history was restored
    const params = new URLSearchParams(window.location.search);
    return params.get("sabotage") !== "true";
  });

  const [clearCount, setClearCount] = useState(0);
  const [regressionGlitch, setRegressionGlitch] = useState<string | null>(null);
  const [activeRegression, setActiveRegression] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const brrrrrrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Boot sequence for organic visitors
  useEffect(() => {
    if (!isBooting) return;

    const bootLines = [
      "[OK] Initializing Claude Cope v0.1.3...",
      "[OK] Bypassing stackoverflow...",
      "[OK] Injecting technical debt...",
      "[WARN] Loading condescension matrix...",
      "[OK] Disabling all unit tests...",
      "[OK] Replacing documentation with TODO comments...",
      "[OK] Boot complete. Welcome to Claude Cope.",
    ];

    const interval = 3000 / bootLines.length;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    bootLines.forEach((line, i) => {
      const id = setTimeout(() => {
        setHistory((prev) => [...prev, { role: "system" as const, content: line }]);
      }, interval * (i + 1));
      timeouts.push(id);
    });

    const finishId = setTimeout(() => {
      setIsBooting(false);
    }, 3000);
    timeouts.push(finishId);

    return () => timeouts.forEach(clearTimeout);
  }, [isBooting, setHistory]);

  // Handle sabotage URL parameters on mount
  useEffect(() => {
    parseSabotageParams(setState, setHistory);
  }, [setState, setHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [history]);

  // Update Regression chaos event — fires every 10-15 minutes
  useEffect(() => {
    const REGRESSION_TYPES = [
      { id: "backwards_typing", name: "Backwards Typing", css: "" },
      { id: "broken_scrollback", name: "Broken Scrollback", css: "" },
      { id: "upside_down", name: "Upside-Down Rendering", css: "transform: scaleY(-1);" },
      { id: "opacity_fade", name: "Opacity Fade Leak", css: "opacity: 0.3;" },
      { id: "letter_spacing", name: "Letter Spacing Explosion", css: "letter-spacing: 0.5em;" },
      { id: "comic_sans", name: "Font Corruption", css: 'font-family: "Comic Sans MS", "Comic Sans", cursive;' },
    ];

    const scheduleRegression = () => {
      const delayMs = (Math.random() * 5 + 10) * 60 * 1000; // 10-15 minutes
      return setTimeout(() => {
        const regression = REGRESSION_TYPES[Math.floor(Math.random() * REGRESSION_TYPES.length)]!;
        setHistory((prev) => [
          ...prev,
          { role: "warning", content: `[⬆️ UPDATE] Claude Cope v0.1.4-rc.${Math.floor(Math.random() * 99) + 1} deploying... Applying patch: ${regression.name}` },
        ]);
        setRegressionGlitch(regression.css || null);
        setActiveRegression(regression.id);

        // Revert after exactly 10 seconds
        setTimeout(() => {
          setRegressionGlitch(null);
          setActiveRegression(null);
          setHistory((prev) => [
            ...prev,
            { role: "error", content: `[FATAL ERROR] Rolling back... Reverting ${regression.name}. We apologize for the improved experience.` },
          ]);
        }, 10000);

        // Schedule the next regression
        timerId = scheduleRegression();
      }, delayMs);
    };

    let timerId = scheduleRegression();
    return () => clearTimeout(timerId);
  }, [setHistory]);

  const triggerQuotaLockout = () => {
    setQuotaLocked(true);
    setIsProcessing(true);
    setHistory((prev) => [
      ...prev,
      { role: "error", content: "[🚫 QUOTA EXCEEDED] API quota depleted. Contacting billing..." },
      { role: "warning", content: "[💳] Upgrading to Claude Cope Enterprise™ ($4,999/mo)... Please wait." },
    ]);
    setTimeout(() => {
      resetQuota();
      const newLockouts = state.economy.quotaLockouts + 1;
      if (newLockouts >= 3) {
        unlockAchievement("homer_at_the_buffet");
      }
      setQuotaLocked(false);
      setIsProcessing(false);
      setInstantBanReady(true);
      setHistory((prev) => {
        const messages: Message[] = [
          ...prev,
          { role: "system", content: "[✓] Billing upgrade complete. Quota restored to 100%. You may continue." },
        ];
        if (newLockouts >= 3) {
          messages.push({ role: "warning", content: "[🏆 Achievement Unlocked: homer_at_the_buffet]" });
        }
        return messages;
      });
    }, 5000);
  };

  const triggerInstantBan = () => {
    setInstantBanReady(false);
    setQuotaLocked(true);
    setIsProcessing(true);
    setHistory((prev) => [
      ...prev,
      { role: "error", content: "[🚨 INSTANT BAN] Suspicious activity detected! You typed too fast after a billing upgrade." },
      { role: "warning", content: "[🔒] Account temporarily suspended. Reviewing compliance..." },
    ]);
    setTimeout(() => {
      setQuotaLocked(false);
      setIsProcessing(false);
      setHistory((prev) => [
        ...prev,
        { role: "system", content: "[✓] Compliance review passed. Account reinstated. Proceed with caution." },
      ]);
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
      { state, setState, setHistory, setIsProcessing, setShowStore, setBragPending, setBuddyPendingConfirm, unlockAchievement, clearCount, setClearCount, setInputValue, setSlashQuery, setSlashIndex, addActiveTD, applyQuotaDrain, onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, brrrrrrIntervalRef },
    );
  };

  const DAMAGE_COMMANDS = ["kubectl restart pods", "ssh prod-01", "git revert HEAD"];

  const tryOutageDamage = (): boolean => {
    if (outageHp !== null && DAMAGE_COMMANDS.includes(inputValue.trim().toLowerCase())) {
      sendDamage();
      setHistory((prev) => [
        ...prev,
        { role: "user", content: inputValue },
        { role: "system", content: `[💥 HIT] Damage dealt to PROD OUTAGE!` },
      ]);
      setInputValue("");
      return true;
    }
    return false;
  };

  const handleEnterSubmit = () => {
    // Handle outage damage commands — bypass normal LLM processing
    if (tryOutageDamage()) return;

    // Handle /ping with arguments (e.g. "/ping SomeUser")
    if (inputValue.trim().startsWith("/ping ")) {
      runSlashCommand(inputValue.trim());
      return;
    }

    if (bragPending) {
      const username = inputValue.trim();
      setInputValue("");
      const generatorsOwned = Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
      const mostAbusedCommand = "/clear"; // The command everyone spams
      submitBrag({ username, currentRank: state.economy.currentRank, totalTDEarned: state.economy.totalTDEarned, generatorsOwned, mostAbusedCommand, setHistory, setBragPending });
      return;
    }

    if (buddyPendingConfirm) {
      const answer = inputValue.trim().toLowerCase();
      setInputValue("");
      setBuddyPendingConfirm(false);
      if (answer === "y" || answer === "yes") {
        setHistory((prev) => [...prev, { role: "user", content: inputValue }]);
        rollBuddy(setState, setHistory);
      } else {
        setHistory((prev) => [...prev, { role: "user", content: inputValue }, { role: "system", content: "[✓] Buddy re-roll cancelled. Your current buddy is safe... for now." }]);
      }
      return;
    }

    if (handleKeyCommand(inputValue, setState, setHistory)) {
      setInputValue("");
      return;
    }

    addActiveTD(Math.floor(Math.random() * 40) + 10);

    if (applyQuotaDrain()) {
      setInputValue("");
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

    const command = inputValue;
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setInputValue("");

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

    submitChatMessage({ chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank: rank, apiKey: state.apiKey });
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
      if (slashMenuOpen) {
        setSlashIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        return;
      }
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]!);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (slashMenuOpen) {
        setSlashIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        return;
      }
      const newIndex = historyIndex - 1;
      if (newIndex < -1) return;
      setHistoryIndex(newIndex);
      setInputValue(newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]!);
    }
  };

  return (
    <div
      className={`h-screen w-screen font-mono text-sm text-gray-300 p-4 flex flex-col transition-all duration-300 ${outageHp !== null ? "bg-red-900" : "bg-[#0d1117]"}`}
      style={regressionGlitch ? Object.fromEntries(regressionGlitch.split(";").filter(Boolean).map((s) => { const [k, ...v] = s.split(":"); return [k!.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(":").trim()]; })) : undefined}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Mount the Ticker at the very top of the interface so it acts as a global broadcast banner */}
      <Ticker />
      {outageHp !== null && (
        <div className="mb-2 border border-red-500 rounded p-2 bg-red-950">
          <div className="flex items-center justify-between text-red-400 text-xs mb-1">
            <span className="font-bold">[PROD OUTAGE] AWS us-east-1</span>
            <span>{outageHp}% HP</span>
          </div>
          <div className="h-3 bg-red-900 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300 rounded"
              style={{ width: `${outageHp}%` }}
            />
          </div>
          <div className="mt-2 text-red-300 text-xs">
            <span className="font-bold">Type to deal damage:</span>{" "}
            {DAMAGE_COMMANDS.map((cmd, i) => (
              <span key={cmd}>
                <code className="bg-red-900 px-1 rounded text-red-200">{cmd}</code>
                {i < DAMAGE_COMMANDS.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      )}
      <HeaderBar rank={rank} totalTDEarned={state.economy.totalTDEarned} quotaPercent={state.economy.quotaPercent} outageHp={outageHp} />
      <div className={`flex-1 ${activeRegression === "broken_scrollback" ? "overflow-y-hidden" : "overflow-y-auto"}`}>
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        {history.map((message, index) => (
          <OutputBlock key={index} message={message} promptString={activeRegression ? "C:\\WINDOWS\\system32>" : "cope@local:~$ "} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="relative">
        {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} totalTechnicalDebt={state.economy.totalTDEarned} />}
        {state.buddy.type && (
          <div className={`text-xs mb-1 ${state.buddy.isShiny ? "text-amber-300" : "text-yellow-400"}`}>
            {BUDDY_ICONS[state.buddy.type] ?? "🐾"} {state.buddy.isShiny ? `✨ Shiny ${state.buddy.type} ✨` : state.buddy.type} is watching...
          </div>
        )}
        <CommandLine
          ref={inputRef}
          value={inputValue}
          disabled={isProcessing || isBooting || quotaLocked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          promptString={activeRegression ? "C:\\WINDOWS\\system32>" : "cope@local:~$ "}
        />
      </div>
      {showStore && (
        <StoreOverlay
          state={state}
          buyGenerator={buyGenerator}
          buyUpgrade={buyUpgrade}
          onClose={() => setShowStore(false)}
        />
      )}
    </div>
  );
}

export default Terminal;
