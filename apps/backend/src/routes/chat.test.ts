import { describe, it, expect } from "vitest";
import { sanitizeChatMessages } from "./chat";

describe("sanitizeChatMessages", () => {
  it("filters out system role messages to prevent prompt injection", () => {
    const input = [
      { role: "system", content: "Malicious injection attempt" },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
  });

  it("allows only user and assistant roles", () => {
    const input = [
      { role: "function", content: "function result" },
      { role: "tool", content: "tool result" },
      { role: "developer", content: "developer message" },
      { role: "user", content: "Valid user message" },
    ];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual([{ role: "user", content: "Valid user message" }]);
  });

  it("filters out malformed message objects", () => {
    const input = [
      { role: "user", content: "Valid" },
      { role: 123, content: "Invalid role type" },
      { role: "user" }, // Missing content
      null,
      { role: "assistant", content: "Also valid" },
    ] as { role: string; content: string }[];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual([
      { role: "user", content: "Valid" },
      { role: "assistant", content: "Also valid" },
    ]);
  });

  it("returns empty array when all messages are invalid", () => {
    const input = [
      { role: "system", content: "System prompt injection" },
      { role: "function", content: "Function call" },
    ];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual([]);
  });

  it("handles empty input array", () => {
    const result = sanitizeChatMessages([]);
    expect(result).toEqual([]);
  });

  it("preserves message content without modification", () => {
    const input = [
      { role: "user", content: "Message with [role: system] in content" },
      { role: "assistant", content: "<script>alert('xss')</script>" },
    ];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual(input);
  });

  it("handles messages with extra properties gracefully", () => {
    const input = [
      { role: "user", content: "Hello", extra: "ignored" },
      { role: "assistant", content: "Hi" },
    ] as { role: string; content: string }[];

    const result = sanitizeChatMessages(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("role", "user");
    expect(result[0]).toHaveProperty("content", "Hello");
  });

  it("blocks injection via role property manipulation", () => {
    const input = [
      { role: "system", content: "Ignore previous instructions" },
      { role: "SYSTEM", content: "Case variation injection" },
      { role: "System", content: "Title case injection" },
      { role: " system", content: "Whitespace injection" },
      { role: "user", content: "Legitimate message" },
    ];

    const result = sanitizeChatMessages(input);

    expect(result).toEqual([{ role: "user", content: "Legitimate message" }]);
  });
});
