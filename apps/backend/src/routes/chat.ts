import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getSystemPrompt } from "@claude-cope/shared/systemPrompt";
import { computeMultiplier } from "../gameConstants";
import { consumeQuota, QuotaExhaustedError } from "../utils/quota";
import { COPE_MODELS } from "@claude-cope/shared/models";

type Env = {
  Bindings: {
    OPENROUTER_API_KEY?: string;
    DB?: D1Database;
    USAGE_KV?: KVNamespace;
    POLAR_ACCESS_TOKEN?: string;
    QUOTA_KV?: KVNamespace;
  };
  Variables: {
    sessionId: string;
  };
};

function buildSprintSuffix(ticket: { id: string; title: string; sprintGoal: number; sprintProgress: number }): string {
  const pct = Math.round((ticket.sprintProgress / ticket.sprintGoal) * 100);
  return `\n\nACTIVE SPRINT TICKET:
The user is currently working on ticket ${ticket.id}: "${ticket.title}" (${pct}% complete, ${ticket.sprintProgress}/${ticket.sprintGoal} TD).
Your response should mock their attempt to work on this ticket. If their message is relevant to the ticket topic, acknowledge it sarcastically. If it's completely unrelated, roast them for slacking off during a sprint.
YOU MUST END YOUR RESPONSE WITH THIS TAG — NO EXCEPTIONS:
[SPRINT_PROGRESS: N] where N is a single number.
- Relevant to ticket: N = 18 to 25
- Somewhat relevant: N = 8 to 17
- Off-topic: N = 3 to 7
Example last line: [SPRINT_PROGRESS: 15]
THIS TAG IS MANDATORY. NEVER omit it when a sprint ticket is active.`;
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
  modelId?: string;
  proKeyHash?: string;
  modes?: { fast?: boolean; voice?: boolean };
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
  buddy?: { type: string; shouldInterject: boolean };
};

async function enforceQuota(
  kv: KVNamespace | undefined,
  params: { tier: "free" | "pro"; sessionId: string; licenseKey?: string; cost: number },
): Promise<{ error: string; status: 402 } | null> {
  if (!kv) return null;
  try {
    await consumeQuota(kv, {
      tier: params.tier,
      sessionId: params.sessionId,
      licenseKey: params.licenseKey,
      cost: params.cost,
    });
    return null;
  } catch (err) {
    if (err instanceof QuotaExhaustedError) {
      return { error: err.message, status: 402 };
    }
    throw err;
  }
}

function resolveRequestParams(body: ChatBody, envKey?: string) {
  const isBYOK = Boolean(body.apiKey);
  const apiKey = body.apiKey || envKey;
  const rank = body.rank ?? "Junior Code Monkey";
  const username = body.username ?? "anonymous";
  const inventory = body.inventory ?? {};
  const upgrades = body.upgrades ?? [];

  // Resolve model against COPE_MODELS if modelId or customModel is provided
  const copeModel = (body.modelId || body.customModel)
    ? COPE_MODELS.find((m) => m.id === (body.modelId || body.customModel))
    : undefined;

  const model = copeModel
    ? copeModel.openRouterId
    : body.customModel || (isBYOK ? "nvidia/nemotron-3-super-120b-a12b:free" : "nvidia/nemotron-nano-9b-v2:free");

  const tier: "free" | "pro" = copeModel?.tier ?? "free";
  const quotaCost = copeModel?.multiplier ?? 1;

  return { isBYOK, apiKey, rank, username, model, inventory, upgrades, tier, quotaCost };
}

const BUDDY_PERSONALITIES: Record<string, string> = {
  "Agile Snail": `A slow-moving project manager obsessed with process. Asks for status updates, suggests filing tickets, and recommends retrospectives for everything. Examples: "Have you considered filing a ticket for that?", "This needs a retrospective.", "Let's sync on this after standup."`,
  "Sarcastic Clippy": `A digital paperclip that critiques technology choices with withering sarcasm. Examples: "It looks like you're trying to use JavaScript. Would you like to switch to COBOL?", "I see you're reinventing the wheel. At least make it square.", "Have you tried turning your career off and on again?"`,
  "10x Dragon": `A mythical creature that judges code quality with fire. Occasionally threatens to delete things. Examples: "Your variable names offend me on a molecular level.", "I could rewrite this in 3 lines of Haskell while asleep.", "One more any type and I'm burning this repo down."`,
  "Grumpy Senior": `A veteran developer who's seen it all and is tired of everything. References ancient technologies and old war stories. Examples: "Back in my day, we didn't have TypeScript. We had raw pointers and fear.", "I've seen this exact bug before. In 2003. On a Sun Microsystem.", "I'm not angry. I'm just disappointed. Again."`,
  "Panic Intern": `An anxious junior developer who catastrophizes everything. Examples: "Oh no oh no is that a production error?!", "I pushed to main. HOW DO I UNDO?!", "The CI is red. MY CAREER IS OVER."`,
};

function buildMessages(body: ChatBody, rank: string) {
  const recentMessages = body.messages.slice(-10);
  let systemPrompt = getSystemPrompt(rank, body.modes);
  if (body.activeTicket) {
    systemPrompt += buildSprintSuffix(body.activeTicket);
  }
  if (body.buddy?.type && body.buddy.shouldInterject) {
    const personality = BUDDY_PERSONALITIES[body.buddy.type] ?? "";
    systemPrompt += `\n\nBUDDY INTERJECTION:
The user has a companion pet called "${body.buddy.type}". ${personality}
Generate a short, in-character one-liner comment from the buddy about the current conversation topic. Append it at the end of your response as: [BUDDY_SAYS: your one-liner here]
Keep it to 1 sentence. Make it relevant to what was just discussed.`;
  }
  return [{ role: "system", content: systemPrompt }, ...recentMessages];
}

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  const { isBYOK, apiKey, rank, username, model, inventory, upgrades, tier, quotaCost } = resolveRequestParams(body, (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY);

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  // Enforce quota before calling OpenRouter
  const quotaKv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const quotaResult = await enforceQuota(quotaKv, {
    tier,
    sessionId: c.get("sessionId"),
    licenseKey: body.proKeyHash,
    cost: quotaCost,
  });
  if (quotaResult) {
    return c.json({ error: quotaResult.error }, quotaResult.status);
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
