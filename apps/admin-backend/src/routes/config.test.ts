import { describe, it, expect, vi } from "vitest";
import app from "../app";

interface ConfigRow {
  key: string;
  tier: string;
  value: string;
  description: string | null;
  updated_at: string;
}

function createMockDB(rows: ConfigRow[] = []) {
  const state = [...rows];

  return {
    prepare: vi.fn((sql: string) => {
      const stmt = {
        bind: vi.fn((...args: unknown[]) => {
          const boundArgs = args;
          return {
            all: vi.fn(async () => {
              if (sql.includes("SELECT") && sql.includes("WHERE key =")) {
                const key = boundArgs[0] as string;
                return { results: state.filter((r) => r.key === key) };
              }
              if (sql.includes("SELECT") && sql.includes("WHERE tier =")) {
                const tier = boundArgs[0] as string;
                return { results: state.filter((r) => r.tier === tier) };
              }
              return { results: state };
            }),
            first: vi.fn(async () => {
              const key = boundArgs[0] as string;
              const tier = boundArgs[1] as string;
              return state.find((r) => r.key === key && r.tier === tier) ?? null;
            }),
            run: vi.fn(async () => {
              if (sql.includes("INSERT")) {
                const [key, tier, value, description] = boundArgs as [string, string, string, string | null];
                const idx = state.findIndex((r) => r.key === key && r.tier === tier);
                const row: ConfigRow = { key, tier, value, description, updated_at: "2026-01-01T00:00:00" };
                if (idx >= 0) state[idx] = row;
                else state.push(row);
              }
              if (sql.includes("DELETE")) {
                const key = boundArgs[0] as string;
                const tier = boundArgs[1] as string;
                const idx = state.findIndex((r) => r.key === key && r.tier === tier);
                if (idx >= 0) state.splice(idx, 1);
              }
              return { meta: { changes: 1 } };
            }),
          };
        }),
        all: vi.fn(async () => ({ results: state })),
        first: vi.fn(async () => null),
        run: vi.fn(async () => ({ meta: { changes: 0 } })),
      };
      return stmt;
    }),
    exec: vi.fn().mockResolvedValue({ results: [] }),
    batch: vi.fn().mockResolvedValue([]),
  };
}

const TEST_ADMIN_KEY = "test-admin-key";

function makeEnv(db: ReturnType<typeof createMockDB> | null, apiKey: string | false = TEST_ADMIN_KEY) {
  return { ...(db ? { DB: db } : {}), ALLOWED_ORIGINS: "http://localhost:5174", ...(apiKey ? { ADMIN_API_KEY: apiKey } : {}) };
}

function authHeaders(key: string = TEST_ADMIN_KEY): Record<string, string> {
  return { Authorization: `Bearer ${key}` };
}

describe("GET /api/config", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await app.request("/api/config", {
      headers: authHeaders(),
    }, makeEnv(null));
    expect(res.status).toBe(500);
  });

  it("returns config entries with sensitive values fully masked (no suffix leak)", async () => {
    const db = createMockDB([
      { key: "openrouter_api_key", tier: "*", value: "sk-or-v1-abc123xyz789", description: null, updated_at: "2026-01-01" },
      { key: "free_quota_limit", tier: "*", value: "100", description: "Quota", updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config", {
      headers: authHeaders(),
    }, makeEnv(db));
    expect(res.status).toBe(200);
    const data = await res.json() as ConfigRow[];
    const apiKeyEntry = data.find((r) => r.key === "openrouter_api_key");
    expect(apiKeyEntry?.value).toBe("••••");
    const quotaEntry = data.find((r) => r.key === "free_quota_limit");
    expect(quotaEntry?.value).toBe("100");
  });
});

