import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { SHARE_CARD_RENDERER_VERSION } from "@claude-cope/shared/shareCards";
import shareCards from "./shareCards";
import { createSharePages } from "./sharePages";
import {
  buildShareImageCacheKey,
  getCachedOrRenderedShareImage,
  renderPublicSharePageHtml,
  type ShareImageCache,
  type ShareImageRenderer,
} from "../utils/shareImages";

type SharedCardRecord = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
  content_hash: string;
  created_at: string;
};

type AppBindings = {
  DB?: D1Database;
  ALLOWED_ORIGINS?: string;
  SHARE_CARD_BASE_ORIGIN?: string;
  APP_BASE_ORIGIN?: string;
};

const PUBLIC_SHARE_ORIGIN = "https://public.example.com";
const APP_ORIGIN = "https://app.example.com";
const STAGING_ALLOWED_ORIGINS = "http://localhost:5173,https://staging.example.com";
const PUBLIC_IMAGE_URL = `${PUBLIC_SHARE_ORIGIN}/api/share-image/share-1`;
const PAGE_IMAGE_FRAGMENT = '<img src="https://share.example/api/share-image/share-1"';

function createShareCardMockDB() {
  const rows = new Map<string, SharedCardRecord>();
  let nextId = 1;
  const db = {
    prepare(sql: string) {
      const upper = sql.trim().toUpperCase();
      return {
        bind(...args: unknown[]) {
          return {
            async first<T = unknown>() {
              if (upper === "SELECT ID FROM SHARED_CARDS WHERE CONTENT_HASH = ?") {
                const row = rows.get(String(args[0]));
                return (row ? { id: row.id } : null) as T | null;
              }
              if (upper === "SELECT ID, PROMPT, RESPONSE, USERNAME, THEME, RENDERER_VERSION, CREATED_AT FROM SHARED_CARDS WHERE ID = ?") {
                const row = Array.from(rows.values()).find((value) => value.id === String(args[0]));
                return row
                  ? {
                    id: row.id,
                    prompt: row.prompt,
                    response: row.response,
                    username: row.username,
                    theme: row.theme,
                    renderer_version: row.renderer_version,
                    created_at: row.created_at,
                  } as T
                  : null;
              }
              throw new Error(`Unsupported first SQL in test mock: ${sql}`);
            },
            async all<T = unknown>() {
              if (upper.includes("SCHEMA_MIGRATIONS")) return { results: [] as T[] };
              throw new Error(`Unsupported all SQL in test mock: ${sql}`);
            },
            async run() {
              if (upper.startsWith("INSERT OR IGNORE INTO SHARED_CARDS")) {
                const [prompt, response, username, theme, rendererVersion, contentHash] = args as [
                  string,
                  string,
                  string,
                  string | null,
                  string,
                  string,
                ];
                if (!rows.has(contentHash)) {
                  rows.set(contentHash, {
                    id: `share-${nextId++}`,
                    prompt,
                    response,
                    username,
                    theme,
                    renderer_version: rendererVersion,
                    content_hash: contentHash,
                    created_at: "2026-05-13 12:26:00",
                  });
                }
                return { success: true };
              }
              if (upper.includes("SCHEMA_MIGRATIONS")) return { success: true };
              throw new Error(`Unsupported bound run SQL in test mock: ${sql}`);
            },
          };
        },
        async run() {
          if (upper.includes("SCHEMA_MIGRATIONS")) return { success: true };
          throw new Error(`Unsupported run SQL in test mock: ${sql}`);
        },
        async all<T = unknown>() {
          if (upper === "SELECT NAME FROM SCHEMA_MIGRATIONS") return { results: [] as T[] };
          throw new Error(`Unsupported all SQL in test mock: ${sql}`);
        },
      };
    },
  } as unknown as D1Database;

  return { db, insertRow: (row: SharedCardRecord) => rows.set(row.content_hash, row) };
}

function createMemoryCache() {
  const store = new Map<string, Response>();
  const seenKeys: string[] = [];
  const cache: ShareImageCache = {
    async match(request: Request | string) {
      const key = typeof request === "string" ? request : request.url;
      seenKeys.push(key);
      const response = store.get(key);
      return response ? response.clone() : undefined;
    },
    async put(request: Request | string, response: Response) {
      const key = typeof request === "string" ? request : request.url;
      seenKeys.push(key);
      store.set(key, response.clone());
    },
  };
  return { cache, seenKeys };
}

