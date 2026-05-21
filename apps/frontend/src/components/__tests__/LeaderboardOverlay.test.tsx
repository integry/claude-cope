// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config", () => ({
  API_BASE: "https://example.test",
}));

import LeaderboardOverlay from "../LeaderboardOverlay";

describe("LeaderboardOverlay", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
    vi.restoreAllMocks();
  });

  async function renderOverlay() {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(createElement(LeaderboardOverlay, { onClose: vi.fn() }));
    });

    await act(async () => {
      await Promise.resolve();
    });
  }

  it("uses the widened width contract and viewport clamp on the root overlay", async () => {
    await renderOverlay();

    const overlay = container?.querySelector("[data-testid='leaderboard-overlay']") as HTMLDivElement | null;

    expect(overlay).not.toBeNull();
    expect(overlay?.style.width).toBe("30rem");
    expect(overlay?.style.maxWidth).toBe("calc(100vw - 1rem)");
  });
});
