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

type ShareCardPayload = {
  prompt: string;
  response: string;
  username: string;
  theme?: string | number;
};

type AppBindings = {
  DB: D1Database;
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

  return { db, getRowCount: () => rows.size, getRows: () => Array.from(rows.values()) };
}

function createTestApp() {
  const app = new Hono();
  app.route("/api/share-cards", shareCards);
  return app;
}

async function postShareCard(app: Hono, payload: ShareCardPayload, env: AppBindings) {
  return app.request("https://share.example/api/share-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, env);
}

async function createAndFetchImage(app: Hono, payload: ShareCardPayload, env: AppBindings) {
  const create = await postShareCard(app, payload, env);
  const body = await create.json() as { imageUrl: string };
  const image = await app.request(body.imageUrl, {}, env);
  return { create, image, svg: await image.text() };
}

describe("POST /api/share-cards", () => {
  it("returns a stable shareId and URL shape for a new payload", async () => {
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
      imageUrl: "https://share.example/api/share-cards/share-1/image",
      shareUrl: "https://app.example.com/share/share-1",
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

  it("uses SHARE_CARD_BASE_ORIGIN instead of ALLOWED_ORIGINS ordering for shareUrl", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const res = await postShareCard(app, {
      prompt: "Ship it",
      response: "Looks good.",
      username: "alice",
    }, {
      DB: db,
      ALLOWED_ORIGINS: "http://localhost:5173,https://app.example.com",
      SHARE_CARD_BASE_ORIGIN: "https://app.example.com",
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://share.example/api/share-cards/share-1/image",
      shareUrl: "https://app.example.com/share/share-1",
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

  it("uses the default allowed frontend origin for shareUrl when ALLOWED_ORIGINS is unset", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const res = await app.request("https://api.example.com/api/share-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello", response: "World", username: "alice" }),
    }, { DB: db });

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    await expect(res.json()).resolves.toEqual({
      shareId: "share-1",
      imageUrl: "https://api.example.com/api/share-cards/share-1/image",
      shareUrl: "https://claudecope.com/share/share-1",
    });
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

  it("serves the advertised imageUrl", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const { image, svg } = await createAndFetchImage(app, {
      prompt: "Ship it",
      response: "Looks good.",
      username: "alice",
    }, { DB: db });

    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toContain("image/svg+xml");
    expect(svg).toContain("Shared by @alice");
  });

  it("renders exact-fit wrapped text without adding an ellipsis", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const { svg } = await createAndFetchImage(app, {
      prompt: "p".repeat(48 * 4),
      response: "r".repeat(52 * 6),
      username: "alice",
    }, { DB: db });

    expect(svg).toContain(`>${"p".repeat(48)}</text>`);
    expect(svg).not.toContain(`>${"p".repeat(47)}\u2026</text>`);
    expect(svg).toContain(`>${"r".repeat(52)}</text>`);
    expect(svg).not.toContain(`>${"r".repeat(51)}\u2026</text>`);
  });

  it("renders overflow text with an ellipsis on the last visible line", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const { svg } = await createAndFetchImage(app, {
      prompt: "p".repeat(48 * 4 + 1),
      response: "r".repeat(52 * 6 + 1),
      username: "alice",
    }, { DB: db });

    expect(svg).toContain(`>${"p".repeat(47)}\u2026</text>`);
    expect(svg).toContain(`>${"r".repeat(51)}\u2026</text>`);
  });

  it("wraps emoji text conservatively without splitting grapheme clusters", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const emoji = "👨‍👩‍👧‍👦";
    const { svg } = await createAndFetchImage(app, {
      prompt: emoji.repeat(97),
      response: "Looks good.",
      username: "alice",
    }, { DB: db });

    expect(svg).toContain(`>${emoji.repeat(24)}</text>`);
    expect(svg).toContain(`>${emoji.repeat(23)}\u2026</text>`);
    expect(svg).not.toContain("\uFFFD");
  });

  it("preserves embedded blank lines when rendering the image", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const { svg } = await createAndFetchImage(app, {
      prompt: "alpha\n\nomega",
      response: "first\n\nthird",
      username: "alice",
    }, { DB: db });

    expect(svg).toContain(">alpha</text><text x=\"72\" y=\"230\" class=\"body\"></text><text x=\"72\" y=\"264\" class=\"body\">omega</text>");
    expect(svg).toContain(">first</text><text x=\"72\" y=\"450\" class=\"body\"></text><text x=\"72\" y=\"482\" class=\"body\">third</text>");
  });

  it("escapes SVG-sensitive characters in rendered fields", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const { svg } = await createAndFetchImage(app, {
      prompt: `<tag> & "quote" 'apostrophe'`,
      response: "5 > 3 & 2 < 4",
      username: `ali<ce>&"'`,
      theme: `neo&<"'`,
    }, { DB: db });

    expect(svg).toContain("Shared by @ali&lt;ce&gt;&amp;&quot;&#39;");
    expect(svg).toContain("&lt;tag&gt; &amp; &quot;quote&quot; &#39;apostrophe&#39;");
    expect(svg).toContain("5 &gt; 3 &amp; 2 &lt; 4");
    expect(svg).toContain("NEO&amp;&lt;&quot;&#39;");
    expect(svg).not.toContain("<tag>");
  });

  it("rejects invalid payloads with 400", async () => {
    const app = createTestApp();
    const { db } = createShareCardMockDB();
    const cases = [
      {
        body: { prompt: "   ", response: "ok", username: "alice" },
        expected: { error: "prompt must be a non-empty string" },
      },
      {
        body: { prompt: "a".repeat(SHARE_CARD_MAX_PROMPT_LENGTH + 1), response: "ok", username: "alice" },
        expected: { error: `prompt exceeds maximum length of ${SHARE_CARD_MAX_PROMPT_LENGTH}` },
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
    ] satisfies Array<{ body: ShareCardPayload; expected: { error: string } }>;

    for (const testCase of cases) {
      const res = await postShareCard(app, testCase.body, { DB: db });
      expect(res.status).toBe(400);
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