function createRecord(overrides: Partial<SharedCardRecord> = {}): SharedCardRecord {
  return {
    id: "share-1",
    prompt: "Ship it",
    response: "Looks good.",
    username: "alice",
    theme: null,
    renderer_version: SHARE_CARD_RENDERER_VERSION,
    content_hash: "hash-1",
    created_at: "2026-05-13 12:26:00",
    ...overrides,
  };
}

function createTestApp(options: {
  renderer?: ShareImageRenderer;
  cache?: ShareImageCache;
  logger?: Pick<Console, "error" | "warn">;
} = {}) {
  const app = new Hono();
  app.route("/api/share-cards", shareCards);
  app.route("/", createSharePages(options));
  return app;
}

function createDbBackedApp(options?: Parameters<typeof createTestApp>[0]) {
  return { ...createShareCardMockDB(), app: createTestApp(options) };
}

async function createCard(app: Hono, env: AppBindings, body?: Record<string, unknown>) {
  return app.request("https://share.example/api/share-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? { prompt: "Ship it", response: "Looks good.", username: "alice" }),
  }, env);
}

async function createCardJson<T>(app: Hono, env: AppBindings, body?: Record<string, unknown>) {
  const response = await createCard(app, env, body);
  return response.json() as Promise<T>;
}

function expectPublicPageImageMetadata(html: string) {
  for (const fragment of [
    PAGE_IMAGE_FRAGMENT,
    `<meta property="og:image" content="${PUBLIC_IMAGE_URL}">`,
    `<meta name="twitter:image" content="${PUBLIC_IMAGE_URL}">`,
    '<meta name="twitter:card" content="summary_large_image">',
  ]) {
    expect(html).toContain(fragment);
  }
}

