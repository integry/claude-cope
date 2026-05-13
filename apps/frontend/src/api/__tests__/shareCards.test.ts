import { afterEach, describe, expect, it, vi } from "vitest";
import { createShareCard } from "../shareCards";

describe("createShareCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the share payload to the share-card API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      shareId: "share-1",
      imageUrl: "https://claudecope.com/api/share-image/share-1",
      shareUrl: "https://claudecope.com/s/share-1",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await createShareCard({ prompt: "Hello", response: "World", username: "alice", theme: "amber" });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello", response: "World", username: "alice", theme: "amber" }),
    });
  });

  it("throws the backend error message for non-OK responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "prompt must be a non-empty string" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(createShareCard({ prompt: "", response: "World", username: "alice" }))
      .rejects
      .toThrow("prompt must be a non-empty string");
  });

  it("throws for malformed success responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      shareId: "share-1",
      imageUrl: "https://claudecope.com/api/share-image/share-1",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(createShareCard({ prompt: "Hello", response: "World", username: "alice" }))
      .rejects
      .toThrow("Invalid share-card response");
  });

  it("throws a network error when the request fails before a response is received", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hang up")));

    await expect(createShareCard({ prompt: "Hello", response: "World", username: "alice" }))
      .rejects
      .toThrow("Network error");
  });
});
