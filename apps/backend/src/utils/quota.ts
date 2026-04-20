export const DEFAULT_FREE_QUOTA_LIMIT = 20;
export const DEFAULT_PRO_INITIAL_QUOTA = 100;

export type QuotaLimits = {
  freeLimit: number;
  proInitialQuota: number;
};

type QuotaEnv = {
  FREE_QUOTA_LIMIT?: string;
  PRO_INITIAL_QUOTA?: string;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) return fallback;
  return n;
}

/**
 * Parse quota limits from the Worker environment. Operators override the
 * defaults by setting `FREE_QUOTA_LIMIT` and `PRO_INITIAL_QUOTA` env vars.
 * When unset or invalid, the historic defaults (20 / 100) are used.
 */
export function getQuotaLimits(env?: QuotaEnv | Record<string, unknown>): QuotaLimits {
  const e = (env ?? {}) as QuotaEnv;
  return {
    freeLimit: parsePositiveInt(e.FREE_QUOTA_LIMIT, DEFAULT_FREE_QUOTA_LIMIT),
    proInitialQuota: parsePositiveInt(e.PRO_INITIAL_QUOTA, DEFAULT_PRO_INITIAL_QUOTA),
  };
}

const DEFAULT_LIMITS: QuotaLimits = {
  freeLimit: DEFAULT_FREE_QUOTA_LIMIT,
  proInitialQuota: DEFAULT_PRO_INITIAL_QUOTA,
};

export class QuotaExhaustedError extends Error {
  constructor(tier: "free" | "pro") {
    super(
      tier === "free"
        ? "Free tier quota exhausted. Upgrade to Pro for more usage."
        : "Pro tier quota exhausted. Please renew your license.",
    );
    this.name = "QuotaExhaustedError";
  }
}

/**
 * Hash a Polar license key using SHA-256 so raw keys are never stored in KV.
 */
export async function hashKey(licenseKey: string): Promise<string> {
  const encoded = new TextEncoder().encode(licenseKey);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Query the current quota percentage without consuming any credits.
 */
export async function getQuotaPercent(
  kv: KVNamespace,
  opts: {
    tier: "free" | "pro";
    sessionId: string;
    licenseKeyHash?: string;
    limits?: QuotaLimits;
  },
): Promise<number> {
  const limits = opts.limits ?? DEFAULT_LIMITS;

  if (opts.tier === "pro") {
    if (!opts.licenseKeyHash) return 0;
    const kvKey = `polar:${opts.licenseKeyHash}`;
    const raw = await kv.get(kvKey);
    if (raw === null) return 0;
    const remaining = parseInt(raw, 10);
    if (isNaN(remaining)) return 0;
    if (limits.proInitialQuota <= 0) return 0;
    return Math.min(100, Math.max(0, (remaining / limits.proInitialQuota) * 100));
  }

  // Free tier
  const kvKey = `free:${opts.sessionId}`;
  const raw = await kv.get(kvKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  if (limits.freeLimit <= 0) return 0;
  return Math.min(100, Math.max(0, ((limits.freeLimit - current) / limits.freeLimit) * 100));
}

/**
 * Consume quota for a request based on the user's tier.
 *
 * - Pro users: keyed by hashed Polar license key. Quota is stored as a
 *   remaining-usage counter in KV and decremented by `cost`.
 * - Free users: keyed by session ID. A running counter is incremented by
 *   `cost` and capped at the configured free-tier limit.
 *
 * Throws `QuotaExhaustedError` when the user has no remaining quota.
 */
export async function consumeQuota(
  kv: KVNamespace,
  opts: {
    tier: "free" | "pro";
    sessionId: string;
    licenseKey?: string;
    /** Pre-hashed license key (SHA-256 hex) — skips internal hashing if provided */
    licenseKeyHash?: string;
    cost?: number;
    limits?: QuotaLimits;
  },
): Promise<{ quotaPercent: number }> {
  const cost = opts.cost ?? 1;
  const limits = opts.limits ?? DEFAULT_LIMITS;

  if (opts.tier === "pro") {
    if (!opts.licenseKey && !opts.licenseKeyHash) {
      throw new Error("License key or hash is required for Pro tier quota check.");
    }

    const hashed = opts.licenseKeyHash ?? (await hashKey(opts.licenseKey!));
    const kvKey = `polar:${hashed}`;
    const raw = await kv.get(kvKey);

    if (raw === null) {
      throw new QuotaExhaustedError("pro");
    }

    const remaining = parseInt(raw, 10);
    if (isNaN(remaining) || remaining < cost) {
      throw new QuotaExhaustedError("pro");
    }

    const newRemaining = remaining - cost;
    await kv.put(kvKey, String(newRemaining));
    const quotaPercent = limits.proInitialQuota > 0
      ? Math.min(100, Math.max(0, (newRemaining / limits.proInitialQuota) * 100))
      : 0;
    return { quotaPercent };
  }

  // Free tier
  const kvKey = `free:${opts.sessionId}`;
  const raw = await kv.get(kvKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;

  if (current + cost > limits.freeLimit) {
    throw new QuotaExhaustedError("free");
  }

  const newUsage = current + cost;
  await kv.put(kvKey, String(newUsage));
  const quotaPercent = limits.freeLimit > 0
    ? Math.min(100, Math.max(0, ((limits.freeLimit - newUsage) / limits.freeLimit) * 100))
    : 0;
  return { quotaPercent };
}
