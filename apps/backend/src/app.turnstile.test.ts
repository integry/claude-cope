import { describe, it, expect, vi } from "vitest";
import app from "./app";

const ALLOWED_ORIGINS = "http://localhost:5173";
const verifyOriginHeaders = { Origin: ALLOWED_ORIGINS };
const jsonVerifyOriginHeaders = { "Content-Type": "application/json", Origin: ALLOWED_ORIGINS };
const ipVerifyOriginHeaders = { Origin: ALLOWED_ORIGINS, "cf-connecting-ip": "1.2.3.4" };
const ipJsonVerifyOriginHeaders = {
  "Content-Type": "application/json",
  Origin: ALLOWED_ORIGINS,
  "cf-connecting-ip": "1.2.3.4",
};

function requestVerify(method: "GET" | "POST", env: Record<string, unknown>, body?: unknown, headers?: Record<string, string>) {
  return app.request(
    "/api/verify",
    { method, headers: headers ?? (method === "GET" ? verifyOriginHeaders : jsonVerifyOriginHeaders), body: body === undefined ? undefined : JSON.stringify(body) },
    { ALLOWED_ORIGINS, ...env },
  );
}

function requestChat(env: Record<string, unknown>, body: unknown = { chatMessages: [] }) {
  return app.request(
    "/api/chat",
    { method: "POST", headers: jsonVerifyOriginHeaders, body: JSON.stringify(body) },
    { ALLOWED_ORIGINS, ...env },
  );
}

