import { describe, it, expect } from "vitest";
import { parseProviderList } from "@claude-cope/shared/openrouter";

describe("parseProviderList", () => {
  it("should return empty array when input is undefined", () => {
    expect(parseProviderList(undefined)).toEqual([]);
  });

  it("should return empty array when input is empty string", () => {
    expect(parseProviderList("")).toEqual([]);
  });

  it("should parse single provider", () => {
    expect(parseProviderList("Together")).toEqual(["Together"]);
  });

  it("should parse multiple providers", () => {
    expect(parseProviderList("Together,Fireworks")).toEqual(["Together", "Fireworks"]);
  });

  it("should trim whitespace around provider names", () => {
    expect(parseProviderList(" Together , Fireworks ")).toEqual(["Together", "Fireworks"]);
  });

  it("should filter out empty segments", () => {
    expect(parseProviderList("Together,,Fireworks,")).toEqual(["Together", "Fireworks"]);
  });

  it("should handle complex whitespace scenarios", () => {
    expect(parseProviderList("Together,  ,Fireworks, , OpenAI  ")).toEqual(["Together", "Fireworks", "OpenAI"]);
  });
});
