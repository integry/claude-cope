import { Hono } from "hono";
import {
  SHARE_CARD_RENDERER_VERSION,
  computeShareCardContentHash,
  getShareCardBaseOrigin,
  validateAndNormalizeShareCardInput,
} from "@claude-cope/shared/shareCards";

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

type SharedCardImageRow = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
};

const shareCards = new Hono<Env>();
let baseOriginFallbackWarningLogged = false;

function buildShareCardUrls(requestUrl: string, sharePageOrigin: string, shareId: string) {
  const apiBase = new URL(requestUrl);
  return {
    shareId,
    imageUrl: new URL(`/api/share-cards/${shareId}/image`, apiBase).toString(),
    shareUrl: new URL(`/share/${shareId}`, sharePageOrigin).toString(),
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

function splitGraphemes(value: string): string[] {
  const segmenterCtor = (globalThis.Intl as typeof Intl & {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity?: "grapheme" | "word" | "sentence" },
    ) => { segment(input: string): Iterable<{ segment: string }> };
  }).Segmenter;

  if (segmenterCtor) {
    return Array.from(new segmenterCtor(undefined, { granularity: "grapheme" }).segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

function getGraphemeDisplayWidth(grapheme: string): number {
  return Array.from(grapheme).every((character) => (character.codePointAt(0) ?? 0) <= 0x7F)
    ? grapheme.length
    : 2;
}

function clampTextByDisplayWidth(value: string, maxDisplayWidth: number): string {
  const graphemes = splitGraphemes(value);
  let width = 0;
  let result = "";

  for (const grapheme of graphemes) {
    const graphemeWidth = getGraphemeDisplayWidth(grapheme);
    if (width + graphemeWidth > maxDisplayWidth) {
      return `${result}\u2026`;
    }

    result += grapheme;
    width += graphemeWidth;
  }

  return result;
}

function wrapSingleLine(value: string, maxLineWidth: number, maxLines: number): { lines: string[]; consumedAll: boolean } {
  const lines: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const grapheme of splitGraphemes(value)) {
    const graphemeWidth = getGraphemeDisplayWidth(grapheme);
    if (currentLine && currentWidth + graphemeWidth > maxLineWidth) {
      lines.push(currentLine);
      if (lines.length === maxLines) {
        return { lines, consumedAll: false };
      }
      currentLine = grapheme;
      currentWidth = graphemeWidth;
      continue;
    }

    if (!currentLine && graphemeWidth > maxLineWidth) {
      lines.push(grapheme);
      if (lines.length === maxLines) {
        return { lines, consumedAll: false };
      }
      continue;
    }

    currentLine += grapheme;
    currentWidth += graphemeWidth;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return { lines, consumedAll: true };
}

function wrapText(value: string, maxLineWidth: number, maxLines: number): string[] {
  const rawLines = value.split("\n");
  const lines: string[] = [];
  let truncated = false;

  for (const [index, rawLine] of rawLines.entries()) {
    const remainingLines = maxLines - lines.length;
    if (remainingLines === 0) {
      truncated = true;
      break;
    }

    if (!rawLine) {
      lines.push("");
    } else {
      const wrappedLine = wrapSingleLine(rawLine, maxLineWidth, remainingLines);
      lines.push(...wrappedLine.lines);
      if (!wrappedLine.consumedAll) {
        truncated = true;
        break;
      }
    }

    if (lines.length === maxLines && index < rawLines.length - 1) {
      truncated = true;
      break;
    }
  }

  if (truncated && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = clampTextByDisplayWidth(lines[lastIndex], Math.max(1, maxLineWidth - 1));
  }

  return lines;
}

function buildShareCardImageV20260513(row: SharedCardImageRow): string {
  const promptLines = wrapText(row.prompt, 48, 4);
  const responseLines = wrapText(row.response, 52, 6);
  const sharedByLabel = clampTextByDisplayWidth(`Shared by @${row.username}`, 44);
  const themeLabel = clampTextByDisplayWidth((row.theme ?? "default").toUpperCase(), 18);
  const textLines = [
    { x: 72, y: 104, className: "eyebrow", value: sharedByLabel },
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
    .body { fill: #F4F7F5; font: 400 28px monospace; }
    .theme { fill: #FFD166; font: 700 22px sans-serif; text-anchor: end; letter-spacing: 0.12em; }
  </style>
  ${text}
</svg>`;
}

function buildShareCardImage(row: SharedCardImageRow): string | null {
  switch (row.renderer_version) {
    case SHARE_CARD_RENDERER_VERSION:
      return buildShareCardImageV20260513(row);
    default:
      return null;
  }
}

function getSharePageOrigin(env: Env["Bindings"]): string {
  if (!env.SHARE_CARD_BASE_ORIGIN && !baseOriginFallbackWarningLogged) {
    console.warn("SHARE_CARD_BASE_ORIGIN is not configured for share cards; falling back to ALLOWED_ORIGINS/default origin.");
    baseOriginFallbackWarningLogged = true;
  }

  return getShareCardBaseOrigin(env.SHARE_CARD_BASE_ORIGIN, env.ALLOWED_ORIGINS);
}

shareCards.get("/:id/image", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const row = await db
    .prepare("SELECT id, prompt, response, username, theme, renderer_version FROM shared_cards WHERE id = ?")
    .bind(c.req.param("id"))
    .first<SharedCardImageRow>();

  if (!row) {
    return c.json({ error: "Share card not found" }, 404);
  }

  const svg = buildShareCardImage(row);
  if (!svg) {
    return c.json({ error: `Unsupported share card renderer version: ${row.renderer_version}` }, 500);
  }

  return new Response(svg, {
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

  return c.json(
    buildShareCardUrls(
      c.req.url,
      getSharePageOrigin(c.env),
      row.id,
    ),
    200,
    { "Cache-Control": "no-store" },
  );
});

export default shareCards;
