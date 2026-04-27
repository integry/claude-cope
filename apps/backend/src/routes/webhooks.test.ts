import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock webhook signature verification to always pass in tests
vi.mock("../utils/webhook", () => ({
  verifyWebhookSignature: vi.fn().mockResolvedValue(undefined),
}));

import app from "../app";

function createMockDB(opts: {
  runChanges?: number;
  insertThrows?: boolean;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  return {
    db: {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            first: vi.fn().mockResolvedValue(null),
            run: vi.fn().mockImplementation(() => {
              if (opts.insertThrows && sql.includes("INSERT INTO processed_webhooks")) {
                throw new Error("UNIQUE constraint failed");
              }
              return Promise.resolve({ meta: { changes: opts.runChanges ?? 1 } });
            }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockImplementation(() => {
          if (opts.insertThrows && sql.includes("INSERT INTO processed_webhooks")) {
            throw new Error("UNIQUE constraint failed");
          }
          return Promise.resolve({ meta: { changes: opts.runChanges ?? 1 } });
        }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    },
    calls,
  };
}

function mockKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
}

function postWebhook(body: unknown, env: Record<string, unknown>, webhookId = "wh-123") {
  return app.request("/webhooks/polar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "webhook-id": webhookId,
      "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
      "webhook-signature": "v1,fakesig",
    },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /webhooks/polar", () => {
  it("returns 500 when webhook secret is not configured", async () => {
    const res = await postWebhook({}, {});
    expect(res.status).toBe(500);
  });

  it("returns 500 when KV is not configured", async () => {
    const res = await postWebhook(
      { type: "benefit_grant.created" },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==" },
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 for duplicate webhook (KV fast path)", async () => {
    const kv = mockKV({ "webhook:wh-dup": "1" });
    const { db } = createMockDB();
    const res = await postWebhook(
      { type: "benefit_grant.created" },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==", QUOTA_KV: kv, DB: db },
      "wh-dup",
    );
    expect(res.status).toBe(200);
    const data = await res.json() as { received: boolean };
    expect(data.received).toBe(true);
  });

  it("returns 200 for duplicate webhook (DB idempotency)", async () => {
    const kv = mockKV();
    const { db } = createMockDB({ insertThrows: true });
    const res = await postWebhook(
      { type: "benefit_grant.created", data: { properties: { license_key: "COPE-TEST" } } },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==", QUOTA_KV: kv, DB: db },
    );
    expect(res.status).toBe(200);
  });

  it("processes benefit_grant.created and provisions quota", async () => {
    const kv = mockKV();
    const { db } = createMockDB();
    const res = await postWebhook(
      { type: "benefit_grant.created", data: { properties: { license_key: "COPE-TEST-KEY" } } },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==", QUOTA_KV: kv, DB: db },
    );
    expect(res.status).toBe(200);
    // Should have provisioned KV quota
    const polarPuts = (kv.put as ReturnType<typeof vi.fn>).mock.calls.filter(
      (c: unknown[]) => typeof c[0] === "string" && (c[0] as string).startsWith("polar:"),
    );
    expect(polarPuts.length).toBeGreaterThan(0);
  });

  it("processes benefit_grant.revoked and preserves quota", async () => {
    const kv = mockKV({ "polar:somehash": "50" });
    // Override get to return "50" for the polar: key
    kv.get = vi.fn((key: string) => {
      if (key.startsWith("polar:")) return Promise.resolve("50");
      if (key.startsWith("webhook:")) return Promise.resolve(null);
      return Promise.resolve(null);
    });
    const { db } = createMockDB();
    const res = await postWebhook(
      { type: "benefit_grant.revoked", data: { properties: { license_key: "COPE-TEST-KEY" } } },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==", QUOTA_KV: kv, DB: db },
    );
    expect(res.status).toBe(200);
    // Should have saved remaining quota under polar_revoked: key
    const revokedPuts = (kv.put as ReturnType<typeof vi.fn>).mock.calls.filter(
      (c: unknown[]) => typeof c[0] === "string" && (c[0] as string).startsWith("polar_revoked:"),
    );
    expect(revokedPuts.length).toBeGreaterThan(0);
  });

  it("returns 500 when DB is unavailable (fails closed)", async () => {
    const kv = mockKV();
    // No DB provided → claimWebhookIdempotency returns "no_db"
    const res = await postWebhook(
      { type: "benefit_grant.created", data: { properties: { license_key: "COPE-TEST" } } },
      { POLAR_WEBHOOK_SECRET: "whsec_dGVzdA==", QUOTA_KV: kv },
    );
    expect(res.status).toBe(500);
  });
});
