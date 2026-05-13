import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import {
  SHARE_CARD_MAX_RESPONSE_LENGTH,
  SHARE_CARD_MAX_THEME_LENGTH,
  SHARE_CARD_MAX_USERNAME_LENGTH,
  SHARE_CARD_RENDERER_VERSION,
} from "@claude-cope/shared/shareCards";
import shareCards from "./shareCards";
import { issueShareCardClaim } from "../utils/shareCardClaims";

type SharedCardRecord = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
  content_hash: string;
};

type ShareCardPayload = {
  prompt: string;
  response: string;
  username: string;
  theme?: string | number;
};

const TEST_SESSION_ID = "test-session";
const TEST_SHARE_SIGNING_SECRET = "test-share-signing-secret";

type AppBindings = {
  DB: D1Database;
  ALLOWED_ORIGINS?: string;
  SHARE_CARD_BASE_ORIGIN?: string;
  APP_BASE_ORIGIN?: string;
  FREE_ACCOUNT_COOKIE_SECRET?: string;
};

type AppVariables = {
  sessionId: string;
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

  return { db, getRowCount: () => rows.size, getRows: () => Array.from(rows.values()) };
}

function createTestApp() {
  const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();
  app.use("*", async (c, next) => {
    c.set("sessionId", TEST_SESSION_ID);
    await next();
  });
  app.route("/api/share-cards", shareCards);
  return app;
}

async function postShareCard(app: Hono, payload: ShareCardPayload, env: AppBindings) {
  return postShareCardToUrl(app, "https://share.example/api/share-cards", payload, env);
}

async function postShareCardToUrl(app: Hono, requestUrl: string, payload: ShareCardPayload, env: AppBindings) {
  const shareClaim = await issueShareCardClaim({
    FREE_ACCOUNT_COOKIE_SECRET: env.FREE_ACCOUNT_COOKIE_SECRET ?? TEST_SHARE_SIGNING_SECRET,
  }, {
    sessionId: TEST_SESSION_ID,
    prompt: payload.prompt,
    response: payload.response,
    username: payload.username,
  });
  return app.request(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shareClaim,
      ...(payload.theme !== undefined ? { theme: payload.theme } : {}),
    }),
  }, { ...env, FREE_ACCOUNT_COOKIE_SECRET: env.FREE_ACCOUNT_COOKIE_SECRET ?? TEST_SHARE_SIGNING_SECRET });
}

