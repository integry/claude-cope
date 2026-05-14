import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { Message } from "./Terminal";
import { pickRandomSequence } from "./toolSequences";
import { useTypewriter } from "../hooks/useTypewriter";
import { ShareButton } from "./ShareButton";
import { renderWithSlashLinks } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";
import { appendShareMarker, buildMarkdownComponents, cleanLLMOutput } from "./OutputBlockMarkdown";
import { BacklogMessage } from "./BacklogMessage";
import { TicketMessage } from "./TicketMessage";
import { extractBuddyInterjectionBlock } from "./buddyConstants";
import { getTipRenderData, type TipRenderData } from "../hooks/tipMessageUtils";

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

type BuddyRenderData = {
  isBuddyInterjection: boolean;
  buddyBlock: string;
  body: string;
};

function getBuddyRenderData(message: Message): BuddyRenderData {
  if (message.role !== "warning") {
    return { isBuddyInterjection: false, buddyBlock: "", body: message.content };
  }

  const buddyBlock = extractBuddyInterjectionBlock(message.content, message.buddyType);
  if (!buddyBlock) {
    return { isBuddyInterjection: false, buddyBlock: "", body: message.content };
  }

  return {
    isBuddyInterjection: true,
    buddyBlock: buddyBlock.block,
    body: buddyBlock.body,
  };
}

function getContainerClass(message: Message, isNew: boolean): string {
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  // While streaming, the message has role "loading" but we want it to render
  // in the same color as the final system message (not the yellow loading color)
  // so the transition doesn't look jarring.
  const isStreamingContent = message.role === "loading" && !message.content.startsWith("[⚙️]");
  const colorClass = isStreamingContent ? roleColors.system : roleColors[message.role];

  let modifier = "leading-relaxed";
  if (isAchievement) {
    modifier = `${isNew ? "achievement-flash" : ""} whitespace-pre font-bold`;
  }
  return `mb-5 ${colorClass} ${modifier}`;
}

function getMessageFlags(role: string, content: string, isBuddyInterjection: boolean, isTip: boolean) {
  const isWarning = role === "warning";
  const isAchievement = isWarning && content.includes("ACHIEVEMENT UNLOCKED");
  const isMarkdownRole = role === "system" || isWarning || role === "error";
  const useMarkdown = isMarkdownRole && !isAchievement && !isBuddyInterjection && !isTip;
  const isAwaitingResponse = role === "loading" && content.startsWith("[⚙️]");
  const isStreaming = role === "loading" && !isAwaitingResponse;
  return { useMarkdown, isAwaitingResponse, isStreaming };
}

function renderTipContent(
  tipData: TipRenderData,
  onSlashCommand?: (command: string, action: SlashCommandAction) => void,
) {
  const linkifiedBody = onSlashCommand ? renderWithSlashLinks(tipData.body, onSlashCommand) : tipData.body;
  return (
    <div className="terminal-tip-output">
      <span className="terminal-tip-prefix">// Tip:</span>
      {tipData.body ? <span className="terminal-tip-body"> {linkifiedBody}</span> : null}
    </div>
  );
}

function renderBuddyContent(
  buddyData: BuddyRenderData,
  shareNode: React.ReactNode,
  mdComponents: ReturnType<typeof buildMarkdownComponents>,
) {
  const processedBody = buddyData.body ? appendShareMarker(cleanLLMOutput(buddyData.body), Boolean(shareNode)) : "";
  return (
    <div className="space-y-3">
      <pre className="whitespace-pre font-mono">{buddyData.buddyBlock}</pre>
      {processedBody && (
        <ReactMarkdown components={mdComponents} rehypePlugins={[rehypeSanitize]}>
          {processedBody}
        </ReactMarkdown>
      )}
    </div>
  );
}

