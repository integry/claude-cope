import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSessionProfile } from "../../api/profileApi";
import { syncCompletedTicketReward } from "../buildChatSubmitArgs";
import { createServerProfile } from "../../test/createServerProfile";

vi.mock("../../api/profileApi", () => ({
  fetchSessionProfile: vi.fn(),
  updateTicketServer: vi.fn(),
}));

describe("syncCompletedTicketReward", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.mocked(fetchSessionProfile).mockReset();
    vi.mocked(fetchSessionProfile).mockResolvedValue({ found: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts completed task IDs to /api/score for pro users without relying on local totals", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

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
    expect(result).toEqual({ ok: true, status: "pending" });
  });

  it("posts completed task IDs to /api/score without a pro hash when the session is already authenticated", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/score");
    expect(JSON.parse(init?.body as string)).toEqual({
      username: "alice",
      completedTaskIds: ["COPE-115"],
    });
    expect(result).toEqual({ ok: true, status: "pending" });
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
    expect(result).toEqual({
      ok: true,
      status: "settled",
      profile: settledProfile,
      profileSource: "score",
    });
  });

  it("falls back to the refreshed session profile when /api/score succeeds without embedding one", async () => {
    const settledProfile = createServerProfile({ total_td: 1500, current_td: 1300 });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({
      found: true,
      profile: settledProfile,
    });

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
      expectedSettledTotalTdFloor: 1500,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchSessionProfile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ok: true,
      status: "settled",
      profile: settledProfile,
      profileSource: "session",
    });
  });

  it("keeps settlement pending when the refreshed session profile is still below the expected settled total", async () => {
    const staleProfile = createServerProfile({ total_td: 1000, current_td: 1000 });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({
      found: true,
      profile: staleProfile,
    });

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
      expectedSettledTotalTdFloor: 1500,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchSessionProfile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, status: "pending" });
  });

  it("leaves settlement pending when /api/score succeeds and the session refresh still has no profile", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchSessionProfile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, status: "pending" });
  });

  it("treats a 200 response with ok false as a failed reward sync", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: false, error: "retry" }), { status: 200 }),
    );

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, status: "failed" });
  });
});
