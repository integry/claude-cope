import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { renderWithSlashLinks, linkifySlashCommands } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";

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

export function cleanLLMOutput(content: string): string {
  let cleaned = content.replace(/`__TAG_(?:ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g, "[$1]");
  const terminalLangs = "bash|sh|shell|console|terminal|text|log|plaintext|markdown|md";
  const fenceRegex = new RegExp("```(?:" + terminalLangs + ")\\s*\\n([\\s\\S]*?)```", "g");
  cleaned = cleaned.replace(fenceRegex, "$1");
  cleaned = cleaned.replace(/([^\n])\s+([1-9]\uFE0F?\u20E3)\s+/g, "$1\n\n\u2003$2 ");
  cleaned = cleaned.replace(/\n(\[(?:WARN|ERROR|SUCCESS|INFO|FATAL|CRITICAL|DEBUG|DONE|PROGRESS|RESULT|⚙️|⚠️|❌|✓|✅|🔥|💀|🚨|SIGSEGV)[^\]]*\])/g, "\n\n$1");
  cleaned = cleaned.replace(/([^\n])(\[(?:WARN|ERROR|SUCCESS|INFO|FATAL|CRITICAL|DEBUG|DONE|PROGRESS|RESULT|⚙️|⚠️|❌|✓|✅|🔥|💀|🚨|SIGSEGV)[^\]]*\])/g, "$1\n\n$2");
  return cleaned;
}

function renderLineWithTags(line: string, onSlashCommand?: (command: string, action: SlashCommandAction) => void): React.ReactNode {
  const tagInline = /`__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g;
  const bracketTag = /^\[([^\]]+)\]/;

  const linkify = (text: string): React.ReactNode =>
    onSlashCommand ? renderWithSlashLinks(text, onSlashCommand) : text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let inlineMatch;
  while ((inlineMatch = tagInline.exec(line)) !== null) {
    if (inlineMatch.index > lastIndex) {
      parts.push(linkify(line.slice(lastIndex, inlineMatch.index)));
    }
    const category = inlineMatch[1] as TagCategory;
    const tagText = inlineMatch[2];
    parts.push(
      <span key={inlineMatch.index} className={`${TAG_STYLES[category]} font-mono text-xs font-bold mr-2`}>
        {tagText}
      </span>
    );
    lastIndex = tagInline.lastIndex;
  }
  if (parts.length > 0) {
    if (lastIndex < line.length) parts.push(linkify(line.slice(lastIndex)));
    return <>{parts}</>;
  }

  const bracketMatch = bracketTag.exec(line);
  if (bracketMatch) {
    const category = classifyTag(bracketMatch[1]!);
    const isReward = category === "SUCCESS" && /reward/i.test(bracketMatch[1]!);
    const sizeClass = isReward ? "text-sm" : "text-xs";
    const colorClass = isReward ? "text-green-300" : TAG_STYLES[category];
    return (
      <>
        <span className={`${colorClass} font-mono ${sizeClass} font-bold mr-2`}>
          {bracketMatch[1]}
        </span>
        {linkify(line.slice(bracketMatch[0].length))}
      </>
    );
  }

  return linkify(line);
}

function endsWithCodeBlock(content: string): boolean {
  const trimmed = content.trimEnd();
  if (!trimmed) return false;
  if (/```$/.test(trimmed)) return true;

  const lines = trimmed.split("\n");
  let index = lines.length - 1;
  while (index >= 0 && lines[index]!.trim() === "") index -= 1;
  if (index < 0) return false;

  return /^(?: {4,}|\t)/.test(lines[index]!);
}

export function appendShareMarker(content: string, includeShare: boolean): string {
  if (!includeShare) return content;
  const marker = "[share](https://__share__)";
  const trimmed = content.trimEnd();
  if (!trimmed) return marker;
  const separator = endsWithCodeBlock(trimmed) ? "\n\n" : " ";
  return `${trimmed}${separator}${marker}`;
}

export function buildMarkdownComponents(
  onSlashCommand?: (command: string, action: SlashCommandAction) => void,
  shareNode?: React.ReactNode,
) {
  const linkify = (text: string): React.ReactNode =>
    onSlashCommand ? renderWithSlashLinks(text, onSlashCommand) : text;

  const linkifyChildren = (children: React.ReactNode): React.ReactNode =>
    onSlashCommand ? linkifySlashCommands(children, onSlashCommand) : children;

  const flattenTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(flattenTextContent).join("");
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) return flattenTextContent(node.props.children);
    return "";
  };

  return {
    a({ href, children }: { href?: string; children?: React.ReactNode }) {
      if (href === "https://__share__") return <>{shareNode ?? null}</>;
      return (
        <a href={href} className="text-cyan-300 underline underline-offset-2">
          {linkifyChildren(children)}
        </a>
      );
    },
    p({ children }: { children?: React.ReactNode }) {
      const textContent = flattenTextContent(children);
      const trimmed = textContent.trim();
      if (/^[=]{3,}$/.test(trimmed) || /^[-]{3,}$/.test(trimmed)) {
        return <p className="mb-1 text-gray-600 leading-relaxed select-none">{trimmed}</p>;
      }
      const processed = React.Children.map(children, (child) => {
        if (typeof child === "string") return renderLineWithTags(child, onSlashCommand);
        return onSlashCommand ? linkifySlashCommands(child, onSlashCommand) : child;
      });
      return <p className="mb-3 leading-relaxed">{processed}</p>;
    },
    strong({ children }: { children?: React.ReactNode }) {
      return <strong className="text-white font-bold">{linkifyChildren(children)}</strong>;
    },
    em({ children }: { children?: React.ReactNode }) {
      return <em className="text-gray-300 italic">{linkifyChildren(children)}</em>;
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
      const processed = React.Children.map(children, (child) => {
        if (typeof child === "string") return renderLineWithTags(child, onSlashCommand);
        return onSlashCommand ? linkifySlashCommands(child, onSlashCommand) : child;
      });
      return <blockquote className="border-l-2 border-gray-600 pl-3 ml-1 my-2 text-gray-400 italic">{processed}</blockquote>;
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
      const processed = React.Children.map(children, (child) => {
        if (typeof child === "string") return renderLineWithTags(child, onSlashCommand);
        return onSlashCommand ? linkifySlashCommands(child, onSlashCommand) : child;
      });
      return <li className="leading-relaxed">{processed}</li>;
    },
    pre({ children }: { children?: React.ReactNode }) {
      return <pre className="my-3 rounded whitespace-pre-wrap break-words">{children}</pre>;
    },
    code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      if (match) {
        const terminalLangs = ["terminal", "bash", "sh", "shell", "console", "text", "log", "plaintext", "markdown", "md"];
        if (terminalLangs.includes(match[1]!)) {
          const lines = codeString.split("\n");
          return (
            <code className="block whitespace-pre text-gray-100">
              {lines.map((line, index) => (
                <React.Fragment key={index}>
                  {renderLineWithTags(line, onSlashCommand)}
                  {index < lines.length - 1 && "\n"}
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
      const processed = React.Children.map(children, (child) => {
        if (typeof child === "string") return linkify(child);
        return child;
      });
      return (
        <code className={`text-cyan-300 px-1 rounded ${className || ""}`} {...props}>
          {processed}
        </code>
      );
    },
  };
}
