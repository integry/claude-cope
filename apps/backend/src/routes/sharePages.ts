import { type Context, Hono } from "hono";
import {
  buildShareImageRouteContext,
  getCachedOrRenderedShareImage,
  getDefaultShareImageCache,
  getDefaultShareImageRenderer,
  hasSupportedShareCardRendererVersion,
  loadShareCardRecord,
  logShareImageFailure,
  renderDeterministicShareCardHtml,
  renderPublicSharePageHtml,
  type ShareImageBindings,
  type ShareImageCache,
  type ShareImageLogger,
  type ShareImageRenderer,
  unsupportedShareCardRendererVersionError,
} from "../utils/shareImages";

type Env = {
  Bindings: ShareImageBindings;
};

type SharePageDependencies = {
  cache?: ShareImageCache;
  renderer?: ShareImageRenderer;
  logger?: ShareImageLogger;
};

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

    return c.html(renderDeterministicShareCardHtml(record), 200, {
      "Cache-Control": "no-store",
    });
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

    const renderer = deps.renderer ?? getDefaultShareImageRenderer(c.env);
    if (!renderer) {
      logShareImageFailure(logger, record.id, "Browser rendering binding is not configured");
      return c.json({ error: "Browser rendering is not configured" }, 500);
    }

    try {
      const context = buildShareImageRouteContext(c.req.url, c.env, record);
      const { response } = await getCachedOrRenderedShareImage({
        requestUrl: c.req.url,
        record,
        renderUrl: context.renderUrl,
        cache: deps.cache ?? getDefaultShareImageCache(),
        renderer,
      });
      return response;
    } catch (error) {
      logShareImageFailure(logger, record.id, error);
      return c.json({ error: "Failed to render share image" }, 500);
    }
  };

  sharePages.get("/api/share-image/:shareId", imageHandler);

  sharePages.get("/s/:shareId", async (c) => {
    const loaded = await loadSupportedRecord(c);
    if ("response" in loaded) return loaded.response;
    const { record } = loaded;

    const context = buildShareImageRouteContext(c.req.url, c.env, record);
    return c.html(renderPublicSharePageHtml(record, context), 200, {
      "Cache-Control": "no-store",
    });
  });

  sharePages.get("/share/:shareId", (c) => {
    const location = new URL(`/s/${c.req.param("shareId")}`, c.req.url).toString();
    return c.redirect(location, 302);
  });

  return sharePages;
}

const sharePages = createSharePages();

export default sharePages;
