import { POSTHOG_KEY, POSTHOG_HOST } from "./config";

const COPE_ID_KEY = "cope_id";
const GAME_STATE_KEY = "claudeCopeState";

/** Lazily-resolved PostHog instance — `null` when analytics is disabled. */
let phInstance: import("posthog-js").PostHog | null = null;

function getOrCreateCopeId(): string {
  let id = localStorage.getItem(COPE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(COPE_ID_KEY, id);
  }
  return id;
}

function getUsernameFromGameState(): string | undefined {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return undefined;
    const state = JSON.parse(raw);
    return state.username || undefined;
  } catch {
    return undefined;
  }
}

export function initPostHog(): void {
  if (!POSTHOG_KEY) return;

  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST || "https://us.i.posthog.com",
      persistence: "memory",
    });

    phInstance = posthog;

    const copeId = getOrCreateCopeId();
    const username = getUsernameFromGameState();

    posthog.identify(copeId, {
      ...(username ? { username } : {}),
    });
  });
}

/** Fire-and-forget event capture. Never throws. */
export function track(event: string, properties?: Record<string, unknown>): void {
  try {
    phInstance?.capture(event, properties);
  } catch { /* analytics should never block gameplay */ }
}

/** Update PostHog person identity/properties. Never throws. */
export function identify(properties?: Record<string, unknown>): void {
  try {
    if (!phInstance) return;
    const copeId = getOrCreateCopeId();
    phInstance.identify(copeId, properties);
  } catch { /* analytics should never block gameplay */ }
}
