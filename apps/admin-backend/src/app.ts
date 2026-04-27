import { Hono } from "hono";
import { cors } from "hono/cors";
import stats from "./routes/stats";
import users from "./routes/users";
import backlog from "./routes/backlog";
import licenses from "./routes/licenses";
import { applyMigrations } from "./utils/migrations";

const app = new Hono();

// Run schema migrations on the first request that hits the DB.
let migrationPromise: Promise<void> | null = null;
app.use("/api/*", async (c, next) => {
  if (!migrationPromise) {
    const db = (c.env as Record<string, unknown>).DB as D1Database | undefined;
    if (db) {
      migrationPromise = applyMigrations(db);
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
      return allowed[0]!;
    },
  })(c, next);
});

app.get("/", (c) => c.json({ status: "ok", service: "admin-backend" }));

app.route("/api/stats", stats);
app.route("/api/users", users);
app.route("/api/backlog", backlog);
app.route("/api/licenses", licenses);

export default app;
