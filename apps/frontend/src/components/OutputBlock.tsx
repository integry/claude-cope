import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "./Terminal";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

const roleColors: Record<Message["role"], string> = {
  user: "text-white font-bold",
  system: "text-gray-100",
  loading: "text-yellow-400",
  warning: "text-yellow-400",
  error: "text-red-500",
};

function Spinner() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f: number) => (f + 1) % SPINNER_FRAMES.length), 150);
    return () => clearInterval(id);
  }, []);
  return <span>{SPINNER_FRAMES[frame]} </span>;
}

function TokenCounter() {
  const [sent, setSent] = useState(185000 + Math.floor(Math.random() * 40000));
  const [received, setReceived] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSent((s: number) => s + Math.floor(Math.random() * 120) + 30);
      setReceived((r: number) => r + Math.floor(Math.random() * 80) + 10);
    }, 80);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-yellow-400/70 ml-2 text-sm">
      Tokens - Sent: {(sent / 1000).toFixed(1)}k | Received: {(received / 1000).toFixed(1)}k
    </span>
  );
}

const markdownComponents = {
  p({ children }: { children?: React.ReactNode }) {
    return <p className="mb-3 leading-relaxed">{children}</p>;
  },
  strong({ children }: { children?: React.ReactNode }) {
    return <strong className="text-white font-bold">{children}</strong>;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return <ul className="list-disc pl-6 mb-3">{children}</ul>;
  },
  ol({ children }: { children?: React.ReactNode }) {
    return <ol className="list-decimal pl-6 mb-3">{children}</ol>;
  },
  li({ children }: { children?: React.ReactNode }) {
    return <li className="mb-1 leading-relaxed">{children}</li>;
  },
  code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    if (match) {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
        >
          {codeString}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className={`text-cyan-300 bg-cyan-950/30 px-1 rounded ${className || ""}`} {...props}>
        {children}
      </code>
    );
  },
};

function OutputBlock({ message, promptString = "cope@local:~$ " }: { message: Message; promptString?: string }) {
  const colorClass = roleColors[message.role];
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && message.content.includes("\n");
  const isSpecialAsciiArt = isAchievement || isBuddyInterjection;
  const useMarkdown = (message.role === "system" || message.role === "warning" || message.role === "error") && !isSpecialAsciiArt;

  return (
    <div className={`mb-5 ${colorClass} ${isAchievement ? "achievement-flash whitespace-pre font-bold" : isBuddyInterjection ? "whitespace-pre font-mono" : ""}`}>
      {message.role === "user" && (
        <span className="text-green-400 font-bold">{promptString}</span>
      )}
      {message.role === "loading" && <Spinner />}
      {useMarkdown ? (
        <ReactMarkdown components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      ) : (
        message.content
      )}
      {message.role === "loading" && <TokenCounter />}
    </div>
  );
}

export default React.memo(OutputBlock);
