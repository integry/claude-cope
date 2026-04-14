import { describe, it, expect } from "vitest";
import app from "./app";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/unknown", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(404);
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
