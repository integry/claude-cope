import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "./Terminal";
import { pickRandomSequence } from "./toolSequences";
import { useTypewriter } from "../hooks/useTypewriter";
import { ShareButton } from "./ShareButton";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

function SimulatedToolCall({ activeTicketId }: { activeTicketId?: string | null }) {
  // Pick a random sequence once on mount, based on active ticket ID
  const [steps] = useState(() => pickRandomSequence(activeTicketId));
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // Cycle through tool steps at varying intervals for realism
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
      setElapsed(0);
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => e + 80);
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(id);
  }, []);

  const step = steps[stepIndex]!;
  const durationSec = (elapsed / 1000).toFixed(1);

  return (
    <div className="mt-1 space-y-0.5 text-sm font-mono">
      <div className="text-gray-500 flex items-center gap-2">
        <span className="text-yellow-400">{SPINNER_FRAMES[frame]}</span>
        <span className="text-blue-400">{step.tool}</span>
        <span className="text-gray-400">{step.target}</span>
        <span className="text-gray-600">({durationSec}s)</span>
      </div>
      <div className="text-gray-400 text-xs pl-4">
        {step.action}...
      </div>
    </div>
  );
}

const roleColors: Record<Message["role"], string> = {
  user: "text-white font-bold",
  system: "text-gray-100",
  loading: "text-yellow-400",
  warning: "text-yellow-400",
  error: "text-red-500",
};

type TagCategory = "ERROR" | "WARN" | "SUCCESS" | "INFO";

const TAG_STYLES: Record<TagCategory, string> = {
  ERROR: "text-red-400",
  WARN: "text-yellow-400",
  SUCCESS: "text-green-400",
  INFO: "text-blue-400",
};

const TAG_MARKER_REGEX = /^__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+)$/;

function classifyTag(tagContent: string): TagCategory {
  const lower = tagContent.toLowerCase();
  if (/error|❌|💀|🚨|fail|fatal|critical|sigsegv/.test(lower)) return "ERROR";
  if (/warn|⚠️|caution|notice|deprecated/.test(lower)) return "WARN";
  if (/success|✓|✅|complete|done|installed/.test(lower)) return "SUCCESS";
  return "INFO";
}

/** Strip any leaked __TAG_ markers the LLM echoes back from seeing chat history */
/** Strip leaked __TAG_ markers and unwrap terminal-ish code fences (bash, sh, shell, etc.) */
function cleanLLMOutput(content: string): string {
  let cleaned = content.replace(/`__TAG_(?:ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g, "[$1]");
  // Unwrap code fences for terminal-like languages — the content is already in a terminal
  const terminalLangs = "bash|sh|shell|console|terminal|text|log|plaintext|markdown|md";
  const fenceRegex = new RegExp("```(?:" + terminalLangs + ")\\s*\\n([\\s\\S]*?)```", "g");
  cleaned = cleaned.replace(fenceRegex, "$1");
  // Ensure [BRACKET TAGS] are preceded by a blank line so markdown renders them as separate paragraphs
  cleaned = cleaned.replace(/\n(\[(?:WARN|ERROR|SUCCESS|INFO|FATAL|CRITICAL|DEBUG|DONE|PROGRESS|RESULT|⚙️|⚠️|❌|✓|✅|🔥|💀|🚨|SIGSEGV)[^\]]*\])/g, "\n\n$1");
  // Also handle tags jammed directly after text with no newline at all
  cleaned = cleaned.replace(/([^\n])(\[(?:WARN|ERROR|SUCCESS|INFO|FATAL|CRITICAL|DEBUG|DONE|PROGRESS|RESULT|⚙️|⚠️|❌|✓|✅|🔥|💀|🚨|SIGSEGV)[^\]]*\])/g, "$1\n\n$2");
  return cleaned;
}

/** Render a line of text, replacing any `__TAG_...__:text` or `[TAG]` markers with styled spans. */
function renderLineWithTags(line: string): React.ReactNode {
  // Match backtick-wrapped tag markers: `__TAG_ERROR__:some text`
  const TAG_INLINE = /`__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g;
  // Match raw [BRACKET] tags at line start
  const BRACKET_TAG = /^\[([^\]]+)\]/;

  // First try backtick-wrapped markers
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let inlineMatch;
  while ((inlineMatch = TAG_INLINE.exec(line)) !== null) {
    if (inlineMatch.index > lastIndex) {
      parts.push(line.slice(lastIndex, inlineMatch.index));
    }
    const category = inlineMatch[1] as TagCategory;
    const tagText = inlineMatch[2];
    parts.push(
      <span key={inlineMatch.index} className={`${TAG_STYLES[category]} font-mono text-xs font-bold mr-2`}>
        {tagText}
      </span>
    );
    lastIndex = TAG_INLINE.lastIndex;
  }
  if (parts.length > 0) {
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return <>{parts}</>;
  }

  // Fallback: bracket tags at start of line
  const bracketMatch = BRACKET_TAG.exec(line);
  if (bracketMatch) {
    const category = classifyTag(bracketMatch[1]!);
    return (
      <>
        <span className={`${TAG_STYLES[category]} font-mono text-xs font-bold mr-2`}>
          {bracketMatch[1]}
        </span>
        {line.slice(bracketMatch[0].length)}
      </>
    );
  }

  return line;
}

