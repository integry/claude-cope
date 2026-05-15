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

function mockOverviewAndFeed({
  overview,
  overviewLoading = false,
  overviewError = null,
  feed,
  feedLoading = false,
  feedError = null,
}: {
  overview?: unknown;
  overviewLoading?: boolean;
  overviewError?: Error | null;
  feed?: unknown;
  feedLoading?: boolean;
  feedError?: Error | null;
}) {
  useAdminApiMock.mockImplementation((path: string) => {
    if (path === "/api/shares/overview") {
      return {
        data: overview,
        isLoading: overviewLoading,
        isError: overviewError,
      };
    }

    if (path.startsWith("/api/shares?")) {
      return {
        data: feed,
        isLoading: feedLoading,
        isError: feedError,
      };
    }

    throw new Error(`Unexpected path ${path}`);
  });
}

describe("SharedImages", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(cleanup);

  it("renders independent overview and feed loading states", () => {
    mockOverviewAndFeed({
      overviewLoading: true,
      feedLoading: true,
    });

    renderComponent();

    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares/overview");
    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares?limit=25&offset=0");
    expect(container.textContent).toContain("Loading overview...");
    expect(container.textContent).toContain("Loading shared-image activity...");
  });

  it("renders the feed even when overview analytics fail", () => {
    mockOverviewAndFeed({
      overviewError: new Error("boom"),
      feed: {
        items: [
          {
            shareId: "s1",
            createdAt: "2026-05-15T10:00:00.000Z",
            username: "alice",
            promptPreview: "Prompt preview",
            responsePreview: "Response preview",
            imageUrl: "https://example.com/api/share-image/s1",
            shareUrl: "https://example.com/s/s1",
          },
        ],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    expect(container.textContent).toContain("Failed to load shared image analytics.");
    expect(container.textContent).toContain("Prompt preview");
    expect(container.textContent).toContain("Open Share Page");
  });

  it("renders overview totals, filters, table rows, and modal preview", () => {
    mockOverviewAndFeed({
      overview: {
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
      feed: {
        items: [
          {
            shareId: "s1",
            createdAt: "2026-05-15T10:00:00.000Z",
            username: "alice",
            promptPreview: "Prompt preview",
            responsePreview: "Response preview",
            imageUrl: "https://example.com/api/share-image/s1",
            shareUrl: "https://example.com/s/s1",
          },
          {
            shareId: "s2",
            createdAt: "2026-05-15T09:00:00.000Z",
            username: "bob",
            promptPreview: "Another prompt",
            responsePreview: "Another response",
            imageUrl: "https://example.com/api/share-image/s2",
            shareUrl: "https://example.com/s/s2",
          },
        ],
        total: 26,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    expect(container.textContent).toContain("12");
    expect(container.textContent).toContain("456");
    expect(container.textContent).toContain("1. alice");
    expect(container.textContent).toContain("Prompt preview");
    expect(container.textContent).toContain("Response preview");
    expect(container.textContent).toContain("Page 1 of 2");

    const previewButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Preview");
    expect(previewButtons).toHaveLength(2);

    act(() => {
      previewButtons[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Share Preview");
    expect(container.querySelector('a[href="https://example.com/s/s1"]')).not.toBeNull();
  });

  it("resets pagination when username drill-down or search is applied", () => {
    mockOverviewAndFeed({
      overview: {
        totals: {
          lastHour: 1,
          last24Hours: 2,
          last3Days: 3,
          lastWeek: 4,
          lastMonth: 5,
          allTime: 6,
        },
        topUsers: {
          lastHour: [{ username: "alice", shareCount: 2 }],
          last24Hours: [],
          lastMonth: [],
          allTime: [],
        },
      },
      feed: {
        items: [
          {
            shareId: "s1",
            createdAt: "2026-05-15T10:00:00.000Z",
            username: "alice",
            promptPreview: "Prompt preview",
            responsePreview: "Response preview",
            imageUrl: "https://example.com/api/share-image/s1",
            shareUrl: "https://example.com/s/s1",
          },
        ],
        total: 50,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    const nextButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Next");
    act(() => {
      nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares?limit=25&offset=25");

    const leaderboardButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("1. alice"));
    act(() => {
      leaderboardButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares?limit=25&offset=0&username=alice");

    const searchInput = container.querySelector('input[type="search"]') as HTMLInputElement | null;
    expect(searchInput).not.toBeNull();

    act(() => {
      if (searchInput) {
        searchInput.value = "latency";
        searchInput.dispatchEvent(new Event("change", { bubbles: true }));
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    const form = container.querySelector("form");
    act(() => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares?limit=25&offset=0&query=latency&username=alice");
  });

  it("renders a clear empty state for the feed", () => {
    mockOverviewAndFeed({
      overview: {
        totals: {
          lastHour: 0,
          last24Hours: 0,
          last3Days: 0,
          lastWeek: 0,
          lastMonth: 0,
          allTime: 0,
        },
        topUsers: {
          lastHour: [],
          last24Hours: [],
          lastMonth: [],
          allTime: [],
        },
      },
      feed: {
        items: [],
        total: 0,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    expect(container.textContent).toContain("No shared images matched the current filters.");
    expect(container.textContent).toContain("No shared images in this time window yet.");
  });
});
