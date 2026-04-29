import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createMockLimiter(success: boolean) {
  return {
    limit: vi.fn().mockResolvedValue({ success }),
  };
}

describe("rateLimiter middleware", () => {
  it("returns 200 when rate limit is not exceeded", async () => {
    const limiter = createMockLimiter(true);
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "1.2.3.4",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(res.status).not.toBe(429);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const limiter = createMockLimiter(false);
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "1.2.3.4",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Too many requests. Please try again later." });
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(limiter.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
  });

  it("prioritizes cf-connecting-ip over x-forwarded-for", async () => {
    const limiter = createMockLimiter(true);
    await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-connecting-ip": "9.9.9.9",
          "x-forwarded-for": "1.2.3.4",
          "x-real-ip": "5.6.7.8",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "9.9.9.9" });
  });

  it("uses x-real-ip when x-forwarded-for is absent", async () => {
    const limiter = createMockLimiter(true);
    await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "5.6.7.8",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "5.6.7.8" });
  });

  it("uses first IP from x-forwarded-for when multiple are present", async () => {
    const limiter = createMockLimiter(true);
    await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "10.0.0.1" });
  });

  it("falls back to 'unknown' when no IP headers are present", async () => {
    const limiter = createMockLimiter(true);
    await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "unknown" });
  });

  it("allows requests through when RATE_LIMITER binding is not configured", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173" },
    );

    expect(res.status).not.toBe(429);
  });
});