describe("POST /api/share-cards", () => {
  it("returns request-origin public share URLs for a new payload", async () => {
    const app = createTestApp();
    const { db, getRows } = createShareCardMockDB();
    const res = await postShareCard(app, {
      prompt: "  Ship it\r\n",
      response: "\r\nLooks good.\r\n",
      username: "  alice  ",
      theme: "  synthwave  ",
    }, { DB: db, ALLOWED_ORIGINS: "https://app.example.com,http://localhost:5173" });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://share.example/api/share-image/share-1",
      shareUrl: "https://share.example/s/share-1",
    });
    expect(getRows()).toEqual([{
      id: "share-1",
      prompt: "  Ship it\n",
      response: "\nLooks good.\n",
      username: "alice",
      theme: "synthwave",
      renderer_version: SHARE_CARD_RENDERER_VERSION,
      content_hash: expect.any(String),
    }]);
  });

  it("uses SHARE_CARD_BASE_ORIGIN when configured", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const res = await postShareCard(app, {
      prompt: "Ship it",
      response: "Looks good.",
      username: "alice",
    }, {
      DB: db,
      ALLOWED_ORIGINS: "http://localhost:5173,https://app.example.com",
      SHARE_CARD_BASE_ORIGIN: "https://public.example.com",
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://public.example.com/api/share-image/share-1",
      shareUrl: "https://public.example.com/s/share-1",
    });
  });

  it("uses the request origin for public share URLs when no share base origin is set", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const res = await postShareCardToUrl(app, "https://worker.example/api/share-cards", {
      prompt: "Ship it",
      response: "Looks good.",
      username: "alice",
    }, {
      DB: db,
      ALLOWED_ORIGINS: "http://localhost:5173,https://app.example.com",
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://worker.example/api/share-image/share-1",
      shareUrl: "https://worker.example/s/share-1",
    });
  });

  it("dedupes identical normalized payloads and reuses the same shareId", async () => {
    const app = createTestApp();
    const { db, getRowCount } = createShareCardMockDB();
    const first = await postShareCard(app, {
      prompt: "Hello\r\nworld",
      response: "\r\nResponse\r\n",
      username: "alice",
    }, { DB: db });
    const second = await postShareCard(app, {
      prompt: "Hello\nworld",
      response: "\nResponse\n",
      username: " alice ",
      theme: "   ",
    }, { DB: db });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.json()).toEqual(await second.json());
    expect(getRowCount()).toBe(1);
  });

  it("returns share-card data by id for frontend render routes", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    await postShareCard(app, {
      prompt: "Hello\nworld",
      response: "Looks **bad**",
      username: " alice ",
      theme: " default ",
    }, { DB: db });

    const res = await app.request("https://share.example/api/share-cards/share-1", {}, { DB: db });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      prompt: "Hello\nworld",
      response: "Looks **bad**",
      username: "alice",
      theme: "default",
      rendererVersion: SHARE_CARD_RENDERER_VERSION,
    });
    expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  });

  it("does not persist synthetic assistant metadata tags in shared card content", async () => {
    const app = createTestApp();
    const { db, getRows } = createShareCardMockDB();
    const taggedResponse = "Looks bad.\n[SPRINT_PROGRESS: 12]\n[USER_NEXT_MESSAGE: show me the logs]";
    const shareClaim = await issueShareCardClaim({
      FREE_ACCOUNT_COOKIE_SECRET: TEST_SHARE_SIGNING_SECRET,
    }, {
      sessionId: TEST_SESSION_ID,
      prompt: "Ship it?",
      response: taggedResponse
        .replace(/\[SPRINT_PROGRESS:[^\]]*\]/g, "")
        .replace(/\[USER_NEXT_MESSAGE:[^\]]*\]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
      username: "alice",
    });

    const res = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareClaim }),
    }, { DB: db, FREE_ACCOUNT_COOKIE_SECRET: TEST_SHARE_SIGNING_SECRET });

    expect(res.status).toBe(200);
    expect(getRows()).toEqual([{
      id: "share-1",
      prompt: "Ship it?",
      response: "Looks bad.",
      username: "alice",
      theme: null,
      renderer_version: SHARE_CARD_RENDERER_VERSION,
      content_hash: expect.any(String),
    }]);
  });

  it("keeps distinct prompt and response whitespace snapshots separate", async () => {
    const app = createTestApp();
    const { db, getRowCount } = createShareCardMockDB();
    const first = await postShareCard(app, {
      prompt: "Hello\nworld",
      response: "Response",
      username: "alice",
    }, { DB: db });
    const second = await postShareCard(app, {
      prompt: "  Hello\nworld  ",
      response: "  Response  ",
      username: "alice",
    }, { DB: db });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.json()).not.toEqual(await second.json());
    expect(getRowCount()).toBe(2);
  });

  it("rejects invalid payloads with 400", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const cases = [
      {
        body: { prompt: "ok", response: "ok", username: "alice" },
        expected: { error: "Invalid share claim" },
        rawBody: { shareClaim: "bad-claim" },
      },
      {
        body: { prompt: "ok", response: " \n\t ", username: "alice" },
        expected: { error: "response must be a non-empty string" },
      },
      {
        body: { prompt: "ok", response: "ok", username: "   " },
        expected: { error: "username must be a non-empty string" },
      },
      {
        body: { prompt: "ok", response: "ok", username: "alice", theme: 42 },
        expected: { error: "theme must be a string when provided" },
      },
      {
        body: { prompt: "ok", response: "a".repeat(SHARE_CARD_MAX_RESPONSE_LENGTH + 1), username: "alice" },
        expected: { error: `response exceeds maximum length of ${SHARE_CARD_MAX_RESPONSE_LENGTH}` },
      },
      {
        body: { prompt: "ok", response: "ok", username: "a".repeat(SHARE_CARD_MAX_USERNAME_LENGTH + 1) },
        expected: { error: `username exceeds maximum length of ${SHARE_CARD_MAX_USERNAME_LENGTH}` },
      },
      {
        body: { prompt: "ok", response: "ok", username: "alice", theme: "a".repeat(SHARE_CARD_MAX_THEME_LENGTH + 1) },
        expected: { error: `theme exceeds maximum length of ${SHARE_CARD_MAX_THEME_LENGTH}` },
      },
    ] satisfies Array<{ body: ShareCardPayload; expected: { error: string }; rawBody?: Record<string, unknown> }>;

    for (const testCase of cases) {
      const res = testCase.rawBody
        ? await app.request("https://share.example/api/share-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testCase.rawBody),
        }, { DB: db, FREE_ACCOUNT_COOKIE_SECRET: TEST_SHARE_SIGNING_SECRET })
        : await postShareCard(app, testCase.body, { DB: db });
      expect(res.status).toBe(testCase.rawBody ? 403 : 400);
      await expect(res.json()).resolves.toEqual(testCase.expected);
    }

    const invalidJson = await app.request("https://share.example/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }, { DB: db });

    expect(invalidJson.status).toBe(400);
    await expect(invalidJson.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });
});
