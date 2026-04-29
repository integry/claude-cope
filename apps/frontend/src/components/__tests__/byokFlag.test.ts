import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression tests for the `VITE_ENABLE_BYOK` environment flag. When the
 * operator disables BYOK, `/key` must disappear from slash autocomplete and
 * chat submissions must be forced through the backend proxy even when a
 * stale `apiKey` exists in saved state.
 */

// `enableByok === undefined` means "flag unset" — stub to empty so
// parseBoolEnv falls back to its default. We can't rely on
// `vi.unstubAllEnvs()` here because `.env.local` may pin the value.
async function loadSlashCommands(enableByok: boolean | undefined) {
  vi.resetModules();
  vi.stubEnv("VITE_ENABLE_BYOK", enableByok === undefined ? "" : enableByok ? "true" : "false");
  return await import("../slashCommands");
}

async function loadChatApi(enableByok: boolean | undefined) {
  vi.resetModules();
  vi.stubEnv("VITE_ENABLE_BYOK", enableByok === undefined ? "" : enableByok ? "true" : "false");
  return await import("../chatApi");
}

describe("VITE_ENABLE_BYOK — slash command gating", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("includes `/key` in autocomplete by default (flag unset)", async () => {
    const { SLASH_COMMANDS } = await loadSlashCommands(undefined);
    expect(SLASH_COMMANDS).toContain("/key");
  });

  it("includes `/key` when VITE_ENABLE_BYOK=true", async () => {
    const { SLASH_COMMANDS } = await loadSlashCommands(true);
    expect(SLASH_COMMANDS).toContain("/key");
  });

  it("omits `/key` from autocomplete when VITE_ENABLE_BYOK=false", async () => {
    const { SLASH_COMMANDS } = await loadSlashCommands(false);
    expect(SLASH_COMMANDS).not.toContain("/key");
  });
});

describe("VITE_ENABLE_BYOK — chat request routing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  function createMockStreamResponse(): Response {
    const encoder = new TextEncoder();
    const chunks = [
      `data: ${JSON.stringify({ choices: [{ delta: { content: "ok" } }] })}\n\n`,
      "data: [DONE]\n\n",
    ];
    let index = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(encoder.encode(chunks[index]!));
          index++;
        } else {
          controller.close();
        }
      },
    });
    return {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/event-stream" }),
      body,
      json: () => Promise.reject(new Error("Should not call json on stream")),
    } as unknown as Response;
  }

  it("routes directly to OpenRouter when BYOK is enabled and apiKey is set", async () => {
    const { submitChatMessage } = await loadChatApi(true);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "verified" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(createMockStreamResponse());

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-or-v1-stale-key-from-older-session",
    });

    await vi.advanceTimersByTimeAsync(3000);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0]?.[0]).toContain("/api/verify");
    const [url, init] = fetchSpy.mock.calls[1]!;
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk-or-v1-stale-key-from-older-session");
  });

  it("forces the backend proxy path when BYOK is disabled, even with a stale apiKey", async () => {
    const { submitChatMessage } = await loadChatApi(false);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(createMockStreamResponse());

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-or-v1-stale-key-from-older-session",
    });

    await vi.advanceTimersByTimeAsync(3000);

    expect(fetchSpy).toHaveBeenCalled();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toContain("/api/chat");
    expect(url).not.toContain("openrouter.ai");
    // No Authorization header should be sent to the backend proxy
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("does not report BYOK usage when the flag is off", async () => {
    const { submitChatMessage } = await loadChatApi(false);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(createMockStreamResponse());
    const onByokUsage = vi.fn();

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-or-v1-stale",
      onByokUsage,
    });

    await vi.advanceTimersByTimeAsync(3000);
    expect(onByokUsage).not.toHaveBeenCalled();
  });

  it("prepends VITE_API_BASE to the verify URL for cross-origin deployments", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BYOK", "true");
    vi.stubEnv("VITE_API_BASE", "https://worker.example.com");
    const { submitChatMessage } = await import("../chatApi");

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "verified" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(createMockStreamResponse());

    submitChatMessage({
      chatMessages: [{ role: "user", content: "hi" }],
      buddyResult: null,
      unlockAchievement: vi.fn(),
      setHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      currentRank: "Junior Code Monkey",
      apiKey: "sk-or-v1-cross-origin",
    });

    await vi.advanceTimersByTimeAsync(3000);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://worker.example.com/api/verify");
  });
});
