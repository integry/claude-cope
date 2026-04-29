// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import TurnstileWidget from "../components/TurnstileWidget";

let container: HTMLDivElement;
let root: Root;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderWidget(props: { onVerified: () => void; onError: (message: string) => void; verificationNonce?: number }) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(TurnstileWidget, { verificationNonce: 0, ...props }));
  });
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(async () => {
  vi.restoreAllMocks();
  if (root) {
    await act(async () => {
      root.unmount();
    });
  }
  container?.remove();
  document.head.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile"]').forEach((node) => node.remove());
});

describe("TurnstileWidget bootstrap gating", () => {
  it("blocks the app when verify bootstrap reports misconfigured", async () => {
    const onVerified = vi.fn();
    const onError = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "misconfigured", reason: "invalid_expected_hostname" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await renderWidget({ onVerified, onError });
    await flushEffects();

    expect(onVerified).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Human verification is unavailable because the server is misconfigured.");
  });

  it("blocks the app when verify bootstrap reports unavailable", async () => {
    const onVerified = vi.fn();
    const onError = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "unavailable", reason: "storage_unavailable" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await renderWidget({ onVerified, onError });
    await flushEffects();

    expect(onVerified).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Human verification is temporarily unavailable.");
  });
});
