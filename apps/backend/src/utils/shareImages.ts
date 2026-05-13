import puppeteer from "@cloudflare/puppeteer";
import { getAllowedOrigins } from "@claude-cope/shared/shareCards";

export const SHARE_CARD_ROOT_SELECTOR = "#share-card-root";
export const SHARE_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

export type SharedCardRecord = {
  id: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  renderer_version: string;
  created_at: string;
};

export type ShareImageBindings = {
  DB?: D1Database;
  ALLOWED_ORIGINS?: string;
  SHARE_CARD_BASE_ORIGIN?: string;
  BROWSER?: Fetcher;
};

export type ShareImageCache = {
  match(request: Request | string): Promise<Response | undefined>;
  put(request: Request | string, response: Response): Promise<unknown>;
};

export type ShareImageRenderer = {
  renderCardPng(input: {
    renderUrl: string;
    selector: string;
    width: number;
    height: number;
  }): Promise<Uint8Array | ArrayBuffer>;
};

export type ShareImageLogger = Pick<Console, "error" | "warn">;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildMetaDescription(record: SharedCardRecord): string {
  const summary = `${record.username} shared a Claude Cope exchange. Prompt: ${record.prompt.replace(/\s+/g, " ").trim()} Response: ${record.response.replace(/\s+/g, " ").trim()}`;
  return summary.length <= 280 ? summary : `${summary.slice(0, 277)}...`;
}

function buildVisibleExcerpt(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
}

function getPrimaryAppOrigin(rawAllowedOrigins?: string): string {
  const origins = getAllowedOrigins(rawAllowedOrigins);
  for (const origin of origins) {
    try {
      return new URL(origin).origin;
    } catch {
      continue;
    }
  }
  return "https://claudecope.com";
}

export function getPublicShareOrigin(requestUrl: string, env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS">): string {
  const candidates = [
    env.SHARE_CARD_BASE_ORIGIN?.trim(),
    new URL(requestUrl).origin,
    getPrimaryAppOrigin(env.ALLOWED_ORIGINS),
    "https://claudecope.com",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate).origin;
    } catch {
      continue;
    }
  }

  return "https://claudecope.com";
}

export function buildPublicShareUrls(requestUrl: string, env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS">, shareId: string) {
  const publicOrigin = getPublicShareOrigin(requestUrl, env);
  return {
    shareId,
    imageUrl: new URL(`/api/share-image/${shareId}`, publicOrigin).toString(),
    shareUrl: new URL(`/s/${shareId}`, publicOrigin).toString(),
  };
}

export function buildShareImageCacheKey(requestUrl: string, record: Pick<SharedCardRecord, "id" | "renderer_version">): Request {
  const cacheUrl = new URL(`/__share-image-cache/${encodeURIComponent(record.renderer_version)}/${encodeURIComponent(record.id)}.png`, requestUrl);
  return new Request(cacheUrl.toString(), { method: "GET" });
}

export async function loadShareCardRecord(db: D1Database, shareId: string): Promise<SharedCardRecord | null> {
  return db
    .prepare("SELECT id, prompt, response, username, theme, renderer_version, created_at FROM shared_cards WHERE id = ?")
    .bind(shareId)
    .first<SharedCardRecord>();
}

