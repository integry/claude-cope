import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import {
  SHARE_CARD_MAX_PROMPT_LENGTH,
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
    }, { DB: db });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://share.example/api/share-cards/share-1/image",
      shareUrl: "https://share.example/share/share-1",
    });
    expect(getRows()).toEqual([
      {
        id: "share-1",
        prompt: "Ship it",
        response: "Looks good.",
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
        username: " alice ",
        theme: "   ",
      }),
    }, { DB: db });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.json()).toEqual(await second.json());
    expect(getRowCount()).toBe(1);
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
  });
});
