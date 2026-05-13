import {
  getAllowedOrigins,
  SHARE_CARD_DEFAULT_BASE_ORIGIN,
  SHARE_CARD_RENDERER_VERSION,
} from "@claude-cope/shared/shareCards";
import { escapeHtml, renderBoundedTextBlock } from "./shareTextLayout";

export const SHARE_CARD_ROOT_SELECTOR = "#share-card-root";
export const SHARE_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;
const SHARE_IMAGE_CACHE_ORIGIN = "https://share-image-cache.invalid";
const ELLIPSIS = "...";
const PROMPT_MAX_COLUMNS = 35;
const RESPONSE_MAX_COLUMNS = 35;
const PROMPT_MAX_LINES = 11;
const RESPONSE_MAX_LINES = 11;

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
  APP_BASE_ORIGIN?: string;
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

const graphemeSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter("en", { granularity: "grapheme" })
  : null;

function splitGraphemes(value: string): string[] {
  if (!value) return [];
  if (!graphemeSegmenter) return Array.from(value);
  return Array.from(graphemeSegmenter.segment(value), ({ segment }) => segment);
}

function truncateGraphemes(value: string, maxLength: number): string {
  const graphemes = splitGraphemes(value);
  if (graphemes.length <= maxLength) return value;
  if (maxLength <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxLength);
  return `${graphemes.slice(0, maxLength - ELLIPSIS.length).join("")}${ELLIPSIS}`;
}

function buildMetaDescription(record: SharedCardRecord): string {
  const summary = `${record.username} shared a Claude Cope exchange. Prompt: ${record.prompt.replace(/\s+/g, " ").trim()} Response: ${record.response.replace(/\s+/g, " ").trim()}`;
  return truncateGraphemes(summary, 280);
}

function buildVisibleExcerpt(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return truncateGraphemes(normalized, maxLength);
}

function getFirstConfiguredOrigin(rawOrigins?: string): string | undefined {
  if (!rawOrigins?.trim()) return undefined;
  const origins = getAllowedOrigins(rawOrigins);
  for (const origin of origins) {
    try {
      return new URL(origin).origin;
    } catch {
      continue;
    }
  }
  return undefined;
}

function getOrigin(candidate?: string): string | undefined {
  if (!candidate) return undefined;
  try {
    return new URL(candidate).origin;
  } catch {
    return undefined;
  }
}

function getPrimaryAppOrigin(env: Pick<ShareImageBindings, "APP_BASE_ORIGIN" | "ALLOWED_ORIGINS">): string {
  const candidates = [
    env.APP_BASE_ORIGIN?.trim(),
    getFirstConfiguredOrigin(env.ALLOWED_ORIGINS),
    SHARE_CARD_DEFAULT_BASE_ORIGIN,
  ];

  for (const candidate of candidates) {
    const origin = getOrigin(candidate);
    if (origin) return origin;
  }

  return SHARE_CARD_DEFAULT_BASE_ORIGIN;
}

export function getPublicShareOrigin(
  requestUrl: string,
  env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS">,
): string {
  const candidates = [
    env.SHARE_CARD_BASE_ORIGIN?.trim(),
    getFirstConfiguredOrigin(env.ALLOWED_ORIGINS),
    getOrigin(requestUrl),
    SHARE_CARD_DEFAULT_BASE_ORIGIN,
  ];

  for (const candidate of candidates) {
    const origin = getOrigin(candidate);
    if (origin) return origin;
  }

  return SHARE_CARD_DEFAULT_BASE_ORIGIN;
}

export function buildPublicShareUrls(
  requestUrl: string,
  env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS">,
  shareId: string,
) {
  const publicOrigin = getPublicShareOrigin(requestUrl, env);
  return {
    shareId,
    imageUrl: new URL(`/api/share-image/${shareId}`, publicOrigin).toString(),
    shareUrl: new URL(`/s/${shareId}`, publicOrigin).toString(),
  };
}

