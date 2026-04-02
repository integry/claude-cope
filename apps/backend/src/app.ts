import { Hono } from "hono";
import { cors } from "hono/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import chat from "./routes/chat";

const app = new Hono();

app.use("*", cors());

app.use("/api/chat", rateLimiter);

app.route("/api/chat", chat);

export default app;
