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
  const body = await c.req.json<{
    messages: { role: string; content: string }[];
    rank?: string;
    apiKey?: string;
  }>();

  const isBYOK = Boolean(body.apiKey);
  const apiKey = body.apiKey || c.env?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  const rank = body.rank ?? "Junior Code Monkey";

  // Context window: send only last 4 messages per functional spec
  // to minimize token usage and enforce erratic, forgetful AI behavior.
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
      model: isBYOK ? "anthropic/claude-3-opus" : "nvidia/nemotron-3-8b-chat-steer",
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
