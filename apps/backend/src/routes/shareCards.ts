import { Hono } from "hono";
import {
  computeShareCardContentHash,
  validateAndNormalizeShareCardInput,
} from "@claude-cope/shared/shareCards";

type Env = {
  Bindings: {
    DB: D1Database;
    ALLOWED_ORIGINS?: string;
  };
};

type SharedCardRow = {
  id: string;
};

type SharedCardImageRow = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
};

const shareCards = new Hono<Env>();

function getAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? "").split(",").map((value) => value.trim()).filter(Boolean);
}

function getSharePageOrigin(requestUrl: string, allowedOrigins: string[]) {
  const primaryAllowedOrigin = allowedOrigins[0];
  if (primaryAllowedOrigin) {
    try {
      return new URL(primaryAllowedOrigin).origin;
    } catch {
      // Fall back to the request origin if operators supply an invalid origin.
    }
  }
  return new URL(requestUrl).origin;
}

function buildShareCardUrls(requestUrl: string, allowedOrigins: string[], shareId: string) {
  const apiBase = new URL(requestUrl);
  const shareBase = getSharePageOrigin(requestUrl, allowedOrigins);
  return {
    shareId,
    imageUrl: new URL(`/api/share-cards/${shareId}/image`, apiBase).toString(),
    shareUrl: new URL(`/share/${shareId}`, shareBase).toString(),
  };
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapText(value: string, maxLineLength: number, maxLines: number): string[] {
  const rawLines = value.split("\n");
  const lines: string[] = [];
  let truncated = false;

  for (const rawLine of rawLines) {
    if (!rawLine) {
      lines.push("");
    } else {
      let remaining = rawLine;
      while (remaining.length > maxLineLength) {
        if (lines.length === maxLines) {
          truncated = true;
          break;
        }
        lines.push(remaining.slice(0, maxLineLength));
        remaining = remaining.slice(maxLineLength);
      }
      if (truncated) break;
      if (lines.length === maxLines) {
        truncated = true;
        break;
      }
      lines.push(remaining);
    }
    if (lines.length >= maxLines) {
      truncated = true;
      break;
    }
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
    truncated = true;
  }

  if (truncated && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].slice(0, Math.max(0, maxLineLength - 1))}\u2026`;
  }

  return lines;
}

function buildShareCardImage(row: SharedCardImageRow): string {
  const promptLines = wrapText(row.prompt, 48, 4);
  const responseLines = wrapText(row.response, 52, 6);
  const themeLabel = row.theme ?? "default";
  const textLines = [
    { x: 72, y: 104, className: "eyebrow", value: `Shared by @${row.username}` },
    { x: 72, y: 156, className: "heading", value: "Prompt" },
    ...promptLines.map((value, index) => ({
      x: 72,
      y: 196 + index * 34,
      className: "body",
      value,
    })),
    { x: 72, y: 378, className: "heading", value: "Response" },
    ...responseLines.map((value, index) => ({
      x: 72,
      y: 418 + index * 32,
      className: "body",
      value,
    })),
    { x: 1058, y: 104, className: "theme", value: themeLabel.toUpperCase() },
  ];

  const text = textLines
    .map(({ x, y, className, value }) => (
      `<text x="${x}" y="${y}" class="${className}">${escapeSvgText(value)}</text>`
    ))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Claude Cope share card ${escapeSvgText(row.id)}</title>
  <desc id="desc">Shared prompt and response by ${escapeSvgText(row.username)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0A2239"/>
      <stop offset="1" stop-color="#114B5F"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" rx="32" fill="url(#bg)"/>
  <rect x="48" y="48" width="1104" height="534" rx="24" fill="#07141F" fill-opacity="0.72" stroke="#3B8EA5" stroke-opacity="0.4"/>
  <style>
    .eyebrow { fill: #A9D6E5; font: 600 24px sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
    .heading { fill: #6FFFE9; font: 700 28px sans-serif; }
    .body { fill: #F4F7F5; font: 400 28px sans-serif; }
    .theme { fill: #FFD166; font: 700 22px sans-serif; text-anchor: end; letter-spacing: 0.12em; }
  </style>
  ${text}
</svg>`;
}

shareCards.get("/:id/image", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const row = await db
    .prepare("SELECT id, prompt, response, username, theme FROM shared_cards WHERE id = ?")
    .bind(c.req.param("id"))
    .first<SharedCardImageRow>();

  if (!row) {
    return c.json({ error: "Share card not found" }, 404);
  }

  return new Response(buildShareCardImage(row), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
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

  return c.json(buildShareCardUrls(c.req.url, getAllowedOrigins(c.env.ALLOWED_ORIGINS), row.id));
});

export default shareCards;
