import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { COPE_MODELS } from "@claude-cope/shared/models";

import { buildChatMessages } from "@claude-cope/shared/systemPrompt";
import { getProfileRow, isLicenseActive, resolveProUser } from "../utils/profile";
import {
  checkQuotaAvailable,
  consumeQuotaPostSuccess,
  mirrorPolarUsage,
  handleProUserScoring,
  handleFreeUserResponse,
  type ChatResponseData,
} from "./chatHelpers";

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

/** Sanitize chat messages: filter out disallowed roles (e.g. "system") and malformed entries. */
export function sanitizeChatMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  return messages.filter((msg) => {
    if (!msg || typeof msg !== "object") return false;
    if (typeof msg.role !== "string" || typeof msg.content !== "string") return false;
    return ALLOWED_CHAT_ROLES.has(msg.role);
  });
}

const MAX_MESSAGES = 6;
const MAX_USER_CONTENT_LENGTH = 500;
const MAX_ASSISTANT_CONTENT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 2000;

/** Enforce context trimming: cap message count and truncate content lengths. */
export function enforceContextTrimming(messages: { role: string; content: string }[]): { role: string; content: string }[] {
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

/** Verify license is active; revoked keys return undefined (fail closed). */
async function verifyProKeyHash(db: D1Database | undefined, proKeyHash: string | undefined): Promise<string | undefined> {
  if (!proKeyHash || !db) return undefined;
  return (await isLicenseActive(db, proKeyHash)) ? proKeyHash : undefined;
}

function cacheSessionUsername(kv: KVNamespace | undefined, sessionId: string, username: string, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
  if (kv && username && username !== "anonymous") {
    ctx.waitUntil(kv.put(`session_user:${sessionId}`, username, { expirationTtl: 60 * 60 * 24 * 365 }));
  }
}

/** Session→username cache with deferred KV writes for new usernames (prevents orphaned entries). */
async function tryCacheSessionMapping(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database; sessionId: string; username: string; effectiveProKeyHash: string | undefined },
): Promise<{ profileLicenseHash: string | null; hasRow: boolean; deferredKvWrites: (() => void) | null }> {
  const { db, sessionId, username, effectiveProKeyHash } = opts;
  const row = await getProfileRow(db, username);
  const profileHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;
  if (effectiveProKeyHash) {
    if (profileHash === effectiveProKeyHash) {
      cacheSessionUsername(env.QUOTA_KV ?? env.USAGE_KV, sessionId, username, ctx);
    }
  } else if (!row) {
    return {
      profileLicenseHash: profileHash,
      hasRow: false,
      deferredKvWrites: () => {
        const kv = env.QUOTA_KV ?? env.USAGE_KV;
        cacheSessionUsername(kv, sessionId, username, ctx);
        if (kv && username && username !== "anonymous") {
          ctx.waitUntil(kv.put(`username_session:${username}`, sessionId, { expirationTtl: 60 * 60 * 24 * 365 }));
        }
      },
    };
  }
  return { profileLicenseHash: profileHash, hasRow: Boolean(row), deferredKvWrites: null };
}

function validateChatRequest(body: ChatBody, apiKey: string | undefined): { error: string; status: 400 | 500 } | null {
  if (!body.chatMessages || !Array.isArray(body.chatMessages)) {
    return { error: "chatMessages array is required", status: 400 };
  }
  if (!apiKey) {
    return { error: "OPENROUTER_API_KEY is not configured", status: 500 };
  }
  return null;
}

async function callOpenRouter(apiKey: string, model: string, messages: { role: string; content: string }[]) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
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
}

/** Check free-user ownership of the target username via session→KV mapping. */
async function checkFreeOwnership(
  env: Env["Bindings"],
  sessionId: string,
  username: string,
  hasRow: boolean,
): Promise<boolean> {
  const kv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!hasRow) return true;
  if (!kv) return false;
  const sessionUsername = await kv.get(`session_user:${sessionId}`);
  return sessionUsername === username;
}

type PreChatResult = {
  error?: string;
  status?: number;
  effectiveProKeyHash: string | undefined;
  profileLicenseHash: string | null;
  quotaPercent: number;
  ownsUsername: boolean;
  deferredKvWrites: (() => void) | null;
};

function rejectPreChat(msg: string, status: number, base: Partial<PreChatResult>): PreChatResult {
  return { error: msg, status, effectiveProKeyHash: undefined, profileLicenseHash: null, quotaPercent: 0, ownsUsername: false, deferredKvWrites: null, ...base };
}

