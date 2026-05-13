import { Hono } from "hono";
import {
  SHARE_CARD_RENDERER_VERSION,
  computeShareCardContentHash,
  validateAndNormalizeShareCardInput,
} from "@claude-cope/shared/shareCards";
import { buildPublicShareUrls } from "../utils/shareImages";

type Env = {
  Bindings: {
    DB: D1Database;
    ALLOWED_ORIGINS?: string;
    SHARE_CARD_BASE_ORIGIN?: string;
  };
};

type SharedCardRow = {
  id: string;
};

const shareCards = new Hono<Env>();

shareCards.get("/:id/image", (c) => {
  const location = new URL(`/api/share-image/${c.req.param("id")}`, c.req.url).toString();
  return c.redirect(location, 308);
});

shareCards.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const normalized = validateAndNormalizeShareCardInput(body);
  if (!normalized.ok) {
    return c.json({ error: normalized.error }, 400);
  }

  const contentHash = await computeShareCardContentHash(normalized.value);

  await db
    .prepare(
      "INSERT OR IGNORE INTO shared_cards (prompt, response, username, theme, renderer_version, content_hash) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      normalized.value.prompt,
      normalized.value.response,
      normalized.value.username,
      normalized.value.theme ?? null,
      normalized.value.rendererVersion ?? SHARE_CARD_RENDERER_VERSION,
      contentHash,
    )
    .run();

  const row = await db
    .prepare("SELECT id FROM shared_cards WHERE content_hash = ?")
    .bind(contentHash)
    .first<SharedCardRow>();

  if (!row?.id) {
    return c.json({ error: "Failed to persist share card" }, 500);
  }

  return c.json(
    buildPublicShareUrls(c.req.url, c.env, row.id),
    200,
    { "Cache-Control": "no-store" },
  );
});

export default shareCards;
