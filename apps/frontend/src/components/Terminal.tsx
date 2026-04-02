import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import { useGameState } from "../hooks/useGameState";
import { BUDDY_ICONS } from "./buddyConstants";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";
import { executeSlashCommand, parseSabotageParams } from "./slashCommandExecutor";
import Ticker from "./Ticker";
import { useMultiplayer } from "../hooks/useMultiplayer";

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, drainQuota, resetQuota, unlockAchievement } = useGameState();
  const [history, setHistory] = useState<Message[]>([]);
  const { onlineCount, sendPing, pendingPing, rejectPing } = useMultiplayer(setHistory);
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
  const [isBooting, setIsBooting] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sabotage") !== "true";
  });

  const [clearCount, setClearCount] = useState(0);
  const [regressionGlitch, setRegressionGlitch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Boot sequence for organic visitors
  useEffect(() => {
    if (!isBooting) return;

    const bootLines = [
      "[OK] Initializing Claude Cope v0.1.3...",
      "[OK] Bypassing stackoverflow...",
      "[OK] Injecting technical debt...",
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
  }, [isBooting]);

  // Handle sabotage URL parameters on mount
  useEffect(() => {
    parseSabotageParams(setState, setHistory);
  }, [setState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [history]);

  // Update Regression chaos event — fires every 10-15 minutes
  useEffect(() => {
    const REGRESSION_TYPES = [
      { name: "RTL Text Inversion", css: "direction: rtl; unicode-bidi: bidi-override;" },
      { name: "Comic Sans Migration", css: "font-family: 'Comic Sans MS', 'Comic Sans', cursive;" },
      { name: "Upside-Down Rendering", css: "transform: scaleY(-1);" },
      { name: "Opacity Fade Leak", css: "opacity: 0.3;" },
      { name: "Letter Spacing Explosion", css: "letter-spacing: 0.5em;" },
    ];

    const scheduleRegression = () => {
      const delayMs = (Math.random() * 5 + 10) * 60 * 1000; // 10-15 minutes
      return setTimeout(() => {
        const regression = REGRESSION_TYPES[Math.floor(Math.random() * REGRESSION_TYPES.length)]!;
        setHistory((prev) => [
          ...prev,
          { role: "warning", content: `[⬆️ UPDATE] Claude Cope v0.1.4-rc.${Math.floor(Math.random() * 99) + 1} deploying... Applying patch: ${regression.name}` },
        ]);
        setRegressionGlitch(regression.css);

        // Revert after exactly 10 seconds
        setTimeout(() => {
          setRegressionGlitch(null);
          setHistory((prev) => [
            ...prev,
            { role: "error", content: `[⏪ ROLLBACK] Update failed. Reverting ${regression.name}... Previous stable version restored.` },
          ]);
        }, 10000);

        // Schedule the next regression
        timerId = scheduleRegression();
      }, delayMs);
    };

    let timerId = scheduleRegression();
    return () => clearTimeout(timerId);
  }, []);

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
      // Instant ban trap window: 2 seconds after unlock
      setTimeout(() => setInstantBanReady(false), 2000);
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
    const value = e.target.value;
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
      { state, setState, setHistory, setIsProcessing, setShowStore, setBragPending, unlockAchievement, clearCount, setClearCount, setInputValue, setSlashQuery, setSlashIndex, addActiveTD, applyQuotaDrain, onlineCount, sendPing, pendingPing, rejectPing },
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        if (bragPending) {
          const username = inputValue.trim();
          setInputValue("");
          submitBrag(username, state.economy.currentRank, state.economy.totalTDEarned, setHistory, setBragPending);
          return;
        }

        addActiveTD(Math.floor(Math.random() * 40) + 10);

        if (applyQuotaDrain()) {
          setInputValue("");
          return;
        }

        // Increment buddy interjection counter
        const buddyInterjection = computeBuddyInterjection(state.buddy);
        if (state.buddy.type) {
          const newCount = buddyInterjection ? 0 : state.buddy.promptsSinceLastInterjection + 1;
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

        submitChatMessage(chatMessages, buddyInterjection, unlockAchievement, setHistory, setIsProcessing);
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
      className="h-screen w-screen bg-[#0d1117] font-mono text-sm text-gray-300 p-4 flex flex-col transition-all duration-300"
      style={regressionGlitch ? Object.fromEntries(regressionGlitch.split(";").filter(Boolean).map((s) => { const [k, ...v] = s.split(":"); return [k!.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(":").trim()]; })) : undefined}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Mount the Ticker at the very top of the interface so it acts as a global broadcast banner */}
      <Ticker />
      <div className="sticky top-0 z-10 bg-[#0d1117] border-b border-green-800 pb-2 mb-2">
        <div className="flex justify-between text-green-400 mb-1">
          <span>Rank: {rank}</span>
          <span>Technical Debt: {state.economy.totalTDEarned.toLocaleString()} TD</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">API Quota:</span>
          <div className="flex-1 h-2 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded"
              style={{
                width: `${state.economy.quotaPercent}%`,
                backgroundColor:
                  state.economy.quotaPercent > 50
                    ? "#22c55e"
                    : state.economy.quotaPercent > 20
                      ? "#eab308"
                      : "#ef4444",
              }}
            />
          </div>
          <span className={state.economy.quotaPercent > 50 ? "text-green-400" : state.economy.quotaPercent > 20 ? "text-yellow-400" : "text-red-400"}>
            {state.economy.quotaPercent}%
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!isBooting && <p>Welcome to Claude Cope. Type a command to begin.</p>}
        {history.map((message, index) => (
          <OutputBlock key={index} message={message} />
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
        />
      </div>
      {showStore && (
        <StoreOverlay
          state={state}
          buyGenerator={buyGenerator}
          onClose={() => setShowStore(false)}
        />
      )}
    </div>
  );
}

export default Terminal;
