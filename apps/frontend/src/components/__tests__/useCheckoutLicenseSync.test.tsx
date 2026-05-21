// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, useEffect, useState } from "react";
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
  const currentRoot = root;
  if (currentRoot) act(() => currentRoot.unmount());
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

  it("continues checkout sync after the initial history update rerenders the component", async () => {
    window.history.replaceState({}, "", "/?checkout_id=checkout_123");

    let resolveFetch: ((response: Response) => void) | null = null;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve) => {
      resolveFetch = resolve;
      expect(init?.signal?.aborted).toBe(false);
    }));
    global.fetch = fetchMock as typeof fetch;

    const runSlashCommand = vi.fn();

    function StatefulHarness() {
      const [history, setHistory] = useState<Message[]>([]);

      useEffect(() => {
        if (history.length > 0 && resolveFetch) {
          resolveFetch(new Response(JSON.stringify({ licenseKey: "COPE-123" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }));
          resolveFetch = null;
        }
      }, [history]);

      return createElement(Harness, {
        setHistory,
        runSlashCommand: (command: string) => {
          void history.length;
          runSlashCommand(command);
        },
      });
    }

    container = document.createElement("div");
    const nextContainer = container;
    document.body.appendChild(nextContainer);
    const nextRoot = createRoot(nextContainer);
    root = nextRoot;

    await act(async () => {
      nextRoot.render(createElement(StatefulHarness));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(runSlashCommand).toHaveBeenCalledWith("/sync COPE-123");
    expect(window.location.search).toBe("");
  });

  it("starts checkout sync from Polar customer session token return URLs", async () => {
    window.history.replaceState({}, "", "/?customer_session_token=polar_cst_return_1234567890&keep=1");

    const setHistory = vi.fn<(value: SetStateAction<Message[]>) => void>();
    const runSlashCommand = vi.fn();
    const fetchMock = vi.fn(async (): Promise<Response> => (
      new Response(JSON.stringify({ licenseKey: "COPE-456" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    ));
    global.fetch = fetchMock as typeof fetch;

    await act(async () => {
      renderHarness({ setHistory, runSlashCommand });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/account/checkout-license", expect.objectContaining({
      body: JSON.stringify({ customerSessionToken: "polar_cst_return_1234567890" }),
      credentials: "include",
      method: "POST",
    }));
    expect(runSlashCommand).toHaveBeenCalledWith("/sync COPE-456");
    expect(window.location.search).toBe("?keep=1");
  });
});
