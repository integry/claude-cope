import { Hono } from "hono";
import { cors } from "hono/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import chat from "./routes/chat";
import leaderboard from "./routes/leaderboard";
import events from "./routes/events";
import tickets from "./routes/tickets";
import toolSequences from "./routes/toolSequences";

const app = new Hono();

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

app.use("/api/chat", rateLimiter);

app.route("/api/chat", chat);
app.route("/api/leaderboard", leaderboard);
// Mount the events route to expose the SWR polling fallback endpoints
app.route("/api/recent-events", events);
app.route("/api/tickets", tickets);
app.route("/api/tool-sequences", toolSequences);

export default app;
