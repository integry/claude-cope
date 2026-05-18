// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config", () => ({
  API_BASE: "https://example.com",
}));

import LeaderboardOverlay from "../LeaderboardOverlay";

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;
const originalFetch = global.fetch;

function renderOverlay() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<LeaderboardOverlay onClose={vi.fn()} />);
  });
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("LeaderboardOverlay", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders executive supporter accents without replacing podium colors", async () => {
    global.fetch = vi.fn(async () => (
      new Response(JSON.stringify([
        {
          username: "alice",
          country: "US",
          corporate_rank: "Chief Firefighter",
          technical_debt: 9999,
          created_at: "2026-05-18T00:00:00Z",
          is_executive_supporter: true,
        },
        {
          username: "bob",
          country: "CA",
          corporate_rank: "Staff IC",
          technical_debt: 4200,
          created_at: "2026-05-18T00:00:00Z",
          is_executive_supporter: false,
        },
      ]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )) as typeof fetch;

    renderOverlay();
    await flushEffects();

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api/leaderboard");

    const rows = container!.querySelectorAll(".leaderboard-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.classList.contains("leaderboard-row-podium-1")).toBe(true);
    expect(rows[0]?.classList.contains("leaderboard-row-supporter")).toBe(true);
    expect(rows[1]?.classList.contains("leaderboard-row-podium-2")).toBe(true);
    expect(rows[1]?.classList.contains("leaderboard-row-supporter")).toBe(false);

    const supporterBadge = container!.querySelector(".leaderboard-supporter-badge");
    const supporterUsername = container!.querySelector(".leaderboard-supporter-username");
    const supporterRankChip = container!.querySelector(".leaderboard-supporter-rank-chip");

    expect(supporterBadge?.textContent).toBe("EXEC");
    expect(supporterUsername?.textContent).toBe("alice");
    expect(supporterRankChip?.textContent).toContain("[Chief Firefighter]");
    expect(container!.textContent).not.toContain("bob EXEC");
  });
});