describe("Turnstile verification and protection", () => {
  it("reports verification disabled when TURNSTILE_SECRET_KEY is not set", async () => {
    const res = await requestVerify("GET", {});
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "disabled",
      enabled: false,
      bypassed: true,
      misconfigured: false,
    });
    expect(res.headers.get("cache-control")).toBe("no-store, max-age=0");
  });

  it("bypasses verify status rate limiting when TURNSTILE_SECRET_KEY is not set", async () => {
    const rateLimitKv = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
    const res = await requestVerify("GET", { RATE_LIMIT_KV: rateLimitKv }, undefined, ipVerifyOriginHeaders);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "disabled",
      enabled: false,
      bypassed: true,
      misconfigured: false,
    });
    expect(rateLimitKv.get).not.toHaveBeenCalled();
  });

  it("reports verification unavailable when secret is set but verification storage is unavailable", async () => {
    const res = await requestVerify("GET", { TURNSTILE_SECRET_KEY: "secret" });
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
    const res = await requestVerify("GET", {
      TURNSTILE_SECRET_KEY: "secret",
      TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com,evil.example.com",
      USAGE_KV: usageKv,
    });
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
    const res = await requestVerify("GET", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv });
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
    const res = await requestVerify("GET", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: "enabled",
      enabled: true,
      bypassed: false,
      misconfigured: false,
    });
  });

  it("bypasses /api/verify when TURNSTILE_SECRET_KEY is not set", async () => {
    const res = await requestVerify("POST", {}, {});
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ verified: true, bypassed: true });
  });

  it("returns 400 when verify token is missing while secret is configured", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const res = await requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, {});
    expect(res.status).toBe(400);
    expect(usageKv.put).not.toHaveBeenCalled();
  });

  it("returns 503 when TURNSTILE_EXPECTED_HOSTNAME is invalid", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      const res = await requestVerify("POST", {
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com,evil.example.com",
        USAGE_KV: usageKv,
      }, { token: "token-123" });
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Verification hostname misconfigured" });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("rejects /api/chat with 403 when human flag is absent", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue(null) };
    const res = await requestChat({ TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv });
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      error: "Human verification required",
      reason: "human_verification_required",
    });
    expect(usageKv.get).toHaveBeenCalled();
  });

  it("rate limits /api/chat before checking bot protection", async () => {
    const usageKv = { get: vi.fn().mockResolvedValue(null) };
    const overLimitCounter = JSON.stringify({ count: 100, expiresAt: Date.now() + 60_000 });
    const rateLimitKv = {
      get: vi.fn().mockResolvedValue(overLimitCounter),
      put: vi.fn().mockResolvedValue(undefined),
    };
    const res = await requestChat({ TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv, RATE_LIMIT_KV: rateLimitKv, IP_HASH_PEPPER: "test-pepper" });
    expect(res.status).toBe(429);
    expect(rateLimitKv.get).toHaveBeenCalled();
    expect(usageKv.get).not.toHaveBeenCalled();
  });

  it("rejects /api/chat with 503 and a reason when bot protection storage is unavailable", async () => {
    const res = await requestChat({ TURNSTILE_SECRET_KEY: "secret" });
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
      const res = await requestChat({ TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv });
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
      const res = await requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, { token: "token-123" });
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
      const res = await requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, { token: "token-123" });
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
      const responsePromise = requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, { token: "token-123" });
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

  it.each(["invalid-input-secret", "missing-input-secret", "internal-error"])(
    "returns 500 when Cloudflare reports server-side error %s",
    async (errorCode) => {
      const usageKv = { get: vi.fn(), put: vi.fn() };
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ success: false, "error-codes": [errorCode] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      try {
        const res = await requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, { token: "token-123" });
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({ verified: false, error: "Verification service misconfigured" });
        expect(usageKv.put).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
        errorSpy.mockRestore();
      }
    },
  );
  it("returns 403 for client-side error codes like bad-request", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["bad-request"] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      const res = await requestVerify("POST", { TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv }, { token: "token-123" });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ verified: false, reason: "challenge_failed" });
    } finally {
      fetchSpy.mockRestore();
      warnSpy.mockRestore();
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
      const res = await requestVerify("POST", {
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com",
        USAGE_KV: usageKv,
      }, { token: "token-123" });
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
      const res = await requestVerify("POST", {
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com:443",
        USAGE_KV: usageKv,
      }, { token: "token-123" });
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ verified: true });
    } finally {
      fetchSpy.mockRestore();
    }
  });
  it("treats impossible TURNSTILE_EXPECTED_HOSTNAME ports as invalid", async () => {
    const usageKv = { get: vi.fn(), put: vi.fn() };
    const res = await requestVerify("GET", {
      TURNSTILE_SECRET_KEY: "secret",
      TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com:99999",
      USAGE_KV: usageKv,
    });
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
      const res = await requestVerify("POST", {
        TURNSTILE_SECRET_KEY: "secret",
        TURNSTILE_EXPECTED_HOSTNAME: "claudecope.com",
        USAGE_KV: usageKv,
      }, { token: "token-123" });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ verified: false, error: "Unexpected verification hostname" });
      expect(usageKv.put).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
  it("rate limits verify status checks when Turnstile is enabled", async () => {
    const rateLimitKv = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
    const res = await requestVerify(
      "GET",
      {
        TURNSTILE_SECRET_KEY: "secret",
        USAGE_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn() },
        RATE_LIMIT_KV: rateLimitKv,
      },
      undefined,
      ipVerifyOriginHeaders,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(rateLimitKv.get).toHaveBeenCalledWith(expect.stringMatching(/^rl:verify-status:[0-9a-f-]{36}$/));
  });
  it("falls back to IP for verify-status rate limit key when session is unavailable", async () => {
    const rateLimitKv = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
    const res = await app.request(
      "/api/verify",
      { method: "GET", headers: ipVerifyOriginHeaders },
      { ALLOWED_ORIGINS, TURNSTILE_SECRET_KEY: "secret", USAGE_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn() }, RATE_LIMIT_KV: rateLimitKv },
    );
    expect(res.status).toBe(200);
    expect(rateLimitKv.get).toHaveBeenCalledWith(expect.stringMatching(/^rl:verify-status:/));
  });

  it("uses a separate verify-submit rate limiter key for token submission", async () => {
    const rateLimitKv = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
    const res = await requestVerify(
      "POST",
      {
        TURNSTILE_SECRET_KEY: "secret",
        USAGE_KV: { get: vi.fn(), put: vi.fn() },
        RATE_LIMIT_KV: rateLimitKv,
      },
      {},
      ipJsonVerifyOriginHeaders,
    );
    expect(res.status).toBe(400);
    expect(rateLimitKv.get).toHaveBeenCalledWith("rl:verify-submit:1.2.3.4");
  });
});
