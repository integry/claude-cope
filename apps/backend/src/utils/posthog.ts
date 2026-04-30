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

  const response = await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    console.warn(`PostHog capture failed: ${response.status} ${response.statusText}`);
  }
}