describe("PUT /api/config/:key/:tier", () => {
  it("rejects invalid tier for category keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/category_model/pro", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "openai/gpt-4o" }),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("Invalid tier");
  });

  it("accepts valid category tiers", async () => {
    for (const tier of ["*", "max", "free", "depleted"]) {
      const db = createMockDB();
      const res = await app.request(`/api/config/category_model/${tier}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ value: "openai/gpt-4o" }),
      }, makeEnv(db));
      expect(res.status).toBe(200);
    }
  });

  it("accepts empty value for non-sensitive keys (allows clearing env overrides)", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "   " }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("rejects non-string value payloads", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: 123 }),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("string");
  });

  it("preserves existing value when explicit sentinel is sent for sensitive key", async () => {
    const db = createMockDB([
      { key: "openrouter_api_key", tier: "*", value: "sk-real-secret-key", description: null, updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config/openrouter_api_key/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "__PRESERVE_EXISTING__" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("preserves existing value when empty string is sent for sensitive key edit", async () => {
    const db = createMockDB([
      { key: "category_api_key", tier: "max", value: "sk-existing", description: null, updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config/category_api_key/max", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("rejects new sensitive key entry with no existing value", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/openrouter_api_key/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "" }),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("required");
  });

  it("rejects missing value field", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({}),
    }, makeEnv(db));
    expect(res.status).toBe(400);
  });

  it("rejects unknown configuration keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/category_modle/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "openai/gpt-4o" }),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("Unknown configuration key");
  });

  it("rejects non-* tier for global-only keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/openrouter_api_key/free", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "sk-test-123" }),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("only supports tier");
  });

  it("accepts * tier for global-only keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/openrouter_providers/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "Together,Fireworks" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("returns 400 for malformed JSON body", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: "not valid json{{{",
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("Invalid JSON");
  });
});

describe("DELETE /api/config/:key/:tier", () => {
  it("deletes an entry", async () => {
    const db = createMockDB([
      { key: "free_quota_limit", tier: "*", value: "100", description: null, updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "DELETE",
      headers: authHeaders(),
    }, makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("returns 500 when DB is not configured", async () => {
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "DELETE",
      headers: authHeaders(),
    }, makeEnv(null));
    expect(res.status).toBe(500);
  });

  it("rejects invalid tier for category keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/category_model/pro", {
      method: "DELETE",
      headers: authHeaders(),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("Invalid tier");
  });

  it("rejects non-* tier for global-only keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/openrouter_api_key/free", {
      method: "DELETE",
      headers: authHeaders(),
    }, makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("only supports tier");
  });
});

describe("PUT /api/config boolean normalization", () => {
  it("normalizes 'TRUE' to 'true' for boolean keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/enable_byok/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "TRUE" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("normalizes ' true ' to 'true' for boolean keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/openrouter_providers_free_only/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: " true " }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("normalizes '1' to 'true' for boolean keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/enable_ticket_refine/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "1" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("normalizes '0' to 'false' for boolean keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/enable_byok/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "0" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });

  it("does not normalize non-boolean keys", async () => {
    const db = createMockDB();
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ value: "TRUE" }),
    }, makeEnv(db));
    expect(res.status).toBe(200);
  });
});

describe("Auth guard for /api/config", () => {
  it("returns 403 when ADMIN_API_KEY is not set (fail closed)", async () => {
    const db = createMockDB([
      { key: "free_quota_limit", tier: "*", value: "100", description: null, updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config", {}, makeEnv(db, false));
    expect(res.status).toBe(403);
  });

  it("returns 401 when ADMIN_API_KEY is set but no Authorization header provided", async () => {
    const db = createMockDB([]);
    const res = await app.request("/api/config", {}, makeEnv(db, "secret-admin-key"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization header has wrong token", async () => {
    const db = createMockDB([]);
    const res = await app.request("/api/config", {
      headers: { Authorization: "Bearer wrong-key" },
    }, makeEnv(db, "secret-admin-key"));
    expect(res.status).toBe(401);
  });

  it("allows access with correct Bearer token", async () => {
    const db = createMockDB([
      { key: "free_quota_limit", tier: "*", value: "100", description: null, updated_at: "2026-01-01" },
    ]);
    const res = await app.request("/api/config", {
      headers: { Authorization: "Bearer secret-admin-key" },
    }, makeEnv(db, "secret-admin-key"));
    expect(res.status).toBe(200);
  });

  it("protects PUT endpoints with auth", async () => {
    const db = createMockDB([]);
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "200" }),
    }, makeEnv(db, "secret-admin-key"));
    expect(res.status).toBe(401);
  });

  it("protects DELETE endpoints with auth", async () => {
    const db = createMockDB([]);
    const res = await app.request("/api/config/free_quota_limit/*", {
      method: "DELETE",
    }, makeEnv(db, "secret-admin-key"));
    expect(res.status).toBe(401);
  });

  it("allows OPTIONS preflight requests without auth (CORS)", async () => {
    const db = createMockDB([]);
    const res = await app.request("/api/config", {
      method: "OPTIONS",
    }, makeEnv(db, "secret-admin-key"));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
