/**
 * Known slash commands in the game. Only these will be passed through
 * to analytics — anything else is mapped to "/unknown" to prevent
 * accidental leakage of secrets pasted after a `/`.
 */
const KNOWN_COMMANDS = new Set([
  "/help",
  "/clear",
  "/store",
  "/synergize",
  "/user",
  "/compact",
  "/buddy",
  "/ping",
  "/theme",
  "/support",
  "/preworkout",
  "/who",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/fast",
  "/voice",
  "/blame",
  "/brrrrrr",
  "/ticket",
  "/backlog",
  "/sync",
  "/shill",
  "/key",
  "/feedback",
  "/bug",
  "/upgrade",
  "/take",
  "/accept",
  "/abandon",
  "/alias",
  "/model",
  "/new",
  "/leaderboard",
  "/achievements",
  "/profile",
  "/party",
]);

/**
 * Extracts the base command (first token) from a slash command string,
 * stripping any arguments. If the resulting token is not a known command,
 * returns "/unknown" to prevent accidental leakage of secrets or
 * sensitive data into analytics.
 */
export function parseBaseCommand(command: string): string {
  const token = command.trim().split(/\s+/, 1)[0] as string;
  if (!token || !token.startsWith("/")) return "/unknown";
  return KNOWN_COMMANDS.has(token) ? token : "/unknown";
}
