import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
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

  const username = body.username ?? "anonymous";
  const rank = body.rank ?? "Junior Code Monkey";
  const inventory = body.inventory ?? {};
  const upgrades = body.upgrades ?? [];

  // Resolve model — only allow predefined COPE_MODELS for server path
  const copeModel = body.modelId ? COPE_MODELS.find((m) => m.id === body.modelId) : undefined;
  const model = copeModel?.openRouterId ?? "nvidia/nemotron-nano-9b-v2:free";
  const tier: "free" | "pro" = copeModel?.tier ?? "free";
  const quotaCost = copeModel?.multiplier ?? 1;

  // Enforce quota
  const quotaKv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (quotaKv) {
    try {
      await consumeQuota(quotaKv, { tier, sessionId: c.get("sessionId"), licenseKey: body.proKeyHash, cost: quotaCost });
    } catch (err) {
      if (err instanceof QuotaExhaustedError) {
        return c.json({ error: err.message }, 402);
      }
      throw err;
    }
  }

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
      reasoning: { effort: "none" },
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  // Parse response
  const data = await response.json() as {
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    [key: string]: unknown;
  };

  // Server-authoritative TD award with validated multiplier
  const baseTD = Math.floor(Math.random() * 40) + 10;
  const serverMultiplier = computeMultiplier(inventory, upgrades);
  const tdAwarded = Math.round(baseTD * serverMultiplier);
  const country = c.req.header("cf-ipcountry") || "Unknown";
  const hour = new Date().toISOString().slice(0, 13);

  // Log usage and update score asynchronously
  const db = c.env?.DB;
  if (db) {
    const tokensSent = data.usage?.prompt_tokens ?? 0;
    const tokensReceived = data.usage?.completion_tokens ?? 0;
    c.executionCtx.waitUntil(Promise.all([
      db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(username, model, tokensSent, tokensReceived, hour).run(),
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, updated_at = datetime('now')").bind(username, tdAwarded, tdAwarded, rank, country, tdAwarded, tdAwarded).run(),
    ]));
  }

  (data as Record<string, unknown>).td_awarded = tdAwarded;
  return c.json(data);
});

export default chat;
