import { Hono } from "hono";
import { cors } from "hono/cors";
const app = new Hono();
app.use("*", cors());
app.post("/api/chat", (c) => {
    return c.json({ message: "[⚙️] Backend is successfully coping with your request." });
});
export default app;
