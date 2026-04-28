import { describe, it, expect } from "vitest";
import { parseProviderList } from "../utils/openrouter";
import { buildTicketRefineRequest } from "./tickets";

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
