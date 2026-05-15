// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import SprintProgressBar from "../SprintProgressBar";

describe("SprintProgressBar", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let mobileViewport = false;
  let frameTime = 0;
  let rafId = 0;
  const rafTimers = new Map<number, ReturnType<typeof setTimeout>>();

  const renderBar = (props: React.ComponentProps<typeof SprintProgressBar>) => {
    if (!container) {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
    }

    act(() => {
      root.render(<SprintProgressBar {...props} />);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    frameTime = 0;
    rafId = 0;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query === "(max-width: 767px)" ? mobileViewport : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++rafId;
      const timer = setTimeout(() => {
        frameTime += 16;
        callback(frameTime);
      }, 16);
      rafTimers.set(id, timer);
      return id;
    });

    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      const timer = rafTimers.get(id);
      if (timer !== undefined) {
        clearTimeout(timer);
        rafTimers.delete(id);
      }
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    mobileViewport = false;
    rafTimers.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders idle copy and the 10x reminder when no ticket is active", () => {
    renderBar({});

    expect(container.textContent).toContain("[SPRINT] WAITING FOR DESTRUCTION (Current Earning Rate: 1x)");
    expect(container.textContent).toContain("[-----------------] Open the /backlog. Official tasks inflict 10x more Technical Debt.");
  });

  it("renders the compressed one-line idle copy on mobile", () => {
    mobileViewport = true;

    renderBar({ onSlashCommand: vi.fn() });

    expect(container.textContent).toContain("[IDLE]Earning 1x. Run /backlog for 10x TD multiplier.");
    expect(container.textContent).not.toContain("WAITING FOR DESTRUCTION");
    expect(container.textContent).not.toContain("[-----------------]");
  });

  it("makes /backlog clickable in the idle copy", () => {
    const onSlashCommand = vi.fn();
    renderBar({ onSlashCommand });

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("/backlog");

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/backlog", "prefill");
  });

  it("renders active sprint progress when a ticket is active", () => {
    renderBar({
      id: "COPE-784",
      title: "Keep the sprint bar visible",
      sprintProgress: 45,
      sprintGoal: 90,
    });

    expect(container.textContent).toContain("COPE-784");
    expect(container.textContent).toContain("Keep the sprint bar visible");
    expect(container.textContent).toContain("45/90 TD");
    expect(container.textContent).toContain("50%");
  });

  it("animates progress increases instead of jumping instantly", async () => {
    renderBar({
      id: "COPE-784",
      title: "Keep the sprint bar visible",
      sprintProgress: 20,
      sprintGoal: 80,
    });

    renderBar({
      id: "COPE-784",
      title: "Keep the sprint bar visible",
      sprintProgress: 40,
      sprintGoal: 80,
    });

    expect(container.textContent).toContain("20/80 TD");
    expect(container.textContent).toContain("25%");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });

    expect(container.textContent).not.toContain("40/80 TD");
    expect(container.textContent).not.toContain("50%");
    expect(container.textContent).toMatch(/([2-3]\d)\/80 TD/);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1400);
    });

    expect(container.textContent).toContain("40/80 TD");
    expect(container.textContent).toContain("50%");
  });

  it("resets immediately when the active ticket identity changes", async () => {
    renderBar({
      id: "COPE-784",
      title: "Keep the sprint bar visible",
      sprintProgress: 60,
      sprintGoal: 80,
    });

    renderBar({
      id: "COPE-784",
      title: "Keep the sprint bar visible",
      sprintProgress: 75,
      sprintGoal: 80,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(64);
    });

    expect(container.textContent).toMatch(/6\d\/80 TD|7\d\/80 TD/);

    renderBar({
      id: "COPE-999",
      title: "Fresh sprint target",
      sprintProgress: 0,
      sprintGoal: 20,
    });

    expect(container.textContent).toContain("COPE-999");
    expect(container.textContent).toContain("Fresh sprint target");
    expect(container.textContent).toContain("0/20 TD");
    expect(container.textContent).toContain("0%");
  });
});