export function renderDeterministicShareCardHtml(record: SharedCardRecord): string {
  const themeLabel = escapeHtml((record.theme ?? "default").toUpperCase());
  const sharedByLabel = escapeHtml(`Shared by @${record.username}`);
  const prompt = escapeHtml(record.prompt);
  const response = escapeHtml(record.response);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>Claude Cope share ${escapeHtml(record.id)}</title>
    <style>
      :root { color-scheme: light; font-family: "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${SHARE_IMAGE_WIDTH}px; height: ${SHARE_IMAGE_HEIGHT}px; background: #04121c; }
      body { overflow: hidden; }
      ${SHARE_CARD_ROOT_SELECTOR} {
        width: ${SHARE_IMAGE_WIDTH}px; height: ${SHARE_IMAGE_HEIGHT}px; display: flex; flex-direction: column; justify-content: space-between; padding: 48px;
        background: radial-gradient(circle at top left, rgba(111, 255, 233, 0.14), transparent 34%), linear-gradient(135deg, #0a2239 0%, #114b5f 100%);
        color: #f4f7f5;
      }
      .frame { flex: 1; display: flex; flex-direction: column; border: 1px solid rgba(169, 214, 229, 0.24); border-radius: 28px; padding: 38px 40px; background: rgba(7, 20, 31, 0.78); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04); }
      .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px; gap: 16px; }
      .eyebrow { color: #a9d6e5; font-size: 22px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .theme { color: #ffd166; font-size: 18px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; text-align: right; }
      .columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; min-height: 0; flex: 1; }
      .panel { min-height: 0; padding: 24px 26px; border-radius: 22px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(169, 214, 229, 0.16); }
      .label { margin: 0 0 14px; color: #6fffe9; font-size: 24px; font-weight: 700; }
      pre { margin: 0; white-space: pre-wrap; word-break: break-word; font: 400 22px/1.42 "SFMono-Regular", "SF Mono", "Cascadia Code", Menlo, Consolas, monospace; color: #f4f7f5; }
    </style>
  </head>
  <body>
    <main id="share-card-root" aria-label="Claude Cope share card"><section class="frame"><header class="topbar"><div class="eyebrow">${sharedByLabel}</div><div class="theme">${themeLabel}</div></header><section class="columns"><article class="panel"><h1 class="label">Prompt</h1><pre>${prompt}</pre></article><article class="panel"><h2 class="label">Response</h2><pre>${response}</pre></article></section></section></main>
  </body>
</html>`;
}

export function renderPublicSharePageHtml(
  record: SharedCardRecord,
  urls: {
    imageUrl: string;
    shareUrl: string;
    appUrl: string;
  },
): string {
  const title = `${record.username} shared a Claude Cope exchange`;
  const description = buildMetaDescription(record);
  const promptExcerpt = buildVisibleExcerpt(record.prompt, 180);
  const responseExcerpt = buildVisibleExcerpt(record.response, 220);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(urls.shareUrl)}">
    <meta property="og:image" content="${escapeHtml(urls.imageUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(urls.imageUrl)}">
    <style>
      :root {
        color-scheme: light; font-family: Georgia, "Times New Roman", serif;
        background: radial-gradient(circle at top center, rgba(255, 209, 102, 0.2), transparent 28%), linear-gradient(180deg, #f5f1e8 0%, #ebe2d1 100%);
        color: #1b2631;
      }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .page { width: min(100%, 860px); padding: 28px; border-radius: 28px; background: rgba(255, 252, 246, 0.92); box-shadow: 0 28px 80px rgba(27, 38, 49, 0.14); border: 1px solid rgba(27, 38, 49, 0.08); }
      img { width: 100%; height: auto; display: block; border-radius: 22px; }
      .eyebrow { margin: 18px 0 10px; font: 700 12px/1.2 "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #114b5f; }
      h1 { margin: 0 0 14px; font-size: clamp(30px, 4vw, 42px); line-height: 1.05; }
      p { margin: 0 0 12px; font-size: 18px; line-height: 1.5; }
      .cta { display: inline-block; margin-top: 14px; padding: 12px 18px; border-radius: 999px; background: #0a2239; color: #fefcf6; text-decoration: none; font: 600 16px/1.2 "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif; }
    </style>
  </head>
  <body>
    <main class="page"><img src="${escapeHtml(urls.imageUrl)}" alt="${escapeHtml(title)}"><p class="eyebrow">Immutable share snapshot</p><h1>${escapeHtml(title)}</h1><p><strong>Prompt:</strong> ${escapeHtml(promptExcerpt)}</p><p><strong>Response:</strong> ${escapeHtml(responseExcerpt)}</p><a class="cta" href="${escapeHtml(urls.appUrl)}">Open Claude Cope</a></main>
  </body>
</html>`;
}

export class CloudflareBrowserShareImageRenderer implements ShareImageRenderer {
  constructor(private readonly browserBinding: Fetcher) {}

  async renderCardPng(input: {
    renderUrl: string;
    selector: string;
    width: number;
    height: number;
  }): Promise<Uint8Array> {
    const browser = await puppeteer.launch(this.browserBinding);
    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: input.width,
        height: input.height,
        deviceScaleFactor: 1,
      });
      await page.goto(input.renderUrl, { waitUntil: "networkidle0" });
      await page.waitForSelector(input.selector, { timeout: 10_000 });
      await page.evaluate(async (selector) => {
        await document.fonts.ready;
        const root = document.querySelector(selector);
        if (!root) {
          throw new Error(`Missing card root: ${selector}`);
        }
        const images = Array.from(root.querySelectorAll("img"));
        await Promise.all(images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve, reject) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => reject(new Error(`Failed image: ${img.currentSrc || img.src}`)), { once: true });
          });
        }));
      }, input.selector);

      const handle = await page.$(input.selector);
      if (!handle) {
        throw new Error(`Missing card root after wait: ${input.selector}`);
      }

      const screenshot = await handle.screenshot({ type: "png" });
      return screenshot instanceof Uint8Array ? screenshot : new Uint8Array(screenshot);
    } finally {
      await browser.close();
    }
  }
}

export function getDefaultShareImageCache(): ShareImageCache | undefined {
  const cacheStorage = globalThis.caches as CacheStorage & { default?: ShareImageCache } | undefined;
  return cacheStorage?.default;
}

export function getDefaultShareImageRenderer(env: Pick<ShareImageBindings, "BROWSER">): ShareImageRenderer | undefined {
  if (!env.BROWSER) return undefined;
  return new CloudflareBrowserShareImageRenderer(env.BROWSER);
}

export async function getCachedOrRenderedShareImage(input: {
  requestUrl: string;
  record: SharedCardRecord;
  renderUrl: string;
  cache?: ShareImageCache;
  renderer: ShareImageRenderer;
}): Promise<{ response: Response; cacheKey: Request }> {
  const cacheKey = buildShareImageCacheKey(input.requestUrl, input.record);
  const cached = input.cache ? await input.cache.match(cacheKey) : undefined;
  if (cached) {
    return { response: cached, cacheKey };
  }

  const png = await input.renderer.renderCardPng({
    renderUrl: input.renderUrl,
    selector: SHARE_CARD_ROOT_SELECTOR,
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
  });
  const bytes = png instanceof Uint8Array ? png : new Uint8Array(png);
  const body = new Uint8Array(bytes.byteLength);
  body.set(bytes);
  const response = new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": SHARE_IMAGE_CACHE_CONTROL,
    },
  });

  if (input.cache) {
    await input.cache.put(cacheKey, response.clone());
  }

  return { response, cacheKey };
}

export function buildShareImageRouteContext(requestUrl: string, env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS">, record: SharedCardRecord) {
  const urls = buildPublicShareUrls(requestUrl, env, record.id);
  return {
    ...urls,
    renderUrl: new URL(`/share/render/${record.id}`, requestUrl).toString(),
    appUrl: new URL("/", getPrimaryAppOrigin(env.ALLOWED_ORIGINS)).toString(),
  };
}

export function logShareImageFailure(logger: ShareImageLogger, shareId: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error("share image rendering failed", { shareId, error: detail });
}
