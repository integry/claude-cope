import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { computeMultiplier } from "../gameConstants";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { consumeQuota, getQuotaLimits, QuotaExhaustedError } from "../utils/quota";
import { buildChatMessages } from "@claude-cope/shared/systemPrompt";
import { getProfile, getProfileByLicenseHash, getProfileRow, isLicenseActive, resolveRank, resolveProUser } from "../utils/profile";
import { syncPolarUsage } from "../utils/polar";

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

async function handleQuotaCheck(
  env: Env["Bindings"],
  sessionId: string,
  proKeyHash?: string,
): Promise<{ quotaPercent: number; remaining?: number; exhaustedMessage?: string }> {
  const quotaKv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!quotaKv) return { quotaPercent: 100 };

  const tier = proKeyHash ? "pro" : "free";
  const limits = getQuotaLimits(env);
  try {
    const result = await consumeQuota(quotaKv, {
      tier,
      sessionId,
      licenseKeyHash: proKeyHash,
      limits,
    });
    return { quotaPercent: result.quotaPercent, remaining: result.remaining };
  } catch (err) {
    if (err instanceof QuotaExhaustedError) {
      return { quotaPercent: 0, exhaustedMessage: err.message };
    }
    throw err;
  }
}

/** Minimum interval (ms) between Polar usage syncs per license key. */
const POLAR_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Mirror the user's Pro-tier usage to Polar's license-key dashboard.
 * Fire-and-forget via waitUntil — no user latency, no fail mode for chat.
 * Debounced: at most one outbound PATCH per license key per POLAR_SYNC_INTERVAL_MS.
 */
async function mirrorPolarUsage(
  env: Env["Bindings"],
  proKeyHash: string,
  remaining: number,
): Promise<void> {
  const kv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!kv || !env.POLAR_ACCESS_TOKEN) return;

  // Coarse debounce: skip if we synced recently for this license key
  const debounceKey = `polar_sync_ts:${proKeyHash}`;
  const lastSync = await kv.get(debounceKey);
  if (lastSync && Date.now() - Number(lastSync) < POLAR_SYNC_INTERVAL_MS) return;

  const licenseKeyId = await kv.get(`polar_id:${proKeyHash}`);
  if (!licenseKeyId) return;
  const limits = getQuotaLimits(env);
  const usage = Math.max(0, limits.proInitialQuota - remaining);
  try {
    await syncPolarUsage(licenseKeyId, env.POLAR_ACCESS_TOKEN, usage);
    // Only write the debounce timestamp on real success — a thrown error
    // (network failure, Polar 4xx/5xx) skips this so the next chat retries
    // immediately instead of suppressing for 5 minutes.
    await kv.put(debounceKey, String(Date.now()), { expirationTtl: POLAR_SYNC_INTERVAL_MS / 1000 });
  } catch (err) {
    // Polar dashboard drift is acceptable; KV remains the source of truth.
    // Surface failures in logs so consistent rejections (revoked token,
    // misconfig) are visible via `wrangler tail`.
    console.warn(`[polar-mirror] failed for ${proKeyHash.slice(0, 8)}:`, err instanceof Error ? err.message : err);
  }
}

