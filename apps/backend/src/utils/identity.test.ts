import { describe, it, expect } from "vitest";
import { hashIpDaily, resolveRequestIdentity } from "./identity";

describe("hashIpDaily", () => {
  it("returns a 64-char hex string", async () => {
    const hash = await hashIpDaily("1.2.3.4", "2026-04-29");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different dates", async () => {
    const a = await hashIpDaily("1.2.3.4", "2026-04-29");
    const b = await hashIpDaily("1.2.3.4", "2026-04-30");
    expect(a).not.toBe(b);
  });

  it("produces different hashes for different IPs on the same date", async () => {
    const a = await hashIpDaily("1.2.3.4", "2026-04-29");
    const b = await hashIpDaily("5.6.7.8", "2026-04-29");
    expect(a).not.toBe(b);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashIpDaily("10.0.0.1", "2026-01-01");
    const b = await hashIpDaily("10.0.0.1", "2026-01-01");
    expect(a).toBe(b);
  });
});

describe("resolveRequestIdentity", () => {
  function makeReq(
    headers: Record<string, string>,
    cf?: { asn?: number; country?: string },
  ) {
    return {
      header: (name: string) => headers[name.toLowerCase()],
      raw: cf ? { cf } : {},
    };
  }

  it("maps sessionId to cope_id", async () => {
    const id = await resolveRequestIdentity(
      "sess-abc-123",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
    );
    expect(id.cope_id).toBe("sess-abc-123");
  });

  it("hashes the IP instead of returning it raw", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
    );
    expect(id.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(id.ip_hash).not.toContain("1.2.3.4");
  });

  it("exposes asn and country from cf properties", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }, { asn: 13335, country: "US" }),
    );
    expect(id.asn).toBe(13335);
    expect(id.country).toBe("US");
  });

  it("returns undefined for asn and country when cf is absent", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
    );
    expect(id.asn).toBeUndefined();
    expect(id.country).toBeUndefined();
  });

  it("uses x-forwarded-for fallback for IP resolution", async () => {
    const a = await resolveRequestIdentity(
      "sess",
      makeReq({ "x-forwarded-for": "9.9.9.9" }),
    );
    const b = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "9.9.9.9" }),
    );
    expect(a.ip_hash).toBe(b.ip_hash);
  });
});
