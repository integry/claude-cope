/**
 * Extracts the base command (first token) from a slash command string,
 * stripping any arguments. This ensures sensitive arguments (e.g. API keys
 * passed to `/key`) are never included in analytics or logging.
 */
export function parseBaseCommand(command: string): string {
  return command.split(" ")[0] as string;
}
