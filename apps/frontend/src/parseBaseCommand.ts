/**
 * Extracts the base command (first token) from a slash command string,
 * stripping any arguments. This ensures sensitive arguments (e.g. API keys
 * passed to `/key`) are never included in analytics or logging.
 */
export function parseBaseCommand(command: string): string {
  return command.trim().split(/\s+/, 1)[0] as string;
}
