import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createMockDB(overrides: {
  scoreAgg?: { total_users: number; total_td: number } | null;
  eventCount?: { count: number } | null;
  licenseCount?: { count: number } | null;
  maxUsers?: { count: number } | null;
  revokedUsers?: { count: number } | null;
} = {}) {
  const firstResponses: (Record<string, unknown> | null)[] = [
    overrides.scoreAgg ?? { total_users: 10, total_td: 50000 },
    overrides.eventCount ?? { count: 3 },
    overrides.licenseCount ?? { count: 5 },
    overrides.maxUsers ?? { count: 4 },
    overrides.revokedUsers ?? { count: 1 },
  ];
  let callIndex = 0;
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockImplementation(() => Promise.resolve(firstResponses[callIndex++] ?? null)),
      run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
      all: vi.fn().mockResolvedValue({ results: [] }),
    })),
    exec: vi.fn().mockResolvedValue({ results: [] }),
    batch: vi.fn().mockResolvedValue([]),
  };
}

function getStats(env: Record<string, unknown>) {
  return app.request("/api/stats", {}, { ALLOWED_ORIGINS: "http://localhost:5174", ...env });
}

describe("GET /api/stats", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await getStats({});
    expect(res.status).toBe(500);
  });

  it("returns aggregated stats", async () => {
    const db = createMockDB();
    const res = await getStats({ DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, number>;
    expect(data.total_users).toBe(10);
    expect(data.total_td).toBe(50000);
    expect(data.recent_events).toBe(3);
    expect(data.total_licenses).toBe(5);
    expect(data.max_users).toBe(4);
    expect(data.revoked_users).toBe(1);
    expect(data.free_users).toBe(5); // 10 - 4 - 1
  });

  it("handles zero users gracefully", async () => {
    const db = createMockDB({
      scoreAgg: { total_users: 0, total_td: 0 },
      eventCount: { count: 0 },
      licenseCount: { count: 0 },
      maxUsers: { count: 0 },
      revokedUsers: { count: 0 },
    });
    const res = await getStats({ DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, number>;
    expect(data.total_users).toBe(0);
    expect(data.free_users).toBe(0);
  });
});
