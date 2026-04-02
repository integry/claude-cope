import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";
import SlashMenu, { SLASH_COMMANDS } from "./SlashMenu";

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

function Terminal() {
  const [history, setHistory] = useState<Message[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>("");
  const [slashIndex, setSlashIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  const executeSlashCommand = (command: string) => {
    setInputValue("");
    setSlashQuery("");
    setSlashIndex(0);

    if (command === "/clear") {
      setHistory([]);
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
        const command = inputValue;
        setCommandHistory((prev) => [...prev, command]);
        setHistoryIndex(-1);
        setInputValue("");

        setHistory((prev) => [
          ...prev,
          { role: "user", content: command },
          { role: "loading", content: "[⚙️] Coping with your request..." },
        ]);
        setIsProcessing(true);

        setTimeout(() => {
          setHistory((prev) => [
            ...prev.filter((msg) => msg.role !== "loading"),
            {
              role: "system",
              content: "[❌ Error] Your request lacks a senior mindset.",
            },
          ]);
          setIsProcessing(false);
        }, 1500);
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
    </div>
  );
}

export default Terminal;
