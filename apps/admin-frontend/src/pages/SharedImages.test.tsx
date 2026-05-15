/* eslint-disable max-lines */
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

type FeedItem = {
  shareId: string;
  createdAt: string;
  username: string;
  promptPreview: string;
  responsePreview: string;
  imageUrl: string;
  shareUrl: string;
};

let container!: HTMLDivElement;
let root!: ReturnType<typeof createRoot>;

function createOverview() {
  return {
    totals: {
      lastHour: 1,
      last24Hours: 2,
      last3Days: 3,
      lastWeek: 4,
      lastMonth: 5,
      allTime: 6,
    },
    topUsers: {
      lastHour: [],
      last24Hours: [],
      lastMonth: [],
      allTime: [],
    },
  };
}

function createFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    shareId: "s1",
    createdAt: "2026-05-15T10:00:00.000Z",
    username: "alice",
    promptPreview: "Prompt preview",
    responsePreview: "Response preview",
    imageUrl: "https://example.com/api/share-image/s1",
    shareUrl: "https://example.com/s/s1",
    ...overrides,
  };
}

function renderComponent() {
  act(() => {
    if (!container) {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
    }

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
  root = undefined as never;
  container = undefined as never;
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
        items: [createFeedItem()],
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

  it("renders a feed error state when the activity request fails", () => {
    mockOverviewAndFeed({
      overview: createOverview(),
      feedError: new Error("feed failed"),
    });

    renderComponent();

    expect(container.textContent).toContain("Failed to load shared-image activity.");
    expect(container.textContent).toContain("Generated shared images across key time windows.");
  });

  it("renders a feed error state when the activity payload is invalid", () => {
    mockOverviewAndFeed({
      overview: createOverview(),
      feed: {
        items: [],
        total: 2,
        limit: "25",
        offset: 0,
      },
    });

    renderComponent();

    expect(container.textContent).toContain("Failed to load shared-image activity.");
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
          createFeedItem(),
          createFeedItem({
            shareId: "s2",
            createdAt: "2026-05-15T09:00:00.000Z",
            username: "bob",
            promptPreview: "Another prompt",
            responsePreview: "Another response",
            imageUrl: "https://example.com/api/share-image/s2",
            shareUrl: "https://example.com/s/s2",
          }),
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
        ...createOverview(),
        topUsers: {
          lastHour: [{ username: "alice", shareCount: 2 }],
          last24Hours: [],
          lastMonth: [],
          allTime: [],
        },
      },
      feed: {
        items: [createFeedItem()],
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
    const usernameInput = container.querySelector('input[placeholder="Filter by username"]') as HTMLInputElement | null;
    expect(searchInput).not.toBeNull();
    expect(usernameInput).not.toBeNull();

    act(() => {
      if (usernameInput) {
        usernameInput.value = "  eve  ";
        usernameInput.dispatchEvent(new Event("change", { bubbles: true }));
        usernameInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    expect(usernameInput?.value).toBe("  eve  ");
    expect(useAdminApiMock).not.toHaveBeenCalledWith("/api/shares?limit=25&offset=0&username=eve");

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
  });

  it("uses the backend-provided page size for labels and follow-up pagination requests", () => {
    let currentFeed = {
      items: [createFeedItem()],
      total: 35,
      limit: 10,
      offset: 20,
    };

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
      feed: currentFeed,
    });

    renderComponent();

    expect(container.textContent).toContain("Showing 21–30 of 35");
    expect(container.textContent).toContain("Page 3 of 4");

    currentFeed = {
      ...currentFeed,
      offset: 30,
    };
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
      feed: currentFeed,
    });

    const nextButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Next");
    act(() => {
      nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(useAdminApiMock).toHaveBeenCalledWith("/api/shares?limit=10&offset=30");
    expect(useAdminApiMock).not.toHaveBeenCalledWith("/api/shares?limit=25&offset=30");
  });

  it("closes the preview modal when the selected share is not in the active feed anymore", () => {
    const overview = {
      totals: {
        lastHour: 1,
        last24Hours: 1,
        last3Days: 1,
        lastWeek: 1,
        lastMonth: 1,
        allTime: 1,
      },
      topUsers: {
        lastHour: [],
        last24Hours: [],
        lastMonth: [],
        allTime: [],
      },
    };

    mockOverviewAndFeed({
      overview,
      feed: {
        items: [createFeedItem()],
        total: 2,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    const previewButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Preview");
    act(() => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Share Preview");

    mockOverviewAndFeed({
      overview,
      feed: {
        items: [
          createFeedItem({
            shareId: "s2",
            createdAt: "2026-05-15T09:00:00.000Z",
            username: "bob",
            promptPreview: "Another prompt",
            responsePreview: "Another response",
            imageUrl: "https://example.com/api/share-image/s2",
            shareUrl: "https://example.com/s/s2",
          }),
        ],
        total: 2,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    expect(container.textContent).not.toContain("Share Preview");
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

  it("dismisses the preview modal when the backdrop is clicked", () => {
    mockOverviewAndFeed({
      overview: createOverview(),
      feed: {
        items: [createFeedItem()],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });

    renderComponent();

    const previewButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Preview");
    act(() => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute("aria-describedby")).toBe("share-preview-description");

    act(() => {
      dialog?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).not.toContain("Share Preview");
  });
});