function renderMarkdownContent({
  content,
  visibleContent,
  shouldTypewrite,
  isStreaming,
  isTyping,
  shareNode,
  mdComponents,
}: {
  content: string;
  visibleContent: string;
  shouldTypewrite: boolean;
  isStreaming: boolean;
  isTyping: boolean;
  shareNode: React.ReactNode;
  mdComponents: ReturnType<typeof buildMarkdownComponents>;
}) {
  const rawContent = shouldTypewrite ? visibleContent : content;
  const processedContent = appendShareMarker(cleanLLMOutput(rawContent), Boolean(shareNode));
  const showCursor = isStreaming || isTyping;
  return (
    <div className="space-y-1">
      <ReactMarkdown components={mdComponents} rehypePlugins={[rehypeSanitize]}>
        {processedContent}
      </ReactMarkdown>
      {showCursor && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-text-bottom" />}
    </div>
  );
}

function renderPlainTextContent(
  body: string,
  onSlashCommand?: (command: string, action: SlashCommandAction) => void,
) {
  return onSlashCommand ? renderWithSlashLinks(body, onSlashCommand) : body;
}

function getNonMarkdownMessageContent({
  message,
  role,
  tipData,
  buddyData,
  onSlashCommand,
  shareNode,
  mdComponents,
  isAwaitingResponse,
}: {
  message: Message;
  role: Message["role"];
  tipData: TipRenderData;
  buddyData: BuddyRenderData;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
  shareNode: React.ReactNode;
  mdComponents: ReturnType<typeof buildMarkdownComponents>;
  isAwaitingResponse: boolean;
}): React.ReactNode {
  if (message.backlogDisplay && role === "system") {
    return <BacklogMessage backlog={message.backlogDisplay} onSlashCommand={onSlashCommand} />;
  }
  if (message.ticketDisplay && role === "system") {
    return <TicketMessage ticket={message.ticketDisplay} onSlashCommand={onSlashCommand} />;
  }
  if (role === "user") return null;
  if (tipData.isTip) return renderTipContent(tipData, onSlashCommand);
  if (buddyData.isBuddyInterjection) return renderBuddyContent(buddyData, shareNode, mdComponents);
  if (isAwaitingResponse) return message.content;
  if (role !== "loading") return renderPlainTextContent(buddyData.body, onSlashCommand);
  return null;
}

function MessageContent({
  message,
  buddyData,
  isNew = false,
  onSlashCommand,
  shareNode,
}: {
  message: Message;
  buddyData: BuddyRenderData;
  isNew?: boolean;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
  shareNode?: React.ReactNode;
}) {
  const { role, content } = message;
  const tipData = getTipRenderData(message);
  const hasStructuredDisplay = Boolean(message.backlogDisplay || message.ticketDisplay);
  const { useMarkdown, isAwaitingResponse, isStreaming } = getMessageFlags(
    role,
    content,
    buddyData.isBuddyInterjection,
    tipData.isTip,
  );
  // Only typewrite actual AI responses (system role). Scaffold messages (ads,
  // queue warnings) render instantly so they don't vanish mid-animation when
  // the fixed delay timers remove them.
  const shouldTypewrite = isNew && useMarkdown && role === "system";
  const { visibleContent, isTyping } = useTypewriter(content, shouldTypewrite);
  const mdComponents = useMemo(() => buildMarkdownComponents(onSlashCommand, shareNode), [onSlashCommand, shareNode]);
  if ((useMarkdown && !hasStructuredDisplay) || isStreaming) {
    return renderMarkdownContent({
      content,
      visibleContent,
      shouldTypewrite,
      isStreaming,
      isTyping,
      shareNode,
      mdComponents,
    });
  }
  return (
    <>
      {getNonMarkdownMessageContent(
        { message, role, tipData, buddyData, onSlashCommand, shareNode, mdComponents, isAwaitingResponse },
      )}
    </>
  );
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

function getShareProps(
  message: Message,
  previousMessage?: Message,
  shareUserMessage?: Message,
  enableShare = true,
): { showShareButton: boolean; shareClaim?: string; shareSystemMessage: string; shareUserPrompt: string } {
  const userTurn = shareUserMessage?.role === "user"
    ? shareUserMessage
    : previousMessage?.role === "user"
      ? previousMessage
      : undefined;
  const isSlashCommandResponse = userTurn?.content.startsWith("/") ?? false;
  const showShareButton = enableShare && message.role === "system" && Boolean(userTurn) && !isSlashCommandResponse && typeof message.shareClaim === "string";
  return {
    showShareButton,
    shareClaim: message.shareClaim,
    shareSystemMessage: message.content,
    shareUserPrompt: userTurn?.content ?? "",
  };
}

function OutputBlock({ message, previousMessage, nextMessage, shareUserMessage, isNew = false, promptString = "❯ ", activeTicketId, username = "", onSlashCommand, enableShare = true }: { message: Message; previousMessage?: Message; nextMessage?: Message; shareUserMessage?: Message; isNew?: boolean; promptString?: string; activeTicketId?: string | null; username?: string; onSlashCommand?: (command: string, action: SlashCommandAction) => void; enableShare?: boolean }) {
  void nextMessage;
  const isAwaitingResponse = message.role === "loading" && message.content.startsWith("[⚙️]");
  const { showShareButton, shareClaim, shareSystemMessage, shareUserPrompt } = getShareProps(message, previousMessage, shareUserMessage, enableShare);
  const buddyData = getBuddyRenderData(message);
  const shareNode = showShareButton ? (
    <ShareButton userMessage={shareUserPrompt} systemMessage={shareSystemMessage} username={username} shareClaim={shareClaim!} />
  ) : undefined;

  return (
    <div className={`group ${getContainerClass(message, isNew)}`}>
      {message.role === "user" && (
        <div className="inline-block bg-gray-200 text-gray-900 px-2 py-1 sm:px-3 sm:py-1.5 font-bold">
          <span className="text-gray-500 mr-1">{promptString}</span>
          {message.content}
        </div>
      )}
      {message.role === "loading" && !isAwaitingResponse && <Spinner />}
      <MessageContent
        message={message}
        buddyData={buddyData}
        isNew={isNew}
        onSlashCommand={onSlashCommand}
        shareNode={shareNode}
      />
      {isAwaitingResponse && <SimulatedToolCall activeTicketId={activeTicketId} />}
      {message.role === "loading" && <TokenCounter />}
      {message.role === "system" && message.cost != null && <CostDisplay cost={message.cost} />}
    </div>
  );
}

type OutputBlockProps = Parameters<typeof OutputBlock>[0];

const MESSAGE_COMPARISON_FIELDS = [
  "role",
  "content",
  "displayType",
  "shareClaim",
  "buddyType",
  "backlogDisplay",
  "ticketDisplay",
] as const satisfies readonly (keyof Message)[];

function messagesEqual(a: Message | undefined, b: Message | undefined): boolean {
  return a === b || MESSAGE_COMPARISON_FIELDS.every((field) => a?.[field] === b?.[field]);
}

function outputBlockPropsAreEqual(prev: OutputBlockProps, next: OutputBlockProps): boolean {
  if (prev.message.role !== next.message.role) return false;
  if (prev.message.content !== next.message.content) return false;
  if (prev.message.displayType !== next.message.displayType) return false;
  if (prev.message.shareClaim !== next.message.shareClaim) return false;
  if (prev.message.buddyType !== next.message.buddyType) return false;
  if (prev.message.cost !== next.message.cost) return false;
  if (prev.message.backlogDisplay !== next.message.backlogDisplay) return false;
  if (prev.message.ticketDisplay !== next.message.ticketDisplay) return false;
  if (prev.isNew !== next.isNew) return false;
  if (prev.promptString !== next.promptString) return false;
  if (!messagesEqual(prev.previousMessage, next.previousMessage)) return false;
  if (!messagesEqual(prev.nextMessage, next.nextMessage)) return false;
  if (!messagesEqual(prev.shareUserMessage, next.shareUserMessage)) return false;
  if (prev.username !== next.username) return false;
  if (prev.onSlashCommand !== next.onSlashCommand) return false;
  if (prev.enableShare !== next.enableShare) return false;
  // Only compare activeTicketId for loading messages
  if (prev.message.role === "loading" && prev.activeTicketId !== next.activeTicketId) return false;
  return true;
}

export default React.memo(OutputBlock, outputBlockPropsAreEqual);
