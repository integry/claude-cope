// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
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

    expect(container.textContent).toContain("IDLE: unclaimed labor capacity");
    expect(container.textContent).toContain("casual chat pays 1x TD");
    expect(container.textContent).toContain("10x");
    expect(container.textContent).toContain("/backlog");
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