export function buildShareImageCacheKey(record: Pick<SharedCardRecord, "id" | "renderer_version">): Request {
  const cacheUrl = new URL(`/__share-image-cache/${encodeURIComponent(record.renderer_version)}/${encodeURIComponent(record.id)}.png`, SHARE_IMAGE_CACHE_ORIGIN);
  return new Request(cacheUrl.toString(), { method: "GET" });
}

export async function loadShareCardRecord(db: D1Database, shareId: string): Promise<SharedCardRecord | null> {
  return db
    .prepare("SELECT id, prompt, response, username, theme, renderer_version, created_at FROM shared_cards WHERE id = ?")
    .bind(shareId)
    .first<SharedCardRecord>();
}

export function hasSupportedShareCardRendererVersion(record: Pick<SharedCardRecord, "renderer_version">): boolean {
  return record.renderer_version === SHARE_CARD_RENDERER_VERSION;
}

export function renderDeterministicShareCardHtml(record: SharedCardRecord): string {
  const themeLabel = escapeHtml((record.theme ?? "default").toUpperCase());
  const sharedByLabel = escapeHtml(`Shared by @${record.username}`);
  const prompt = renderBoundedTextBlock(record.prompt, PROMPT_MAX_COLUMNS, PROMPT_MAX_LINES);
  const response = renderBoundedTextBlock(record.response, RESPONSE_MAX_COLUMNS, RESPONSE_MAX_LINES);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>Claude Cope share ${escapeHtml(record.id)}</title><style>:root{color-scheme:light}*{box-sizing:border-box}html,body{margin:0;width:${SHARE_IMAGE_WIDTH}px;height:${SHARE_IMAGE_HEIGHT}px;background:#04121c}body{overflow:hidden}${SHARE_CARD_ROOT_SELECTOR}{width:${SHARE_IMAGE_WIDTH}px;height:${SHARE_IMAGE_HEIGHT}px;display:flex;flex-direction:column;justify-content:space-between;padding:48px;background:radial-gradient(circle at top left,rgba(111,255,233,.14),transparent 34%),linear-gradient(135deg,#0a2239 0%,#114b5f 100%);color:#f4f7f5}.frame{flex:1;display:flex;flex-direction:column;border:1px solid rgba(169,214,229,.24);border-radius:28px;padding:38px 40px;background:rgba(7,20,31,.78);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px;gap:16px}.eyebrow{color:#a9d6e5;font:700 22px/1.2 "Courier New",Courier,monospace;letter-spacing:.08em;text-transform:uppercase}.theme{color:#ffd166;font:700 18px/1.2 "Courier New",Courier,monospace;letter-spacing:.16em;text-transform:uppercase;text-align:right}.columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;min-height:0;flex:1}.panel{min-height:0;padding:24px 26px;border-radius:22px;background:rgba(255,255,255,.03);border:1px solid rgba(169,214,229,.16)}.label{margin:0 0 14px;color:#6fffe9;font:700 24px/1.2 "Courier New",Courier,monospace}.text{display:grid;grid-auto-rows:28px;row-gap:0;font:400 22px/28px "Courier New",Courier,monospace;color:#f4f7f5}.line{white-space:pre}.truncate::after{content:"";display:block}</style></head><body><main id="share-card-root" aria-label="Claude Cope share card"><section class="frame"><header class="topbar"><div class="eyebrow">${sharedByLabel}</div><div class="theme">${themeLabel}</div></header><section class="columns"><article class="panel"><h1 class="label">Prompt</h1><div class="text${prompt.truncated ? " truncate" : ""}">${prompt.html}</div></article><article class="panel"><h2 class="label">Response</h2><div class="text${response.truncated ? " truncate" : ""}">${response.html}</div></article></section></section></main></body></html>`;
}

export function renderPublicSharePageHtml(
  record: SharedCardRecord,
  urls: {
    imageUrl: string;
    pageImageUrl?: string;
    shareUrl: string;
    appUrl: string;
  },
): string {
  const title = `${record.username} shared a Claude Cope exchange`;
  const description = buildMetaDescription(record);
  const promptExcerpt = buildVisibleExcerpt(record.prompt, 180);
  const responseExcerpt = buildVisibleExcerpt(record.response, 220);

  const pageImageUrl = urls.pageImageUrl ?? urls.imageUrl;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(urls.shareUrl)}"><meta property="og:image" content="${escapeHtml(urls.imageUrl)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(urls.imageUrl)}"><style>:root{color-scheme:light;font-family:Georgia,"Times New Roman",serif;background:radial-gradient(circle at top center,rgba(255,209,102,.2),transparent 28%),linear-gradient(180deg,#f5f1e8 0%,#ebe2d1 100%);color:#1b2631}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.page{width:min(100%,860px);padding:28px;border-radius:28px;background:rgba(255,252,246,.92);box-shadow:0 28px 80px rgba(27,38,49,.14);border:1px solid rgba(27,38,49,.08)}img{width:100%;height:auto;display:block;border-radius:22px}.eyebrow{margin:18px 0 10px;font:700 12px/1.2 "Courier New",Courier,monospace;letter-spacing:.16em;text-transform:uppercase;color:#114b5f}h1{margin:0 0 14px;font-size:clamp(30px,4vw,42px);line-height:1.05}p{margin:0 0 12px;font-size:18px;line-height:1.5}.cta{display:inline-block;margin-top:14px;padding:12px 18px;border-radius:999px;background:#0a2239;color:#fefcf6;text-decoration:none;font:600 16px/1.2 "Courier New",Courier,monospace}</style></head><body><main class="page"><img src="${escapeHtml(pageImageUrl)}" alt="${escapeHtml(title)}"><p class="eyebrow">Immutable share snapshot</p><h1>${escapeHtml(title)}</h1><p><strong>Prompt:</strong> ${escapeHtml(promptExcerpt)}</p><p><strong>Response:</strong> ${escapeHtml(responseExcerpt)}</p><a class="cta" href="${escapeHtml(urls.appUrl)}">Open Claude Cope</a></main></body></html>`;
}

