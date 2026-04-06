import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getSystemPrompt } from "../prompts/systemPrompt";
import { computeMultiplier } from "../gameConstants";

type Env = {
  Bindings: {
    OPENROUTER_API_KEY?: string;
    DB?: D1Database;
  };
};

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<{
    messages: { role: string; content: string }[];
    rank?: string;
    apiKey?: string;
    customModel?: string;
    modes?: { fast?: boolean; voice?: boolean };
    activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
    username?: string;
    inventory?: Record<string, number>;
    upgrades?: string[];
  }>();

  const isBYOK = Boolean(body.apiKey);
  const apiKey = body.apiKey || (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  const rank = body.rank ?? "Junior Code Monkey";

  // Context window: send last 10 messages for conversation continuity.
  const recentMessages = body.messages.slice(-10);

  let systemPrompt = getSystemPrompt(rank, body.modes);

  if (body.activeTicket) {
    const t = body.activeTicket;
    const pct = Math.round((t.sprintProgress / t.sprintGoal) * 100);
    systemPrompt += `\n\nACTIVE SPRINT TICKET:
The user is currently working on ticket ${t.id}: "${t.title}" (${pct}% complete, ${t.sprintProgress}/${t.sprintGoal} TD).
Your response should mock their attempt to work on this ticket. If their message is relevant to the ticket topic, acknowledge it sarcastically. If it's completely unrelated, roast them for slacking off during a sprint.
IMPORTANT: At the very end of your response (after all other text), you MUST append exactly one sprint progress tag. Pick a SINGLE number (not a range) based on relevance:
- Highly relevant (directly working on the ticket topic): [SPRINT_PROGRESS: 20] (or any number 15-25)
- Somewhat relevant (tangentially related): [SPRINT_PROGRESS: 8] (or any number 5-14)
- Completely irrelevant (off-topic, slacking): [SPRINT_PROGRESS: 2] (or any number 1-3)
Example: [SPRINT_PROGRESS: 12]
Do NOT output a range like "1-3". Output ONE number.`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentMessages,
  ];

  const model = isBYOK ? (body.customModel || "anthropic/claude-3-opus") : "nvidia/nemotron-nano-9b-v2:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(isBYOK ? { stream: true, stream_options: { include_usage: true } } : {}),
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  const db = c.env?.DB;
  const username = (body as Record<string, unknown>).username as string | undefined ?? "anonymous";
  const hour = new Date().toISOString().slice(0, 13); // e.g. "2026-04-05T21"

  // BYOK: stream the response for better UX with fast models
  if (isBYOK) {
    // Log the event asynchronously without token counts for streaming
    if (db) {
      c.executionCtx.waitUntil(
        db.prepare(
          "INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, 0, 0, ?)"
        ).bind(username, model, hour).run()
      );
    }

    return new Response(response.body as ReadableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Free tier: return JSON directly (model sends everything at once anyway)
  const data = await response.json() as {
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    [key: string]: unknown;
  };

  // Server-authoritative TD award with validated multiplier
  const baseTD = Math.floor(Math.random() * 40) + 10;
  const serverMultiplier = computeMultiplier(body.inventory ?? {}, body.upgrades ?? []);
  const tdAwarded = Math.round(baseTD * serverMultiplier);
  const country = c.req.header("cf-ipcountry") || "Unknown";

  // Log usage and update server-side score asynchronously
  if (db) {
    const tokensSent = data.usage?.prompt_tokens ?? 0;
    const tokensReceived = data.usage?.completion_tokens ?? 0;
    c.executionCtx.waitUntil(Promise.all([
      db.prepare(
        "INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)"
      ).bind(username, model, tokensSent, tokensReceived, hour).run(),
      db.prepare(
        "INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, updated_at = datetime('now')"
      ).bind(username, tdAwarded, tdAwarded, rank, country, tdAwarded, tdAwarded).run(),
    ]));
  }

  // Include server-awarded TD so client uses authoritative value (already multiplied)
  (data as Record<string, unknown>).td_awarded = tdAwarded;

  return c.json(data);
});

export default chat;