function Spinner() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f: number) => (f + 1) % SPINNER_FRAMES.length), 150);
    return () => clearInterval(id);
  }, []);
  return <span>{SPINNER_FRAMES[frame]} </span>;
}

function TokenCounter({ tokensSent, tokensReceived }: { tokensSent?: number; tokensReceived?: number }) {
  const hasRealTokens = tokensSent != null || tokensReceived != null;
  const [sent, setSent] = useState(185000 + Math.floor(Math.random() * 40000));
  const [received, setReceived] = useState(0);
  useEffect(() => {
    if (hasRealTokens) return;
    const id = setInterval(() => {
      setSent((s: number) => s + Math.floor(Math.random() * 120) + 30);
      setReceived((r: number) => r + Math.floor(Math.random() * 80) + 10);
    }, 80);
    return () => clearInterval(id);
  }, [hasRealTokens]);

  const displaySent = hasRealTokens ? (tokensSent ?? 0) : sent;
  const displayReceived = hasRealTokens ? (tokensReceived ?? 0) : received;

  return (
    <span className="text-yellow-400/70 ml-2 text-sm">
      Tokens - Sent: {(displaySent / 1000).toFixed(1)}k | Received: {(displayReceived / 1000).toFixed(1)}k
    </span>
  );
}

const markdownComponents = {
  p({ children }: { children?: React.ReactNode }) {
    // Process [BRACKET TAG] markers in text children
    const processed = React.Children.map(children, (child) => {
      if (typeof child === "string") return renderLineWithTags(child);
      return child;
    });
    return <p className="mb-3 leading-relaxed">{processed}</p>;
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
    return <pre className="my-3 rounded whitespace-pre-wrap break-words">{children}</pre>;
  },
  code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    if (match) {
      // Terminal-ish languages render as plain preformatted text
      // to avoid clashing with the terminal's own dark/monospace aesthetic
      const terminalLangs = ["terminal", "bash", "sh", "shell", "console", "text", "log", "plaintext", "markdown", "md"];
      if (terminalLangs.includes(match[1]!)) {
        const lines = codeString.split("\n");
        return (
          <code className="block whitespace-pre text-gray-100">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {renderLineWithTags(line)}
                {i < lines.length - 1 && "\n"}
              </React.Fragment>
            ))}
          </code>
        );
      }
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
      <code className={`text-cyan-300 px-1 rounded ${className || ""}`} {...props}>
        {children}
      </code>
    );
  },
};

// Buddy interjections have a specific shape: ASCII art on the first lines,
// then a `[Buddy Name] text` line. We need to render those as preformatted
// monospace so the ASCII art lines up. Other multi-line warnings (rate-limit
// errors, etc.) should wrap normally.
function isBuddyMessage(content: string): boolean {
  return /\n\[[^\]]+\]\s/.test(content);
}

function getContainerClass(message: Message, isNew: boolean): string {
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && isBuddyMessage(message.content);
  // While streaming, the message has role "loading" but we want it to render
  // in the same color as the final system message (not the yellow loading color)
  // so the transition doesn't look jarring.
  const isStreamingContent = message.role === "loading" && !message.content.startsWith("[⚙️]");
  const colorClass = isStreamingContent ? roleColors.system : roleColors[message.role];

  let modifier = "leading-relaxed";
  if (isAchievement) {
    modifier = `${isNew ? "achievement-flash" : ""} whitespace-pre font-bold`;
  } else if (isBuddyInterjection) {
    modifier = "whitespace-pre font-mono";
  }
  return `mb-5 ${colorClass} ${modifier}`;
}