async function handleProUserScoring(
  db: D1Database,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: { proKeyHash: string; model: string; hour: string; data: ChatResponseData; quotaPercent: number },
): Promise<Response | null> {
  const { proKeyHash, model, hour, data, quotaPercent } = params;
  const serverProfile = await getProfileByLicenseHash(db, proKeyHash);
  if (!serverProfile) return null;

  const baseTD = Math.floor(Math.random() * 40) + 10;
  const tdAwarded = Math.round(baseTD * serverProfile.multiplier * serverProfile.td_multiplier);

  // Atomically increment TD and read back the post-update total in one statement
  // via RETURNING. This prevents concurrent chats from computing rank against
  // stale pre-update totals.
  const postUpdate = await db
    .prepare(
      "UPDATE user_scores SET total_td = total_td + ?, current_td = current_td + ?, credits_used = credits_used + 1, updated_at = datetime('now') WHERE username = ? RETURNING total_td",
    )
    .bind(tdAwarded, tdAwarded, serverProfile.username)
    .first<{ total_td: number }>();

  // Derive rank from the actual post-increment total and write it atomically.
  const actualRank = resolveRank(postUpdate?.total_td ?? serverProfile.total_td + tdAwarded);
  await db.prepare("UPDATE user_scores SET corporate_rank = ? WHERE username = ?").bind(actualRank, serverProfile.username).run();

  const tokensSent = data.usage?.prompt_tokens ?? 0;
  const tokensReceived = data.usage?.completion_tokens ?? 0;
  ctx.waitUntil(
    db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(serverProfile.username, model, tokensSent, tokensReceived, hour).run(),
  );

  const updatedProfile = await getProfileByLicenseHash(db, proKeyHash);

  (data as Record<string, unknown>).td_awarded = tdAwarded;
  (data as Record<string, unknown>).quotaPercent = quotaPercent;
  (data as Record<string, unknown>).profile = updatedProfile;
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}

function recordUsage(
  db: D1Database | undefined,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: { username: string; model: string; data: ChatResponseData; tdAwarded: number; rank?: string; country: string; hour: string; proKeyHash?: string; profileLicenseHash?: string | null; ownsUsername: boolean },
) {
  if (!db) return;
  const tokensSent = params.data.usage?.prompt_tokens ?? 0;
  const tokensReceived = params.data.usage?.completion_tokens ?? 0;
  const queries: Promise<unknown>[] = [];

  // Skip the usage_logs insert if the target username has a license_hash that
  // doesn't match the caller's proKeyHash — prevents spoofed usage_logs rows
  // under another user's name.
  const isOwnershipSpoofed = !params.proKeyHash && params.profileLicenseHash;

  // Free users without username ownership are blocked in preChatChecks before
  // reaching this point — no AI call or DB write occurs for them.

  if (!isOwnershipSpoofed) {
    queries.push(
      db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(params.username, params.model, tokensSent, tokensReceived, params.hour).run(),
    );
  }

  // Each upsert also increments credits_used so admin views can read the
  // counter directly instead of running an aggregate query against usage_logs.
  if (params.proKeyHash) {
    queries.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, license_hash, credits_used) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, license_hash = ?, credits_used = credits_used + 1, updated_at = datetime('now')").bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.proKeyHash, params.tdAwarded, params.tdAwarded, params.proKeyHash).run(),
    );
  } else if (!isOwnershipSpoofed) {
    // Guard: only update rows that have no license_hash (free users).
    // This prevents free callers from vandalizing a Pro user's TD/rank/country.
    // Use server-derived rank for new rows — never trust client-claimed rank.
    const serverDerivedRank = params.rank ?? resolveRank(params.tdAwarded);
    queries.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, credits_used) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, credits_used = credits_used + 1, updated_at = datetime('now') WHERE license_hash IS NULL").bind(params.username, params.tdAwarded, params.tdAwarded, serverDerivedRank, params.country, params.tdAwarded, params.tdAwarded).run(),
    );
  }
  if (queries.length > 0) {
    ctx.waitUntil(Promise.all(queries));
  }
}

/**
 * Verify the license is still active before granting pro-tier access.
 * A revoked license falls through to the free-user path even if the
 * client still holds the old hash.
 */
async function verifyProKeyHash(
  db: D1Database | undefined,
  proKeyHash: string | undefined,
): Promise<string | undefined> {
  if (!proKeyHash) return undefined;
  if (!db) return undefined; // DB unavailable: fail closed
  const active = await isLicenseActive(db, proKeyHash);
  return active ? proKeyHash : undefined;
}

function cacheSessionUsername(
  kv: KVNamespace | undefined,
  sessionId: string,
  username: string,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
) {
  if (kv && username && username !== "anonymous") {
    ctx.waitUntil(
      kv.put(`session_user:${sessionId}`, username, { expirationTtl: 60 * 60 * 24 * 365 }),
    );
  }
}

