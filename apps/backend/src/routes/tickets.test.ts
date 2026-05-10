import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import {
  FREE_BACKLOG_CATEGORY_PREFIXES,
  getBacklogCategoryPrefix,
  isPremiumBacklogCategory,
} from "@claude-cope/shared/backlogTiers";
import type { CommunityBacklogTicket } from "@claude-cope/shared/backlogTickets";
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

          const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
          const limit = limitMatch ? Number(limitMatch[1]) : rows.length;
          const prefixBindings = bindings
            .map((binding) => String(binding))
            .filter((binding) => !activeHashes.includes(binding));

          const filteredRows =
            prefixBindings.length === 0
              ? rows
              : rows.filter((row) => {
                  const prefix = row.id.split("-")[0];
                  return prefixBindings.includes(prefix);
                });

          return { results: filteredRows.slice(0, limit) as T[] };
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
    makeBacklogRow("COMM-001"),
    makeBacklogRow("CLINIC-001"),
    makeBacklogRow("SCAM-001"),
  ];

  it("returns only free playable categories plus locked premium teasers for free users", async () => {
    const res = await app.request("/api/tickets/community", {}, { DB: createCommunityMockDB(rows) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=10");
    expect(res.headers.get("Vary")).toBe("x-pro-key-hash");

    const data = await res.json() as CommunityBacklogTicket[];

    const unlockedRows = data.filter((row) => !row.is_locked);
    const lockedRows = data.filter((row) => row.is_locked);

    expect(unlockedRows).toHaveLength(5);
    expect(unlockedRows.every((row) => row.category_prefix !== null && FREE_BACKLOG_CATEGORY_PREFIXES.has(row.category_prefix))).toBe(true);
    expect(unlockedRows.every((row) => row.tier === "free")).toBe(true);

    expect(lockedRows.length).toBeGreaterThanOrEqual(1);
    expect(lockedRows.length).toBeLessThanOrEqual(2);
    expect(lockedRows.every((row) => row.tier === "premium")).toBe(true);
    expect(lockedRows.every((row) => row.category_prefix !== null && !FREE_BACKLOG_CATEGORY_PREFIXES.has(row.category_prefix))).toBe(true);
    expect(lockedRows.every((row) => row.upgrade_teaser && row.upgrade_teaser.length > 0)).toBe(true);
    expect(lockedRows.every((row) => !("description" in row))).toBe(true);
    expect(lockedRows.every((row) => !("technical_debt" in row))).toBe(true);
    expect(lockedRows.every((row) => !("kickoff_prompt" in row))).toBe(true);
    expect(data.some((row) => row.id === "COMM-001")).toBe(false);
  });

  it("returns premium categories unlocked for paid users", async () => {
    const res = await app.request(
      "/api/tickets/community",
      { headers: { "x-pro-key-hash": "pro-hash" } },
      { DB: createCommunityMockDB(rows, ["pro-hash"]) },
    );

    expect(res.status).toBe(200);

    const data = await res.json() as CommunityBacklogTicket[];

    expect(data).toHaveLength(5);
    expect(data.some((row) => row.tier === "premium" && row.is_locked === false)).toBe(true);
    expect(data.every((row) => row.is_locked === false)).toBe(true);
  });

  it("treats uncategorized ids as uncategorized instead of premium", async () => {
    const res = await app.request(
      "/api/tickets/community",
      { headers: { "x-pro-key-hash": "pro-hash" } },
      {
        DB: createCommunityMockDB(
          [
            makeBacklogRow("COMM-001"),
            makeBacklogRow("COMM-002"),
            makeBacklogRow("COMM-003"),
            makeBacklogRow("COMM-004"),
            makeBacklogRow("COMM-005"),
          ],
          ["pro-hash"],
        ),
      },
    );

    expect(res.status).toBe(200);

    const data = await res.json() as CommunityBacklogTicket[];

    expect(data).toHaveLength(5);
    expect(data.every((row) => row.category_prefix === null)).toBe(true);
    expect(data.every((row) => row.tier === "free")).toBe(true);
    expect(data.every((row) => row.is_locked === false)).toBe(true);
  });
});

describe("backlog tier helpers", () => {
  it("does not treat unknown prefixes as premium categories", () => {
    expect(getBacklogCategoryPrefix("COMM-123")).toBeNull();
    expect(getBacklogCategoryPrefix("5f2c8a63c4c04c28a07003da9b6754b2")).toBeNull();
    expect(isPremiumBacklogCategory("COMM-123")).toBe(false);
    expect(isPremiumBacklogCategory("5f2c8a63c4c04c28a07003da9b6754b2")).toBe(false);
  });
});
