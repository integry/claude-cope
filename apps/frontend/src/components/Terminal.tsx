import { useState } from "react";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

function Terminal() {
  const [_history, _setHistory] = useState<Message[]>([]);
  const [_commandHistory, _setCommandHistory] = useState<string[]>([]);
  const [_historyIndex, _setHistoryIndex] = useState<number>(-1);
  const [_isProcessing, _setIsProcessing] = useState<boolean>(false);
  const [_slashQuery, _setSlashQuery] = useState<string>("");

  return (
    <div className="h-screen w-screen bg-[#0d1117] font-mono text-sm text-gray-300 p-4">
      <p>Welcome to Claude Cope. Type a command to begin.</p>
    </div>
  );
}

export default Terminal;