describe("share image and public share routes", () => {
  it("redirects /share/render/:shareId to the frontend render route", async () => {
    const { db, app } = createDbBackedApp();
    const env = { DB: db, ALLOWED_ORIGINS: APP_ORIGIN, APP_BASE_ORIGIN: APP_ORIGIN };
    const { shareId } = await createCardJson<{ shareId: string }>(app, env);
    const res = await app.request(`https://share.example/share/render/${shareId}`, {}, env);
    expect(res.status).toBe(308);
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    const renderUrl = new URL(location!);
    expect(renderUrl.origin).toBe(APP_ORIGIN);
    expect(renderUrl.pathname).toBe("/share-card-render.html");
    expect(renderUrl.searchParams.get("sid")).toBe(shareId);
    expect(renderUrl.searchParams.get("p")).toBe("Ship it");
    expect(renderUrl.searchParams.get("r")).toBe("Looks good.");
    expect(renderUrl.searchParams.get("u")).toBe("alice");
  });

  it("returns public unfurl metadata from /s/:shareId with absolute image URLs", async () => {
    const { db, app } = createDbBackedApp();
    const env = {
      DB: db,
      SHARE_CARD_BASE_ORIGIN: PUBLIC_SHARE_ORIGIN,
      ALLOWED_ORIGINS: APP_ORIGIN,
      APP_BASE_ORIGIN: APP_ORIGIN,
    };
    const { shareId } = await createCardJson<{ shareId: string }>(app, env);
    const res = await app.request(`https://share.example/s/${shareId}`, {}, env);
    const html = await res.text();
    expect(res.status).toBe(200);
    expectPublicPageImageMetadata(html);
    expect(html).toContain(`href="${APP_ORIGIN}/"`);
  });

  it.each([
    {
      name: "uses APP_BASE_ORIGIN for the share-page CTA when multiple allowed origins exist",
      env: {
        SHARE_CARD_BASE_ORIGIN: PUBLIC_SHARE_ORIGIN,
        ALLOWED_ORIGINS: STAGING_ALLOWED_ORIGINS,
        APP_BASE_ORIGIN: "https://claudecope.com",
      },
      expectedHref: 'href="https://claudecope.com/"',
    },
    {
      name: "prefers a non-local allowed origin for the share-page CTA when APP_BASE_ORIGIN is unset",
      env: {
        SHARE_CARD_BASE_ORIGIN: PUBLIC_SHARE_ORIGIN,
        ALLOWED_ORIGINS: STAGING_ALLOWED_ORIGINS,
      },
      expectedHref: 'href="https://staging.example.com/"',
    },
  ])("$name", async ({ env, expectedHref }) => {
    const { db, app } = createDbBackedApp();
    const requestEnv = { DB: db, ...env };
    const { shareId } = await createCardJson<{ shareId: string }>(app, requestEnv);
    const res = await app.request(`https://worker.example/s/${shareId}`, {}, requestEnv);
    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toContain(expectedHref);
  });

  it("uses the request origin for public share URLs when no explicit public share origin is configured", async () => {
    const { db, app } = createDbBackedApp();
    const response = await app.request("https://worker.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Ship it", response: "Looks good.", username: "alice" }),
    }, {
      DB: db,
      ALLOWED_ORIGINS: STAGING_ALLOWED_ORIGINS,
    });
    const created = await response.json() as { imageUrl: string; shareUrl: string };
    expect(created.imageUrl).toBe("https://worker.example/api/share-image/share-1");
    expect(created.shareUrl).toBe("https://worker.example/s/share-1");
  });

  it("returns image/png with immutable cache headers and reuses the same cache key on repeated requests", async () => {
    const { cache, seenKeys } = createMemoryCache();
    const renderer: ShareImageRenderer = {
      renderCardPng: vi.fn().mockResolvedValue(new Uint8Array([137, 80, 78, 71])),
    };
    const { db, app } = createDbBackedApp({ renderer, cache });
    const { shareId, imageUrl } = await createCardJson<{ shareId: string; imageUrl: string }>(app, { DB: db });
    const first = await app.request(imageUrl, {}, { DB: db });
    const second = await app.request(imageUrl, {}, { DB: db });
    const firstBytes = new Uint8Array(await first.arrayBuffer());
    const secondBytes = new Uint8Array(await second.arrayBuffer());
    expect(shareId).toBe("share-1");
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toBe("image/png");
    expect(first.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(second.status).toBe(200);
    expect(firstBytes).toEqual(new Uint8Array([137, 80, 78, 71]));
    expect(secondBytes).toEqual(new Uint8Array([137, 80, 78, 71]));
    expect(renderer.renderCardPng).toHaveBeenCalledTimes(1);
    expect(seenKeys).toContain(`https://share-image-cache.invalid/__share-image-cache/${SHARE_CARD_RENDERER_VERSION}/share-1.png`);
  });

  it("dedupes concurrent image renders for the same cache miss", async () => {
    const { cache } = createMemoryCache();
    let resolvePng: ((value: Uint8Array) => void) | undefined;
    const record = createRecord();
    const renderer: ShareImageRenderer = {
      renderCardPng: vi.fn().mockImplementation(() => new Promise<Uint8Array>((resolve) => {
        resolvePng = resolve;
      })),
    };
    const firstRequest = getCachedOrRenderedShareImage({
      record,
      renderUrl: "https://app.example.com/share-card-render/share-1",
      cache,
      renderer,
    });
    const secondRequest = getCachedOrRenderedShareImage({
      record,
      renderUrl: "https://app.example.com/share-card-render/share-1",
      cache,
      renderer,
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(renderer.renderCardPng).toHaveBeenCalledTimes(1);

    resolvePng?.(new Uint8Array([137, 80, 78, 71]));

    const [{ response: first }, { response: second }] = await Promise.all([firstRequest, secondRequest]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(new Uint8Array(await first.arrayBuffer())).toEqual(new Uint8Array([137, 80, 78, 71]));
    expect(new Uint8Array(await second.arrayBuffer())).toEqual(new Uint8Array([137, 80, 78, 71]));
    expect(renderer.renderCardPng).toHaveBeenCalledTimes(1);
  });

  it("uses the same cache key across different request origins", () => {
    const record = createRecord();
    const workersDevKey = buildShareImageCacheKey(record);
    const customDomainKey = buildShareImageCacheKey({ ...record });
    expect(workersDevKey.url).toBe(`https://share-image-cache.invalid/__share-image-cache/${SHARE_CARD_RENDERER_VERSION}/share-1.png`);
    expect(customDomainKey.url).toBe(workersDevKey.url);
  });

  it("returns explicit 500 responses and logs shareId-scoped context on renderer failures", async () => {
    const logger = { error: vi.fn(), warn: vi.fn() };
    const renderer: ShareImageRenderer = {
      renderCardPng: vi.fn().mockRejectedValue(new Error("browser crashed")),
    };
    const { db, app } = createDbBackedApp({ renderer, logger });
    const { imageUrl } = await createCardJson<{ imageUrl: string }>(app, { DB: db });
    const res = await app.request(imageUrl, {}, { DB: db });
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to render share image" });
    expect(logger.error).toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "browser crashed",
    });
  });
  it("returns 503 from the image route while leaving the public page metadata stable when browser rendering is unavailable", async () => {
    const logger = { error: vi.fn(), warn: vi.fn() };
    const { db, app } = createDbBackedApp({ logger });
    const env = { DB: db, SHARE_CARD_BASE_ORIGIN: PUBLIC_SHARE_ORIGIN, APP_BASE_ORIGIN: APP_ORIGIN };
    const { imageUrl, shareId } = await createCardJson<{ imageUrl: string; shareId: string }>(app, env);
    const imageRes = await app.request(imageUrl, {}, { DB: db });
    const pageRes = await app.request(`https://share.example/s/${shareId}`, {}, env);
    const pageHtml = await pageRes.text();
    expect(imageRes.status).toBe(503);
    await expect(imageRes.json()).resolves.toEqual({ error: "Browser rendering is not configured" });
    expect(pageRes.status).toBe(200);
    expectPublicPageImageMetadata(pageHtml);
    expect(logger.error).toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "Browser rendering binding is not configured",
    });
  });
  it("keeps image metadata and inline images on the public page when rendering fails", async () => {
    const logger = { error: vi.fn(), warn: vi.fn() };
    const renderer: ShareImageRenderer = { renderCardPng: vi.fn().mockRejectedValue(new Error("browser crashed")) };
    const { db, app } = createDbBackedApp({ renderer, logger });
    const env = { DB: db, SHARE_CARD_BASE_ORIGIN: PUBLIC_SHARE_ORIGIN, APP_BASE_ORIGIN: APP_ORIGIN };
    const { shareId } = await createCardJson<{ shareId: string }>(app, env);
    const pageRes = await app.request(`https://share.example/s/${shareId}`, {}, env);
    const pageHtml = await pageRes.text();
    expect(pageRes.status).toBe(200);
    expectPublicPageImageMetadata(pageHtml);
    expect(logger.error).not.toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "browser crashed",
    });
  });
  it("returns 404 for unknown share IDs across the public routes", async () => {
    const { db, app } = createDbBackedApp();
    for (const path of ["/share/render/missing", "/api/share-image/missing"]) {
      const response = await app.request(`https://share.example${path}`, {}, { DB: db });
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({ error: "Share card not found" });
    }
    const pageRes = await app.request("https://share.example/s/missing", {}, { DB: db });
    expect(pageRes.status).toBe(404);
    expect(pageRes.headers.get("content-type")).toContain("text/html");
    await expect(pageRes.text()).resolves.toContain("Share not found");
  });
  it("rejects persisted rows with unsupported renderer_version", async () => {
    const logger = { error: vi.fn(), warn: vi.fn() };
    const { db, insertRow, app } = createDbBackedApp({ logger });
    insertRow(createRecord({ renderer_version: "2026-05-12", content_hash: "hash-legacy" }));
    for (const path of ["/share/render/share-1", "/api/share-image/share-1"]) {
      const response = await app.request(`https://share.example${path}`, {}, { DB: db });
      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toEqual({ error: "Unsupported share card renderer version" });
    }
    const pageRes = await app.request("https://share.example/s/share-1", {}, { DB: db });
    expect(pageRes.status).toBe(409);
    expect(pageRes.headers.get("content-type")).toContain("text/html");
    await expect(pageRes.text()).resolves.toContain("Share unavailable");
    expect(logger.error).toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "Unsupported share card renderer version: 2026-05-12",
    });
  });

  it("truncates public page excerpts on grapheme boundaries", () => {
    const descriptionHtml = renderPublicSharePageHtml(createRecord({ prompt: `${"🙂".repeat(180)}x`, response: `${"🚀".repeat(220)}y` }), {
      imageUrl: "https://public.example.com/api/share-image/share-1",
      pageImageUrl: "https://share.example/api/share-image/share-1",
      shareUrl: "https://public.example.com/s/share-1",
      appUrl: "https://app.example.com/",
    });
    expect(descriptionHtml).toContain(`${"🙂".repeat(177)}...`);
    expect(descriptionHtml).toContain(`${"🚀".repeat(217)}...`);
  });

  it("keeps the legacy image path as a redirect from the shareCards router", async () => {
    const app = new Hono();
    app.route("/api/share-cards", shareCards);
    const res = await app.request("https://share.example/api/share-cards/share-1/image");
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://share.example/api/share-image/share-1");
  });
});