/**
 * Decide whether to cache the session→username mapping.
 * Prevents an attacker from claiming another user's username.
 *
 * Returns the profile's license_hash (or null) so callers can reuse the
 * lookup without a second SELECT.
 */
async function tryCacheSessionMapping(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database; sessionId: string; username: string; effectiveProKeyHash: string | undefined },
): Promise<{ profileLicenseHash: string | null; hasRow: boolean }> {
  const { db, sessionId, username, effectiveProKeyHash } = opts;
  const row = await getProfileRow(db, username);
  const profileHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;
  if (effectiveProKeyHash) {
    // Pro user: only cache if the verified key hash matches this profile
    if (profileHash === effectiveProKeyHash) {
      cacheSessionUsername(env.QUOTA_KV ?? env.USAGE_KV, sessionId, username, ctx);
    }
  } else if (!row) {
    // Brand-new username with no user_scores row: first-chat-wins binding.
    const kv = env.QUOTA_KV ?? env.USAGE_KV;
    cacheSessionUsername(kv, sessionId, username, ctx);
    // Also set the reverse index so future chats from the same username
    // can be matched back to this session (first-claim-wins).
    if (kv && username && username !== "anonymous") {
      ctx.waitUntil(kv.put(`username_session:${username}`, sessionId, { expirationTtl: 60 * 60 * 24 * 365 }));
    }
  }
  // Existing free user (row exists, no license_hash): no backfill.
  // Pre-existing free users cannot restore via /me after a localStorage clear.
  // This is a deliberate trade-off to fully close the impersonation hole where
  // any new session could claim an existing free username.
  // Otherwise: username has a license_hash but caller has no matching proKeyHash — skip caching
  return { profileLicenseHash: profileHash, hasRow: Boolean(row) };
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

type PreChatResult = {
  error?: string;
  status?: number;
  effectiveProKeyHash: string | undefined;
  profileLicenseHash: string | null;
  quotaPercent: number;
  remaining?: number;
  ownsUsername: boolean;
};

/**
 * Pre-flight checks: validate pro ownership, cache session mapping, and
 * consume quota.  Runs before the OpenRouter call so we never burn paid
 * quota or upstream cost for requests that will be rejected.
 */
async function preChatChecks(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database | undefined; sessionId: string; username: string; effectiveProKeyHash: string | undefined },
): Promise<PreChatResult> {
  const { db, sessionId, username, effectiveProKeyHash } = opts;

  // Reject anonymous users immediately — no AI calls without a proven username.
  if (!username || username === "anonymous") {
    return { error: "A proven username is required to use chat", status: 403, effectiveProKeyHash, profileLicenseHash: null, quotaPercent: 0, ownsUsername: false };
  }

  // Pro ownership validation — must happen before quota consumption.
  if (effectiveProKeyHash && db) {
    const resolution = await resolveProUser(db, effectiveProKeyHash, username);
    if (resolution.error) {
      return { error: resolution.error, status: resolution.code === "revoked" ? 403 : 409, effectiveProKeyHash, profileLicenseHash: null, quotaPercent: 0, ownsUsername: false };
    }
  }

  // Cache session → username mapping (verified ownership prevents impersonation).
  let profileLicenseHash: string | null = null;
  let hasRow = false;
  if (db && username && username !== "anonymous") {
    const mappingResult = await tryCacheSessionMapping(env, ctx, { db, sessionId, username, effectiveProKeyHash });
    profileLicenseHash = mappingResult.profileLicenseHash;
    hasRow = mappingResult.hasRow;
  }

  // For free users, verify the caller's session owns this username before allowing writes.
  // Ownership: either the username has no row yet (first-chat-wins) or the caller's
  // session_user mapping matches the target username (cookie = identity).
  let ownsUsername = true; // Pro users always pass (validated above)
  if (!effectiveProKeyHash) {
    const kv = env.QUOTA_KV ?? env.USAGE_KV;
    if (!hasRow) {
      ownsUsername = true; // new username — free upsert allowed
    } else if (kv) {
      const sessionUsername = await kv.get(`session_user:${sessionId}`);
      ownsUsername = sessionUsername === username;
    } else {
      ownsUsername = false; // no KV to verify — fail closed
    }
  }

  // Block free users who don't own the username BEFORE consuming quota or
  // making any AI calls.  No backwards-compat concern — system is in dev.
  if (!effectiveProKeyHash && !ownsUsername) {
    return { error: "Session does not own this username", status: 403, effectiveProKeyHash, profileLicenseHash, quotaPercent: 0, ownsUsername };
  }

  // Consume quota after ownership has been validated.
  const quotaResult = await handleQuotaCheck(env, sessionId, effectiveProKeyHash);
  if (quotaResult.exhaustedMessage) {
    return { error: quotaResult.exhaustedMessage, status: 402, effectiveProKeyHash, profileLicenseHash, quotaPercent: 0, ownsUsername };
  }

  if (effectiveProKeyHash && quotaResult.remaining != null) {
    ctx.waitUntil(mirrorPolarUsage(env, effectiveProKeyHash, quotaResult.remaining));
  }

  return { effectiveProKeyHash, profileLicenseHash, quotaPercent: quotaResult.quotaPercent, remaining: quotaResult.remaining, ownsUsername };
}

