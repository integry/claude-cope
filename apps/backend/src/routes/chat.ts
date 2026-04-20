import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { computeMultiplier } from "../gameConstants";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { consumeQuota, getQuotaLimits, QuotaExhaustedError } from "../utils/quota";
import { buildChatMessages } from "@claude-cope/shared/systemPrompt";
import { getProfileByLicenseHash, resolveRank } from "../utils/profile";

type Env = {
  Bindings: {
    OPENROUTER_API_KEY?: string;
    DB?: D1Database;
    USAGE_KV?: KVNamespace;
    POLAR_ACCESS_TOKEN?: string;
    QUOTA_KV?: KVNamespace;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
  };
  Variables: {
    sessionId: string;
  };
};

type ChatBody = {
  /** Raw chat messages from the user (not including system prompt) */
  chatMessages: { role: string; content: string }[];
  /** Active modes (fast, voice, etc.) */
  modes?: { fast?: boolean; voice?: boolean };
  /** Active sprint ticket context */
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } | null;
  /** Current buddy companion type */
  buddyType?: string | null;
  rank?: string;
  modelId?: string;
  proKeyHash?: string;
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
  country?: string;
};

/** Allowed roles in chatMessages (excludes "system" to prevent prompt injection) */
const ALLOWED_CHAT_ROLES = new Set(["user", "assistant"]);

/**
 * Sanitize incoming chat messages to prevent prompt injection attacks.
 * Filters out any messages with disallowed roles (e.g., "system") and
 * ensures each message has valid structure.
 */
export function sanitizeChatMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  return messages.filter((msg) => {
    if (!msg || typeof msg !== "object") return false;
    if (typeof msg.role !== "string" || typeof msg.content !== "string") return false;
    return ALLOWED_CHAT_ROLES.has(msg.role);
  });
}

/** Maximum number of recent messages to keep */
const MAX_MESSAGES = 6;
/** Maximum content length for user messages */
const MAX_USER_CONTENT_LENGTH = 500;
/** Maximum content length for non-last assistant messages */
const MAX_ASSISTANT_CONTENT_LENGTH = 500;
/** Maximum content length for any individual message */
const MAX_CONTENT_LENGTH = 2000;

/**
 * Enforce context trimming to prevent token exhaustion attacks.
 * - Restricts messages to MAX_MESSAGES most recent elements
 * - Truncates user messages to MAX_USER_CONTENT_LENGTH characters
 * - Truncates assistant messages (except last) to MAX_ASSISTANT_CONTENT_LENGTH characters
 * - Enforces MAX_CONTENT_LENGTH as hard limit for any message
 */
export function enforceContextTrimming(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  // Take only the most recent messages
  const recentMessages = messages.slice(-MAX_MESSAGES);

  return recentMessages.map((msg, index) => {
    const isLastMessage = index === recentMessages.length - 1;
    let maxLength: number;

    if (msg.role === "user") {
      maxLength = MAX_USER_CONTENT_LENGTH;
    } else if (msg.role === "assistant" && !isLastMessage) {
      maxLength = MAX_ASSISTANT_CONTENT_LENGTH;
    } else {
      maxLength = MAX_CONTENT_LENGTH;
    }

    return {
      role: msg.role,
      content: msg.content.slice(0, maxLength),
    };
  });
}

type ChatResponseData = {
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
};

