import { describe, it, expect } from "vitest";
import app from "./app";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/unknown", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(404);
  });
});
