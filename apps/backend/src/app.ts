import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.post("/api/chat", (c) => {
  return c.json({ message: "Chat endpoint" });
});

export default app;
