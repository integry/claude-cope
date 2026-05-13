import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { SHARE_CARD_RENDERER_VERSION } from "@claude-cope/shared/shareCards";
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

type AppBindings = {
  DB?: D1Database;
  ALLOWED_ORIGINS?: string;
  SHARE_CARD_BASE_ORIGIN?: string;
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

              if (upper === "SELECT ID, PROMPT, RESPONSE, USERNAME, THEME, RENDERER_VERSION FROM SHARED_CARDS WHERE ID = ?") {
                const row = Array.from(rows.values()).find((value) => value.id === String(args[0]));
                return row
                  ? {
                    id: row.id,
                    prompt: row.prompt,
                    response: row.response,
                    username: row.username,
                    theme: row.theme,
                    renderer_version: row.renderer_version,
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

  return { db, getRows: () => Array.from(rows.values()) };
}

function createTestApp() {
  const app = new Hono();
  app.route("/api/share-cards", shareCards);
  return app;
}

async function createCard(app: Hono, env: AppBindings, body?: Record<string, unknown>) {
  return app.request("https://share.example/api/share-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? { prompt: "Ship it", response: "Looks good.", username: "alice" }),
  }, env);
}

describe("GET /api/share-cards/:id/image", () => {
  it("returns 404 when the share card does not exist", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();

    const res = await app.request("https://share.example/api/share-cards/missing/image", {}, { DB: db });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "Share card not found" });
  });

  it("returns 500 when the database binding is missing for image requests", async () => {
    const app = createTestApp();

    const res = await app.request("https://share.example/api/share-cards/share-1/image");

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Database is not configured" });
  });

  it("returns 500 when the database binding is missing for create requests", async () => {
    const app = createTestApp();

    const res = await createCard(app, {});

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Database is not configured" });
  });

  it("rejects persisted cards with an unsupported renderer version", async () => {
    const app = createTestApp();
    const { db, getRows } = createShareCardMockDB();
    const create = await createCard(app, { DB: db });
    const { imageUrl } = await create.json() as { imageUrl: string };
    getRows()[0]!.renderer_version = "2025-01-01";

    const res = await app.request(imageUrl, {}, { DB: db });

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Unsupported share card renderer version: 2025-01-01",
    });
  });

  it("truncates long usernames and themes before rendering them", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const username = "u".repeat(64);
    const theme = "sunset".repeat(10);
    const create = await createCard(app, { DB: db }, {
      prompt: "Ship it",
      response: "Looks good.",
      username,
      theme,
    });
    const { imageUrl } = await create.json() as { imageUrl: string };

    const svg = await (await app.request(imageUrl, {}, { DB: db })).text();

    expect(svg).toContain("Shared by @");
    expect(svg).toContain("\u2026");
    expect(svg).not.toContain(`Shared by @${username}`);
    expect(svg).not.toContain(theme.toUpperCase());
  });

  it("wraps wide glyphs more conservatively than ASCII text", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const create = await createCard(app, { DB: db }, {
      prompt: "漢".repeat(25),
      response: "Looks good.",
      username: "alice",
      theme: SHARE_CARD_RENDERER_VERSION,
    });
    const { imageUrl } = await create.json() as { imageUrl: string };

    const svg = await (await app.request(imageUrl, {}, { DB: db })).text();

    expect(svg).toContain(`>${"漢".repeat(24)}</text>`);
    expect(svg).toContain(">漢</text>");
  });
});
