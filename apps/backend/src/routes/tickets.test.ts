import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { FREE_BACKLOG_CATEGORY_PREFIXES } from "@claude-cope/shared/backlogTiers";
import { parseProviderList } from "@claude-cope/shared/openrouter";
import tickets, { buildTicketRefineRequest } from "./tickets";

type MockBacklogRow = {
  id: string;
  reporter: string | null;
  reporter_name: string | null;
  reporter_title: string | null;
  reporter_description: string | null;
  title: string;
  description: string;
  technical_debt: number;
  kickoff_prompt: string;
  created_at: string;
};

function makeBacklogRow(id: string): MockBacklogRow {
  return {
    id,
    reporter: null,
    reporter_name: null,
    reporter_title: null,
    reporter_description: null,
    title: `${id} title`,
    description: `${id} description`,
    technical_debt: 13,
    kickoff_prompt: `${id} kickoff`,
    created_at: "2026-05-10T00:00:00Z",
  };
}

function createCommunityMockDB(rows: MockBacklogRow[], activeHashes: string[] = []) {
  return {
    prepare(sql: string) {
      let bindings: unknown[] = [];
      return {
        bind(...args: unknown[]) {
          bindings = args;
          return this;
        },
        async all<T>() {
          if (!sql.includes("FROM community_backlog")) {
            throw new Error(`Unexpected all() query: ${sql}`);
          }
          return { results: rows as T[] };
        },
        async first<T>() {
          if (!sql.includes("FROM licenses WHERE key_hash = ?")) {
            throw new Error(`Unexpected first() query: ${sql}`);
          }
          const keyHash = String(bindings[0] ?? "");
          if (!activeHashes.includes(keyHash)) return null as T | null;
          return {
            status: "active",
            last_activated_at: new Date().toISOString(),
          } as T;
        },
      };
    },
  } as unknown as D1Database;
}

describe("Provider configuration in ticket refine requests", () => {
  it("includes provider.order in request body when OPENROUTER_PROVIDERS is configured", () => {
    const providers = parseProviderList("Together,Fireworks,OpenAI");
    expect(providers).toEqual(["Together", "Fireworks", "OpenAI"]);

    const messages = [
      { role: "system", content: "test prompt" },
      { role: "user", content: "test task" },
    ];

    const requestBody = buildTicketRefineRequest(messages, providers);

    expect(requestBody).toHaveProperty("provider");
    expect(requestBody).toMatchObject({
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages,
      provider: { order: ["Together", "Fireworks", "OpenAI"] },
    });
  });

  it("omits provider field when OPENROUTER_PROVIDERS is not configured", () => {
    const providers = parseProviderList(undefined);
    expect(providers).toEqual([]);

    const messages = [{ role: "user", content: "test" }];
    const requestBody = buildTicketRefineRequest(messages, providers);

    expect(requestBody).not.toHaveProperty("provider");
    expect(requestBody).toMatchObject({
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages,
    });
  });

  it("omits provider field when OPENROUTER_PROVIDERS is empty after parsing", () => {
    const providers = parseProviderList("  ,  ,  ");
    expect(providers).toEqual([]);

    const messages = [{ role: "user", content: "test" }];
    const requestBody = buildTicketRefineRequest(messages, providers);

    expect(requestBody).not.toHaveProperty("provider");
  });

  it("handles mixed whitespace and valid providers correctly", () => {
    const providers = parseProviderList(" Together , , Fireworks, ");
    expect(providers).toEqual(["Together", "Fireworks"]);

    const messages = [{ role: "user", content: "test" }];
    const requestBody = buildTicketRefineRequest(messages, providers);

    expect(requestBody).toHaveProperty("provider");
    expect(requestBody).toMatchObject({
      provider: { order: ["Together", "Fireworks"] },
    });
  });

  it("handles empty provider array by omitting provider field", () => {
    const messages = [{ role: "user", content: "test" }];
    const requestBody = buildTicketRefineRequest(messages, []);

    expect(requestBody).not.toHaveProperty("provider");
  });

  it("handles undefined providers parameter by omitting provider field", () => {
    const messages = [{ role: "user", content: "test" }];
    const requestBody = buildTicketRefineRequest(messages, undefined);

    expect(requestBody).not.toHaveProperty("provider");
  });
});

describe("POST /refine feature flag", () => {
  const app = new Hono();
  app.route("/api/tickets", tickets);

  async function postRefine(env: Record<string, string | undefined>) {
    return app.request(
      "/api/tickets/refine",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "build a thing" }),
      },
      env,
    );
  }

  it("returns 404 when ENABLE_TICKET_REFINE is unset", async () => {
    const res = await postRefine({ OPENROUTER_API_KEY: "test" });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Ticket refinement is disabled" });
  });

  it("returns 404 when ENABLE_TICKET_REFINE is any non-'true' value", async () => {
    const res = await postRefine({ OPENROUTER_API_KEY: "test", ENABLE_TICKET_REFINE: "false" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/tickets/community backlog tiering", () => {
  const app = new Hono();
  app.route("/api/tickets", tickets);

  const rows = [
    makeBacklogRow("YELL-001"),
    makeBacklogRow("OOPS-001"),
    makeBacklogRow("BLAME-001"),
    makeBacklogRow("SNEER-001"),
    makeBacklogRow("PANIC-001"),
    makeBacklogRow("CLINIC-001"),
    makeBacklogRow("SCAM-001"),
  ];

  it("returns only free playable categories plus locked premium teasers for free users", async () => {
    const res = await app.request("/api/tickets/community", {}, { DB: createCommunityMockDB(rows) });

    expect(res.status).toBe(200);

    const data = await res.json() as Array<MockBacklogRow & {
      category_prefix: string | null;
      category_label: string | null;
      is_locked: boolean;
      tier: "free" | "premium";
      upgrade_teaser?: string;
    }>;

    const unlockedRows = data.filter((row) => !row.is_locked);
    const lockedRows = data.filter((row) => row.is_locked);

    expect(unlockedRows).toHaveLength(5);
    expect(unlockedRows.every((row) => row.category_prefix !== null && FREE_BACKLOG_CATEGORY_PREFIXES.has(row.category_prefix))).toBe(true);
    expect(unlockedRows.every((row) => row.tier === "free")).toBe(true);

    expect(lockedRows.length).toBeGreaterThanOrEqual(1);
    expect(lockedRows.length).toBeLessThanOrEqual(2);
    expect(lockedRows.every((row) => row.tier === "premium")).toBe(true);
    expect(lockedRows.every((row) => row.kickoff_prompt === "")).toBe(true);
    expect(lockedRows.every((row) => row.category_prefix !== null && !FREE_BACKLOG_CATEGORY_PREFIXES.has(row.category_prefix))).toBe(true);
    expect(lockedRows.every((row) => row.upgrade_teaser && row.upgrade_teaser.length > 0)).toBe(true);
  });

  it("returns premium categories unlocked for paid users", async () => {
    const res = await app.request(
      "/api/tickets/community",
      { headers: { "x-pro-key-hash": "pro-hash" } },
      { DB: createCommunityMockDB(rows, ["pro-hash"]) },
    );

    expect(res.status).toBe(200);

    const data = await res.json() as Array<MockBacklogRow & {
      category_prefix: string | null;
      is_locked: boolean;
      tier: "free" | "premium";
    }>;

    expect(data).toHaveLength(5);
    expect(data.some((row) => row.tier === "premium" && row.is_locked === false)).toBe(true);
    expect(data.every((row) => row.is_locked === false)).toBe(true);
  });
});
