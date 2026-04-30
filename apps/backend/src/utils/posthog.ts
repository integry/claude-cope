type PostHogEvent = {
  event: string;
  distinct_id: string;
  properties?: Record<string, unknown>;
};

type PostHogEnv = {
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
};

const DEFAULT_HOST = "https://app.posthog.com";
const CAPTURE_TIMEOUT_MS = 5000;

let captureFailureLogged = false;

export async function capturePostHogEvent(
  env: PostHogEnv,
  event: PostHogEvent,
): Promise<void> {
  const apiKey = env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = (env.POSTHOG_HOST || DEFAULT_HOST).replace(/\/+$/, "");

  const body = JSON.stringify({
    api_key: apiKey,
    event: event.event,
    distinct_id: event.distinct_id,
    properties: {
      ...event.properties,
      $lib: "claude-cope-worker",
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);

  try {
    const response = await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });

    if (!response.ok && !captureFailureLogged) {
      console.warn(`PostHog capture failed: ${response.status} ${response.statusText}`);
      captureFailureLogged = true;
    }
  } finally {
    clearTimeout(timeout);
  }
}
