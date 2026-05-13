import { Hono } from "hono";
import {
  SHARE_CARD_RENDERER_VERSION,
  computeShareCardContentHash,
  validateAndNormalizeShareCardInput,
} from "@claude-cope/shared/shareCards";
import { buildPublicShareUrls } from "../utils/shareImages";
import { verifyShareCardClaim } from "../utils/shareCardClaims";

type Env = {
  Bindings: {
    DB: D1Database;
    ALLOWED_ORIGINS?: string;
    SHARE_CARD_BASE_ORIGIN?: string;
    SHARE_CARD_SIGNING_SECRET?: string;
    FREE_ACCOUNT_COOKIE_SECRET?: string;
  };
  Variables: {
    sessionId: string;
  };
};

type SharedCardRow = {
  id: string;
};

type SharedCardRecord = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
};

const shareCards = new Hono<Env>();

function prewarmShareImage(url: string, ctx: { waitUntil?: (promise: Promise<unknown>) => void } | undefined) {
  if (!ctx?.waitUntil) return;
  ctx.waitUntil(
    fetch(url, { method: "GET" }).catch(() => undefined),
  );
}

function getExecutionContext(c: { executionCtx: { waitUntil: (promise: Promise<unknown>) => void } }): { waitUntil: (promise: Promise<unknown>) => void } | undefined {
  try {
    return c.executionCtx;
  } catch {
    return undefined;
  }
}

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

  const bodyRecord = typeof body === "object" && body !== null
    ? body as Record<string, unknown>
    : null;

  const shareClaim = typeof bodyRecord?.shareClaim === "string"
    ? bodyRecord.shareClaim
    : null;
  if (!shareClaim) {
    return c.json({ error: "shareClaim is required" }, 400);
  }

  const sessionId = c.get("sessionId");
  if (!sessionId) {
    return c.json({ error: "Session is not available" }, 403);
  }

  const verifiedClaim = await verifyShareCardClaim(c.env, shareClaim, sessionId);
  if (!verifiedClaim) {
    return c.json({ error: "Invalid share claim" }, 403);
  }

  const normalized = validateAndNormalizeShareCardInput({
    prompt: verifiedClaim.p,
    response: verifiedClaim.r,
    username: verifiedClaim.u,
    theme: bodyRecord?.theme,
  });
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

  const urls = buildPublicShareUrls(c.req.url, c.env, row.id);
  prewarmShareImage(urls.imageUrl, getExecutionContext(c));

  return c.json(
    urls,
    200,
    { "Cache-Control": "no-store" },
  );
});

shareCards.get("/:id", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const shareId = c.req.param("id");
  const row = await db
    .prepare("SELECT id, prompt, response, username, theme, renderer_version FROM shared_cards WHERE id = ?")
    .bind(shareId)
    .first<SharedCardRecord>();

  if (!row) {
    return c.json({ error: "Share card not found" }, 404);
  }

  return c.json({
    shareId: row.id,
    prompt: row.prompt,
    response: row.response,
    username: row.username,
    theme: row.theme,
    rendererVersion: row.renderer_version,
  }, 200, {
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

export default shareCards;
