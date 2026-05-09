import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncCompletedTicketReward } from "../buildChatSubmitArgs";
import { createServerProfile } from "../../test/createServerProfile";

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
    expect(result).toEqual({ ok: true, profile: settledProfile, profileSource: "score" });
  });

  it("falls back to the session profile when /api/score succeeds without returning one", async () => {
    const settledProfile = createServerProfile({ total_td: 1500, current_td: 1500 });
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ found: true, profile: settledProfile }), { status: 200 }),
      );

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/account/me");
    expect(result).toEqual({ ok: true, profile: settledProfile, profileSource: "session" });
  });

  it("leaves settlement pending when neither endpoint returns a profile", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ found: false }), { status: 200 }));

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/account/me");
    expect(result).toEqual({ ok: true });
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
    expect(result).toBeNull();
  });
});
