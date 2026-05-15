import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";

const TEST_ADMIN_KEY = "test-admin-key";
const NOW = "2026-05-15T12:00:00.000Z";

type ShareRow = {
  id: string;
  created_at: string;
  username: string;
  prompt: string;
  response: string;
};

function hoursAgo(hours: number): string {
  return new Date(Date.parse(NOW) - (hours * 60 * 60 * 1000)).toISOString();
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24);
}

function createMockDB(rows: ShareRow[] = []) {
  function normalizeFtsTerm(term: string): string {
    return term
      .replace(/^"/, "")
      .replace(/"\*$/, "")
      .replaceAll("\"\"", "\"")
      .toLowerCase();
  }

  function applyFilters(sql: string, args: unknown[]): ShareRow[] {
    let filtered = [...rows];
    let argIndex = 0;

    if (sql.includes("shared_cards_search MATCH ?")) {
      const query = String(args[argIndex++] ?? "");
      const needles = query.split(" AND ").map(normalizeFtsTerm).filter(Boolean);
      filtered = filtered.filter((row) => needles.every((needle) => (
        row.id.toLowerCase().includes(needle)
        || row.username.toLowerCase().includes(needle)
        || row.prompt.toLowerCase().includes(needle)
        || row.response.toLowerCase().includes(needle)
      )));
    }

    if (sql.includes("shared_cards.id LIKE ? ESCAPE '\\'")) {
      const rawPattern = String(args[argIndex++] ?? "").toLowerCase();
      const needle = rawPattern
        .replace(/^%/, "")
        .replace(/%$/, "")
        .replaceAll("\\%", "%")
        .replaceAll("\\_", "_")
        .replaceAll("\\\\", "\\");
      const matches = (value: string) => value.toLowerCase().includes(needle);
      filtered = filtered.filter((row) => (
        matches(row.id)
        || matches(row.username)
        || matches(row.prompt)
        || matches(row.response)
      ));
    }

    if (sql.includes("shared_cards.username = ?")) {
      const username = String(args[argIndex++] ?? "");
      filtered = filtered.filter((row) => row.username === username);
    }

    return filtered;
  }

  function filterByWindow(sql: string): ShareRow[] {
    const nowMs = Date.now();
    if (sql.includes("-1 hour")) return rows.filter((row) => Date.parse(row.created_at) >= nowMs - (60 * 60 * 1000));
    if (sql.includes("-24 hours")) return rows.filter((row) => Date.parse(row.created_at) >= nowMs - (24 * 60 * 60 * 1000));
    if (sql.includes("-1 month")) return rows.filter((row) => Date.parse(row.created_at) >= nowMs - (30 * 24 * 60 * 60 * 1000));
    return rows;
  }

  function statement(sql: string, args: unknown[] = []) {
    return {
      bind: (...boundArgs: unknown[]) => statement(sql, boundArgs),
      first: vi.fn(async () => {
        if (sql.includes("SELECT") && sql.includes("SUM(CASE WHEN created_at")) {
          const nowMs = Date.now();
          return {
            last_hour: rows.filter((row) => Date.parse(row.created_at) >= nowMs - (60 * 60 * 1000)).length,
            last_24_hours: rows.filter((row) => Date.parse(row.created_at) >= nowMs - (24 * 60 * 60 * 1000)).length,
            last_3_days: rows.filter((row) => Date.parse(row.created_at) >= nowMs - (3 * 24 * 60 * 60 * 1000)).length,
            last_week: rows.filter((row) => Date.parse(row.created_at) >= nowMs - (7 * 24 * 60 * 60 * 1000)).length,
            last_month: rows.filter((row) => Date.parse(row.created_at) >= nowMs - (30 * 24 * 60 * 60 * 1000)).length,
            all_time: rows.length,
          };
        }

        if (sql.includes("SELECT COUNT(*) AS total FROM shared_cards")) {
          return { total: applyFilters(sql, args).length };
        }

        return null;
      }),
      all: vi.fn(async () => {
        if (sql.includes("SELECT name FROM schema_migrations")) {
          return { results: [] };
        }

        if (sql.includes("GROUP BY username")) {
          const counts = new Map<string, number>();
          for (const row of filterByWindow(sql)) {
            counts.set(row.username, (counts.get(row.username) ?? 0) + 1);
          }

          const results = Array.from(counts.entries())
            .map(([username, share_count]) => ({ username, share_count }))
            .sort((a, b) => {
              if (b.share_count !== a.share_count) return b.share_count - a.share_count;
              return a.username.localeCompare(b.username);
            })
            .slice(0, 10);

          return { results };
        }

        if (sql.includes("COUNT(*) OVER() AS total_count")) {
          const filtered = applyFilters(sql, args)
            .sort((a, b) => {
              const createdAtDelta = Date.parse(b.created_at) - Date.parse(a.created_at);
              if (createdAtDelta !== 0) return createdAtDelta;
              return b.id.localeCompare(a.id);
            });

          const limit = Number(args[args.length - 2] ?? 50);
          const offset = Number(args[args.length - 1] ?? 0);
          const paged = filtered.slice(offset, offset + limit).map((row) => ({
            ...row,
            total_count: filtered.length,
          }));
          return { results: paged };
        }

        return { results: [] };
      }),
      run: vi.fn(async () => ({ meta: { changes: 0 } })),
    };
  }

  return {
    prepare: vi.fn((sql: string) => statement(sql)),
    exec: vi.fn().mockResolvedValue({ results: [] }),
    batch: vi.fn().mockResolvedValue([]),
  };
}

function createThrowingDB(message: string) {
  const statement = {
    bind: vi.fn(),
    first: vi.fn(async () => {
      throw new Error(message);
    }),
    all: vi.fn(async () => {
      throw new Error(message);
    }),
    run: vi.fn(async () => {
      throw new Error(message);
    }),
  };
  statement.bind.mockImplementation(() => statement);

  return {
    prepare: vi.fn(() => statement),
    exec: vi.fn().mockRejectedValue(new Error(message)),
    batch: vi.fn().mockRejectedValue(new Error(message)),
  };
}

function makeEnv(db?: ReturnType<typeof createMockDB>) {
  return {
    ...(db ? { DB: db } : {}),
    ALLOWED_ORIGINS: "http://localhost:5174",
    ADMIN_API_KEY: TEST_ADMIN_KEY,
    SHARE_CARD_BASE_ORIGIN: "https://claudecope.com",
  };
}

function requestShares(path: string, env: Record<string, unknown>, headers?: Record<string, string>) {
  return app.request(path, { headers }, env);
}

describe("admin shares routes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires the admin bearer token", async () => {
    const res = await requestShares("/api/shares/overview", makeEnv(createMockDB()));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns a consistent 500 JSON error when DB is not configured", async () => {
    const res = await requestShares(
      "/api/shares/overview",
      makeEnv(),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Database not configured" });
  });

  it("returns empty overview and feed payloads when there are no shared cards", async () => {
    const db = createMockDB();

    const overviewRes = await requestShares(
      "/api/shares/overview",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );
    expect(overviewRes.status).toBe(200);
    await expect(overviewRes.json()).resolves.toEqual({
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
    });

    const listRes = await requestShares(
      "/api/shares",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );
    expect(listRes.status).toBe(200);
    await expect(listRes.json()).resolves.toEqual({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
  });

  it("returns a consistent 500 JSON error when overview analytics querying fails", async () => {
    const res = await requestShares(
      "/api/shares/overview",
      makeEnv(createThrowingDB("overview failed") as never),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to load share overview analytics" });
  });

  it("returns a consistent 500 JSON error when shared-image activity querying fails", async () => {
    const res = await requestShares(
      "/api/shares",
      makeEnv(createThrowingDB("feed failed") as never),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to load shared-image activity" });
  });

  it("returns time-window totals and ordered top-user leaderboards", async () => {
    const db = createMockDB([
      { id: "s1", username: "alice", prompt: "Prompt one", response: "Response one", created_at: hoursAgo(0.25) },
      { id: "s2", username: "alice", prompt: "Prompt two", response: "Response two", created_at: hoursAgo(0.8) },
      { id: "s3", username: "bob", prompt: "Prompt three", response: "Response three", created_at: hoursAgo(7) },
      { id: "s4", username: "carol", prompt: "Prompt four", response: "Response four", created_at: daysAgo(2) },
      { id: "s5", username: "dave", prompt: "Prompt five", response: "Response five", created_at: daysAgo(6) },
      { id: "s6", username: "erin", prompt: "Prompt six", response: "Response six", created_at: daysAgo(25) },
      { id: "s7", username: "bob", prompt: "Prompt seven", response: "Response seven", created_at: daysAgo(66) },
    ]);

    const res = await requestShares(
      "/api/shares/overview",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(200);
    const data = await res.json() as {
      totals: Record<string, number>;
      topUsers: Record<string, Array<{ username: string; shareCount: number }>>;
    };

    expect(data.totals).toEqual({
      lastHour: 2,
      last24Hours: 3,
      last3Days: 4,
      lastWeek: 5,
      lastMonth: 6,
      allTime: 7,
    });
    expect(data.topUsers.lastHour).toEqual([
      { username: "alice", shareCount: 2 },
    ]);
    expect(data.topUsers.last24Hours).toEqual([
      { username: "alice", shareCount: 2 },
      { username: "bob", shareCount: 1 },
    ]);
    expect(data.topUsers.lastMonth).toEqual([
      { username: "alice", shareCount: 2 },
      { username: "bob", shareCount: 1 },
      { username: "carol", shareCount: 1 },
      { username: "dave", shareCount: 1 },
      { username: "erin", shareCount: 1 },
    ]);
    expect(data.topUsers.allTime).toEqual([
      { username: "alice", shareCount: 2 },
      { username: "bob", shareCount: 2 },
      { username: "carol", shareCount: 1 },
      { username: "dave", shareCount: 1 },
      { username: "erin", shareCount: 1 },
    ]);
  });

  it("returns newest-first paginated feed items with public share URLs", async () => {
    const db = createMockDB([
      { id: "s1", username: "alice", prompt: "Older prompt", response: "Older response", created_at: daysAgo(3) },
      { id: "s2", username: "bob", prompt: "Newest prompt with more than enough content to create a preview string", response: "Newest response", created_at: hoursAgo(1) },
      { id: "s3", username: "carol", prompt: "Middle prompt", response: "Middle response", created_at: daysAgo(1) },
    ]);

    const res = await requestShares(
      "/api/shares?limit=2&offset=1",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(200);
    const data = await res.json() as {
      items: Array<Record<string, string>>;
      total: number;
      limit: number;
      offset: number;
    };

    expect(data.total).toBe(3);
    expect(data.limit).toBe(2);
    expect(data.offset).toBe(1);
    expect(data.items.map((item) => item.shareId)).toEqual(["s3", "s1"]);
    expect(data.items[0]).toMatchObject({
      shareId: "s3",
      createdAt: expect.any(String),
      username: "carol",
      promptPreview: "Middle prompt",
      responsePreview: "Middle response",
      imageUrl: "https://claudecope.com/api/share-image/s3",
      shareUrl: "https://claudecope.com/s/s3",
    });
  });

  it("filters the feed by username and search query", async () => {
    const db = createMockDB([
      { id: "s1", username: "alice", prompt: "Latency is melting prod", response: "Please page SRE", created_at: hoursAgo(1) },
      { id: "s2", username: "alice", prompt: "Unrelated prompt", response: "Nothing about incidents", created_at: hoursAgo(2) },
      { id: "s3", username: "bob", prompt: "Latency issue from Bob", response: "Still bad", created_at: hoursAgo(3) },
    ]);

    const res = await requestShares(
      "/api/shares?username=alice&query=latency",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(200);
    const data = await res.json() as {
      items: Array<{ shareId: string; username: string; promptPreview: string }>;
      total: number;
    };

    expect(data.total).toBe(1);
    expect(data.items).toEqual([
      {
        shareId: "s1",
        username: "alice",
        promptPreview: "Latency is melting prod",
        responsePreview: "Please page SRE",
        createdAt: hoursAgo(1),
        imageUrl: "https://claudecope.com/api/share-image/s1",
        shareUrl: "https://claudecope.com/s/s1",
      },
    ]);
  });

  it("treats percent and underscore search input as literal text", async () => {
    const db = createMockDB([
      { id: "s1", username: "alice", prompt: "CPU at 95%_util", response: "watch it", created_at: hoursAgo(1) },
      { id: "s2", username: "bob", prompt: "CPU at 95xutil", response: "not the same", created_at: hoursAgo(2) },
    ]);

    const res = await requestShares(
      "/api/shares?query=%25_",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(200);
    const data = await res.json() as {
      items: Array<{ shareId: string }>;
      total: number;
    };

    expect(data.total).toBe(1);
    expect(data.items.map((item) => item.shareId)).toEqual(["s1"]);
  });

  it("keeps prompt and response previews within their configured max length", async () => {
    const db = createMockDB([
      {
        id: "s1",
        username: "alice",
        prompt: "p".repeat(200),
        response: "r".repeat(260),
        created_at: hoursAgo(1),
      },
    ]);

    const res = await requestShares(
      "/api/shares",
      makeEnv(db),
      { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    );

    expect(res.status).toBe(200);
    const data = await res.json() as {
      items: Array<{ promptPreview: string; responsePreview: string }>;
    };

    expect(data.items[0]?.promptPreview).toHaveLength(140);
    expect(data.items[0]?.responsePreview).toHaveLength(220);
  });
});
