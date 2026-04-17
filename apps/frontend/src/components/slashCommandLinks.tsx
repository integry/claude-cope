/* eslint-disable react-refresh/only-export-components */
import React from "react";

/**
 * Commands that require user-provided arguments — clicking these should only
 * prefill the input, never auto-execute.
 */
export const PREFILL_COMMANDS = new Set([
  "/take",
  "/ticket",
  "/alias",
  "/model",
  "/user",
  "/sync",
  "/theme",
  "/key",
]);

/**
 * Match a known slash command at a word boundary in text.
 * The regex matches `/command` only when:
 *   - preceded by start-of-string or a whitespace/punctuation char
 *   - the command is followed by end-of-string, whitespace, or punctuation
 * This avoids false positives like `/api/chat`.
 */
const SLASH_COMMAND_PATTERN =
  /(?:^|(?<=[\s(`"'']))(\/(backlog|take|clear|support|preworkout|buddy|store|synergize|compact|who|ping|help|about|privacy|terms|contact|fast|voice|blame|brrrrrr|feedback|bug|key|upgrade|leaderboard|achievements|profile|ticket|accept|abandon|alias|model|user|sync|shill|party|theme))(?=$|[\s)`"''.,!?:;])/g;

export type SlashCommandAction = "execute" | "prefill";

export interface DetectedCommand {
  command: string;
  action: SlashCommandAction;
  start: number;
  end: number;
}

/**
 * Detect all slash commands in a string and return their positions and actions.
 */
export function detectSlashCommands(text: string): DetectedCommand[] {
  const results: DetectedCommand[] = [];
  const regex = new RegExp(SLASH_COMMAND_PATTERN.source, SLASH_COMMAND_PATTERN.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    const command = match[1]!;
    results.push({
      command,
      action: PREFILL_COMMANDS.has(command) ? "prefill" : "execute",
      start: match.index,
      end: match.index + command.length,
    });
  }
  return results;
}

/**
 * Render a text string with clickable slash commands.
 * Non-command text is preserved as-is.
 */
export function renderWithSlashLinks(
  text: string,
  onCommand: (command: string, action: SlashCommandAction) => void,
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
        className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
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
