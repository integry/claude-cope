import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getSystemPrompt } from "../prompts/systemPrompt";

type Env = {
  Bindings: {
    OPENROUTER_API_KEY?: string;
  };
};

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const apiKey = c.env?.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  const body = await c.req.json<{
    messages: { role: string; content: string }[];
    rank?: string;
  }>();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  const rank = body.rank ?? "Junior Code Monkey";

  // Strict context window: only send the last 4 messages per product spec
  // to manage context strictly and avoid over-reliance on deep history.
  const recentMessages = body.messages.slice(-4);

  const messages = [
    { role: "system", content: getSystemPrompt(rank) },
    ...recentMessages,
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-4-340b-instruct",
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  return c.json(data);
});

export default chat;