function resolveModel(modelId?: string): string {
  const copeModel = modelId ? COPE_MODELS.find((m) => m.id === modelId) : undefined;
  return copeModel?.openRouterId ?? "openai/gpt-oss-20b";
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
  params: { username: string; model: string; data: ChatResponseData; tdAwarded: number; rank: string; country: string; hour: string; proKeyHash?: string },
) {
  if (!db) return;
  const tokensSent = params.data.usage?.prompt_tokens ?? 0;
  const tokensReceived = params.data.usage?.completion_tokens ?? 0;
  const queries: Promise<unknown>[] = [
    db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(params.username, params.model, tokensSent, tokensReceived, params.hour).run(),
  ];
  if (params.proKeyHash) {
    queries.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, license_hash) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, license_hash = ?, updated_at = datetime('now')").bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.proKeyHash, params.tdAwarded, params.tdAwarded, params.proKeyHash).run(),
    );
  } else {
    queries.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, updated_at = datetime('now')").bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.tdAwarded, params.tdAwarded).run(),
    );
  }
  ctx.waitUntil(Promise.all(queries));
}

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  if (!body.chatMessages || !Array.isArray(body.chatMessages)) {
    return c.json({ error: "chatMessages array is required" }, 400);
  }

  const apiKey = (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  // Consume quota before making the OpenRouter request
  const quotaKv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  let quotaPercent = 100;
  if (quotaKv) {
    const sessionId = c.get("sessionId");
    const tier = body.proKeyHash ? "pro" : "free";
    const limits = getQuotaLimits(c.env);
    try {
      const result = await consumeQuota(quotaKv, {
        tier,
        sessionId,
        licenseKeyHash: body.proKeyHash,
        limits,
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

  // Sanitize chat messages to prevent prompt injection (strip "system" role, etc.)
  const sanitizedMessages = sanitizeChatMessages(body.chatMessages);

  // Enforce context trimming to prevent token exhaustion attacks
  const trimmedMessages = enforceContextTrimming(sanitizedMessages);

  // Build the full messages array server-side (system prompt + history)
  const messages = buildChatMessages({
    rank,
    chatMessages: trimmedMessages,
    modes: body.modes,
    activeTicket: body.activeTicket,
    buddyType: body.buddyType,
  });

  // Proxy to OpenRouter — messages built server-side for security
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,

      max_tokens: 2000,
      reasoning: { effort: "low" },
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    console.log(`[CHAT ERROR] status=${response.status} body=${JSON.stringify(data).slice(0, 500)}`);
    return c.json({ error: "OpenRouter request failed", details: data }, response.status as ContentfulStatusCode);
  }

  // Parse response
  const data = await response.json() as ChatResponseData;

  // Debug logging for tag/voice diagnostics — useful when tuning system prompts
  logChatDiagnostics(messages, data);

  // Country detection priority: body (frontend), CF object, header, fallback
  const cfCountry = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  const country = body.country || cfCountry || c.req.header("cf-ipcountry") || "Unknown";
  const hour = new Date().toISOString().slice(0, 13);

  const isPro = Boolean(body.proKeyHash);
  const db = c.env?.DB;

  // For pro users, read server-stored profile for authoritative multiplier
  if (isPro && db) {
    const serverProfile = await getProfileByLicenseHash(db, body.proKeyHash!);
    if (serverProfile) {
      const baseTD = Math.floor(Math.random() * 40) + 10;
      const tdAwarded = Math.round(baseTD * serverProfile.multiplier * serverProfile.td_multiplier);

      // Relative increment — safe under concurrent writes
      await db
        .prepare(
          "UPDATE user_scores SET total_td = total_td + ?, current_td = current_td + ?, corporate_rank = ?, updated_at = datetime('now') WHERE username = ?",
        )
        .bind(tdAwarded, tdAwarded, resolveRank(serverProfile.total_td + tdAwarded), serverProfile.username)
        .run();

      // Log usage
      recordUsage(db, c.executionCtx, { username: serverProfile.username, model, data, tdAwarded, rank: serverProfile.corporate_rank, country, hour });

      // Return updated profile
      const updatedProfile = await getProfileByLicenseHash(db, body.proKeyHash!);

      (data as Record<string, unknown>).td_awarded = tdAwarded;
      (data as Record<string, unknown>).quotaPercent = quotaPercent;
      (data as Record<string, unknown>).profile = updatedProfile;
      return c.json(data);
    }
  }

  // Free users or pro users without a profile — existing behavior
  const serverMultiplier = computeMultiplier(inventory, upgrades);
  const baseTD = Math.floor(Math.random() * 40) + 10;
  const tdAwarded = Math.round(baseTD * serverMultiplier);

  // Log usage and update score asynchronously
  recordUsage(db, c.executionCtx, { username, model, data, tdAwarded, rank, country, hour, proKeyHash: body.proKeyHash });

  (data as Record<string, unknown>).td_awarded = tdAwarded;
  (data as Record<string, unknown>).quotaPercent = quotaPercent;
  return c.json(data);
});

export default chat;
