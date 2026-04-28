import { describe, it, expect } from "vitest";
import { parseProviderList } from "@claude-cope/shared/openrouter";

type OpenRouterRequestBody = {
  model: string;
  messages: { role: string; content: string }[];
  provider?: { order: string[] };
};

describe("Provider configuration in ticket refine requests", () => {
  it("includes provider.order in request body when OPENROUTER_PROVIDERS is configured", () => {
    const providers = parseProviderList("Together,Fireworks,OpenAI");
    expect(providers).toEqual(["Together", "Fireworks", "OpenAI"]);

    // Simulate the request body construction in tickets.ts
    const requestBody: OpenRouterRequestBody = {
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: [],
    };

    if (providers.length > 0) {
      requestBody.provider = { order: providers };
    }

    expect(requestBody).toHaveProperty("provider");
    expect(requestBody.provider).toEqual({ order: ["Together", "Fireworks", "OpenAI"] });
  });

  it("omits provider field when OPENROUTER_PROVIDERS is not configured", () => {
    const providers = parseProviderList(undefined);
    expect(providers).toEqual([]);

    const requestBody: OpenRouterRequestBody = {
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: [],
    };

    if (providers.length > 0) {
      requestBody.provider = { order: providers };
    }

    expect(requestBody).not.toHaveProperty("provider");
  });

  it("omits provider field when OPENROUTER_PROVIDERS is empty after parsing", () => {
    const providers = parseProviderList("  ,  ,  ");
    expect(providers).toEqual([]);

    const requestBody: OpenRouterRequestBody = {
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: [],
    };

    if (providers.length > 0) {
      requestBody.provider = { order: providers };
    }

    expect(requestBody).not.toHaveProperty("provider");
  });

  it("handles mixed whitespace and valid providers correctly", () => {
    const providers = parseProviderList(" Together , , Fireworks, ");
    expect(providers).toEqual(["Together", "Fireworks"]);

    const requestBody: OpenRouterRequestBody = {
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: [],
    };

    if (providers.length > 0) {
      requestBody.provider = { order: providers };
    }

    expect(requestBody).toHaveProperty("provider");
    expect(requestBody.provider).toEqual({ order: ["Together", "Fireworks"] });
  });
});
