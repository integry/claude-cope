// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import SprintProgressBar from "../SprintProgressBar";

describe("SprintProgressBar", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const renderBar = (props: React.ComponentProps<typeof SprintProgressBar>) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(<SprintProgressBar {...props} />);
    });
  };

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("renders idle copy and the 10x reminder when no ticket is active", () => {
    renderBar({});

    expect(container.textContent).toContain("[SPRINT] WAITING FOR DESTRUCTION (Current Earning Rate: 1x)");
    expect(container.textContent).toContain("[-----------------] Open the /backlog. Official tasks inflict 10x more Technical Debt.");
  });

  it("makes /backlog clickable in the idle copy", () => {
    const onSlashCommand = vi.fn();
    renderBar({ onSlashCommand });

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("/backlog");

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/backlog", "execute");
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
});
