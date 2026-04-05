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
    modes?: { fast?: boolean; voice?: boolean };
    activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
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

  const model = isBYOK ? "anthropic/claude-3-opus" : "nvidia/nemotron-nano-9b-v2:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(isBYOK ? { stream: true } : {}),
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  // BYOK: stream the response for better UX with fast models
  if (isBYOK) {
    return new Response(response.body as ReadableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Free tier: return JSON directly (model sends everything at once anyway)
  const data = await response.json();
  return c.json(data);
});

export default chat;
