import { API_BASE } from "../config";

export type ToolStep = { tool: string; target: string; action: string };

/** In-memory cache of fetched sequences keyed by task ID ("__none__" for no-task). */
const sequenceCache = new Map<string, ToolStep[][]>();

/** Minimal fallback shown while the first API fetch is in flight. */
const INLINE_FALLBACK: ToolStep[][] = [
  [
    { tool: "Read", target: "src/index.ts", action: "Pretending to review" },
    { tool: "Grep", target: "handleRequest", action: "Hunting for clues" },
    { tool: "Read", target: "package.json", action: "Skimming with intent" },
    { tool: "Bash", target: "npm test", action: "Executing with reckless abandon" },
    { tool: "Glob", target: "src/**/*.ts", action: "Rounding up the usual suspects" },
  ],
  [
    { tool: "Read", target: "tsconfig.json", action: "Absorbing corporate wisdom" },
    { tool: "Grep", target: "export default", action: "Interrogating the codebase" },
    { tool: "Bash", target: "tsc --noEmit", action: "Hoping for the best" },
    { tool: "Read", target: "src/utils/helpers.ts", action: "Consulting the sacred texts" },
    { tool: "Grep", target: "TODO|FIXME", action: "Rummaging through the wreckage" },
  ],
  [
    { tool: "Bash", target: "git log --oneline -5", action: "Crossing fingers and running" },
    { tool: "Read", target: "src/config/index.ts", action: "Staring at code pensively" },
    { tool: "Grep", target: "process\\.env", action: "Snooping around suspiciously" },
    { tool: "Read", target: ".env.example", action: "Deciphering ancient artifacts" },
    { tool: "Bash", target: "npm run lint", action: "Yelling into the terminal void" },
  ],
];

/**
 * Fetch task-specific tool sequences from the backend API.
 * Results are cached so repeated calls for the same task are instant.
 */
async function fetchSequences(taskId?: string | null): Promise<ToolStep[][]> {
  const cacheKey = taskId ?? "__none__";
  const cached = sequenceCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = taskId
      ? `${API_BASE}/api/tool-sequences/for-task/${encodeURIComponent(taskId)}`
      : `${API_BASE}/api/tool-sequences/random`;

    const res = await fetch(url);
    if (!res.ok) return INLINE_FALLBACK;

    const data = await res.json();
    // /for-task/:id returns { sequences: ToolStep[][] }
    // /random returns { sequence: ToolStep[] }
    const sequences: ToolStep[][] = data.sequences ?? [data.sequence];
    sequenceCache.set(cacheKey, sequences);
    return sequences;
  } catch {
    return INLINE_FALLBACK;
  }
}

/**
 * Pick a random tool-step sequence for the given task.
 *
 * This kicks off an async fetch (cached after first call) and returns a
 * fallback sequence synchronously so the caller always gets a value
 * immediately. Once the fetch resolves, subsequent calls return
 * task-specific sequences.
 */
export function pickRandomSequence(activeTicketId?: string | null): ToolStep[] {
  const cacheKey = activeTicketId ?? "__none__";
  const cached = sequenceCache.get(cacheKey);

  if (cached) {
    return cached[Math.floor(Math.random() * cached.length)]!;
  }

  // Fire-and-forget the fetch so the next mount gets real data
  fetchSequences(activeTicketId);

  // Return a random fallback for this render
  return INLINE_FALLBACK[Math.floor(Math.random() * INLINE_FALLBACK.length)]!;
}

/**
 * Pre-fetch and cache sequences for a specific task.
 * Call this when a ticket is claimed so sequences are ready
 * before the user sends their first prompt.
 */
export function prefetchSequences(taskId: string): void {
  fetchSequences(taskId);
}
