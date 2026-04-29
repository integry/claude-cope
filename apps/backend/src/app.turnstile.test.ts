import { describe, it, expect, vi } from "vitest";
import app from "./app";

describe("Turnstile verification and protection", () => {
  it("reports verification disabled when TURNSTILE_SECRET_KEY is not set", async () => {
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      { ALLOWED_ORIGINS: "http://localhost:5173" },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "disabled",
      enabled: false,
      bypassed: true,
      misconfigured: false,
    });
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  });

  it("bypasses verify status rate limiting when TURNSTILE_SECRET_KEY is not set", async () => {
    const limiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173", "cf-connecting-ip": "1.2.3.4" } },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "disabled",
      enabled: false,
      bypassed: true,
      misconfigured: false,
    });
    expect(limiter.limit).not.toHaveBeenCalled();
  });

  it("reports verification unavailable when secret is set but verification storage is unavailable", async () => {
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret" },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "unavailable",
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: "storage_unavailable",
    });
  });

  it("reports verification misconfigured when TURNSTILE_EXPECTED_HOSTNAME is invalid", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      {
        ALLOWED_ORIGINS: "http://localhost:5173",
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com,evil.example.com",
        USAGE_KV: usageKv,
      },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "misconfigured",
      enabled: false,
      bypassed: false,
      misconfigured: true,
      reason: "invalid_expected_hostname",
    });
  });

  it("reports already verified when human flag exists in KV", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue("1"), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "verified",
      enabled: true,
      bypassed: false,
      misconfigured: false,
    });
    expect(usageKv.get).toHaveBeenCalledWith(expect.stringMatching(/^human:/));
  });

  it("reports enabled when human flag is absent in KV", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "enabled",
      enabled: true,
      bypassed: false,
      misconfigured: false,
    });
  });

  it("bypasses /api/verify when TURNSTILE_SECRET_KEY is not set", async () => {
    const res = await app.request(
      "/api/verify",
      { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({}) },
      { ALLOWED_ORIGINS: "http://localhost:5173" },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ verified: true, bypassed: true });
  });

  it("returns 400 when verify token is missing while secret is configured", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({}) },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
    );
    expect(res.status).toBe(400);
    expect(usageKv.put).not.toHaveBeenCalled();
  });

  it("returns 503 when TURNSTILE_EXPECTED_HOSTNAME is invalid", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          TURNSTILE_SECRET_KEY: "secret",
          TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com,evil.example.com",
          USAGE_KV: usageKv,
        },
      );
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Verification hostname misconfigured" });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("rejects /api/chat with 403 when human flag is absent", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue(null) };
    const res = await app.request(
      "/api/chat",
      { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ chatMessages: [] }) },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
    );
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      error: "Human verification required",
      reason: "human_verification_required",
    });
    expect(usageKv.get).toHaveBeenCalled();
  });

  it("rate limits /api/chat before checking bot protection", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue(null) };
    const limiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await app.request(
      "/api/chat",
      { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ chatMessages: [] }) },
      {
        ALLOWED_ORIGINS: "http://localhost:5173",
        TURNSTILE_SECRET_KEY: "secret",
        USAGE_KV: usageKv,
        RATE_LIMITER: limiter,
      },
    );
    expect(res.status).toBe(429);
    expect(limiter.limit).toHaveBeenCalled();
    expect(usageKv.get).not.toHaveBeenCalled();
  });

  it("rejects /api/chat with 503 and a reason when bot protection storage is unavailable", async () => {
    const res = await app.request(
      "/api/chat",
      { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ chatMessages: [] }) },
      { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret" },
    );
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "Bot protection storage is not available",
      reason: "storage_unavailable",
    });
  });

  it("rejects /api/chat with 503 and a reason when the verification check fails", async () => {
    const usageKv = { get: vi.fn().mockRejectedValue(new Error("kv down")) };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await app.request(
        "/api/chat",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ chatMessages: [] }) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({
        error: "Verification check failed",
        reason: "verification_check_failed",
      });
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("stores human flag in USAGE_KV on successful verification", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn().mockResolvedValue(undefined) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ verified: true });
      expect(usageKv.put).toHaveBeenCalledWith(
        expect.stringMatching(/^human:/),
        "1",
        { expirationTtl: 60 * 60 * 24 },
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("returns 503 when Cloudflare verification request throws", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Verification service unavailable" });
      expect(usageKv.put).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("aborts Cloudflare verification when the siteverify request hangs", async () => {
    vi.useFakeTimers();
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("The operation was aborted.", "AbortError"));
      });
    }));
    try {
      const responsePromise = app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      await vi.advanceTimersByTimeAsync(10_000);
      const res = await responsePromise;
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Verification service unavailable" });
      expect(usageKv.put).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it("rejects successful verification when hostname does not match expected hostname", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, hostname: "evil.example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          TURNSTILE_SECRET_KEY: "secret",
          TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com",
          USAGE_KV: usageKv,
        },
      );
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Unexpected verification hostname" });
      expect(usageKv.put).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("accepts successful verification when TURNSTILE_EXPECTED_HOSTNAME includes a port", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn().mockResolvedValue(undefined) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, hostname: "claudecope.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          TURNSTILE_SECRET_KEY: "secret",
          TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com:443",
          USAGE_KV: usageKv,
        },
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ verified: true });
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("treats impossible TURNSTILE_EXPECTED_HOSTNAME ports as invalid", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173" } },
      {
        ALLOWED_ORIGINS: "http://localhost:5173",
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com:99999",
        USAGE_KV: usageKv,
      },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "misconfigured",
      enabled: false,
      bypassed: false,
      misconfigured: true,
      reason: "invalid_expected_hostname",
    });
  });

  it("rejects successful verification when expected hostname is configured but hostname is missing", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ token: "token-123" }) },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          TURNSTILE_SECRET_KEY: "secret",
          TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com",
          USAGE_KV: usageKv,
        },
      );
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Unexpected verification hostname" });
      expect(usageKv.put).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("does not rate limit verify status checks when Turnstile is enabled", async () => {
    const limiter = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: { Origin: "http://localhost:5173", "cf-connecting-ip": "1.2.3.4" } },
      {
        ALLOWED_ORIGINS: "http://localhost:5173",
        TURNSTILE_SECRET_KEY: "secret",
        USAGE_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn() },
        RATE_LIMITER: limiter,
      },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(limiter.limit).not.toHaveBeenCalled();
  });

  it("uses a separate verify-submit rate limiter key for token submission", async () => {
    const limiter = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const res = await app.request(
      "/api/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
          "cf-connecting-ip": "1.2.3.4",
        },
        body: JSON.stringify({}),
      },
      {
        ALLOWED_ORIGINS: "http://localhost:5173",
        TURNSTILE_SECRET_KEY: "secret",
        USAGE_KV: { get: vi.fn(), put: vi.fn() },
        RATE_LIMITER: limiter,
      },
    );
    expect(res.status).toBe(400);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "verify-submit:1.2.3.4" });
  });
});
