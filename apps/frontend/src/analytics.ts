import posthog from "posthog-js";
import { POSTHOG_KEY, POSTHOG_HOST } from "./config";

const COPE_ID_KEY = "cope_id";
const GAME_STATE_KEY = "claudeCopeState";

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

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || "https://us.i.posthog.com",
    persistence: "memory",
  });

  const copeId = getOrCreateCopeId();
  const username = getUsernameFromGameState();

  posthog.identify(copeId, {
    ...(username ? { username } : {}),
  });
}
