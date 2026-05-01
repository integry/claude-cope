import { describe, it, expect } from "vitest";
import { pickAllLicenseKeys, validateActiveTicket, parseCheckoutCache } from "./accountHelpers";
import type { PolarLicenseKeyItem } from "./accountHelpers";

describe("pickAllLicenseKeys", () => {
  const key = (k: string, created_at: string): PolarLicenseKeyItem => ({ key: k, created_at, status: "granted" });

  it("returns empty array for empty input", () => {
    expect(pickAllLicenseKeys([], "2026-01-01T00:00:00Z")).toEqual([]);
  });

  it("returns all eligible keys for team-pack (multiple keys after checkout within window)", () => {
    const checkoutTime = "2026-01-02T00:00:00Z";
    const keys = [
      key("OLD", "2026-01-01T00:00:00Z"),
      key("K1", "2026-01-02T00:00:01Z"),
      key("K2", "2026-01-02T00:00:02Z"),
      key("K3", "2026-01-02T00:00:03Z"),
      key("K4", "2026-01-02T00:00:04Z"),
      key("K5", "2026-01-02T00:00:05Z"),
    ];
    const result = pickAllLicenseKeys(keys, checkoutTime);
    expect(result).toHaveLength(5);
    expect(result.map((k) => k.key)).toEqual(["K1", "K2", "K3", "K4", "K5"]);
  });

  it("returns keys ordered oldest-first", () => {
    const keys = [
      key("C", "2026-01-02T00:02:00Z"),
      key("A", "2026-01-02T00:00:01Z"),
      key("B", "2026-01-02T00:01:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result.map((k) => k.key)).toEqual(["A", "B", "C"]);
  });

  it("returns empty array for invalid checkoutCreatedAt", () => {
    const keys = [key("A", "2026-01-02T00:00:00Z"), key("B", "2026-01-01T00:00:00Z")];
    const result = pickAllLicenseKeys(keys, "not-a-date");
    expect(result).toHaveLength(0);
  });

  it("excludes keys created before checkout", () => {
    const keys = [
      key("BEFORE", "2026-01-01T00:00:00Z"),
      key("AFTER", "2026-01-02T00:01:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("AFTER");
  });

  it("excludes keys created more than 5 minutes after checkout (later purchase)", () => {
    const keys = [
      key("THIS_CHECKOUT", "2026-01-02T00:00:10Z"),
      key("LATER_PURCHASE", "2026-01-02T01:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("THIS_CHECKOUT");
  });

  it("includes keys within the 5-minute window", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:01Z"),
      key("K2", "2026-01-02T00:04:59Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(2);
  });

  it("does not mutate the input array", () => {
    const keys = [
      key("C", "2026-01-02T00:02:00Z"),
      key("A", "2026-01-02T00:00:01Z"),
      key("B", "2026-01-02T00:01:00Z"),
    ];
    const original = keys.map((k) => k.key);
    pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(keys.map((k) => k.key)).toEqual(original);
  });
});

describe("parseCheckoutCache", () => {
  it("parses session-bound cache format", () => {
    const raw = JSON.stringify({ keys: ["K1", "K2"], sessionId: "sess-abc" });
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["K1", "K2"], sessionId: "sess-abc" });
  });

  it("parses legacy JSON array format (no session binding)", () => {
    const raw = JSON.stringify(["COPE-OLD1", "COPE-OLD2"]);
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["COPE-OLD1", "COPE-OLD2"], sessionId: "" });
  });

  it("parses legacy plain string format", () => {
    const result = parseCheckoutCache("COPE-LEGACY");
    expect(result).toEqual({ keys: ["COPE-LEGACY"], sessionId: "" });
  });

  it("returns null for invalid JSON object without keys field", () => {
    const raw = JSON.stringify({ something: "else" });
    expect(parseCheckoutCache(raw)).toBeNull();
  });

  it("treats missing sessionId in object format as empty string", () => {
    const raw = JSON.stringify({ keys: ["K1"] });
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["K1"], sessionId: "" });
  });

  it("returns null for empty keys array", () => {
    expect(parseCheckoutCache(JSON.stringify({ keys: [] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify([]))).toBeNull();
  });

  it("returns null when keys contain non-string or empty values", () => {
    expect(parseCheckoutCache(JSON.stringify({ keys: [123, "K1"] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify({ keys: ["", "K1"] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify([null, "K1"]))).toBeNull();
  });

  it("returns null for empty string input", () => {
    expect(parseCheckoutCache("")).toBeNull();
  });
});

describe("validateActiveTicket", () => {
  it("returns null for null input", () => {
    expect(validateActiveTicket(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(validateActiveTicket(undefined)).toBeNull();
  });

  it("returns error for non-object", () => {
    expect(validateActiveTicket("string")).toContain("must be an object");
  });

  it("returns null for valid ticket", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix bug", sprintProgress: 3, sprintGoal: 10 })).toBeNull();
  });

  it("rejects sprintProgress exceeding sprintGoal", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: 11, sprintGoal: 10 })).toContain("cannot exceed");
  });

  it("rejects negative sprintProgress", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: -1, sprintGoal: 10 })).toContain("sprintProgress");
  });

  it("rejects zero sprintGoal", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: 0, sprintGoal: 0 })).toContain("sprintGoal");
  });
});
