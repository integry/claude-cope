import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

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

export default app;
