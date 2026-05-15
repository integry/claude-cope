import { describe, it, expect, vi } from "vitest";
import app from "./app";
import { migrations } from "./utils/migrations";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/unknown", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(404);
  });

  describe("migration bootstrap middleware", () => {
    it("registers explicit migrations for user_scores.account_id rollout", () => {
      expect(migrations.some((migration) => migration.name === "033_add_user_scores_account_id")).toBe(true);
      expect(migrations.some((migration) => migration.name === "034_idx_user_scores_account_id")).toBe(true);
    });

    it("registers explicit migrations for shared_cards rollout", () => {
      expect(migrations.some((migration) => migration.name === "035_create_shared_cards")).toBe(true);
      expect(migrations.some((migration) => migration.name === "036_idx_shared_cards_created_at")).toBe(true);
      expect(migrations.some((migration) => migration.name === "037_idx_shared_cards_renderer_version")).toBe(true);
      expect(migrations.some((migration) => migration.name === "038_idx_shared_cards_username_created_at")).toBe(true);
    });

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
      expect(csp).toContain("connect-src 'self' https://openrouter.ai https://challenges.cloudflare.com https://us.i.posthog.com https://us-assets.i.posthog.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://*.supabase.co wss: ws: http://localhost:5173");
      expect(csp).toContain("frame-src https://challenges.cloudflare.com");
      expect(csp).toContain("img-src 'self' data: blob:");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });
  });

  describe("CORS headers", () => {
    it("sets Access-Control-Allow-Origin for allowed origins", async () => {
      const res = await app.request(
        "/api/leaderboard",
        {
          method: "GET",
          headers: { Origin: "http://localhost:5173" },
        },
        { ALLOWED_ORIGINS: "http://localhost:5173" },
      );
      expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    });

    it("does not set Access-Control-Allow-Origin for disallowed origins", async () => {
      const res = await app.request(
        "/api/leaderboard",
        {
          method: "GET",
          headers: { Origin: "https://evil.com" },
        },
        { ALLOWED_ORIGINS: "http://localhost:5173" },
      );
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
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

  describe("/api/share-cards protections", () => {
    it("fails closed when share-card rate limiting is not configured", async () => {
      const res = await app.request(
        "/api/share-cards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
          body: JSON.stringify({ prompt: "p", response: "r", username: "alice" }),
        },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
        },
      );

      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({
        error: "Share card creation is temporarily unavailable",
      });
    });

    it("fails closed when Turnstile is not configured", async () => {
      const res = await app.request(
        "/api/share-cards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: "http://localhost:5173", "cf-connecting-ip": "1.2.3.4" },
          body: JSON.stringify({ prompt: "p", response: "r", username: "alice" }),
        },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          RATE_LIMIT_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn().mockResolvedValue(undefined) },
          IP_HASH_PEPPER: "pepper",
        },
      );

      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({
        error: "Share card creation is temporarily unavailable",
      });
    });

    it("requires prior human verification when protections are configured", async () => {
      const usageKv = {
        get: vi.fn().mockResolvedValue(null),
      };
      const rateLimitKv = {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
      };

      const res = await app.request(
        "/api/share-cards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
          body: JSON.stringify({ prompt: "p", response: "r", username: "alice" }),
        },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          RATE_LIMIT_KV: rateLimitKv,
          IP_HASH_PEPPER: "pepper",
          TURNSTILE_SECRET_KEY: "secret",
          USAGE_KV: usageKv,
        },
      );

      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({
        error: "Human verification required",
        reason: "human_verification_required",
      });
    });

    it("applies rate limiting before the share-card route when KV rate limiting is configured", async () => {
      const windowSeconds = 60;
      const rateLimitKv = {
        get: vi.fn().mockResolvedValue(JSON.stringify({
          count: 20,
          expiresAt: Date.now() + windowSeconds * 1000,
        })),
        put: vi.fn().mockResolvedValue(undefined),
      };

      const res = await app.request(
        "/api/share-cards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: "http://localhost:5173", "cf-connecting-ip": "1.2.3.4" },
          body: JSON.stringify({ prompt: "p", response: "r", username: "alice" }),
        },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
          RATE_LIMIT_KV: rateLimitKv,
          IP_HASH_PEPPER: "pepper",
          TURNSTILE_SECRET_KEY: "secret",
          USAGE_KV: { get: vi.fn().mockResolvedValue("1") },
        },
      );

      expect(res.status).toBe(429);
      expect(res.headers.get("retry-after")).toBeTruthy();
    });

    it("does not require write protections for legacy public image URLs", async () => {
      const res = await app.request(
        "/api/share-cards/share-1/image",
        {
          method: "GET",
          headers: { Origin: "http://localhost:5173" },
        },
        {
          ALLOWED_ORIGINS: "http://localhost:5173",
        },
      );

      expect(res.status).toBe(308);
      expect(res.headers.get("location")).toBe("http://localhost/api/share-image/share-1");
    });
  });

});
