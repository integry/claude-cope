import { describe, it, expect } from "vitest";
import app from "./app";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/unknown", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(404);
  });

  describe("Content-Security-Policy", () => {
    it("returns a CSP header on all responses", async () => {
      const res = await app.request("/api/leaderboard", undefined, {
        ALLOWED_ORIGINS: "http://localhost:5173",
      });
      const csp = res.headers.get("content-security-policy");
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("img-src 'self' data:");
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
