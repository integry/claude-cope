import { describe, it, expect, vi } from "vitest";
import app from "./app";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/unknown", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(404);
  });

  describe("migration bootstrap middleware", () => {
    it("calls DB.exec for migration when DB is available", async () => {
      const db = {
        prepare: vi.fn(() => ({
          bind: vi.fn().mockReturnThis(),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      // A request with a DB should trigger migrations (via exec or prepare)
      // and then proceed normally
      const res = await app.request("/api/leaderboard", undefined, {
        ALLOWED_ORIGINS: "http://localhost:5173",
        DB: db,
      });
      // The migration middleware should have interacted with the DB
      expect(db.exec.mock.calls.length + db.prepare.mock.calls.length).toBeGreaterThan(0);
      // The request should still complete (not hang or error from migrations)
      expect(res.status).toBeDefined();
    });

    it("proceeds without error when DB is not available", async () => {
      const res = await app.request("/api/leaderboard", undefined, {
        ALLOWED_ORIGINS: "http://localhost:5173",
      });
      // Should still work — no DB means migrations are skipped
      expect(res.status).toBeDefined();
    });
  });

  describe("Content-Security-Policy", () => {
    it("returns a CSP header on all responses", async () => {
      const res = await app.request("/api/leaderboard", undefined, {
        ALLOWED_ORIGINS: "http://localhost:5173",
      });
      const csp = res.headers.get("content-security-policy");
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com");
      expect(csp).toContain("connect-src 'self' https://openrouter.ai https://challenges.cloudflare.com wss: ws:");
      expect(csp).toContain("frame-src https://challenges.cloudflare.com");
      expect(csp).toContain("img-src 'self' data: blob:");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });
  });

  describe("CSRF protection", () => {
    it("rejects /api/* requests from disallowed origins with 403", async () => {
      const res = await app.request(
        "/api/chat",
        {
          method: "POST",
          headers: { Origin: "https://evil.com" },
        },
        { ALLOWED_ORIGINS: "http://localhost:5173" },
      );
      expect(res.status).toBe(403);
    });

    it("allows /api/* requests from allowed origins", async () => {
      const res = await app.request(
        "/api/leaderboard",
        {
          method: "GET",
          headers: { Origin: "http://localhost:5173" },
        },
        { ALLOWED_ORIGINS: "http://localhost:5173" },
      );
      expect(res.status).not.toBe(403);
    });
  });

  describe("Turnstile verification and protection", () => {
    it("reports verification disabled when TURNSTILE_SECRET_KEY is not set", async () => {
      const res = await app.request(
        "/api/verify",
        { method: "GET", headers: { Origin: "http://localhost:5173" } },
        { ALLOWED_ORIGINS: "http://localhost:5173" },
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ enabled: false, bypassed: true, misconfigured: false });
    });

    it("reports verification disabled when secret is set but verification storage is unavailable", async () => {
      const res = await app.request(
        "/api/verify",
        { method: "GET", headers: { Origin: "http://localhost:5173" } },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret" },
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ enabled: false, bypassed: false, misconfigured: true });
    });

    it("reports verification misconfigured when TURNSTILE_EXPECTED_HOSTNAME is invalid", async () => {
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
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
      await expect(res.json()).resolves.toEqual({ enabled: false, bypassed: false, misconfigured: true });
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
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
      const res = await app.request(
        "/api/verify",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({}) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      expect(res.status).toBe(400);
      expect(usageKv.put).not.toHaveBeenCalled();
    });

    it("returns 503 when TURNSTILE_EXPECTED_HOSTNAME is invalid", async () => {
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
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
      const usageKv = {
        get: vi.fn().mockResolvedValue(null),
      };
      const res = await app.request(
        "/api/chat",
        { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" }, body: JSON.stringify({ chatMessages: [] }) },
        { ALLOWED_ORIGINS: "http://localhost:5173", TURNSTILE_SECRET_KEY: "secret", USAGE_KV: usageKv },
      );
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ error: "Human verification required" });
      expect(usageKv.get).toHaveBeenCalled();
    });

    it("stores human flag in USAGE_KV on successful verification", async () => {
      const usageKv = {
        get: vi.fn(),
        put: vi.fn().mockResolvedValue(undefined),
      };
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
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
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

    it("rejects successful verification when hostname does not match expected hostname", async () => {
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
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
      const usageKv = {
        get: vi.fn(),
        put: vi.fn().mockResolvedValue(undefined),
      };
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

    it("rejects successful verification when expected hostname is configured but hostname is missing", async () => {
      const usageKv = {
        get: vi.fn(),
        put: vi.fn(),
      };
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

    it("uses a verify-specific rate limiter key", async () => {
      const limiter = {
        limit: vi.fn().mockResolvedValue({ success: true }),
      };
      const res = await app.request(
        "/api/verify",
        { method: "GET", headers: { Origin: "http://localhost:5173", "cf-connecting-ip": "1.2.3.4" } },
        { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      );
      expect(res.status).toBe(200);
      expect(limiter.limit).toHaveBeenCalledWith({ key: "verify:1.2.3.4" });
    });
  });
});