async function preChatChecks(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database | undefined; sessionId: string; username: string; effectiveProKeyHash: string | undefined },
): Promise<PreChatResult> {
  const { db, sessionId, username, effectiveProKeyHash } = opts;

  if (!username || username === "anonymous") {
    return rejectPreChat("A proven username is required to use chat", 403, { effectiveProKeyHash });
  }

  if (effectiveProKeyHash && db) {
    const resolution = await resolveProUser(db, effectiveProKeyHash, username);
    if (resolution.error) {
      return rejectPreChat(resolution.error, resolution.code === "revoked" ? 403 : 409, { effectiveProKeyHash });
    }
  }

  let profileLicenseHash: string | null = null;
  let hasRow = false;
  let deferredKvWrites: (() => void) | null = null;
  if (db && username !== "anonymous") {
    const m = await tryCacheSessionMapping(env, ctx, { db, sessionId, username, effectiveProKeyHash });
    profileLicenseHash = m.profileLicenseHash;
    hasRow = m.hasRow;
    deferredKvWrites = m.deferredKvWrites;
  }

  const ownsUsername = effectiveProKeyHash ? true : await checkFreeOwnership(env, sessionId, username, hasRow);

  if (!effectiveProKeyHash && !ownsUsername) {
    return rejectPreChat("Session does not own this username", 403, { effectiveProKeyHash, profileLicenseHash });
  }
  if (!effectiveProKeyHash && profileLicenseHash) {
    return rejectPreChat("This account is linked to a Pro license — authenticate with proKeyHash", 403, { effectiveProKeyHash, profileLicenseHash });
  }

  const quotaCheck = await checkQuotaAvailable(env, sessionId, effectiveProKeyHash);
  if (quotaCheck.exhaustedMessage) {
    return rejectPreChat(quotaCheck.exhaustedMessage, 402, { effectiveProKeyHash, profileLicenseHash });
  }
  return { effectiveProKeyHash, profileLicenseHash, quotaPercent: 100, ownsUsername, deferredKvWrites };
}

const chat = new Hono<Env>();

chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  const apiKey = (c.env as Record<string, string | undefined>).OPENROUTER_API_KEY;
  const validation = validateChatRequest(body, apiKey);
  if (validation) {
    return c.json({ error: validation.error }, validation.status);
  }

  const db = c.env?.DB;
  const effectiveProKeyHash = await verifyProKeyHash(db, body.proKeyHash);

  const sessionId = c.get("sessionId");
  const { username, rank } = extractBodyDefaults(body);

  const preCheck = await preChatChecks(c.env, c.executionCtx, { db, sessionId, username, effectiveProKeyHash });
  if (preCheck.error) {
    return c.json({ error: preCheck.error }, (preCheck.status ?? 500) as ContentfulStatusCode);
  }

  const model = resolveModel(body.modelId);

  const sanitizedMessages = sanitizeChatMessages(body.chatMessages);
  const trimmedMessages = enforceContextTrimming(sanitizedMessages);
  const messages = buildChatMessages({
    rank,
    chatMessages: trimmedMessages,
    modes: body.modes,
    activeTicket: body.activeTicket,
    buddyType: body.buddyType,
  });

  const orResponse = await callOpenRouter(apiKey!, model, messages);

  if (!orResponse.ok) {
    const errData = await orResponse.json();
    console.log(`[CHAT ERROR] status=${orResponse.status} body=${JSON.stringify(errData).slice(0, 500)}`);
    return c.json({ error: "OpenRouter request failed", details: errData }, orResponse.status as ContentfulStatusCode);
  }

  const data = await orResponse.json() as ChatResponseData;
  logChatDiagnostics(messages, data);

  const quotaResult = await consumeQuotaPostSuccess(c.env, sessionId, preCheck.effectiveProKeyHash);
  const quotaPercent = quotaResult.quotaPercent;
  if (preCheck.effectiveProKeyHash && quotaResult.remaining != null) {
    c.executionCtx.waitUntil(mirrorPolarUsage(c.env, preCheck.effectiveProKeyHash, quotaResult.remaining));
  }

  const country = body.country || (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country || c.req.header("cf-ipcountry") || "Unknown";
  const hour = new Date().toISOString().slice(0, 13);

  if (preCheck.effectiveProKeyHash && db) {
    const proResponse = await handleProUserScoring(db, c.executionCtx, { proKeyHash: preCheck.effectiveProKeyHash, model, hour, data, quotaPercent });
    if (proResponse) return proResponse;
    return c.json({ error: "Pro scoring failed — please retry" }, 500);
  }

  return handleFreeUserResponse(db, c.executionCtx, {
    username, model, country, hour,
    data, quotaPercent, profileLicenseHash: preCheck.profileLicenseHash,
    ownsUsername: preCheck.ownsUsername, deferredKvWrites: preCheck.deferredKvWrites,
  });
});

export default chat;
