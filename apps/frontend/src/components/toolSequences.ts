import { API_BASE } from "../config";

export type ToolStep = { tool: string; target: string; action: string };

/** In-memory cache of fetched sequences keyed by task ID ("__none__" for no-task). */
const sequenceCache = new Map<string, ToolStep[][]>();

/** Minimal fallback shown while the first API fetch is in flight. */
const INLINE_FALLBACK: ToolStep[][] = [
  [
    { tool: "Read", target: "src/index.ts", action: "Narrating this like David Attenborough at a funeral" },
    { tool: "Grep", target: "handleRequest", action: "Following a trail of console.logs through the rain" },
    { tool: "Read", target: "package.json", action: "Carefully brushing the dust off this ancient commit" },
    { tool: "Bash", target: "npm test", action: "Throwing a Hail Mary to the production server" },
    { tool: "Glob", target: "src/**/*.ts", action: "Descending into the underworld of node_modules" },
  ],
  [
    { tool: "Read", target: "tsconfig.json", action: "The ouija board spells out S-E-G-F-A-U-L-T" },
    { tool: "Grep", target: "export default", action: "Interrogating the config file under a single light bulb" },
    { tool: "Bash", target: "tsc --noEmit", action: "Sacrificing a clean commit history to appease the CI gods" },
    { tool: "Read", target: "src/utils/helpers.ts", action: "Conducting a seance to contact the original author" },
    { tool: "Grep", target: "TODO|FIXME", action: "Organizing a candlelight vigil for the deleted feature" },
  ],
  [
    { tool: "Bash", target: "git log --oneline -5", action: "Performing an archaeological dig through the git blame" },
    { tool: "Read", target: "src/config/index.ts", action: "The code is coming from INSIDE the node_modules" },
    { tool: "Grep", target: "process\\.env", action: "Wake up, sheeple — the config file is lying to you" },
    { tool: "Read", target: ".env.example", action: "The microfilm is hidden inside the .env file" },
    { tool: "Bash", target: "npm run lint", action: "Gordon Ramsay voice: THIS CODE IS RAW" },
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
