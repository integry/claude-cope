import { describe, it, expect } from "vitest";
import { pickBestLicenseKey, pickAllLicenseKeys, validateActiveTicket } from "./accountHelpers";
import type { PolarLicenseKeyItem } from "./accountHelpers";

describe("pickBestLicenseKey", () => {
  const key = (k: string, created_at: string): PolarLicenseKeyItem => ({ key: k, created_at, status: "granted" });

  it("returns null for empty array", () => {
    expect(pickBestLicenseKey([], "2026-01-01T00:00:00Z")).toBeNull();
  });

  it("returns the first key when no checkoutCreatedAt is provided", () => {
    const keys = [key("A", "2026-01-02T00:00:00Z"), key("B", "2026-01-01T00:00:00Z")];
    expect(pickBestLicenseKey(keys)).toEqual(expect.objectContaining({ key: "B" }));
  });

  it("returns the oldest eligible key (closest to checkout time)", () => {
    const keys = [
      key("OLD", "2026-01-01T00:00:00Z"),
      key("MID", "2026-01-02T12:00:00Z"),
      key("NEW", "2026-01-03T00:00:00Z"),
    ];
    const result = pickBestLicenseKey(keys, "2026-01-02T00:00:00Z");
    expect(result?.key).toBe("MID");
  });

  it("returns null when no keys are created after checkout", () => {
    const keys = [key("A", "2026-01-01T00:00:00Z")];
    expect(pickBestLicenseKey(keys, "2026-01-02T00:00:00Z")).toBeNull();
  });

  it("returns key created at exactly checkout time", () => {
    const keys = [key("EXACT", "2026-01-02T00:00:00Z")];
    expect(pickBestLicenseKey(keys, "2026-01-02T00:00:00Z")?.key).toBe("EXACT");
  });
});

describe("pickAllLicenseKeys", () => {
  const key = (k: string, created_at: string): PolarLicenseKeyItem => ({ key: k, created_at, status: "granted" });

  it("returns empty array for empty input", () => {
    expect(pickAllLicenseKeys([], "2026-01-01T00:00:00Z")).toEqual([]);
  });

  it("returns all eligible keys for team-pack (multiple keys after checkout)", () => {
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
      key("C", "2026-01-04T00:00:00Z"),
      key("A", "2026-01-02T00:00:00Z"),
      key("B", "2026-01-03T00:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-01T00:00:00Z");
    expect(result.map((k) => k.key)).toEqual(["A", "B", "C"]);
  });

  it("returns only first key when no checkoutCreatedAt", () => {
    const keys = [key("A", "2026-01-02T00:00:00Z"), key("B", "2026-01-01T00:00:00Z")];
    const result = pickAllLicenseKeys(keys);
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("B");
  });

  it("excludes keys created before checkout", () => {
    const keys = [
      key("BEFORE", "2026-01-01T00:00:00Z"),
      key("AFTER", "2026-01-03T00:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("AFTER");
  });

  it("does not mutate the input array", () => {
    const keys = [
      key("C", "2026-01-04T00:00:00Z"),
      key("A", "2026-01-02T00:00:00Z"),
      key("B", "2026-01-03T00:00:00Z"),
    ];
    const original = keys.map((k) => k.key);
    pickAllLicenseKeys(keys, "2026-01-01T00:00:00Z");
    expect(keys.map((k) => k.key)).toEqual(original);
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
