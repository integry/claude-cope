// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import {
  AdminApiProvider,
  clearAdminApiKey,
  getAdminApiKey,
  setAdminApiKey,
  useAdminAuth,
} from "./useAdminApi";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let latestAuth: ReturnType<typeof useAdminAuth> | null = null;

function AuthHarness() {
  latestAuth = useAdminAuth();
  return createElement("div");
}

function renderProvider() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(AdminApiProvider, null, createElement(AuthHarness)));
  });
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

function cleanup() {
  latestAuth = null;
  clearAdminApiKey();
  vi.restoreAllMocks();
  if (root) {
    act(() => root.unmount());
  }
  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe("useAdminAuth", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    clearAdminApiKey();
  });

  afterEach(cleanup);

  it("keeps auth required when sign-in verification fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "Unauthorized" }, { status: 401, statusText: "Unauthorized" }),
    );

    renderProvider();
    await flushEffects();

    expect(latestAuth?.authRequired).toBe(true);
    expect(latestAuth?.authChecking).toBe(false);

    let result = false;
    await act(async () => {
      result = await latestAuth!.signIn("bad-key");
    });

    expect(result).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith("/api/config", {
      headers: {
        Authorization: "Bearer bad-key",
      },
    });
    expect(latestAuth?.authRequired).toBe(true);
    expect(latestAuth?.authError).toBe(true);
    expect(getAdminApiKey()).toBe("");
  });

  it("preserves a stored key when initial verification hits a server error", async () => {
    setAdminApiKey("stored-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "Database not configured" }, { status: 500, statusText: "Internal Server Error" }),
    );

    renderProvider();
    await flushEffects();

    expect(latestAuth?.authRequired).toBe(true);
    expect(latestAuth?.authError).toBe(false);
    expect(latestAuth?.serverError).toBe("Database not configured");
    expect(getAdminApiKey()).toBe("stored-key");
  });

  it("preserves the stored key when sign-in verification hits a server error", async () => {
    setAdminApiKey("stored-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "Database not configured" }, { status: 500, statusText: "Internal Server Error" }),
    );

    renderProvider();
    await flushEffects();

    let result = true;
    await act(async () => {
      result = await latestAuth!.signIn("replacement-key");
    });

    expect(result).toBe(false);
    expect(latestAuth?.authRequired).toBe(true);
    expect(latestAuth?.authError).toBe(false);
    expect(latestAuth?.serverError).toBe("Database not configured");
    expect(getAdminApiKey()).toBe("stored-key");
  });

  it("holds the app behind auth checking while validating a stored key", async () => {
    let resolveFetch: ((response: Response) => void) | null = null;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    setAdminApiKey("stored-key");
    renderProvider();

    expect(latestAuth?.authChecking).toBe(true);
    expect(latestAuth?.authRequired).toBe(true);

    await act(async () => {
      resolveFetch?.(jsonResponse([], { status: 200, statusText: "OK" }));
      await Promise.resolve();
    });

    expect(latestAuth?.authChecking).toBe(false);
    expect(latestAuth?.authRequired).toBe(false);
    expect(latestAuth?.authError).toBe(false);
  });
});
