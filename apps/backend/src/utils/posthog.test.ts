import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { capturePostHogEvent } from "./posthog";

describe("capturePostHogEvent", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("OK", { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is a no-op when POSTHOG_API_KEY is missing", async () => {
    await capturePostHogEvent({}, { event: "test", distinct_id: "u1" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the correct payload to the capture endpoint", async () => {
    await capturePostHogEvent(
      { POSTHOG_API_KEY: "phk_test" },
      { event: "Test_Event", distinct_id: "user-1", properties: { foo: "bar" } },
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://app.posthog.com/capture/");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string);
    expect(body.api_key).toBe("phk_test");
    expect(body.event).toBe("Test_Event");
    expect(body.distinct_id).toBe("user-1");
    expect(body.properties.foo).toBe("bar");
    expect(body.properties.$lib).toBe("claude-cope-worker");
  });

  it("strips trailing slashes from POSTHOG_HOST", async () => {
    await capturePostHogEvent(
      { POSTHOG_API_KEY: "phk_test", POSTHOG_HOST: "https://custom.posthog.io///" },
      { event: "test", distinct_id: "u1" },
    );

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://custom.posthog.io/capture/");
  });

  it("uses default host when POSTHOG_HOST is empty", async () => {
    await capturePostHogEvent(
      { POSTHOG_API_KEY: "phk_test", POSTHOG_HOST: "" },
      { event: "test", distinct_id: "u1" },
    );

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://app.posthog.com/capture/");
  });

  it("aborts fetch after the configured timeout", async () => {
    vi.useFakeTimers();

    fetchSpy.mockImplementation((_input: unknown, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      }),
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const promise = capturePostHogEvent(
      { POSTHOG_API_KEY: "phk_test" },
      { event: "test", distinct_id: "u1" },
    );

    await vi.advanceTimersByTimeAsync(5000);
    await promise;

    expect(fetchSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
    vi.useRealTimers();
  });

  it("does not throw on fetch failure", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      capturePostHogEvent(
        { POSTHOG_API_KEY: "phk_test" },
        { event: "test", distinct_id: "u1" },
      ),
    ).resolves.toBeUndefined();

    warnSpy.mockRestore();
  });

  it("does not throw on non-ok response", async () => {
    fetchSpy.mockResolvedValue(new Response("Server Error", { status: 500 }));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      capturePostHogEvent(
        { POSTHOG_API_KEY: "phk_test" },
        { event: "test", distinct_id: "u1" },
      ),
    ).resolves.toBeUndefined();

    warnSpy.mockRestore();
  });

  it("throttles failure logs to avoid log flooding", async () => {
    vi.useFakeTimers();
    // Set time far in the future to ensure we're past any previous real Date.now() throttle window
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    const localFetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await capturePostHogEvent(
        { POSTHOG_API_KEY: "phk_test" },
        { event: "test", distinct_id: "u1" },
      );
      const firstCallCount = warnSpy.mock.calls.length;
      expect(firstCallCount).toBe(1);

      await capturePostHogEvent(
        { POSTHOG_API_KEY: "phk_test" },
        { event: "test", distinct_id: "u2" },
      );
      expect(warnSpy.mock.calls.length).toBe(firstCallCount);

      vi.setSystemTime(new Date("2030-01-01T00:06:00Z"));

      await capturePostHogEvent(
        { POSTHOG_API_KEY: "phk_test" },
        { event: "test", distinct_id: "u3" },
      );
      expect(warnSpy.mock.calls.length).toBe(firstCallCount + 1);
    } finally {
      warnSpy.mockRestore();
      localFetchSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});
