/**
 * Parses a comma-separated list of OpenRouter provider names.
 * Returns an array of trimmed, non-empty provider names.
 *
 * @param providersEnv - Raw comma-separated string from environment variable
 * @returns Array of provider names, or empty array if input is undefined/empty
 *
 * @example
 * parseProviderList("Together,Fireworks") // ["Together", "Fireworks"]
 * parseProviderList("Together, Fireworks, ") // ["Together", "Fireworks"]
 * parseProviderList(undefined) // []
 */
export function parseProviderList(providersEnv: string | undefined): string[] {
  if (!providersEnv) return [];
  return providersEnv
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
