import { afterEach, describe, expect, it, vi } from "vitest";
import { updateThemeServer } from "../profileApi";

describe("updateThemeServer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the selected theme and optional license hash to the account API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateThemeServer("alice", "amber", "pro-hash");

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/account/update-theme"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alice", themeId: "amber", licenseKeyHash: "pro-hash" }),
    });
  });

  it("omits licenseKeyHash when persisting a session-backed theme selection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateThemeServer("alice", "amber");

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      body: JSON.stringify({ username: "alice", themeId: "amber" }),
    }));
  });
});
