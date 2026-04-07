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

function buildSprintSuffix(ticket: { id: string; title: string; sprintGoal: number; sprintProgress: number }): string {
  const pct = Math.round((ticket.sprintProgress / ticket.sprintGoal) * 100);
  return `\n\nACTIVE SPRINT TICKET:
The user is currently working on ticket ${ticket.id}: "${ticket.title}" (${pct}% complete, ${ticket.sprintProgress}/${ticket.sprintGoal} TD).
Your response should mock their attempt to work on this ticket. If their message is relevant to the ticket topic, acknowledge it sarcastically. If it's completely unrelated, roast them for slacking off during a sprint.
IMPORTANT: At the very end of your response (after all other text), you MUST append exactly one sprint progress tag. Pick a SINGLE number (not a range) based on relevance:
- Highly relevant (directly working on the ticket topic): [SPRINT_PROGRESS: 22] (or any number 18-25)
- Somewhat relevant (tangentially related): [SPRINT_PROGRESS: 12] (or any number 8-17)
- Completely irrelevant (off-topic, slacking): [SPRINT_PROGRESS: 5] (or any number 3-7)
Example: [SPRINT_PROGRESS: 15]
Do NOT output a range like "1-3". Output ONE number.`;
}

function logUsageAndScore(
  db: D1Database,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: { username: string; model: string; rank: string; country: string; tdAwarded: number; tokensSent: number; tokensReceived: number; hour: string },
) {
  ctx.waitUntil(Promise.all([
    db.prepare(
      "INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)"
    ).bind(params.username, params.model, params.tokensSent, params.tokensReceived, params.hour).run(),
    db.prepare(
      "INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, updated_at = datetime('now')"
    ).bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.tdAwarded, params.tdAwarded).run(),
  ]));
}

type ChatBody = {
  messages: { role: string; content: string }[];
  rank?: string;
  apiKey?: string;
  customModel?: string;
  modes?: { fast?: boolean; voice?: boolean };
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
};

function resolveRequestParams(body: ChatBody, envKey?: string) {
  const isBYOK = Boolean(body.apiKey);
  const apiKey = body.apiKey || envKey;
  const rank = body.rank ?? "Junior Code Monkey";
  const username = body.username ?? "anonymous";
  const model = isBYOK ? (body.customModel || "anthropic/claude-3-opus") : "nvidia/nemotron-nano-9b-v2:free";
  const inventory = body.inventory ?? {};
  const upgrades = body.upgrades ?? [];
  return { isBYOK, apiKey, rank, username, model, inventory, upgrades };
}

function buildMessages(body: ChatBody, rank: string) {
  const recentMessages = body.messages.slice(-10);
  let systemPrompt = getSystemPrompt(rank, body.modes);
  if (body.activeTicket) {
    systemPrompt += buildSprintSuffix(body.activeTicket);
  }
  return [{ role: "system", content: systemPrompt }, ...recentMessages];
}

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  const { isBYOK, apiKey, rank, username, model, inventory, upgrades } = resolveRequestParams(body, (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY);

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  const messages = buildMessages(body, rank);

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
  const hour = new Date().toISOString().slice(0, 13);

  // BYOK: stream the response for better UX with fast models
  if (isBYOK) {
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

  // Free tier: return JSON directly
  const data = await response.json() as {
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    [key: string]: unknown;
  };

  const baseTD = Math.floor(Math.random() * 40) + 10;
  const serverMultiplier = computeMultiplier(inventory, upgrades);
  const tdAwarded = Math.round(baseTD * serverMultiplier);
  const country = c.req.header("cf-ipcountry") || "Unknown";

  if (db) {
    logUsageAndScore(db, c.executionCtx, {
      username, model, rank, country, tdAwarded,
      tokensSent: data.usage?.prompt_tokens ?? 0,
      tokensReceived: data.usage?.completion_tokens ?? 0,
      hour,
    });
  }

  (data as Record<string, unknown>).td_awarded = tdAwarded;

  return c.json(data);
});

export default chat;
