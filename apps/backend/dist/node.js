import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./app";
app.use("/*", serveStatic({ root: "./public" }));
app.get("*", serveStatic({ root: "./public", path: "index.html" }));
const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
});
