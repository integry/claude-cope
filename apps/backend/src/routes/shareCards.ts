import { Hono } from "hono";
import {
  computeShareCardContentHash,
  validateAndNormalizeShareCardInput,
} from "@claude-cope/shared/shareCards";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

type SharedCardRow = {
  id: string;
};

const shareCards = new Hono<Env>();

function buildShareCardUrls(requestUrl: string, shareId: string) {
  const base = new URL(requestUrl);
  return {
    shareId,
    imageUrl: new URL(`/api/share-cards/${shareId}/image`, base).toString(),
    shareUrl: new URL(`/share/${shareId}`, base).toString(),
  };
}

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
      normalized.value.rendererVersion,
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

  return c.json(buildShareCardUrls(c.req.url, row.id));
});

export default shareCards;
