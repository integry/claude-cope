import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { computeMultiplier } from "../gameConstants";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { consumeQuota, QuotaExhaustedError } from "../utils/quota";

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

type ChatBody = {
  /** Pre-built messages array (system prompt + conversation context) from the client */
  messages: { role: string; content: string }[];
  rank?: string;
  modelId?: string;
  proKeyHash?: string;
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
};

type ChatResponseData = {
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
};

function resolveModel(modelId?: string): string {
  const copeModel = modelId ? COPE_MODELS.find((m) => m.id === modelId) : undefined;
  return copeModel?.openRouterId ?? "nvidia/nemotron-3-super-120b-a12b";
}

function extractBodyDefaults(body: ChatBody) {
  return {
    username: body.username ?? "anonymous",
    rank: body.rank ?? "Junior Code Monkey",
    inventory: body.inventory ?? {},
    upgrades: body.upgrades ?? [],
  };
}

function logChatDiagnostics(messages: { role: string; content: string }[], data: ChatResponseData) {
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";
  const replyContent = data.choices?.[0]?.message?.content ?? "";
  const hasUserNext = /\[USER_NEXT_MESSAGE:/i.test(replyContent);
  console.log(
    `[CHAT] user="${lastUserMsg.slice(0, 80)}" | reply=${replyContent.length}c | tag=${hasUserNext ? "✓" : "✗"} | tail="${replyContent.slice(-200).replace(/\n/g, " ")}"`,
  );
}

function recordUsage(
  db: D1Database | undefined,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: { username: string; model: string; data: ChatResponseData; tdAwarded: number; rank: string; country: string; hour: string },
) {
  if (!db) return;
  const tokensSent = params.data.usage?.prompt_tokens ?? 0;
  const tokensReceived = params.data.usage?.completion_tokens ?? 0;
  ctx.waitUntil(Promise.all([
    db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(params.username, params.model, tokensSent, tokensReceived, params.hour).run(),
    db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, updated_at = datetime('now')").bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.tdAwarded, params.tdAwarded).run(),
  ]));
}

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages array is required" }, 400);
  }

  const apiKey = (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  // Consume quota before making the OpenRouter request
  const quotaKv = c.env?.QUOTA_KV;
  let quotaPercent = 100;
  if (quotaKv) {
    const sessionId = c.get("sessionId");
    const tier = body.proKeyHash ? "pro" : "free";
    try {
      const result = await consumeQuota(quotaKv, {
        tier,
        sessionId,
        licenseKeyHash: body.proKeyHash,
      });
      quotaPercent = result.quotaPercent;
    } catch (err) {
      if (err instanceof QuotaExhaustedError) {
        return c.json({ error: err.message }, 402);
      }
      throw err;
    }
  }

  const { username, rank, inventory, upgrades } = extractBodyDefaults(body);
  const model = resolveModel(body.modelId);

  // Proxy to OpenRouter — messages come pre-built from the client
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: body.messages,

      max_tokens: 2000,
      reasoning: { effort: "low" },
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  // Parse response
  const data = await response.json() as ChatResponseData;

  // Debug logging for tag/voice diagnostics — useful when tuning system prompts
  logChatDiagnostics(body.messages, data);

  // Server-authoritative TD award with validated multiplier
  const baseTD = Math.floor(Math.random() * 40) + 10;
  const serverMultiplier = computeMultiplier(inventory, upgrades);
  const tdAwarded = Math.round(baseTD * serverMultiplier);
  const country = c.req.header("cf-ipcountry") || "Unknown";
  const hour = new Date().toISOString().slice(0, 13);

  // Log usage and update score asynchronously
  recordUsage(c.env?.DB, c.executionCtx, { username, model, data, tdAwarded, rank, country, hour });

  (data as Record<string, unknown>).td_awarded = tdAwarded;
  (data as Record<string, unknown>).quotaPercent = quotaPercent;
  return c.json(data);
});

export default chat;