async function handleFreeUserResponse(
  db: D1Database | undefined,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: {
    username: string; model: string; country: string; hour: string;
    data: ChatResponseData; quotaPercent: number; profileLicenseHash: string | null;
    ownsUsername: boolean;
  },
): Promise<Response> {
  // Never trust client-provided inventory/upgrades for scoring — read from DB.
  // Free users can only have inventory if the server wrote it, so forged values
  // are impossible to sneak through.
  let serverMultiplier = 1;
  let serverRank = "Junior Code Monkey";
  if (db) {
    const serverProfile = await getProfile(db, params.username);
    if (serverProfile) {
      serverMultiplier = serverProfile.multiplier;
      serverRank = serverProfile.corporate_rank;
    }
  }

  const baseTD = Math.floor(Math.random() * 40) + 10;

  // Free users with profileLicenseHash set are targeting a licensed row — skip writes.
  // ownsUsername is guaranteed true here (enforced in preChatChecks).
  const writeAllowed = !params.profileLicenseHash;
  const tdAwarded = writeAllowed ? Math.round(baseTD * serverMultiplier) : 0;

  recordUsage(db, ctx, {
    username: params.username, model: params.model, data: params.data,
    tdAwarded, rank: serverRank, country: params.country, hour: params.hour,
    profileLicenseHash: params.profileLicenseHash,
    ownsUsername: params.ownsUsername,
  });

  (params.data as Record<string, unknown>).td_awarded = tdAwarded;
  (params.data as Record<string, unknown>).quotaPercent = params.quotaPercent;
  return new Response(JSON.stringify(params.data), { headers: { "Content-Type": "application/json" } });
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

  const country = body.country || (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country || c.req.header("cf-ipcountry") || "Unknown";
  const hour = new Date().toISOString().slice(0, 13);

  // Pro user scoring — ownership was already validated in preChatChecks.
  if (preCheck.effectiveProKeyHash && db) {
    const proResponse = await handleProUserScoring(db, c.executionCtx, { proKeyHash: preCheck.effectiveProKeyHash, model, hour, data, quotaPercent: preCheck.quotaPercent });
    if (proResponse) return proResponse;
    return c.json({ error: "Pro scoring failed — please retry" }, 500);
  }

  // Free users only — pro users are fully handled above
  return handleFreeUserResponse(db, c.executionCtx, {
    username, model, country, hour,
    data, quotaPercent: preCheck.quotaPercent, profileLicenseHash: preCheck.profileLicenseHash,
    ownsUsername: preCheck.ownsUsername,
  });
});

export default chat;
