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

export default function TurnstileWidget({ onVerified }: { onVerified: () => void }) {
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      onVerified();
      return;
    }

    let cancelled = false;
    let retries = 0;
    const maxRetries = 3;

    const run = async () => {
      const turnstile = window.turnstile;
      const container = document.getElementById("turnstile-container");
      if (!turnstile || !container) return;

      const widgetId = turnstile.render(container, {
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
            turnstile.reset(widgetId);
            turnstile.execute(widgetId);
          }
        },
        "error-callback": () => {
          if (cancelled || retries >= maxRetries) return;
          retries += 1;
          turnstile.reset(widgetId);
          turnstile.execute(widgetId);
        },
        "expired-callback": () => {
          if (cancelled) return;
          turnstile.reset(widgetId);
          turnstile.execute(widgetId);
        },
      });

      turnstile.execute(widgetId);
    };

    const timer = window.setInterval(() => {
      if (window.turnstile && document.getElementById("turnstile-container")) {
        window.clearInterval(timer);
        void run();
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [onVerified]);

  return <div id="turnstile-container" style={{ display: "none" }} aria-hidden="true" />;
}
