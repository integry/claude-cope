import { useEffect } from "react";
import { API_BASE, TURNSTILE_SITE_KEY } from "../config";

type TurnstileRenderOptions = {
  sitekey: string;
  size?: "invisible";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

async function verifyToken(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return Boolean(data?.verified);
}

async function isBackendVerificationEnabled(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "include",
  }).catch(() => null);
  if (!res) return false;
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    return !Boolean(data?.bypassed);
  }
  return res.status === 400;
}

function ensureTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile script failed to load")), { once: true });
    });
  }
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  return new Promise((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile script failed to load"));
    document.head.appendChild(script);
  });
}

export default function TurnstileWidget({
  onVerified,
  onError,
  verificationNonce,
}: {
  onVerified: () => void;
  onError: (message: string) => void;
  verificationNonce: number;
}) {
  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const maxRetries = 3;
    let widgetId: string | null = null;
    const scriptLoadTimeoutMs = 10_000;
    const verificationTimeoutMs = 20_000;

    const run = async () => {
      if (!TURNSTILE_SITE_KEY) {
        const enabled = await isBackendVerificationEnabled().catch(() => false);
        if (cancelled) return;
        if (enabled) {
          onError("Human verification is enabled on the server, but VITE_TURNSTILE_SITE_KEY is not configured.");
          return;
        }
        onVerified();
        return;
      }

      await Promise.race([
        ensureTurnstileScript(),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("Turnstile script load timed out")), scriptLoadTimeoutMs)),
      ]);
      if (cancelled) return;

      const turnstile = window.turnstile;
      const container = document.getElementById("turnstile-container");
      if (!turnstile || !container) {
        onError("Turnstile did not initialize.");
        return;
      }
      container.innerHTML = "";

      const renderedWidgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        callback: async (token: string) => {
          if (cancelled) return;
          const ok = await verifyToken(token).catch(() => false);
          if (cancelled) return;
          if (ok) {
            onVerified();
            return;
          }
          if (retries < maxRetries) {
            retries += 1;
            turnstile.reset(renderedWidgetId);
            turnstile.execute(renderedWidgetId);
            return;
          }
          onError("Human verification failed after multiple attempts.");
        },
        "error-callback": () => {
          if (cancelled || retries >= maxRetries) return;
          retries += 1;
          turnstile.reset(renderedWidgetId);
          turnstile.execute(renderedWidgetId);
          if (retries >= maxRetries) {
            onError("Turnstile reported repeated errors.");
          }
        },
        "expired-callback": () => {
          if (cancelled) return;
          turnstile.reset(renderedWidgetId);
          turnstile.execute(renderedWidgetId);
        },
      });
      widgetId = renderedWidgetId;

      turnstile.execute(renderedWidgetId);
      window.setTimeout(() => {
        if (!cancelled) {
          onError("Human verification timed out.");
        }
      }, verificationTimeoutMs);
    };

    void run().catch(() => {
      if (!cancelled) onError("Unable to start human verification.");
    });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onError, onVerified, verificationNonce]);

  return <div id="turnstile-container" style={{ display: "none" }} aria-hidden="true" />;
}
