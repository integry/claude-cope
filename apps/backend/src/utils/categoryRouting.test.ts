import { describe, it, expect, vi } from "vitest";
import { assignCategory, getCategoryConfig, getOpenRouterConfig, getRoutingConfig } from "./categoryRouting";

describe("assignCategory", () => {
  it("returns 'max' for pro users with available quota", () => {
    expect(assignCategory({ isProUser: true, quotaPercent: 80 })).toBe("max");
  });

  it("returns 'free' for non-pro users with available quota", () => {
    expect(assignCategory({ isProUser: false, quotaPercent: 50 })).toBe("free");
  });

  it("returns 'depleted' when quota is zero regardless of tier", () => {
    expect(assignCategory({ isProUser: true, quotaPercent: 0 })).toBe("depleted");
    expect(assignCategory({ isProUser: false, quotaPercent: 0 })).toBe("depleted");
  });

  it("returns 'depleted' when quota is negative", () => {
    expect(assignCategory({ isProUser: true, quotaPercent: -5 })).toBe("depleted");
  });

  it("returns 'free' for non-pro users at 100% quota", () => {
    expect(assignCategory({ isProUser: false, quotaPercent: 100 })).toBe("free");
  });

  it("returns 'max' for pro users at 1% quota", () => {
    expect(assignCategory({ isProUser: true, quotaPercent: 1 })).toBe("max");
  });
});

function mockDB(rows: Array<{ key: string; tier: string; value: string }> = []) {
  const allFn = vi.fn(async () => ({ results: rows }));
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        all: allFn,
      })),
      all: allFn,
    })),
  } as unknown as D1Database;
}

describe("getCategoryConfig", () => {
  it("returns null model and apiKey when no config exists", async () => {
    const db = mockDB([]);
    const result = await getCategoryConfig(db, "free");
    expect(result).toEqual({ model: null, apiKey: null });
  });

  it("returns model from category-specific tier", async () => {
    const db = mockDB([
      { key: "category_model", tier: "max", value: "openai/gpt-4o" },
    ]);
    const result = await getCategoryConfig(db, "max");
    expect(result.model).toBe("openai/gpt-4o");
    expect(result.apiKey).toBeNull();
  });

  it("returns apiKey from category-specific tier", async () => {
    const db = mockDB([
      { key: "category_api_key", tier: "free", value: "sk-free-key" },
    ]);
    const result = await getCategoryConfig(db, "free");
    expect(result.model).toBeNull();
    expect(result.apiKey).toBe("sk-free-key");
  });

  it("returns both model and apiKey when both are configured", async () => {
    const db = mockDB([
      { key: "category_api_key", tier: "depleted", value: "sk-depleted" },
      { key: "category_model", tier: "depleted", value: "nvidia/nemotron-nano-9b-v2" },
    ]);
    const result = await getCategoryConfig(db, "depleted");
    expect(result.model).toBe("nvidia/nemotron-nano-9b-v2");
    expect(result.apiKey).toBe("sk-depleted");
  });

  it("prefers category-specific tier over global (*) tier", async () => {
    const db = mockDB([
      { key: "category_model", tier: "max", value: "x-ai/grok-4.1-fast" },
      { key: "category_model", tier: "*", value: "openai/gpt-oss-20b" },
    ]);
    const result = await getCategoryConfig(db, "max");
    expect(result.model).toBe("x-ai/grok-4.1-fast");
  });

  it("falls back to global (*) tier when category-specific is missing", async () => {
    const db = mockDB([
      { key: "category_model", tier: "*", value: "openai/gpt-oss-20b" },
    ]);
    const result = await getCategoryConfig(db, "free");
    expect(result.model).toBe("openai/gpt-oss-20b");
  });

  it("passes the correct category to the query", async () => {
    const prepareSpy = vi.fn(() => ({
      bind: vi.fn((...args: unknown[]) => {
        expect(args).toEqual(["max", "max"]);
        return { all: vi.fn(async () => ({ results: [] })) };
      }),
    }));
    const db = { prepare: prepareSpy } as unknown as D1Database;
    await getCategoryConfig(db, "max");
    expect(prepareSpy).toHaveBeenCalledOnce();
  });
});

describe("getOpenRouterConfig", () => {
  it("returns all nulls when no config exists", async () => {
    const db = mockDB([]);
    const result = await getOpenRouterConfig(db);
    expect(result).toEqual({ apiKey: null, providers: null, providersFreeOnly: null });
  });

  it("returns apiKey from system_config", async () => {
    const db = mockDB([
      { key: "openrouter_api_key", tier: "*", value: "sk-admin-key" },
    ]);
    const result = await getOpenRouterConfig(db);
    expect(result.apiKey).toBe("sk-admin-key");
    expect(result.providers).toBeNull();
    expect(result.providersFreeOnly).toBeNull();
  });

  it("returns all three settings when configured", async () => {
    const db = mockDB([
      { key: "openrouter_api_key", tier: "*", value: "sk-admin-key" },
      { key: "openrouter_providers", tier: "*", value: "openai,anthropic" },
      { key: "openrouter_providers_free_only", tier: "*", value: "true" },
    ]);
    const result = await getOpenRouterConfig(db);
    expect(result.apiKey).toBe("sk-admin-key");
    expect(result.providers).toBe("openai,anthropic");
    expect(result.providersFreeOnly).toBe("true");
  });
});

describe("getRoutingConfig", () => {
  it("returns combined openRouter and category config in a single query", async () => {
    const db = mockDB([
      { key: "openrouter_api_key", tier: "*", value: "sk-combined" },
      { key: "openrouter_providers", tier: "*", value: "DeepInfra" },
      { key: "openrouter_providers_free_only", tier: "*", value: "true" },
      { key: "category_model", tier: "max", value: "openai/gpt-4o" },
      { key: "category_api_key", tier: "max", value: "sk-max-key" },
    ]);
    const result = await getRoutingConfig(db, "max");
    expect(result.openRouter.apiKey).toBe("sk-combined");
    expect(result.openRouter.providers).toBe("DeepInfra");
    expect(result.openRouter.providersFreeOnly).toBe("true");
    expect(result.category.model).toBe("openai/gpt-4o");
    expect(result.category.apiKey).toBe("sk-max-key");
  });

  it("returns nulls for missing config", async () => {
    const db = mockDB([]);
    const result = await getRoutingConfig(db, "free");
    expect(result.openRouter).toEqual({ apiKey: null, providers: null, providersFreeOnly: null });
    expect(result.category).toEqual({ model: null, apiKey: null });
  });

  it("prefers category-specific tier over global for category keys", async () => {
    const db = mockDB([
      { key: "category_model", tier: "depleted", value: "cheap-model" },
      { key: "category_model", tier: "*", value: "default-model" },
    ]);
    const result = await getRoutingConfig(db, "depleted");
    expect(result.category.model).toBe("cheap-model");
  });
});
