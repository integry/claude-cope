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

type TagCategory = "ERROR" | "WARN" | "SUCCESS" | "INFO";

const TAG_STYLES: Record<TagCategory, string> = {
  ERROR: "bg-red-500/15 text-red-400",
  WARN: "bg-yellow-500/15 text-yellow-400",
  SUCCESS: "bg-green-500/15 text-green-400",
  INFO: "bg-blue-500/15 text-blue-400",
};

const TAG_MARKER_PREFIX = "__TAG_";
const TAG_MARKER_REGEX = /^__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+)$/;

function classifyTag(tagContent: string): TagCategory {
  const lower = tagContent.toLowerCase();
  if (/error|❌|💀|🚨|fail|fatal|critical|sigsegv/.test(lower)) return "ERROR";
  if (/warn|⚠️|caution|notice|deprecated/.test(lower)) return "WARN";
  if (/success|✓|✅|complete|done|installed/.test(lower)) return "SUCCESS";
  return "INFO";
}

function preprocessTagPrefix(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const match = line.match(/^\[([^\]]+)\]/);
      if (!match) return line;
      const tagText = match[1]!;
      const category = classifyTag(tagText);
      const marker = `\`${TAG_MARKER_PREFIX}${category}__:${tagText}\``;
      return marker + line.slice(match[0].length);
    })
    .join("\n");
}

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
  em({ children }: { children?: React.ReactNode }) {
    return <em className="text-gray-300 italic">{children}</em>;
  },
  h1({ children }: { children?: React.ReactNode }) {
    return <h1 className="text-lg font-bold text-white mb-3 mt-4 border-b border-gray-700 pb-1">{children}</h1>;
  },
  h2({ children }: { children?: React.ReactNode }) {
    return <h2 className="text-base font-bold text-white mb-2 mt-3">{children}</h2>;
  },
  h3({ children }: { children?: React.ReactNode }) {
    return <h3 className="text-sm font-bold text-gray-200 mb-2 mt-2">{children}</h3>;
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return <blockquote className="border-l-2 border-gray-600 pl-3 ml-1 my-2 text-gray-400 italic">{children}</blockquote>;
  },
  hr() {
    return <hr className="border-gray-700 my-4" />;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>;
  },
  ol({ children }: { children?: React.ReactNode }) {
    return <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>;
  },
  li({ children }: { children?: React.ReactNode }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  pre({ children }: { children?: React.ReactNode }) {
    return <pre className="my-3 rounded overflow-x-auto">{children}</pre>;
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
    const tagMatch = TAG_MARKER_REGEX.exec(codeString);
    if (tagMatch) {
      const category = tagMatch[1] as TagCategory;
      const tagText = tagMatch[2];
      return (
        <span className={`${TAG_STYLES[category]} px-1.5 py-0 font-mono text-xs font-bold mr-2 inline-block`}>
          {tagText}
        </span>
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

  const processedContent = useMarkdown ? preprocessTagPrefix(message.content) : message.content;

  return (
    <div className={`mb-5 ${colorClass} ${isAchievement ? "achievement-flash whitespace-pre font-bold" : isBuddyInterjection ? "whitespace-pre font-mono" : "leading-relaxed"}`}>
      {message.role === "user" && (
        <span className="text-green-400 font-bold">{promptString}</span>
      )}
      {message.role === "loading" && <Spinner />}
      {useMarkdown ? (
        <div className="space-y-1">
          <ReactMarkdown components={markdownComponents}>
            {processedContent}
          </ReactMarkdown>
        </div>
      ) : (
        message.content
      )}
      {message.role === "loading" && <TokenCounter />}
    </div>
  );
}

export default React.memo(OutputBlock);
