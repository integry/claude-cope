// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config", () => ({
  API_BASE: "https://example.test",
}));

import LeaderboardOverlay from "../LeaderboardOverlay";

describe("LeaderboardOverlay", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  const originalFetch = global.fetch;

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  async function renderOverlay(entries: unknown[] = []) {
    global.fetch = vi.fn(async () => (
      new Response(JSON.stringify(entries), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )) as typeof fetch;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<LeaderboardOverlay onClose={vi.fn()} />);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("uses the widened width contract and viewport clamp on the root overlay", async () => {
    await renderOverlay();

    const overlay = container?.firstElementChild as HTMLDivElement | null;

    expect(overlay).not.toBeNull();
    expect(overlay?.style.width).toBe("30rem");
    expect(overlay?.style.maxWidth).toBe("calc(100vw - 1rem)");
  });

  it("renders executive supporter accents without replacing podium colors", async () => {
    const entries = [
      {
        id: "alice",
        username: "alice",
        country: "US",
        corporate_rank: "Founder in Stealth",
        display_rank: "Founder in Stealth",
        technical_debt: 9999,
        created_at: "2026-05-18T00:00:00Z",
        is_executive_supporter: true,
      },
      {
        id: "bob",
        username: "bob",
        country: "CA",
        corporate_rank: "Staff IC",
        technical_debt: 4200,
        created_at: "2026-05-18T00:00:00Z",
        is_executive_supporter: false,
      },
      {
        id: "carol",
        username: "carol",
        country: "GB",
        corporate_rank: "Principal",
        technical_debt: 1200,
        created_at: "2026-05-18T00:00:00Z",
        is_executive_supporter: false,
      },
    ];

    await renderOverlay(entries);

    expect(global.fetch).toHaveBeenCalledWith("https://example.test/api/leaderboard");

    const rows = container!.querySelectorAll(".leaderboard-row");
    expect(rows).toHaveLength(3);
    expect(rows[0]?.classList.contains("leaderboard-row-podium-1")).toBe(true);
    expect(rows[0]?.classList.contains("leaderboard-row-supporter")).toBe(true);
    expect(rows[1]?.classList.contains("leaderboard-row-podium-2")).toBe(true);
    expect(rows[1]?.classList.contains("leaderboard-row-supporter")).toBe(false);
    expect(rows[2]?.classList.contains("leaderboard-row-supporter")).toBe(false);

    const supporterBadge = container!.querySelector(".leaderboard-supporter-badge");
    const supporterUsername = container!.querySelector(".leaderboard-supporter-username");
    const supporterRankChip = container!.querySelector(".leaderboard-vanity-rank-chip");

    expect(supporterBadge?.textContent).toBe("EXEC");
    expect(supporterUsername?.textContent).toBe("alice");
    expect(supporterRankChip?.textContent).toContain("[Founder in Stealth]");
    expect(container!.textContent).not.toContain("bob EXEC");
    expect(container!.textContent).not.toContain("carol EXEC");
  });
});
