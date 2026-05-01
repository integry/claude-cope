import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import stats from "./routes/stats";
import users from "./routes/users";
import backlog from "./routes/backlog";
import licenses from "./routes/licenses";
import config from "./routes/config";
import { applyMigrations } from "./utils/migrations";

const app = new Hono();

// Run schema migrations on the first request that hits the DB.
let migrationPromise: Promise<void> | null = null;
app.use("/api/*", async (c, next) => {
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

app.use("*", (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const csv = env.ALLOWED_ORIGINS || "http://localhost:5174";
  const allowed = csv.split(",").map((s: string) => s.trim());
  return cors({
    origin: (origin) => {
      if (!origin || allowed.includes(origin)) return origin;
      return null;
    },
  })(c, next);
});

app.get("/", (c) => c.json({ status: "ok", service: "admin-backend" }));

const adminAuthGuard: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, string | undefined>;
  const secret = env.ADMIN_API_KEY;
  if (!secret) return next();
  const auth = c.req.header("Authorization");
  if (!auth || auth !== `Bearer ${secret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
};
app.use("/api/*", adminAuthGuard);

app.route("/api/stats", stats);
app.route("/api/users", users);
app.route("/api/backlog", backlog);
app.route("/api/licenses", licenses);
app.route("/api/config", config);

export default app;
