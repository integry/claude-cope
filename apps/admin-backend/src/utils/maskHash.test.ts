import { describe, it, expect } from "vitest";
import { maskHash } from "./maskHash";

describe("maskHash", () => {
  it("returns null for null input", () => {
    expect(maskHash(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(maskHash(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(maskHash("")).toBeNull();
  });

  it("masks long hashes showing first 8 and last 4 chars", () => {
    const hash = "abcdef1234567890abcdef";
    const masked = maskHash(hash);
    expect(masked).toBe("abcdef12…cdef");
    expect(masked).not.toBe(hash);
  });

  it("handles short hashes (<=12 chars) with truncated display", () => {
    const shortHash = "abcdef123456";
    const masked = maskHash(shortHash);
    expect(masked).toBe("abcd…");
  });
});
