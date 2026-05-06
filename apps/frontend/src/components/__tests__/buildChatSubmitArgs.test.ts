import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks, syncCompletedTicketReward } from "../buildChatSubmitArgs";

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
    await syncCompletedTicketReward({
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
      currentTD: 0,
      totalTDEarned: 0,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["COPE-115"],
      proKeyHash: "pro-hash",
    });
  });

  it("uses the latest state when syncing a completed paid ticket", async () => {
    const playChime = vi.fn();
    const addActiveTD = vi.fn();
    const setState = vi.fn((updater: (prev: any) => any) => updater({
      username: "alice",
      proKeyHash: "fresh-pro-hash",
      activeTicket: { id: "COPE-059", title: "Do Crimes To YAML", sprintProgress: 90, sprintGoal: 100 },
      pendingCompletedTaskIds: [],
    }));

    const { onSprintProgress } = buildSprintCallbacks({
      getState: () => ({
        username: "alice",
        proKeyHash: "fresh-pro-hash",
        activeTicket: { id: "COPE-059", title: "Do Crimes To YAML", sprintProgress: 90, sprintGoal: 100 },
      } as any),
      updateTicketProgress: vi.fn(),
      addActiveTD,
      playChime,
      setState,
    });

    await onSprintProgress(10);

    const scoreCall = fetchMock.mock.calls.find(([url]) => url === "/api/score");
    expect(scoreCall).toBeTruthy();
    expect(JSON.parse(scoreCall![1]?.body as string)).toMatchObject({
      username: "alice",
      completedTaskIds: ["COPE-059"],
      proKeyHash: "fresh-pro-hash",
    });
  });
});
