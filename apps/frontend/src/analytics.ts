import { POSTHOG_KEY, POSTHOG_HOST, POSTHOG_DEFAULT_HOST } from "./config";

const COPE_ID_KEY = "cope_id";
const GAME_STATE_KEY = "claudeCopeState";

/** Lazily-resolved PostHog instance — `null` when analytics is disabled. */
let phInstance: import("posthog-js").PostHog | null = null;

/** Promise that resolves when PostHog is ready (or `null` when analytics is disabled). */
let readyPromise: Promise<void> | null = null;

/** Guard against double initialization. */
let initialized = false;

/** Buffered calls made before PostHog finished loading. */
const pendingTrackCalls: Array<{ event: string; properties?: Record<string, unknown> }> = [];
const pendingIdentifyCalls: Array<Record<string, unknown> | undefined> = [];

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

function flushPending(): void {
  for (const { event, properties } of pendingTrackCalls) {
    phInstance?.capture(event, properties);
  }
  pendingTrackCalls.length = 0;

  for (const properties of pendingIdentifyCalls) {
    const copeId = getOrCreateCopeId();
    phInstance?.identify(copeId, properties);
  }
  pendingIdentifyCalls.length = 0;
}

export function initPostHog(): void {
  if (initialized) return;
  initialized = true;

  if (!POSTHOG_KEY) return;

  readyPromise = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST || POSTHOG_DEFAULT_HOST,
        persistence: "memory",
      });

      phInstance = posthog;

      const copeId = getOrCreateCopeId();
      const username = getUsernameFromGameState();

      posthog.identify(copeId, {
        ...(username ? { username } : {}),
      });

      flushPending();
    })
    .catch(() => {
      // PostHog failed to load — discard buffered calls and continue without analytics.
      pendingTrackCalls.length = 0;
      pendingIdentifyCalls.length = 0;
    });
}

/** Fire-and-forget event capture. Never throws. */
export function track(event: string, properties?: Record<string, unknown>): void {
  try {
    if (phInstance) {
      phInstance.capture(event, properties);
    } else if (readyPromise) {
      pendingTrackCalls.push({ event, properties });
    }
  } catch { /* analytics should never block gameplay */ }
}

/** Update PostHog person identity/properties. Never throws. */
export function identify(properties?: Record<string, unknown>): void {
  try {
    if (phInstance) {
      const copeId = getOrCreateCopeId();
      phInstance.identify(copeId, properties);
    } else if (readyPromise) {
      pendingIdentifyCalls.push(properties);
    }
  } catch { /* analytics should never block gameplay */ }
}
