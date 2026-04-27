import { consumeQuota, getQuotaLimits, getQuotaPercent, QuotaExhaustedError } from "../utils/quota";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { getProfile, getProfileByLicenseHash, resolveRank } from "../utils/profile";
import { syncPolarUsage } from "../utils/polar";

type EnvBindings = {
  OPENROUTER_API_KEY?: string;
  DB?: D1Database;
  USAGE_KV?: KVNamespace;
  POLAR_ACCESS_TOKEN?: string;
  QUOTA_KV?: KVNamespace;
  FREE_QUOTA_LIMIT?: string;
  PRO_INITIAL_QUOTA?: string;
};

export type ChatResponseData = {
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
};

type FreeProfileSnapshotParams = {
  username: string;
  serverProfile: ServerProfile | null;
  tdAwarded: number;
  quotaPercent: number;
};

export function buildFreeChatProfileSnapshot(params: FreeProfileSnapshotParams): ServerProfile | null {
  const { username, serverProfile, tdAwarded, quotaPercent } = params;
  if (!serverProfile && tdAwarded <= 0) return null;

  if (!serverProfile) {
    const rank = resolveRank(tdAwarded);
    return {
      username,
      total_td: tdAwarded,
      current_td: tdAwarded,
      corporate_rank: rank,
      inventory: {},
      upgrades: [],
      achievements: [],
      buddy_type: null,
      buddy_is_shiny: false,
      unlocked_themes: ["default"],
      active_theme: "default",
      active_ticket: null,
      td_multiplier: 1,
      multiplier: 1,
      quota_percent: quotaPercent,
    };
  }

  const totalTD = serverProfile.total_td + tdAwarded;
  return {
    ...serverProfile,
    total_td: totalTD,
    current_td: serverProfile.current_td + tdAwarded,
    corporate_rank: resolveRank(totalTD),
    quota_percent: quotaPercent,
  };
}

/** Pre-flight quota availability check — does NOT consume credits. */
export async function checkQuotaAvailable(
  env: EnvBindings, sessionId: string, proKeyHash?: string,
): Promise<{ exhaustedMessage?: string }> {
  const quotaKv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!quotaKv) return {};
  const percent = await getQuotaPercent(quotaKv, { tier: proKeyHash ? "pro" : "free", sessionId, licenseKeyHash: proKeyHash, limits: getQuotaLimits(env) });
  if (percent <= 0) {
    const msg = proKeyHash
      ? "Pro tier quota exhausted. Please renew your license."
      : "Free tier quota exhausted. Upgrade to Pro for more usage.";
    return { exhaustedMessage: msg };
  }
  return {};
}

/** Consume quota AFTER a successful generation. Returns quota info or an error message. */
export async function consumeQuotaPostSuccess(
  env: EnvBindings, sessionId: string, proKeyHash?: string,
): Promise<{ quotaPercent: number; remaining?: number; exhaustedMessage?: string }> {
  const quotaKv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!quotaKv) return { quotaPercent: 100 };
  try {
    const result = await consumeQuota(quotaKv, { tier: proKeyHash ? "pro" : "free", sessionId, licenseKeyHash: proKeyHash, limits: getQuotaLimits(env) });
    return { quotaPercent: result.quotaPercent, remaining: result.remaining };
  } catch (err) {
    if (err instanceof QuotaExhaustedError) return { quotaPercent: 0, exhaustedMessage: err.message };
    throw err;
  }
}

const POLAR_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 min debounce for Polar usage sync

/** Mirror Pro-tier usage to Polar (fire-and-forget, debounced per license key). */
export async function mirrorPolarUsage(
  env: EnvBindings,
  proKeyHash: string,
  remaining: number,
): Promise<void> {
  const kv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!kv || !env.POLAR_ACCESS_TOKEN) return;

  const debounceKey = `polar_sync_ts:${proKeyHash}`;
  const lastSync = await kv.get(debounceKey);
  if (lastSync && Date.now() - Number(lastSync) < POLAR_SYNC_INTERVAL_MS) return;

  const licenseKeyId = await kv.get(`polar_id:${proKeyHash}`);
  if (!licenseKeyId) return;
  const limits = getQuotaLimits(env);
  const usage = Math.max(0, limits.proInitialQuota - remaining);
  try {
    await syncPolarUsage(licenseKeyId, env.POLAR_ACCESS_TOKEN, usage);
    await kv.put(debounceKey, String(Date.now()), { expirationTtl: POLAR_SYNC_INTERVAL_MS / 1000 });
  } catch (err) {
    console.warn(`[polar-mirror] failed for ${proKeyHash.slice(0, 8)}:`, err instanceof Error ? err.message : err);
  }
}

