import { Hono } from "hono";
import { cors } from "hono/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import chat from "./routes/chat";
import leaderboard from "./routes/leaderboard";

const app = new Hono();

// Apply strict origin checking to prevent cross-site request forgery and unauthorized API usage.
// We use a dynamic origin function because we need to support both dev and prod environments safely.
app.use("*", cors({
  origin: (origin) => {
    const allowedOrigins = ['https://claudecope.com', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) return origin;
    return 'https://claudecope.com';
  }
}));

app.use("/api/chat", rateLimiter);

app.route("/api/chat", chat);
app.route("/api/leaderboard", leaderboard);

export default app;
