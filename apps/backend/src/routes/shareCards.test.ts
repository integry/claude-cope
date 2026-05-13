import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import {
  SHARE_CARD_MAX_PROMPT_LENGTH,
  SHARE_CARD_MAX_RESPONSE_LENGTH,
  SHARE_CARD_MAX_THEME_LENGTH,
  SHARE_CARD_MAX_USERNAME_LENGTH,
  SHARE_CARD_RENDERER_VERSION,
} from "@claude-cope/shared/shareCards";
import shareCards from "./shareCards";

type SharedCardRecord = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
  content_hash: string;
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
              if (upper === "SELECT ID, PROMPT, RESPONSE, USERNAME, THEME FROM SHARED_CARDS WHERE ID = ?") {
                const row = Array.from(rows.values()).find((value) => value.id === String(args[0]));
                if (!row) return null;
                return {
                  id: row.id,
                  prompt: row.prompt,
                  response: row.response,
                  username: row.username,
                  theme: row.theme,
                } as T;
              }
              throw new Error(`Unsupported first SQL in test mock: ${sql}`);
            },
            async all<T = unknown>() {
              if (upper.includes("SCHEMA_MIGRATIONS")) {
                return { results: [] as T[] };
              }
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
                  });
                }
                return { success: true };
              }
              if (upper.includes("SCHEMA_MIGRATIONS")) {
                return { success: true };
              }
              throw new Error(`Unsupported bound run SQL in test mock: ${sql}`);
            },
          };
        },
        async run() {
          if (upper.includes("SCHEMA_MIGRATIONS")) {
            return { success: true };
          }
          throw new Error(`Unsupported run SQL in test mock: ${sql}`);
        },
        async all<T = unknown>() {
          if (upper === "SELECT NAME FROM SCHEMA_MIGRATIONS") {
            return { results: [] as T[] };
          }
          throw new Error(`Unsupported all SQL in test mock: ${sql}`);
        },
      };
    },
  } as unknown as D1Database;

  return {
    db,
    getRowCount: () => rows.size,
    getRows: () => Array.from(rows.values()),
  };
}

function createTestApp() {
  const app = new Hono();
  app.route("/api/share-cards", shareCards);
  return app;
}

describe("POST /api/share-cards", () => {
  it("returns a stable shareId and URL shape for a new payload", async () => {
    const app = createTestApp();
    const { db, getRows } = createShareCardMockDB();

    const res = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "  Ship it\r\n",
        response: "\r\nLooks good.\r\n",
        username: "  alice  ",
        theme: "  synthwave  ",
      }),
    }, { DB: db, ALLOWED_ORIGINS: "https://app.example.com,http://localhost:5173" });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://share.example/api/share-cards/share-1/image",
      shareUrl: "https://app.example.com/share/share-1",
    });
    expect(getRows()).toEqual([
      {
        id: "share-1",
        prompt: "  Ship it\n",
        response: "\nLooks good.\n",
        username: "alice",
        theme: "synthwave",
        renderer_version: SHARE_CARD_RENDERER_VERSION,
        content_hash: expect.any(String),
      },
    ]);
  });

  it("dedupes identical normalized payloads and reuses the same shareId", async () => {
    const app = createTestApp();
    const { db, getRowCount } = createShareCardMockDB();

    const first = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Hello\r\nworld",
        response: "\r\nResponse\r\n",
        username: "alice",
      }),
    }, { DB: db });

    const second = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Hello\nworld",
        response: "\nResponse\n",
        username: " alice ",
        theme: "   ",
      }),
    }, { DB: db });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.json()).toEqual(await second.json());
    expect(getRowCount()).toBe(1);
  });

  it("keeps distinct prompt and response whitespace snapshots separate", async () => {
    const app = createTestApp();
    const { db, getRowCount } = createShareCardMockDB();

    const first = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Hello\nworld",
        response: "Response",
        username: "alice",
      }),
    }, { DB: db });

    const second = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "  Hello\nworld  ",
        response: "  Response  ",
        username: "alice",
      }),
    }, { DB: db });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.json()).not.toEqual(await second.json());
    expect(getRowCount()).toBe(2);
  });

  it("serves the advertised imageUrl", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();

    const create = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Ship it",
        response: "Looks good.",
        username: "alice",
      }),
    }, { DB: db });

    const body = await create.json() as { imageUrl: string };
    const image = await app.request(body.imageUrl, {}, { DB: db });

    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toContain("image/svg+xml");
    await expect(image.text()).resolves.toContain("Shared by @alice");
  });

  it("rejects invalid payloads with 400", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();

    const emptyPrompt = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "   ",
        response: "ok",
        username: "alice",
      }),
    }, { DB: db });

    expect(emptyPrompt.status).toBe(400);
    await expect(emptyPrompt.json()).resolves.toEqual({ error: "prompt must be a non-empty string" });

    const tooLongPrompt = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "a".repeat(SHARE_CARD_MAX_PROMPT_LENGTH + 1),
        response: "ok",
        username: "alice",
      }),
    }, { DB: db });

    expect(tooLongPrompt.status).toBe(400);
    await expect(tooLongPrompt.json()).resolves.toEqual({
      error: `prompt exceeds maximum length of ${SHARE_CARD_MAX_PROMPT_LENGTH}`,
    });

    const invalidJson = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }, { DB: db });

    expect(invalidJson.status).toBe(400);
    await expect(invalidJson.json()).resolves.toEqual({ error: "Invalid JSON body" });

    const emptyResponse = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: " \n\t ",
        username: "alice",
      }),
    }, { DB: db });

    expect(emptyResponse.status).toBe(400);
    await expect(emptyResponse.json()).resolves.toEqual({ error: "response must be a non-empty string" });

    const emptyUsername = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: "ok",
        username: "   ",
      }),
    }, { DB: db });

    expect(emptyUsername.status).toBe(400);
    await expect(emptyUsername.json()).resolves.toEqual({ error: "username must be a non-empty string" });

    const nonStringTheme = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: "ok",
        username: "alice",
        theme: 42,
      }),
    }, { DB: db });

    expect(nonStringTheme.status).toBe(400);
    await expect(nonStringTheme.json()).resolves.toEqual({ error: "theme must be a string when provided" });

    const tooLongResponse = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: "a".repeat(SHARE_CARD_MAX_RESPONSE_LENGTH + 1),
        username: "alice",
      }),
    }, { DB: db });

    expect(tooLongResponse.status).toBe(400);
    await expect(tooLongResponse.json()).resolves.toEqual({
      error: `response exceeds maximum length of ${SHARE_CARD_MAX_RESPONSE_LENGTH}`,
    });

    const tooLongUsername = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: "ok",
        username: "a".repeat(SHARE_CARD_MAX_USERNAME_LENGTH + 1),
      }),
    }, { DB: db });

    expect(tooLongUsername.status).toBe(400);
    await expect(tooLongUsername.json()).resolves.toEqual({
      error: `username exceeds maximum length of ${SHARE_CARD_MAX_USERNAME_LENGTH}`,
    });

    const tooLongTheme = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "ok",
        response: "ok",
        username: "alice",
        theme: "a".repeat(SHARE_CARD_MAX_THEME_LENGTH + 1),
      }),
    }, { DB: db });

    expect(tooLongTheme.status).toBe(400);
    await expect(tooLongTheme.json()).resolves.toEqual({
      error: `theme exceeds maximum length of ${SHARE_CARD_MAX_THEME_LENGTH}`,
    });
  });
});
