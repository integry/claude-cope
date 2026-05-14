import { type Context, Hono } from "hono";
import {
  buildShareImageRouteContext,
  type ShareImageBindings,
  type ShareImageCache,
  type ShareImageLogger,
  type ShareImageRenderer,
  getCachedOrRenderedShareImage,
  getDefaultShareImageCache,
  getDefaultShareImageRenderer,
  hasSupportedShareCardRendererVersion,
  loadShareCardRecord,
  logShareImageFailure,
  renderPublicSharePageHtml,
  unsupportedShareCardRendererVersionError,
} from "../utils/shareImages";
import { escapeHtml } from "../utils/shareTextLayout";

type Env = {
  Bindings: ShareImageBindings;
};

type SharePageDependencies = {
  cache?: ShareImageCache;
  renderer?: ShareImageRenderer;
  logger?: ShareImageLogger;
};

function renderSharePageErrorHtml(title: string, detail: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>:root{color-scheme:light;font-family:Georgia,"Times New Roman",serif;background:linear-gradient(180deg,#f5f1e8 0%,#ebe2d1 100%);color:#1b2631}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.page{width:min(100%,680px);padding:32px;border-radius:28px;background:rgba(255,252,246,.94);box-shadow:0 28px 80px rgba(27,38,49,.14);border:1px solid rgba(27,38,49,.08)}.eyebrow{margin:0 0 10px;font:700 12px/1.2 "Courier New",Courier,monospace;letter-spacing:.16em;text-transform:uppercase;color:#114b5f}h1{margin:0 0 12px;font-size:clamp(30px,4vw,40px);line-height:1.05}p{margin:0;font-size:18px;line-height:1.5}</style></head><body><main class="page"><p class="eyebrow">Claude Cope share</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p></main></body></html>`;
}

export function createSharePages(deps: SharePageDependencies = {}) {
  const sharePages = new Hono<Env>();
  const logger = deps.logger ?? console;

  const loadSupportedRecord = async (c: Context<Env>) => {
    const db = c.env?.DB;
    if (!db) return { response: c.json({ error: "Database is not configured" }, 500) };

    const shareId = c.req.param("shareId");
    if (!shareId) return { response: c.json({ error: "Share card not found" }, 404) };

    const record = await loadShareCardRecord(db, shareId);
    if (!record) return { response: c.json({ error: "Share card not found" }, 404) };
    if (!hasSupportedShareCardRendererVersion(record)) {
      return { response: c.json({ error: "Unsupported share card renderer version" }, 409), record };
    }

    return { record };
  };

  sharePages.get("/share/render/:shareId", async (c) => {
    const loaded = await loadSupportedRecord(c);
    if ("response" in loaded) return loaded.response;
    const { record } = loaded;
    const context = buildShareImageRouteContext(c.req.url, c.env, record);
    return c.redirect(context.renderUrl, 308);
  });

  const imageHandler = async (c: Context<Env>) => {
    const loaded = await loadSupportedRecord(c);
    if ("response" in loaded) {
      if (loaded.record) {
        logShareImageFailure(logger, loaded.record.id, unsupportedShareCardRendererVersionError(loaded.record));
      }
      return loaded.response;
    }
    const { record } = loaded;
    try {
      const context = buildShareImageRouteContext(c.req.url, c.env, record);
      const renderer = deps.renderer ?? getDefaultShareImageRenderer(c.env);
      if (!renderer) {
        logShareImageFailure(logger, record.id, "Browser rendering binding is not configured");
        return c.json({ error: "Browser rendering is not configured" }, 503);
      }
      const { response } = await getCachedOrRenderedShareImage({ record, renderUrl: context.renderUrl, cache: deps.cache ?? getDefaultShareImageCache(), renderer });
      return response;
    } catch (error) {
      logShareImageFailure(logger, record.id, error);
      return c.json({ error: "Failed to render share image" }, 500);
    }
  };

  sharePages.get("/api/share-image/:shareId", imageHandler);

  sharePages.get("/s/:shareId", async (c) => {
    const loaded = await loadSupportedRecord(c);
    if ("response" in loaded) {
      const status = (loaded.response?.status ?? 500) as 404 | 409 | 500;
      const title = status === 404 ? "Share not found" : "Share unavailable";
      const detail = status === 404
        ? "This share does not exist or is no longer available."
          : status === 409
          ? "This share uses an older renderer version and can no longer be displayed."
          : "This share page is temporarily unavailable.";
      return c.html(renderSharePageErrorHtml(title, detail), status, {
        "Cache-Control": "no-store",
      });
    }
    const { record } = loaded;

    const context = buildShareImageRouteContext(c.req.url, c.env, record);
    return c.html(renderPublicSharePageHtml(record, context), 200, {
      "Cache-Control": "no-store",
    });
  });

  sharePages.get("/share/:shareId", (c) => {
    const location = new URL(`/s/${c.req.param("shareId")}`, c.req.url).toString();
    return c.redirect(location, 308);
  });

  return sharePages;
}

const sharePages = createSharePages();

export default sharePages;
