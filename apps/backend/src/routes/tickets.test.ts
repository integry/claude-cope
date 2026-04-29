import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { parseProviderList } from "@claude-cope/shared/openrouter";
import tickets, { buildTicketRefineRequest } from "./tickets";

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
