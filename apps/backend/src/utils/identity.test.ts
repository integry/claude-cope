import { describe, it, expect } from "vitest";
import { hashIpDaily, resolveRequestIdentity } from "./identity";

describe("hashIpDaily", () => {
  it("returns a 64-char hex string", async () => {
    const hash = await hashIpDaily("1.2.3.4", "test-pepper", "2026-04-29");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different dates", async () => {
    const a = await hashIpDaily("1.2.3.4", "test-pepper", "2026-04-29");
    const b = await hashIpDaily("1.2.3.4", "test-pepper", "2026-04-30");
    expect(a).not.toBe(b);
  });

  it("produces different hashes for different IPs on the same date", async () => {
    const a = await hashIpDaily("1.2.3.4", "test-pepper", "2026-04-29");
    const b = await hashIpDaily("5.6.7.8", "test-pepper", "2026-04-29");
    expect(a).not.toBe(b);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashIpDaily("10.0.0.1", "test-pepper", "2026-01-01");
    const b = await hashIpDaily("10.0.0.1", "test-pepper", "2026-01-01");
    expect(a).toBe(b);
  });

  it("never contains the raw IP in the output", async () => {
    const ip = "192.168.1.42";
    const hash = await hashIpDaily(ip, "test-pepper", "2026-04-29");
    expect(hash).not.toContain(ip);
    expect(hash).not.toContain(ip.replace(/\./g, ""));
  });

  it("produces different hashes for different peppers", async () => {
    const a = await hashIpDaily("1.2.3.4", "pepper-a", "2026-04-29");
    const b = await hashIpDaily("1.2.3.4", "pepper-b", "2026-04-29");
    expect(a).not.toBe(b);
  });

  it("requires a pepper argument", async () => {
    const hash = await hashIpDaily("1.2.3.4", "required-pepper", "2026-04-29");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("resolveRequestIdentity", () => {
  const TEST_PEPPER = "test-pepper";

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
      TEST_PEPPER,
    );
    expect(id.cope_id).toBe("sess-abc-123");
  });

  it("uses the sessionId verbatim, not a hash", async () => {
    const session = "my-unique-session-id-xyz";
    const id = await resolveRequestIdentity(
      session,
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
      TEST_PEPPER,
    );
    expect(id.cope_id).toBe(session);
  });

  it("hashes the IP instead of returning it raw", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
      TEST_PEPPER,
    );
    expect(id.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(id.ip_hash).not.toContain("1.2.3.4");
  });

  it("no field in the returned identity contains the raw IP", async () => {
    const rawIp = "203.0.113.77";
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": rawIp }),
      TEST_PEPPER,
    );
    const allValues = JSON.stringify(id);
    expect(allValues).not.toContain(rawIp);
  });

  it("exposes asn and country from cf properties", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }, { asn: 13335, country: "US" }),
      TEST_PEPPER,
    );
    expect(id.asn).toBe(13335);
    expect(id.country).toBe("US");
  });

  it("returns undefined for asn and country when cf is absent", async () => {
    const id = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
      TEST_PEPPER,
    );
    expect(id.asn).toBeUndefined();
    expect(id.country).toBeUndefined();
  });

  it("uses x-forwarded-for fallback for IP resolution", async () => {
    const a = await resolveRequestIdentity(
      "sess",
      makeReq({ "x-forwarded-for": "9.9.9.9" }),
      TEST_PEPPER,
    );
    const b = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "9.9.9.9" }),
      TEST_PEPPER,
    );
    expect(a.ip_hash).toBe(b.ip_hash);
  });

  it("uses x-real-ip as a fallback when other headers are absent", async () => {
    const a = await resolveRequestIdentity(
      "sess",
      makeReq({ "x-real-ip": "10.10.10.10" }),
      TEST_PEPPER,
    );
    const b = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "10.10.10.10" }),
      TEST_PEPPER,
    );
    expect(a.ip_hash).toBe(b.ip_hash);
  });

  it("falls back to 'unknown' when no IP headers are present", async () => {
    const id = await resolveRequestIdentity("sess", makeReq({}), TEST_PEPPER);
    const unknownHash = await hashIpDaily("unknown", TEST_PEPPER);
    expect(id.ip_hash).toBe(unknownHash);
  });

  it("produces different hashes with different peppers", async () => {
    const a = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
      "pepper-alpha",
    );
    const b = await resolveRequestIdentity(
      "sess",
      makeReq({ "cf-connecting-ip": "1.2.3.4" }),
      "pepper-beta",
    );
    expect(a.ip_hash).not.toBe(b.ip_hash);
  });
});
