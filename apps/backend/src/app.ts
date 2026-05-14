import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { getAllowedOrigins } from "@claude-cope/shared/shareCards";
import { createKvRateLimiter, rateLimiter } from "./middleware/rateLimiter";
import { botProtection } from "./middleware/botProtection";
import { sessionMiddleware } from "./middleware/session";
import { applyMigrations } from "./utils/migrations";
import chat from "./routes/chat";
import verify from "./routes/verify";
import leaderboard from "./routes/leaderboard";
import events from "./routes/events";
import tickets from "./routes/tickets";
import toolSequences from "./routes/toolSequences";
import score from "./routes/score";
import account from "./routes/account";
import shareCards from "./routes/shareCards";
import sharePages from "./routes/sharePages";
import webhooks from "./routes/webhooks";

const app = new Hono();

function isShareCardCreateRequest(request: Request): boolean {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
  return request.method === "POST" && pathname === "/api/share-cards";
}

const shareCardCreateOnly = (middleware: MiddlewareHandler): MiddlewareHandler => async (c, next) => {
  if (!isShareCardCreateRequest(c.req.raw)) {
    return next();
  }

  return middleware(c, next);
};

const requireShareCardProtections: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, unknown>;

  if (!env.RATE_LIMIT_KV) {
    return c.json({ error: "Share card creation is temporarily unavailable" }, 503);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return c.json({ error: "Share card creation is temporarily unavailable" }, 503);
  }

  if (!env.USAGE_KV) {
    return c.json({ error: "Share card creation is temporarily unavailable" }, 503);
  }

  return next();
};

function toConnectSrcOrigin(origin: string): string | undefined {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}

app.use("*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const origins = getAllowedOrigins(env.ALLOWED_ORIGINS);
  const connectSrc: string[] = ["'self'", "https://openrouter.ai", "https://challenges.cloudflare.com", "https://us.i.posthog.com", "https://us-assets.i.posthog.com", "https://eu.i.posthog.com", "https://eu-assets.i.posthog.com", "https://*.supabase.co", "wss:", "ws:"];
  for (const origin of origins) {
    const connectOrigin = toConnectSrcOrigin(origin);
    if (connectOrigin && !connectSrc.includes(connectOrigin)) {
      connectSrc.push(connectOrigin);
    }
  }
  return secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"],
      connectSrc,
      frameSrc: ["https://challenges.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })(c, next);
});

app.use("*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const allowed = getAllowedOrigins(env.ALLOWED_ORIGINS);
  return cors({
    origin: (origin) => {
      if (!origin || allowed.includes(origin)) return origin;
      return null;
    },
    credentials: true,
  })(c, next);
});

app.use("/api/*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const allowed = getAllowedOrigins(env.ALLOWED_ORIGINS);
  return csrf({ origin: allowed })(c, next);
});

app.use("*", sessionMiddleware);

// Run schema migrations on the first request that hits the DB.
// Applied globally so that /webhooks/* routes (e.g. Polar) also
// bootstrap the schema on a fresh deploy before any /api/* request.
let migrationPromise: Promise<void> | null = null;
app.use("*", async (c, next) => {
  if (!migrationPromise) {
    const db = (c.env as Record<string, unknown>).DB as D1Database | undefined;
    if (db) {
      migrationPromise = applyMigrations(db).catch((err) => {
        // Reset so the next request retries instead of permanently awaiting
        // a rejected promise for the lifetime of the isolate.
        migrationPromise = null;
        throw err;
      });
    }
  }
  if (migrationPromise) await migrationPromise;
  return next();
});

app.use("/api/chat", rateLimiter);
app.use("/api/chat", botProtection);
app.use("/api/share-cards", shareCardCreateOnly(requireShareCardProtections));
app.use("/api/share-cards", shareCardCreateOnly(createKvRateLimiter("share-cards:", 20, 60)));
app.use("/api/share-cards", shareCardCreateOnly(botProtection));

app.route("/api/chat", chat);
app.route("/api/verify", verify);
app.route("/api/leaderboard", leaderboard);
// Mount the events route to expose the SWR polling fallback endpoints
app.route("/api/recent-events", events);
app.route("/api/tickets", tickets);
app.route("/api/tool-sequences", toolSequences);
app.route("/api/score", score);
app.route("/api/account", account);
app.route("/api/share-cards", shareCards);
app.route("/", sharePages);

app.route("/webhooks", webhooks);

export default app;
