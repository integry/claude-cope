import { Hono } from "hono";
import { cors } from "hono/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import chat from "./routes/chat";
import leaderboard from "./routes/leaderboard";

const app = new Hono();

app.use("*", cors());

app.use("/api/chat", rateLimiter);

app.route("/api/chat", chat);
app.route("/api/leaderboard", leaderboard);

export default app;
