import { POSTHOG_KEY, POSTHOG_HOST, POSTHOG_DEFAULT_HOST } from "./config";
import { STORAGE_KEY } from "./hooks/storageKey";

const COPE_ID_KEY = "cope_id";
let volatileCopeId: string | null = null;

/** Lazily-resolved PostHog instance — `null` when analytics is disabled. */
let phInstance: import("posthog-js").PostHog | null = null;

/** Promise that resolves when PostHog is ready; stays `null` when analytics is disabled. */
let readyPromise: Promise<void> | null = null;

/** Guard against double initialization. */
let initialized = false;

/** Maximum number of events buffered before PostHog finishes loading. */
const MAX_PENDING_EVENTS = 100;

/** Buffered calls made before PostHog finished loading. */
const pendingTrackCalls: Array<{ event: string; properties?: Record<string, unknown> }> = [];
const pendingIdentifyCalls: Array<Record<string, unknown> | undefined> = [];

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments where randomUUID is unavailable
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getBrowserStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function getOrCreateCopeId(): string {
  const storage = getBrowserStorage();

  try {
    const storedId = storage?.getItem(COPE_ID_KEY);
    if (storedId) {
      volatileCopeId = storedId;
      return storedId;
    }
  } catch {
    // Ignore storage read failures and fall back to an in-memory ID.
  }

  const id = volatileCopeId ?? generateId();
  volatileCopeId = id;

  try {
    storage?.setItem(COPE_ID_KEY, id);
  } catch {
    // Ignore storage write failures and keep using the in-memory ID.
  }

  return id;
}

function getUsernameFromGameState(): string | undefined {
  try {
    const raw = getBrowserStorage()?.getItem(STORAGE_KEY);
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
  if (!POSTHOG_KEY) {
    initialized = true;
    return;
  }
  initialized = true;

  readyPromise = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST || POSTHOG_DEFAULT_HOST,
        persistence: "memory",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
      });

      phInstance = posthog;

      const copeId = getOrCreateCopeId();
      const username = getUsernameFromGameState();

      posthog.identify(copeId, {
        ...(username ? { username } : {}),
      });

      flushPending();
    })
    .catch((err) => {
      // PostHog failed to load — allow retry on next initPostHog() call.
      // Pending events are preserved so they can be flushed on a successful retry.
      initialized = false;
      readyPromise = null;
      phInstance = null;
      if (import.meta.env.DEV) {
        console.warn("[analytics] PostHog initialization failed:", err);
      }
    });
}

/** Fire-and-forget event capture. Never throws. */
export function track(event: string, properties?: Record<string, unknown>): void {
  try {
    if (phInstance) {
      phInstance.capture(event, properties);
    } else if (readyPromise && pendingTrackCalls.length < MAX_PENDING_EVENTS) {
      pendingTrackCalls.push({ event, properties });
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] track() failed:", err);
    }
  }
}

/** Update PostHog person identity/properties. Never throws. */
export function identify(properties?: Record<string, unknown>): void {
  try {
    if (phInstance) {
      const copeId = getOrCreateCopeId();
      phInstance.identify(copeId, properties);
    } else if (readyPromise && pendingIdentifyCalls.length < MAX_PENDING_EVENTS) {
      pendingIdentifyCalls.push(properties);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] identify() failed:", err);
    }
  }
}
