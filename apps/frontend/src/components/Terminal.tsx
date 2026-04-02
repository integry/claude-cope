import { useState, ChangeEvent, KeyboardEvent } from "react";
import OutputBlock from "./OutputBlock";
import CommandLine from "./CommandLine";

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

function Terminal() {
  const [_history, _setHistory] = useState<Message[]>([]);
  const [_commandHistory, _setCommandHistory] = useState<string[]>([]);
  const [_historyIndex, _setHistoryIndex] = useState<number>(-1);
  const [_isProcessing, _setIsProcessing] = useState<boolean>(false);
  const [_slashQuery, _setSlashQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (_e: KeyboardEvent<HTMLInputElement>) => {
    // Key handling will be implemented in a future phase
  };

  return (
    <div className="h-screen w-screen bg-[#0d1117] font-mono text-sm text-gray-300 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <p>Welcome to Claude Cope. Type a command to begin.</p>
        {_history.map((message, index) => (
          <OutputBlock key={index} message={message} />
        ))}
      </div>
      <CommandLine
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default Terminal;
