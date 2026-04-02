import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import { useGameState } from "../hooks/useGameState";
import { CORPORATE_RANKS } from "../game/constants";
import { BUDDY_ICONS } from "./buddyConstants";
import { submitBrag } from "./submitBrag";
import { computeBuddyInterjection, submitChatMessage } from "./chatApi";

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator, drainQuota, resetQuota, unlockAchievement } = useGameState();
  const rank = state.economy.currentRank;
  const [quotaLocked, setQuotaLocked] = useState(false);
  const [instantBanReady, setInstantBanReady] = useState(false);

  const [history, setHistory] = useState<Message[]>([]);
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
    const params = new URLSearchParams(window.location.search);
    if (params.get("sabotage") !== "true") return;

    const target = parseInt(params.get("target") ?? "0", 10);
    const rankTitle = params.get("rank") ?? "";

    if (target > 0) {
      // Find the rank index matching the provided rank title
      let rankIndex = 0;
      for (let i = 0; i < CORPORATE_RANKS.length; i++) {
        if (CORPORATE_RANKS[i]!.title === rankTitle) {
          rankIndex = i;
          break;
        }
      }

      setState((prev) => {
        const newRankIndex = Math.max(
          CORPORATE_RANKS.findIndex((r) => r.title === prev.economy.currentRank),
          rankIndex,
        );
        return {
          ...prev,
          economy: {
            ...prev.economy,
            currentTD: prev.economy.currentTD + target,
            totalTDEarned: prev.economy.totalTDEarned + target,
            currentRank: CORPORATE_RANKS[newRankIndex]?.title ?? prev.economy.currentRank,
          },
        };
      });

      setHistory((prev) => [
        ...prev,
        {
          role: "warning" as const,
          content: `[🚨 SABOTAGE] A colleague sent you ${target.toLocaleString()} TD of inherited technical debt! Your rank has been set to ${rankTitle || "Unknown"}.`,
        },
      ]);
    }

    // Silently strip URL parameters so a refresh doesn't replay
    window.history.replaceState({}, "", window.location.pathname);
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
      setQuotaLocked(false);
      setIsProcessing(false);
      setInstantBanReady(true);
      setHistory((prev) => [
        ...prev,
        { role: "system", content: "[✓] Billing upgrade complete. Quota restored to 100%. You may continue." },
      ]);
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

  const executeSlashCommand = (command: string) => {
    setInputValue("");
    setSlashQuery("");
    setSlashIndex(0);
    setIsProcessing(true);
    setHistory((prev) => [
      ...prev,
      { role: "user", content: command },
      { role: "loading", content: "[⚙️] Claude is coping..." },
    ]);

    const clearLoading = (prev: Message[]) => prev.filter((m) => m.content !== "[⚙️] Claude is coping...");
    const reply = (msg: Message): void => {
      setHistory((prev) => [...clearLoading(prev), msg]);
    };

    setTimeout(() => {
      addActiveTD(Math.floor(Math.random() * 40) + 10);
      if (applyQuotaDrain()) return;

      if (command === "/clear") {
        setHistory((prev) => [
          ...clearLoading(prev),
          { role: "warning", content: "[WARNING] Executing sudo rm -rf /..." },
        ]);
        setTimeout(() => {
          setHistory([]);
          setIsProcessing(false);
        }, 2000);
        return;
      } else if (command === "/store") {
        if (state.economy.totalTDEarned < 1000) {
          reply({ role: "error", content: "[❌ Error] Store access denied. Requires 1,000 Technical Debt." });
        } else {
          setHistory(clearLoading);
          setShowStore(true);
        }
      } else if (command === "/synergize") {
        reply({ role: "system", content: "[🗓️] Joining 1-on-1 meeting. Please wait..." });
        setTimeout(() => {
          setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived 10 seconds of corporate synergy. No action items assigned." }]);
          setIsProcessing(false);
        }, 10000);
        return;
      } else if (command === "/compact") {
        setHistory((prev) => {
          const filtered = clearLoading(prev).slice(0, Math.max(0, clearLoading(prev).length - 5));
          return [...filtered, { role: "system", content: "[✓] Context compacted. Deleted 50 lines of unoptimized boilerplate." }];
        });
      } else if (command === "/brag") {
        setBragPending(true);
        reply({ role: "system", content: "[🏆] Enter your name for the Hall of Blame:" });
      } else if (command === "/support") {
        reply({ role: "system", content: "[✓] Support ticket created. Redirecting payload directly to /dev/null..." });
      } else if (command === "/preworkout") {
        reply({ role: "system", content: "[✓] Injected 400mg of pure caffeine into the Node.js event loop. LFG." });
      } else if (command === "/buddy") {
        const roll = Math.random() * 100;
        const [buddyType, buddyIcon] = roll < 70 ? ["Agile Snail", "🐌"] : roll < 95 ? ["Sarcastic Clippy", "📎"] : ["10x Dragon", "🐉"];
        const isShiny = buddyType === "10x Dragon" && Math.random() < 0.05;
        setState((prev) => ({ ...prev, buddy: { type: buddyType, isShiny, promptsSinceLastInterjection: 0 } }));
        const shinyLabel = isShiny ? " ✨ SHINY ✨" : "";
        reply({ role: "system", content: `[✓] RNG sequence complete. Spawning your new companion: ${buddyType}${shinyLabel} ${buddyIcon}!` });
      } else {
        reply({ role: "system", content: `[✓] Executed ${command}` });
      }

      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const filtered = getFilteredSlashCommands();
    const slashMenuOpen = slashQuery !== "" && filtered.length > 0;

    if (e.key === "Enter") {
      if (slashMenuOpen) {
        e.preventDefault();
        const selected = filtered[slashIndex];
        if (selected) {
          executeSlashCommand(selected);
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
