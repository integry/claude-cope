import { SLASH_COMMANDS } from "./slashCommands";

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

export type SlashCommandAction = "execute" | "prefill";

export interface DetectedCommand {
  command: string;
  action: SlashCommandAction;
  start: number;
  end: number;
}

/**
 * Build a regex that matches any known slash command at a word boundary.
 * Derived from the canonical SLASH_COMMANDS list so it stays in sync automatically.
 */
function buildSlashCommandPattern(): RegExp {
  const names = SLASH_COMMANDS.map((cmd) => cmd.slice(1)); // strip leading "/"
  const alternation = names.join("|");
  return new RegExp(
    `(?:^|(?<=[\\s(\`"'']))(\\/(?:${alternation}))(?=$|[\\s)\`"''.,!?:;])`,
    "g",
  );
}

const SLASH_COMMAND_PATTERN = buildSlashCommandPattern();

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