export async function handleProUserScoring(
  db: D1Database,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: { proKeyHash: string; model: string; hour: string; data: ChatResponseData; quotaPercent: number },
): Promise<Response | null> {
  const { proKeyHash, model, hour, data, quotaPercent } = params;
  const serverProfile = await getProfileByLicenseHash(db, proKeyHash);
  if (!serverProfile) return null;

  const baseTD = Math.floor(Math.random() * 40) + 10;
  const tdAwarded = Math.round(baseTD * serverProfile.multiplier * serverProfile.td_multiplier);

  // Compute expected rank from the anticipated new total_td so we can set it
  // atomically in a single UPDATE, eliminating the partial-failure window
  // that existed when rank was updated in a separate statement.
  const expectedTotalTd = serverProfile.total_td + tdAwarded;
  const expectedRank = resolveRank(expectedTotalTd);

  const postUpdate = await db
    .prepare(
      "UPDATE user_scores SET total_td = total_td + ?, current_td = current_td + ?, credits_used = credits_used + 1, corporate_rank = ?, updated_at = datetime('now') WHERE username = ? RETURNING total_td",
    )
    .bind(tdAwarded, tdAwarded, expectedRank, serverProfile.username)
    .first<{ total_td: number }>();

  // If a concurrent update changed total_td, correct the rank.
  const actualTotalTd = postUpdate?.total_td ?? expectedTotalTd;
  if (actualTotalTd !== expectedTotalTd) {
    const correctedRank = resolveRank(actualTotalTd);
    if (correctedRank !== expectedRank) {
      await db.prepare("UPDATE user_scores SET corporate_rank = ? WHERE username = ?").bind(correctedRank, serverProfile.username).run();
    }
  }

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

export function recordUsage(
  db: D1Database | undefined,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: {
    username: string;
    model: string;
    data: ChatResponseData;
    tdAwarded: number;
    rank?: string;
    country: string;
    hour: string;
    proKeyHash?: string;
    profileLicenseHash?: string | null;
    revokedProfileLicenseHash?: string | null;
    ownsUsername: boolean;
    deferredKvWrites?: (() => void) | null;
  },
) {
  if (!db) return;
  const tokensSent = params.data.usage?.prompt_tokens ?? 0;
  const tokensReceived = params.data.usage?.completion_tokens ?? 0;
  const queries: Promise<unknown>[] = [];

  // Skip writes if free caller targets a licensed username (spoofed ownership).
  const isOwnershipSpoofed = !params.proKeyHash && params.profileLicenseHash;
  if (!isOwnershipSpoofed) {
    queries.push(
      db.prepare("INSERT INTO usage_logs (username, model, tokens_sent, tokens_received, hour) VALUES (?, ?, ?, ?, ?)").bind(params.username, params.model, tokensSent, tokensReceived, params.hour).run(),
    );
  }

  if (params.proKeyHash) {
    queries.push(
      db.prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, license_hash, credits_used) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT(username) DO UPDATE SET total_td = total_td + ?, current_td = current_td + ?, license_hash = ?, credits_used = credits_used + 1, updated_at = datetime('now')").bind(params.username, params.tdAwarded, params.tdAwarded, params.rank, params.country, params.proKeyHash, params.tdAwarded, params.tdAwarded, params.proKeyHash).run(),
    );
  } else if (!isOwnershipSpoofed) {
    const serverDerivedRank = params.rank ?? resolveRank(params.tdAwarded);
    queries.push(
      db.prepare(
        `INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country, credits_used)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(username) DO UPDATE SET
           total_td = total_td + ?,
           current_td = current_td + ?,
           credits_used = credits_used + 1,
           updated_at = datetime('now')
         WHERE license_hash IS NULL OR license_hash = ?`,
      ).bind(
        params.username,
        params.tdAwarded,
        params.tdAwarded,
        serverDerivedRank,
        params.country,
        params.tdAwarded,
        params.tdAwarded,
        params.revokedProfileLicenseHash ?? "",
      ).run(),
    );
  }
  if (queries.length > 0) {
    const dbThenKv = Promise.all(queries).then(() => {
      if (params.deferredKvWrites) params.deferredKvWrites();
    });
    ctx.waitUntil(dbThenKv);
  } else if (params.deferredKvWrites) {
    params.deferredKvWrites();
  }
}

export async function handleFreeUserResponse(
  db: D1Database | undefined,
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  params: {
    username: string; model: string; country: string; hour: string;
    data: ChatResponseData; quotaPercent: number; profileLicenseHash: string | null;
    revokedProfileLicenseHash: string | null;
    ownsUsername: boolean; deferredKvWrites: (() => void) | null;
  },
): Promise<Response> {
  let serverProfile: ServerProfile | null = null;
  let serverMultiplier = 1;
  let serverRank = "Junior Code Monkey";
  if (db) {
    serverProfile = await getProfile(db, params.username);
    if (serverProfile) {
      serverMultiplier = serverProfile.multiplier;
      serverRank = serverProfile.corporate_rank;
    }
  }

  const baseTD = Math.floor(Math.random() * 40) + 10;
  const writeAllowed = !params.profileLicenseHash;
  const tdAwarded = writeAllowed ? Math.round(baseTD * serverMultiplier) : 0;

  recordUsage(db, ctx, {
    username: params.username, model: params.model, data: params.data,
    tdAwarded, rank: serverRank, country: params.country, hour: params.hour,
    profileLicenseHash: params.profileLicenseHash,
    revokedProfileLicenseHash: params.revokedProfileLicenseHash,
    ownsUsername: params.ownsUsername,
    deferredKvWrites: params.deferredKvWrites,
  });

  (params.data as Record<string, unknown>).td_awarded = tdAwarded;
  (params.data as Record<string, unknown>).quotaPercent = params.quotaPercent;
  (params.data as Record<string, unknown>).profile = buildFreeChatProfileSnapshot({
    username: params.username,
    serverProfile,
    tdAwarded,
    quotaPercent: params.quotaPercent,
  });
  return new Response(JSON.stringify(params.data), { headers: { "Content-Type": "application/json" } });
}
