import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncCompletedTicketReward } from "../buildChatSubmitArgs";
import type { ServerProfile } from "@claude-cope/shared/profile";

function createServerProfile(overrides: Partial<ServerProfile> = {}): ServerProfile {
  return {
    username: "alice",
    current_td: 1000,
    total_td: 1000,
    corporate_rank: "Junior Code Monkey",
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy_type: null,
    buddy_is_shiny: false,
    unlocked_themes: ["default"],
    active_theme: "default",
    active_ticket: null,
    td_multiplier: 1,
    multiplier: 1,
    quota_percent: 100,
    ...overrides,
  };
}

describe("syncCompletedTicketReward", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts completed task IDs to /api/score for pro users without relying on local totals", async () => {
    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/score");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      username: "alice",
      completedTaskIds: ["COPE-115"],
      proKeyHash: "pro-hash",
    });
    expect(result).toEqual({ ok: true });
  });

  it("returns the embedded profile when /api/score confirms the updated account state", async () => {
    const settledProfile = createServerProfile({ total_td: 1500, current_td: 1500 });
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, profile: settledProfile }), { status: 200 }),
    );

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, profile: settledProfile });
  });

  it("leaves settlement pending when /api/score succeeds without an updated profile", async () => {
    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true });
  });
});
