import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "./middleware/rateLimiter";
import { sessionMiddleware } from "./middleware/session";
import { applyMigrations } from "./utils/migrations";
import chat from "./routes/chat";
import leaderboard from "./routes/leaderboard";
import events from "./routes/events";
import tickets from "./routes/tickets";
import toolSequences from "./routes/toolSequences";
import score from "./routes/score";
import account from "./routes/account";
import webhooks from "./routes/webhooks";

const app = new Hono();

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: [
        "'self'",
        "https://openrouter.ai",
        "https://us.i.posthog.com",
        "https://us-assets.i.posthog.com",
        "https://eu.i.posthog.com",
        "https://eu-assets.i.posthog.com",
        "wss:",
        "ws:",
      ],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

app.use("*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const csv = env.ALLOWED_ORIGINS || "https://claudecope.com,http://localhost:5173";
  const allowed = csv.split(",").map((s: string) => s.trim());
  return cors({
    origin: (origin) => {
      if (!origin || allowed.includes(origin)) return origin;
      return allowed[0]!;
    },
  })(c, next);
});

app.use("/api/*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const csv = env.ALLOWED_ORIGINS || "https://claudecope.com,http://localhost:5173";
  const allowed = csv.split(",").map((s: string) => s.trim());
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

app.route("/api/chat", chat);
app.route("/api/leaderboard", leaderboard);
// Mount the events route to expose the SWR polling fallback endpoints
app.route("/api/recent-events", events);
app.route("/api/tickets", tickets);
app.route("/api/tool-sequences", toolSequences);
app.route("/api/score", score);
app.route("/api/account", account);

app.route("/webhooks", webhooks);

export default app;
