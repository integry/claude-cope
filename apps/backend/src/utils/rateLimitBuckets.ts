export type BucketName = "swarm" | "ip_burst" | "burst" | "hourly" | "daily";

export type BucketDefinition = {
  name: BucketName;
  windowSeconds: number;
  limit: number;
  keyPrefix: string;
  keyType: "ip" | "identity";
};

export const BUCKETS: readonly BucketDefinition[] = [
  { name: "swarm",    windowSeconds: 600,   limit: 100, keyPrefix: "rl:swarm:",    keyType: "ip" },
  { name: "ip_burst", windowSeconds: 300,   limit: 20,  keyPrefix: "rl:ip_burst:", keyType: "ip" },
  { name: "burst",    windowSeconds: 60,    limit: 10,  keyPrefix: "rl:burst:",    keyType: "identity" },
  { name: "hourly",   windowSeconds: 3600,  limit: 60,  keyPrefix: "rl:hourly:",   keyType: "identity" },
  { name: "daily",    windowSeconds: 86400, limit: 500, keyPrefix: "rl:daily:",    keyType: "identity" },
];

export const LORE: Record<BucketName, string> = {
  swarm:    "Too many requests from this network. Please wait before trying again.",
  ip_burst: "Burst limit exceeded for this IP. Please slow down.",
  burst:    "You're sending requests too quickly. Please wait a moment.",
  hourly:   "Hourly request limit reached. Please try again later.",
  daily:    "Daily request limit reached. Please come back tomorrow.",
};

type CounterState = {
  count: number;
  expiresAt: number;
};

export type RateLimitResult =
  | { blocked: false }
  | {
      blocked: true;
      bucket: BucketName;
      retryAfterMs: number;
      shouldTrack: boolean;
      lore: string;
    };

const KV_MIN_TTL = 60;

function buildKey(bucket: BucketDefinition, identifier: string): string {
  return `${bucket.keyPrefix}${identifier}`;
}

function parseCounter(raw: string | null): CounterState | null {
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as CounterState;
    if (typeof parsed.count !== "number" || typeof parsed.expiresAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Advisory rate-limit check backed by Cloudflare KV.
 *
 * IMPORTANT: KV does not support atomic increments or compare-and-swap.
 * The get→compute→put cycle is NOT atomic, so concurrent requests may
 * read the same counter value and overwrite each other, causing
 * undercounting. This is an inherent KV limitation.
 *
 * This function is therefore a BEST-EFFORT advisory layer. The
 * Cloudflare WAF rate-limit rule (configured per the rollout runbook)
 * is the authoritative, atomic enforcement mechanism. KV counters
 * provide per-identity granularity and user-facing lore that the WAF
 * cannot, but operators must not rely on them for hard guarantees.
 */
export async function checkRateLimits(
  kv: KVNamespace,
  keys: { ip: string; identity: string },
  now?: number,
): Promise<RateLimitResult> {
  const ts = now ?? Date.now();

  for (const bucket of BUCKETS) {
    const identifier = bucket.keyType === "ip" ? keys.ip : keys.identity;
    const key = buildKey(bucket, identifier);
    const existing = parseCounter(await kv.get(key));

    let newState: CounterState;
    let ttl: number;

    if (existing && existing.expiresAt > ts) {
      newState = { count: existing.count + 1, expiresAt: existing.expiresAt };
      ttl = Math.max(Math.ceil((existing.expiresAt - ts) / 1000), KV_MIN_TTL);
    } else {
      const expiresAt = ts + bucket.windowSeconds * 1000;
      newState = { count: 1, expiresAt };
      ttl = bucket.windowSeconds;
    }

    await kv.put(key, JSON.stringify(newState), { expirationTtl: ttl });

    if (newState.count > bucket.limit) {
      return {
        blocked: true,
        bucket: bucket.name,
        retryAfterMs: Math.max(0, newState.expiresAt - ts),
        shouldTrack: newState.count === bucket.limit + 1,
        lore: LORE[bucket.name],
      };
    }
  }

  return { blocked: false };
}
