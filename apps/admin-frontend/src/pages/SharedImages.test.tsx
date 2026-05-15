// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

const useAdminApiMock = vi.fn();

vi.mock("../hooks/useAdminApi", () => ({
  useAdminApi: (...args: unknown[]) => useAdminApiMock(...args),
}));

import SharedImages from "./SharedImages";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderComponent() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(SharedImages));
  });
}

function cleanup() {
  useAdminApiMock.mockReset();
  if (root) {
    act(() => root.unmount());
  }
  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe("SharedImages", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(cleanup);

  it("renders loading state", () => {
    useAdminApiMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: null,
    });

    renderComponent();

    expect(container.textContent).toContain("Shared Images");
    expect(container.textContent).toContain("Loading...");
  });

  it("renders error state", () => {
    useAdminApiMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: new Error("boom"),
    });

    renderComponent();

    expect(container.textContent).toContain("Failed to load shared image analytics.");
  });

  it("renders overview totals, leaderboards, and reserved activity space", () => {
    useAdminApiMock.mockReturnValue({
      data: {
        totals: {
          lastHour: 12,
          last24Hours: 45,
          last3Days: 67,
          lastWeek: 89,
          lastMonth: 123,
          allTime: 456,
        },
        topUsers: {
          lastHour: [{ username: "alice", shareCount: 5 }],
          last24Hours: [{ username: "bob", shareCount: 9 }],
          lastMonth: [{ username: "carol", shareCount: 14 }],
          allTime: [{ username: "dave", shareCount: 33 }],
        },
      },
      isLoading: false,
      isError: null,
    });

    renderComponent();

    expect(container.textContent).toContain("Last Hour");
    expect(container.textContent).toContain("Last 24 Hours");
    expect(container.textContent).toContain("Last 3 Days");
    expect(container.textContent).toContain("Last Week");
    expect(container.textContent).toContain("Last Month");
    expect(container.textContent).toContain("Total");
    expect(container.textContent).toContain("12");
    expect(container.textContent).toContain("456");
    expect(container.textContent).toContain("1. alice");
    expect(container.textContent).toContain("1. bob");
    expect(container.textContent).toContain("1. carol");
    expect(container.textContent).toContain("1. dave");
    expect(container.textContent).toContain("Activity Feed");
    expect(container.textContent).toContain("browsable shared-image activity table");
  });
});
