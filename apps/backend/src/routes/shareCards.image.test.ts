import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { SHARE_CARD_RENDERER_VERSION } from "@claude-cope/shared/shareCards";
import shareCards from "./shareCards";
import { createSharePages } from "./sharePages";
import {
  buildShareImageCacheKey,
  renderDeterministicShareCardHtml,
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

  return {
    db,
    getRows: () => Array.from(rows.values()),
    insertRow: (row: SharedCardRecord) => {
      rows.set(row.content_hash, row);
    },
  };
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

async function createCard(app: Hono, env: AppBindings, body?: Record<string, unknown>) {
  return app.request("https://share.example/api/share-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? { prompt: "Ship it", response: "Looks good.", username: "alice" }),
  }, env);
}

describe("share image and public share routes", () => {
  it("returns deterministic standalone HTML from /share/render/:shareId", async () => {
    const { db } = createShareCardMockDB();
    const app = createTestApp();
    const create = await createCard(app, { DB: db });
    const { shareId } = await create.json() as { shareId: string };

    const res = await app.request(`https://share.example/share/render/${shareId}`, {}, { DB: db });
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(html).toContain('id="share-card-root"');
    expect(html).toContain("width:1200px");
    expect(html).toContain("Shared by @alice");
    expect(html).not.toContain("posthog");
    expect(html).not.toContain("root\"></div>");
  });

  it("returns public unfurl metadata from /s/:shareId with absolute image URLs", async () => {
    const { db } = createShareCardMockDB();
    const app = createTestApp();
    const create = await createCard(app, {
      DB: db,
      SHARE_CARD_BASE_ORIGIN: "https://public.example.com",
      ALLOWED_ORIGINS: "https://app.example.com",
      APP_BASE_ORIGIN: "https://app.example.com",
    });
    const { shareId } = await create.json() as { shareId: string };

    const res = await app.request(`https://share.example/s/${shareId}`, {}, {
      DB: db,
      SHARE_CARD_BASE_ORIGIN: "https://public.example.com",
      ALLOWED_ORIGINS: "https://app.example.com",
      APP_BASE_ORIGIN: "https://app.example.com",
    });
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('<meta property="og:image" content="https://public.example.com/api/share-image/share-1">');
    expect(html).toContain('<meta name="twitter:image" content="https://public.example.com/api/share-image/share-1">');
    expect(html).toContain('<img src="https://share.example/api/share-image/share-1"');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('href="https://app.example.com/"');
  });

  it("uses APP_BASE_ORIGIN for the share-page CTA when multiple allowed origins exist", async () => {
    const { db } = createShareCardMockDB();
    const app = createTestApp();
    const create = await createCard(app, {
      DB: db,
      SHARE_CARD_BASE_ORIGIN: "https://public.example.com",
      ALLOWED_ORIGINS: "http://localhost:5173,https://staging.example.com",
      APP_BASE_ORIGIN: "https://claudecope.com",
    });
    const { shareId } = await create.json() as { shareId: string };

    const res = await app.request(`https://worker.example/s/${shareId}`, {}, {
      DB: db,
      SHARE_CARD_BASE_ORIGIN: "https://public.example.com",
      ALLOWED_ORIGINS: "http://localhost:5173,https://staging.example.com",
      APP_BASE_ORIGIN: "https://claudecope.com",
    });
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('href="https://claudecope.com/"');
  });

  it("returns image/png with immutable cache headers and reuses the same cache key on repeated requests", async () => {
    const { db } = createShareCardMockDB();
    const { cache, seenKeys } = createMemoryCache();
    const renderer: ShareImageRenderer = {
      renderCardPng: vi.fn().mockResolvedValue(new Uint8Array([137, 80, 78, 71])),
    };
    const app = createTestApp({ renderer, cache });
    const create = await createCard(app, { DB: db });
    const { shareId, imageUrl } = await create.json() as { shareId: string; imageUrl: string };

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

  it("uses the same cache key across different request origins", () => {
    const record = createRecord();
    const workersDevKey = buildShareImageCacheKey(record);
    const customDomainKey = buildShareImageCacheKey({ ...record });

    expect(workersDevKey.url).toBe(`https://share-image-cache.invalid/__share-image-cache/${SHARE_CARD_RENDERER_VERSION}/share-1.png`);
    expect(customDomainKey.url).toBe(workersDevKey.url);
  });

  it("returns explicit 500 responses and logs shareId-scoped context on renderer failures", async () => {
    const { db } = createShareCardMockDB();
    const logger = { error: vi.fn(), warn: vi.fn() };
    const renderer: ShareImageRenderer = {
      renderCardPng: vi.fn().mockRejectedValue(new Error("browser crashed")),
    };
    const app = createTestApp({ renderer, logger });
    const create = await createCard(app, { DB: db });
    const { imageUrl } = await create.json() as { imageUrl: string };

    const res = await app.request(imageUrl, {}, { DB: db });

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to render share image" });
    expect(logger.error).toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "browser crashed",
    });
  });

  it("returns 404 for unknown share IDs across the public routes", async () => {
    const { db } = createShareCardMockDB();
    const app = createTestApp();

    const renderRes = await app.request("https://share.example/share/render/missing", {}, { DB: db });
    const imageRes = await app.request("https://share.example/api/share-image/missing", {}, { DB: db });
    const pageRes = await app.request("https://share.example/s/missing", {}, { DB: db });

    expect(renderRes.status).toBe(404);
    await expect(renderRes.json()).resolves.toEqual({ error: "Share card not found" });
    expect(imageRes.status).toBe(404);
    await expect(imageRes.json()).resolves.toEqual({ error: "Share card not found" });
    expect(pageRes.status).toBe(404);
    expect(pageRes.headers.get("content-type")).toContain("text/html");
    await expect(pageRes.text()).resolves.toContain("Share not found");
  });

  it("rejects persisted rows with unsupported renderer_version", async () => {
    const { db, insertRow } = createShareCardMockDB();
    const logger = { error: vi.fn(), warn: vi.fn() };
    const app = createTestApp({ logger });
    insertRow(createRecord({
      renderer_version: "2026-05-12",
      content_hash: "hash-legacy",
    }));

    const renderRes = await app.request("https://share.example/share/render/share-1", {}, { DB: db });
    const imageRes = await app.request("https://share.example/api/share-image/share-1", {}, { DB: db });
    const pageRes = await app.request("https://share.example/s/share-1", {}, { DB: db });

    expect(renderRes.status).toBe(409);
    await expect(renderRes.json()).resolves.toEqual({ error: "Unsupported share card renderer version" });
    expect(imageRes.status).toBe(409);
    await expect(imageRes.json()).resolves.toEqual({ error: "Unsupported share card renderer version" });
    expect(pageRes.status).toBe(409);
    expect(pageRes.headers.get("content-type")).toContain("text/html");
    await expect(pageRes.text()).resolves.toContain("Share unavailable");
    expect(logger.error).toHaveBeenCalledWith("share image rendering failed", {
      shareId: "share-1",
      error: "Unsupported share card renderer version: 2026-05-12",
    });
  });

  it("keeps long text bounded, preserves blank lines, wraps wide glyphs conservatively, and escapes HTML in rendered card HTML", () => {
    const html = renderDeterministicShareCardHtml(createRecord({
      prompt: `line 1\n\n<tag>${"A".repeat(500)}`,
      response: `${"漢".repeat(200)}\n${"B".repeat(500)}`,
    }));

    expect(html).toContain('class="text truncate"');
    expect(html).toContain("line 1");
    expect(html).toContain("&nbsp;");
    expect(html).toContain("&lt;tag&gt;");
    expect(html).not.toContain("<tag>");
    expect(html).toContain(`${"漢".repeat(16)}...`);
    expect(html).not.toContain("漢".repeat(18));
    expect(html).toContain("...");
  });

  it("truncates public page excerpts on grapheme boundaries", () => {
    const descriptionHtml = renderPublicSharePageHtml(createRecord({
      prompt: `${"🙂".repeat(180)}x`,
      response: `${"🚀".repeat(220)}y`,
    }), {
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