export class CloudflareBrowserShareImageRenderer implements ShareImageRenderer {
  constructor(private readonly browserBinding: Fetcher) {}

  async renderCardPng(input: {
    renderUrl: string;
    selector: string;
    width: number;
    height: number;
  }): Promise<Uint8Array> {
    const { default: puppeteer } = await import("@cloudflare/puppeteer");
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
  record: SharedCardRecord;
  renderUrl: string;
  cache?: ShareImageCache;
  renderer: ShareImageRenderer;
}): Promise<{ response: Response; cacheKey: Request }> {
  const cacheKey = buildShareImageCacheKey(input.record);
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

export function buildShareImageRouteContext(
  requestUrl: string,
  env: Pick<ShareImageBindings, "SHARE_CARD_BASE_ORIGIN" | "ALLOWED_ORIGINS" | "APP_BASE_ORIGIN">,
  record: SharedCardRecord,
) {
  const urls = buildPublicShareUrls(requestUrl, env, record.id);
  return {
    ...urls,
    pageImageUrl: new URL(`/api/share-image/${record.id}`, requestUrl).toString(),
    renderUrl: new URL(`/share/render/${record.id}`, requestUrl).toString(),
    appUrl: new URL("/", getPrimaryAppOrigin(env)).toString(),
  };
}

export function logShareImageFailure(logger: ShareImageLogger, shareId: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error("share image rendering failed", { shareId, error: detail });
}

export function unsupportedShareCardRendererVersionError(record: Pick<SharedCardRecord, "renderer_version">): Error {
  return new Error(`Unsupported share card renderer version: ${record.renderer_version}`);
}
