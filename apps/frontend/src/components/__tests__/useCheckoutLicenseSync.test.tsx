// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import type { SetStateAction } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import type { Message } from "../../hooks/useGameState";

vi.mock("../../config", () => ({
  API_BASE: "https://example.com",
}));

import { useCheckoutLicenseSync } from "../useCheckoutLicenseSync";

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;
const originalFetch = global.fetch;
const originalLocation = window.location.pathname + window.location.search;

function Harness({
  isBooting = false,
  proKeyHash,
  setHistory,
  runSlashCommand,
}: {
  isBooting?: boolean;
  proKeyHash?: string;
  setHistory: (value: SetStateAction<Message[]>) => void;
  runSlashCommand: (command: string) => void;
}) {
  useCheckoutLicenseSync({
    isBooting,
    proKeyHash,
    setHistory,
    runSlashCommand,
  });
  return null;
}

function renderHarness(props: {
  isBooting?: boolean;
  proKeyHash?: string;
  setHistory: (value: SetStateAction<Message[]>) => void;
  runSlashCommand: (command: string) => void;
}) {
  container = document.createElement("div");
  const nextContainer = container;
  document.body.appendChild(nextContainer);
  const nextRoot = createRoot(nextContainer);
  root = nextRoot;
  act(() => {
    nextRoot.render(createElement(Harness, props));
  });
}

function cleanup() {
  if (root) act(() => root.unmount());
  root = null;
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
}

describe("useCheckoutLicenseSync", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.fetch = originalFetch;
    window.history.replaceState({}, "", originalLocation);
  });

  it("stops retry-driven history updates after unmount", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/?checkout_id=checkout_123");

    const setHistory = vi.fn<(value: SetStateAction<Message[]>) => void>();
    const runSlashCommand = vi.fn();
    const fetchMock = vi.fn(async (): Promise<Response> => (
      new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    ));
    global.fetch = fetchMock as typeof fetch;

    renderHarness({ setHistory, runSlashCommand });

    expect(setHistory).toHaveBeenCalledTimes(1);
    expect(runSlashCommand).not.toHaveBeenCalled();

    cleanup();

    await act(async () => {
      vi.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(setHistory).toHaveBeenCalledTimes(1);
    expect(runSlashCommand).not.toHaveBeenCalled();
  });
});
