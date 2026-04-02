import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu from "./SlashMenu";
import { SLASH_COMMANDS } from "./slashCommands";
import StoreOverlay from "./StoreOverlay";
import { useGameState } from "../hooks/useGameState";
import { CORPORATE_RANKS } from "../game/constants";

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

function Terminal() {
  const { state, setState, addActiveTD, buyGenerator } = useGameState();
  const rank = CORPORATE_RANKS[state.rankIndex]?.title ?? "Junior Developer";

  const [history, setHistory] = useState<Message[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>("");
  const [slashIndex, setSlashIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [showStore, setShowStore] = useState<boolean>(false);
  const [bragPending, setBragPending] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

      setState((prev) => ({
        ...prev,
        technicalDebt: prev.technicalDebt + target,
        totalTechnicalDebt: prev.totalTechnicalDebt + target,
        rankIndex: Math.max(prev.rankIndex, rankIndex),
      }));

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const newQuery = value.startsWith("/") ? value : "";
    setSlashQuery(newQuery);
    setSlashIndex(0);
  };

  const getFilteredSlashCommands = () =>
    SLASH_COMMANDS.filter((cmd) => cmd.startsWith(slashQuery.toLowerCase()));

  const submitBrag = (username: string) => {
    const currentRank = CORPORATE_RANKS[state.rankIndex]?.title ?? "Junior Developer";
    const currentDebt = state.totalTechnicalDebt;

    setHistory((prev) => [
      ...prev,
      { role: "user", content: username },
      { role: "loading", content: "[⚙️] Submitting to the Hall of Blame..." },
    ]);

    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, rank: currentRank, debt: currentDebt }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          setHistory((prev) => [
            ...prev.filter((msg) => msg.role !== "loading"),
            { role: "error", content: `[❌ Error] ${errorData?.error ?? "Failed to submit brag"}` },
          ]);
          return;
        }

        const sabotageUrl = `${window.location.origin}?sabotage=true&target=${currentDebt}&rank=${encodeURIComponent(currentRank)}`;

        const payload = [
          "┌──────────────────────────────────────────────┐",
          "│        PERFORMANCE REVIEW — Claude Cope       │",
          "├──────────────────────────────────────────────┤",
          `│  Employee:  ${username.padEnd(33)}│`,
          `│  Rank:      ${currentRank.padEnd(33)}│`,
          `│  Total TD:  ${currentDebt.toLocaleString().padEnd(33)}│`,
          "├──────────────────────────────────────────────┤",
          "│  Comments:                                    │",
          "│  \"Has demonstrated an exceptional ability     │",
          "│   to accumulate technical debt at scale.\"     │",
          "├──────────────────────────────────────────────┤",
          "│  🔗 Share the love (sabotage a coworker):     │",
          `│  ${sabotageUrl.length <= 44 ? sabotageUrl.padEnd(44) : sabotageUrl}│`,
          "└──────────────────────────────────────────────┘",
        ].join("\n");

        navigator.clipboard.writeText(payload).catch(() => {
          // clipboard may not be available in all environments
        });

        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          {
            role: "system",
            content: `\`\`\`\n${payload}\n\`\`\`\n\n[📋 Copied to clipboard! Paste it anywhere to brag.]`,
          },
        ]);
      })
      .catch(() => {
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
        ]);
      })
      .finally(() => {
        setBragPending(false);
      });
  };

  const executeSlashCommand = (command: string) => {
    setInputValue("");
    setSlashQuery("");
    setSlashIndex(0);

    addActiveTD(Math.floor(Math.random() * 40) + 10);

    if (command === "/clear") {
      setHistory([]);
    } else if (command === "/store") {
      setShowStore(true);
    } else if (command === "/brag") {
      setBragPending(true);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: "/brag" },
        { role: "system", content: "[🏆] Enter your name for the Hall of Blame:" },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        { role: "user", content: command },
        { role: "system", content: `[✓] Executed ${command}` },
      ]);
    }
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
          submitBrag(username);
          return;
        }

        addActiveTD(Math.floor(Math.random() * 40) + 10);
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

        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
        })
          .then(async (res) => {
            if (res.status === 429) {
              setHistory((prev) => [
                ...prev.filter((msg) => msg.role !== "loading"),
                { role: "warning", content: "[⚠️] Rate limited. Please wait before sending another message." },
              ]);
              return;
            }

            if (!res.ok) {
              const errorData = await res.json().catch(() => null);
              setHistory((prev) => [
                ...prev.filter((msg) => msg.role !== "loading"),
                {
                  role: "error",
                  content: `[❌ Error] ${errorData?.error ?? "Request failed"}`,
                },
              ]);
              return;
            }

            const data = await res.json();
            const reply =
              data?.choices?.[0]?.message?.content ?? "[❌ Error] No response from API.";

            setHistory((prev) => [
              ...prev.filter((msg) => msg.role !== "loading"),
              { role: "system", content: reply },
            ]);
          })
          .catch(() => {
            setHistory((prev) => [
              ...prev.filter((msg) => msg.role !== "loading"),
              { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
            ]);
          })
          .finally(() => {
            setIsProcessing(false);
          });
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
      if (newIndex === -1) {
        setInputValue("");
      } else {
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]!);
      }
    }
  };

  return (
    <div
      className="h-screen w-screen bg-[#0d1117] font-mono text-sm text-gray-300 p-4 flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="sticky top-0 z-10 bg-[#0d1117] border-b border-green-800 pb-2 mb-2 flex justify-between text-green-400">
        <span>Rank: {rank}</span>
        <span>Technical Debt: {state.totalTechnicalDebt.toLocaleString()} TD</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p>Welcome to Claude Cope. Type a command to begin.</p>
        {history.map((message, index) => (
          <OutputBlock key={index} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="relative">
        {slashQuery && <SlashMenu query={slashQuery} activeIndex={slashIndex} />}
        <CommandLine
          ref={inputRef}
          value={inputValue}
          disabled={isProcessing}
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
