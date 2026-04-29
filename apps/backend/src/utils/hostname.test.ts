import { describe, it, expect } from "vitest";
import { normalizeHostname, getExpectedHostnameConfig } from "./hostname";

describe("normalizeHostname", () => {
  it("returns undefined for empty or undefined input", () => {
    expect(normalizeHostname(undefined)).toBeUndefined();
    expect(normalizeHostname("")).toBeUndefined();
    expect(normalizeHostname("  ")).toBeUndefined();
  });

  it("returns the lowercase hostname for a valid hostname", () => {
    expect(normalizeHostname("Example.COM")).toBe("example.com");
    expect(normalizeHostname("localhost")).toBe("localhost");
    expect(normalizeHostname("sub.domain.example.com")).toBe("sub.domain.example.com");
  });

  it("strips the port but returns the hostname", () => {
    expect(normalizeHostname("example.com:443")).toBe("example.com");
    expect(normalizeHostname("localhost:8080")).toBe("localhost");
  });

  it("rejects values with commas (multiple hostnames)", () => {
    expect(normalizeHostname("example.com,evil.com")).toBeUndefined();
  });

  it("rejects values with slashes (URL-like)", () => {
    expect(normalizeHostname("https://example.com")).toBeUndefined();
    expect(normalizeHostname("example.com/path")).toBeUndefined();
  });

  it("rejects values with whitespace in the middle", () => {
    expect(normalizeHostname("example .com")).toBeUndefined();
  });

  it("accepts IPv4 addresses", () => {
    expect(normalizeHostname("127.0.0.1")).toBe("127.0.0.1");
    expect(normalizeHostname("192.168.1.1")).toBe("192.168.1.1");
    expect(normalizeHostname("10.0.0.1:8080")).toBe("10.0.0.1");
  });

  it("rejects invalid IPv4 addresses", () => {
    expect(normalizeHostname("999.999.999.999")).toBeUndefined();
    expect(normalizeHostname("256.1.1.1")).toBeUndefined();
  });

  it("accepts IPv6 addresses", () => {
    expect(normalizeHostname("::1")).toBe("::1");
    expect(normalizeHostname("[::1]")).toBe("::1");
    expect(normalizeHostname("[::1]:8080")).toBe("::1");
    expect(normalizeHostname("[2001:db8::1]")).toBe("2001:db8::1");
  });

  it("rejects invalid port numbers", () => {
    expect(normalizeHostname("example.com:0")).toBeUndefined();
    expect(normalizeHostname("example.com:99999")).toBeUndefined();
    expect(normalizeHostname("example.com:abc")).toBeUndefined();
    expect(normalizeHostname("example.com:123456")).toBeUndefined();
  });

  it("accepts valid port numbers at the boundaries", () => {
    expect(normalizeHostname("example.com:1")).toBe("example.com");
    expect(normalizeHostname("example.com:65535")).toBe("example.com");
  });

  it("rejects hostnames that fail the pattern", () => {
    expect(normalizeHostname("-invalid.com")).toBeUndefined();
    expect(normalizeHostname("invalid-.com")).toBeUndefined();
  });
});

describe("getExpectedHostnameConfig", () => {
  it("returns not invalid when input is undefined or empty", () => {
    expect(getExpectedHostnameConfig(undefined)).toEqual({ invalid: false });
    expect(getExpectedHostnameConfig("")).toEqual({ invalid: false });
    expect(getExpectedHostnameConfig("  ")).toEqual({ invalid: false });
  });

  it("returns the hostname when valid", () => {
    expect(getExpectedHostnameConfig("example.com")).toEqual({ hostname: "example.com", invalid: false });
    expect(getExpectedHostnameConfig("example.com:443")).toEqual({ hostname: "example.com", invalid: false });
  });

  it("returns invalid for malformed hostnames", () => {
    expect(getExpectedHostnameConfig("example.com,evil.com")).toEqual({ invalid: true });
    expect(getExpectedHostnameConfig("example.com:99999")).toEqual({ invalid: true });
  });
});
