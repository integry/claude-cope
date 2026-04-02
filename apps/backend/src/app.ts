import { Hono } from "hono";
import { cors } from "hono/cors";
import { rateLimiter } from "./middleware/rateLimiter";

const app = new Hono();

app.use("*", cors());

app.use("/api/chat", rateLimiter);

app.post("/api/chat", (c) => {
  return c.json({ message: "[⚙️] Backend is successfully coping with your request." });
});

export default app;
