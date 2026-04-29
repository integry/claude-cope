import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../config";
import { pollBootstrapStatus, verifyToken } from "./turnstileBootstrap";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    let retries = 0;
    const maxRetries = 3;
    let widgetId: string | null = null;
    let verificationTimeoutId: number | null = null;
    const scriptLoadTimeoutMs = 10_000;
    const verificationTimeoutMs = 60_000;
    const clearVerificationTimeout = () => {
      if (verificationTimeoutId !== null) {
        window.clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
    };
    const settle = () => { settled = true; clearVerificationTimeout(); };
    const startVerificationTimeout = () => {
      clearVerificationTimeout();
      verificationTimeoutId = window.setTimeout(() => {
        if (!cancelled && !settled) {
          settle();
          onError("Human verification timed out.");
        }
      }, verificationTimeoutMs);
    };
    const retryChallenge = (message: string) => {
      retries += 1;
      if (retries > maxRetries) {
        settle();
        onError(message);
        return false;
      }
      const backoffMs = Math.min(1000 * 2 ** (retries - 1), 8000);
      window.setTimeout(() => {
        if (cancelled) return;
        turnstile?.reset(widgetId ?? "");
        startVerificationTimeout();
        turnstile?.execute(widgetId ?? "");
      }, backoffMs);
      return true;
    };
    let turnstile: TurnstileApi | undefined;

    const run = async () => {
      const bootstrap = await pollBootstrapStatus(() => cancelled);
      if (cancelled) return;
      if (bootstrap.outcome === "verified") {
        onVerified();
        return;
      }
      if (bootstrap.outcome === "error") {
        onError(bootstrap.message);
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

      turnstile = window.turnstile;
      const container = containerRef.current;
      if (!turnstile || !container) {
        onError("Turnstile did not initialize.");
        return;
      }
      const turnstileApi = turnstile;
      container.innerHTML = "";

      const renderedWidgetId = turnstileApi.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        callback: async (token: string) => {
          if (cancelled || settled) return;
          const result = await verifyToken(token).catch(() => ({
            verified: false,
            retryable: false,
            message: "Verification service is temporarily unavailable.",
          }));
          if (cancelled || settled) return;
          if (result.verified) {
            settle();
            onVerified();
            return;
          }
          if (!result.retryable) {
            settle();
            onError(result.message ?? "Human verification unavailable.");
            return;
          }
          retryChallenge("Human verification failed after multiple attempts.");
        },
        "error-callback": () => {
          if (cancelled || settled) return;
          retryChallenge("Turnstile reported repeated errors.");
        },
        "expired-callback": () => {
          if (cancelled || settled) return;
          turnstileApi.reset(renderedWidgetId);
          startVerificationTimeout();
          turnstileApi.execute(renderedWidgetId);
        },
      });
      widgetId = renderedWidgetId;

      startVerificationTimeout();
      turnstileApi.execute(renderedWidgetId);
    };

    void run().catch(() => {
      if (!cancelled && !settled) onError("Unable to start human verification.");
    });

    return () => {
      cancelled = true;
      clearVerificationTimeout();
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onError, onVerified, verificationNonce]);

  return <div ref={containerRef} style={{ display: "none" }} aria-hidden="true" />;
}
