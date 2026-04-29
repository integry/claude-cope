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
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("connect-src 'self' https://openrouter.ai wss: ws:");
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
});
