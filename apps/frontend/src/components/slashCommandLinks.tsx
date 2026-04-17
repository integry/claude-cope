import React from "react";
import { detectSlashCommands } from "./slashCommandDetect";

// Re-export types and detection logic so existing consumers keep working
export { detectSlashCommands, PREFILL_COMMANDS } from "./slashCommandDetect";
export type { SlashCommandAction, DetectedCommand } from "./slashCommandDetect";

/**
 * Recursively walk a React node tree, replacing slash commands in any
 * string leaves with clickable buttons. This ensures commands nested
 * inside <em>, <strong>, <a>, etc. are also linkified.
 */
export function linkifySlashCommands(
  node: React.ReactNode,
  onCommand: (command: string, action: import("./slashCommandDetect").SlashCommandAction) => void,
): React.ReactNode {
  if (typeof node === "string") {
    return renderWithSlashLinks(node, onCommand);
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <React.Fragment key={i}>{linkifySlashCommands(child, onCommand)}</React.Fragment>
    ));
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    const { children } = element.props;
    if (children != null) {
      return React.cloneElement(element, {}, linkifySlashCommands(children, onCommand));
    }
  }

  return node;
}

/**
 * Render a text string with clickable slash commands.
 * Non-command text is preserved as-is.
 */
export function renderWithSlashLinks(
  text: string,
  onCommand: (command: string, action: import("./slashCommandDetect").SlashCommandAction) => void,
): React.ReactNode {
  const detected = detectSlashCommands(text);
  if (detected.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const d of detected) {
    if (d.start > cursor) {
      parts.push(text.slice(cursor, d.start));
    }
    parts.push(
      <button
        key={d.start}
        type="button"
        className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted cursor-pointer bg-transparent border-none p-0 font-inherit"
        onClick={(e) => {
          e.stopPropagation();
          onCommand(d.command, d.action);
        }}
      >
        {d.command}
      </button>,
    );
    cursor = d.end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}
