// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { useMobilePromptFollow } from "../useMobilePromptFollow";
import type { Message } from "../../hooks/useGameState";

function HookHarness(props: {
  history: Message[];
  isMobileViewport: boolean;
  isProcessing: boolean;
  messageKeys: number[];
  resolveScrollViewport: () => HTMLDivElement | null;
}) {
  useMobilePromptFollow(props);
  return null;
}

describe("useMobilePromptFollow", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let rafQueue: FrameRequestCallback[] = [];
  let rafId = 0;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
    rafQueue = [];
    vi.restoreAllMocks();
  });

  it("nudges the mobile viewport until the active prompt reaches the top", () => {
    vi.stubGlobal("requestAnimationFrame", vi.fn((cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      rafId += 1;
      return rafId;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const viewport = document.createElement("div");
    const prompt = document.createElement("div");
    prompt.dataset.messageKey = "11";
    document.body.appendChild(viewport);
    document.body.appendChild(prompt);

    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 200 });
    Object.defineProperty(viewport, "scrollHeight", { configurable: true, value: 800 });
    viewport.scrollTop = 0;
    viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
    prompt.getBoundingClientRect = () => ({ top: viewport.scrollTop <= 96 ? 180 : 100 } as DOMRect);

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root!.render(
        <HookHarness
          history={[{ id: 1, role: "user", content: "ship it" }]}
          isMobileViewport
          isProcessing
          messageKeys={[11]}
          resolveScrollViewport={() => viewport}
        />,
      );
    });

    expect(rafQueue).toHaveLength(1);

    act(() => {
      while (rafQueue.length > 0) {
        const frame = rafQueue.shift();
        frame?.(performance.now());
      }
    });

    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(rafQueue).toHaveLength(0);
  });

  it("stops tracking when mobile mode turns off", () => {
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", vi.fn((cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      rafId += 1;
      return rafId;
    }));
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const viewport = document.createElement("div");
    const prompt = document.createElement("div");
    prompt.dataset.messageKey = "22";
    document.body.appendChild(viewport);
    document.body.appendChild(prompt);

    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 200 });
    Object.defineProperty(viewport, "scrollHeight", { configurable: true, value: 800 });
    viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
    prompt.getBoundingClientRect = () => ({ top: 180 } as DOMRect);

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root!.render(
        <HookHarness
          history={[{ id: 1, role: "user", content: "ship it" }]}
          isMobileViewport
          isProcessing
          messageKeys={[22]}
          resolveScrollViewport={() => viewport}
        />,
      );
    });

    act(() => {
      root!.render(
        <HookHarness
          history={[{ id: 1, role: "user", content: "ship it" }]}
          isMobileViewport={false}
          isProcessing
          messageKeys={[22]}
          resolveScrollViewport={() => viewport}
        />,
      );
    });

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
