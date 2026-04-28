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

const TURNSTILE_SCRIPT_SELECTOR = 'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]';
const TURNSTILE_SCRIPT_STATE = "data-turnstile-state";

type VerifyTokenResult = {
  verified: boolean;
  retryable: boolean;
  message?: string;
};

async function verifyToken(token: string): Promise<VerifyTokenResult> {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return {
      verified: Boolean(data?.verified),
      retryable: !data?.verified,
    };
  }

  if (res.status === 403) {
    return {
      verified: false,
      retryable: typeof data?.error !== "string",
      message: typeof data?.error === "string" ? data.error : undefined,
    };
  }

  if (res.status === 429 || res.status >= 500) {
    return {
      verified: false,
      retryable: false,
      message: typeof data?.error === "string" ? data.error : "Verification service is temporarily unavailable.",
    };
  }

  return {
    verified: false,
    retryable: false,
    message: typeof data?.error === "string" ? data.error : undefined,
  };
}

async function getBackendVerificationStatus(): Promise<"enabled" | "disabled" | "unavailable"> {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "GET",
    credentials: "include",
  }).catch(() => null);
  if (!res || !res.ok) return "unavailable";

  const data = await res.json().catch(() => ({}));
  if (typeof data?.misconfigured === "boolean" && data.misconfigured) {
    return "unavailable";
  }
  if (typeof data?.bypassed === "boolean") {
    return data.bypassed ? "disabled" : "enabled";
  }
  if (typeof data?.enabled === "boolean") {
    return data.enabled ? "enabled" : "unavailable";
  }
  return "unavailable";
}

function waitForTurnstileApi(timeoutMs: number): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const poll = () => {
      if (window.turnstile) {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error("turnstile api unavailable"));
        return;
      }
      window.setTimeout(poll, 50);
    };
    poll();
  });
}

function createTurnstileScript(): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  script.setAttribute(TURNSTILE_SCRIPT_STATE, "loading");
  return script;
}

function waitForScriptLoad(script: HTMLScriptElement): Promise<void> {
  const state = script.getAttribute(TURNSTILE_SCRIPT_STATE);
  if (state === "loaded") return Promise.resolve();
  if (state === "error") return Promise.reject(new Error("turnstile script failed to load"));

  return new Promise((resolve, reject) => {
    const onLoad = () => {
      script.setAttribute(TURNSTILE_SCRIPT_STATE, "loaded");
      resolve();
    };
    const onError = () => {
      script.setAttribute(TURNSTILE_SCRIPT_STATE, "error");
      reject(new Error("turnstile script failed to load"));
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
  });
}

async function ensureTurnstileScript(): Promise<void> {
  if (window.turnstile) return;

  const existing = document.querySelector<HTMLScriptElement>(TURNSTILE_SCRIPT_SELECTOR);
  if (existing) {
    const state = existing.getAttribute(TURNSTILE_SCRIPT_STATE);
    if (state === "loaded") {
      try {
        await waitForTurnstileApi(500);
        return;
      } catch {
        existing.remove();
      }
    }
    if (state !== "error" && existing.isConnected) {
      try {
        await Promise.race([
          waitForScriptLoad(existing),
          waitForTurnstileApi(1_500),
        ]);
      } catch {
        // Fall through to re-inject the script if the existing tag is stuck.
      }
      if (window.turnstile) return;
    }
    existing.remove();
  }

  const script = createTurnstileScript();
  const loadPromise = waitForScriptLoad(script);
  document.head.appendChild(script);
  await loadPromise;
  await waitForTurnstileApi(1_000);
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
    let verificationTimeoutId: number | null = null;
    const scriptLoadTimeoutMs = 10_000;
    const verificationTimeoutMs = 20_000;
    const clearVerificationTimeout = () => {
      if (verificationTimeoutId !== null) {
        window.clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
    };
    const startVerificationTimeout = () => {
      clearVerificationTimeout();
      verificationTimeoutId = window.setTimeout(() => {
        if (!cancelled) {
          onError("Human verification timed out.");
        }
      }, verificationTimeoutMs);
    };

    const run = async () => {
      const status = await getBackendVerificationStatus();
      if (cancelled) return;
      if (status === "disabled") {
        onVerified();
        return;
      }
      if (status === "unavailable") {
        onError("Unable to determine verification status from the server.");
        return;
      }

      if (!TURNSTILE_SITE_KEY) {
        onError("Human verification is enabled on the server, but VITE_TURNSTILE_SITE_KEY is not configured.");
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
          const result = await verifyToken(token).catch(() => ({
            verified: false,
            retryable: false,
            message: "Verification service is temporarily unavailable.",
          }));
          if (cancelled) return;
          if (result.verified) {
            clearVerificationTimeout();
            onVerified();
            return;
          }
          if (!result.retryable) {
            clearVerificationTimeout();
            onError(result.message ?? "Human verification unavailable.");
            return;
          }
          if (retries < maxRetries) {
            retries += 1;
            turnstile.reset(renderedWidgetId);
            startVerificationTimeout();
            turnstile.execute(renderedWidgetId);
            return;
          }
          clearVerificationTimeout();
          onError("Human verification failed after multiple attempts.");
        },
        "error-callback": () => {
          if (cancelled) return;
          if (retries >= maxRetries) {
            clearVerificationTimeout();
            onError("Turnstile reported repeated errors.");
            return;
          }
          retries += 1;
          if (retries >= maxRetries) {
            clearVerificationTimeout();
            onError("Turnstile reported repeated errors.");
            return;
          }
          turnstile.reset(renderedWidgetId);
          startVerificationTimeout();
          turnstile.execute(renderedWidgetId);
        },
        "expired-callback": () => {
          if (cancelled) return;
          turnstile.reset(renderedWidgetId);
          startVerificationTimeout();
          turnstile.execute(renderedWidgetId);
        },
      });
      widgetId = renderedWidgetId;

      startVerificationTimeout();
      turnstile.execute(renderedWidgetId);
    };

    void run().catch(() => {
      if (!cancelled) onError("Unable to start human verification.");
    });

    return () => {
      cancelled = true;
      clearVerificationTimeout();
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onError, onVerified, verificationNonce]);

  return <div id="turnstile-container" style={{ display: "none" }} aria-hidden="true" />;
}
