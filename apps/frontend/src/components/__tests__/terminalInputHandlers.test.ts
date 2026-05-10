import { describe, expect, it, vi } from "vitest";
import type { Message } from "../../hooks/useGameState";
import type { OutageScenario } from "@claude-cope/shared/multiplayer-types";
import {
  normalizeOutageCommandInput,
  tryOutageDamage,
} from "../terminalInputHandlers";

function createMockState<T>(initial: T) {
  let value = initial;
  const setter = vi.fn((next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
  }) as unknown as React.Dispatch<React.SetStateAction<T>>;
  return {
    setter,
    get value() {
      return value;
    },
  };
}

const TEST_SCENARIO: OutageScenario = {
  id: "cloudflare-cache-purge",
  title: "Cloudflare cache stampede",
  alert: "[CRITICAL ALERT: CLOUDFLARE CACHE STAMPEDE IN PROGRESS]",
  success: "[SUCCESS] Cloudflare stopped serving haunted cache. All players receive a TD boost.",
  failure:
    "[FAILURE] Cloudflare kept serving cursed edge responses. Your most expensive generator has been decommissioned.",
  commands: [
    { label: "/purge-cache", aliases: ["curl -X POST /purge-cache"] },
    { label: "redis-cli flushall", aliases: ["redis-cli   flushdb"] },
  ],
};

describe("tryOutageDamage", () => {
  it("intercepts displayed slash-like outage commands before normal slash handling", () => {
    const history = createMockState<Message[]>([]);
    const input = createMockState("/purge-cache");
    const sendDamage = vi.fn();

    const handled = tryOutageDamage({
      inputValue: "/purge-cache",
      outageHp: 100,
      activeOutageScenario: TEST_SCENARIO,
      sendDamage,
      setHistory: history.setter,
      setInputValue: input.setter,
    });

    expect(handled).toBe(true);
    expect(sendDamage).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
    expect(history.value[1]?.content).toContain(TEST_SCENARIO.title);
  });

  it("matches aliases despite trivial whitespace and casing differences", () => {
    const history = createMockState<Message[]>([]);
    const input = createMockState("  REDIS-CLI   FLUSHDB  ");
    const sendDamage = vi.fn();

    const handled = tryOutageDamage({
      inputValue: "  REDIS-CLI   FLUSHDB  ",
      outageHp: 90,
      activeOutageScenario: TEST_SCENARIO,
      sendDamage,
      setHistory: history.setter,
      setInputValue: input.setter,
    });

    expect(handled).toBe(true);
    expect(sendDamage).toHaveBeenCalledTimes(1);
  });

  it("returns false for non-outage commands", () => {
    const history = createMockState<Message[]>([]);
    const input = createMockState("/help");
    const sendDamage = vi.fn();

    const handled = tryOutageDamage({
      inputValue: "/help",
      outageHp: 100,
      activeOutageScenario: TEST_SCENARIO,
      sendDamage,
      setHistory: history.setter,
      setInputValue: input.setter,
    });

    expect(handled).toBe(false);
    expect(sendDamage).not.toHaveBeenCalled();
    expect(history.value).toHaveLength(0);
    expect(input.value).toBe("/help");
  });
});

describe("normalizeOutageCommandInput", () => {
  it("lowercases and collapses repeated whitespace", () => {
    expect(normalizeOutageCommandInput("  SSH    PROD-01 ")).toBe("ssh prod-01");
  });
});