function MessageContent({ message, isNew = false }: { message: Message; isNew?: boolean }) {
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && isBuddyMessage(message.content);
  const isSpecialAsciiArt = isAchievement || isBuddyInterjection;
  const useMarkdown = (message.role === "system" || message.role === "warning" || message.role === "error") && !isSpecialAsciiArt;
  const isAwaitingResponse = message.role === "loading" && message.content.startsWith("[⚙️]");
  const isStreaming = message.role === "loading" && !isAwaitingResponse;

  // Typewriter effect for new system/warning/error messages (not loading or streaming)
  const shouldTypewrite = isNew && useMarkdown && message.role === "system";
  const { visibleContent, isTyping } = useTypewriter(message.content, shouldTypewrite);

  if (message.role === "user") return null;

  if (useMarkdown) {
    const rawContent = shouldTypewrite ? visibleContent : message.content;
    const processedContent = cleanLLMOutput(rawContent);
    return (
      <div className="space-y-1">
        <ReactMarkdown components={markdownComponents}>
          {processedContent}
        </ReactMarkdown>
        {isTyping && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-text-bottom" />}
      </div>
    );
  }

  if (isStreaming) {
    const processedContent = cleanLLMOutput(message.content);
    return (
      <div className="space-y-1">
        <ReactMarkdown components={markdownComponents}>
          {processedContent}
        </ReactMarkdown>
        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-text-bottom" />
      </div>
    );
  }
  if (isAwaitingResponse) return <>{message.content}</>;
  if (message.role !== "loading") return <>{message.content}</>;
  return null;
}

function CostDisplay({ cost }: { cost: number }) {
  const formatted = cost < 0.01
    ? `$${cost.toFixed(6)}`
    : cost < 0.1
      ? `$${cost.toFixed(4)}`
      : `$${cost.toFixed(2)}`;
  return (
    <div className="text-[11px] text-gray-500 mt-1 font-mono">
      cost: {formatted}
    </div>
  );
}


function getShareProps(message: Message, previousMessage?: Message, nextMessage?: Message): { showShareButton: boolean; shareSystemMessage: string } {
  const isSlashCommandResponse = previousMessage?.role === "user" && previousMessage.content.startsWith("/");
  const showShareButton = message.role === "system" && previousMessage?.role === "user" && !isSlashCommandResponse;
  const shareSystemMessage = showShareButton && nextMessage?.role === "warning"
    ? message.content + "\n\n" + nextMessage.content
    : message.content;
  return { showShareButton, shareSystemMessage };
}

function OutputBlock({ message, previousMessage, nextMessage, isNew = false, promptString = "❯ ", activeTicketId, username = "" }: { message: Message; previousMessage?: Message; nextMessage?: Message; isNew?: boolean; promptString?: string; activeTicketId?: string | null; username?: string }) {
  const isAwaitingResponse = message.role === "loading" && message.content.startsWith("[⚙️]");
  const { showShareButton, shareSystemMessage } = getShareProps(message, previousMessage, nextMessage);

  return (
    <div className={`group ${getContainerClass(message, isNew)}`}>
      {message.role === "user" && (
        <div className="inline-block bg-gray-200 text-gray-900 px-2 py-1 sm:px-3 sm:py-1.5 font-bold">
          <span className="text-gray-500 mr-1">{promptString}</span>
          {message.content}
        </div>
      )}
      {message.role === "loading" && !isAwaitingResponse && <Spinner />}
      <MessageContent message={message} isNew={isNew} />
      {isAwaitingResponse && <SimulatedToolCall activeTicketId={activeTicketId} />}
      {message.role === "loading" && <TokenCounter />}
      {message.role === "system" && message.cost != null && <CostDisplay cost={message.cost} />}
      {showShareButton && <ShareButton userMessage={previousMessage!.content} systemMessage={shareSystemMessage} username={username} />}
    </div>
  );
}

export default React.memo(OutputBlock, (prev, next) =>
  prev.message.role === next.message.role &&
  prev.message.content === next.message.content &&
  prev.message.cost === next.message.cost &&
  prev.isNew === next.isNew &&
  prev.promptString === next.promptString &&
  prev.previousMessage?.content === next.previousMessage?.content &&
  prev.previousMessage?.role === next.previousMessage?.role &&
  prev.nextMessage?.content === next.nextMessage?.content &&
  prev.nextMessage?.role === next.nextMessage?.role &&
  prev.username === next.username &&
  // Only compare activeTicketId for loading messages
  (prev.message.role !== "loading" || prev.activeTicketId === next.activeTicketId)
);
