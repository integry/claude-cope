// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

vi.mock("../../config", () => ({
  API_BASE: "",
  TURNSTILE_SITE_KEY: "site-key",
}));

import TurnstileWidget from "../TurnstileWidget";

let container: HTMLDivElement;
let root: Root;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete window.turnstile;
});

describe("TurnstileWidget", () => {
  it("re-injects the script when an existing loaded tag does not expose the API", async () => {
    const onVerified = vi.fn();
    const onError = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: true, bypassed: false, misconfigured: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ verified: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const staleScript = document.createElement("script");
    staleScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    staleScript.setAttribute("data-turnstile-state", "loaded");
    document.head.appendChild(staleScript);

    let renderOptions:
      | {
          callback?: (token: string) => void;
        }
      | undefined;

    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      const result = Node.prototype.appendChild.call(document.head, node) as HTMLScriptElement;
      if (node instanceof HTMLScriptElement && node !== staleScript) {
        window.turnstile = {
          render: (_target, options) => {
            renderOptions = options;
            return "widget-1";
          },
          execute: () => {
            renderOptions?.callback?.("token-123");
          },
          reset: vi.fn(),
        };
        node.dispatchEvent(new Event("load"));
      }
      return result;
    });

    await act(async () => {
      root.render(
        createElement(TurnstileWidget, {
          onVerified,
          onError,
          verificationNonce: 0,
        }),
      );
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    const activeScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    expect(activeScript).not.toBe(staleScript);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onVerified).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });
});
