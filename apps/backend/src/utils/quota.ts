const FREE_QUOTA_LIMIT = 20;
export const PRO_INITIAL_QUOTA = 100;

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
async function hashKey(licenseKey: string): Promise<string> {
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
  },
): Promise<number> {
  if (opts.tier === "pro") {
    if (!opts.licenseKeyHash) return 0;
    const kvKey = `polar:${opts.licenseKeyHash}`;
    const raw = await kv.get(kvKey);
    if (raw === null) return 0;
    const remaining = parseInt(raw, 10);
    if (isNaN(remaining)) return 0;
    return (remaining / PRO_INITIAL_QUOTA) * 100;
  }

  // Free tier
  const kvKey = `free:${opts.sessionId}`;
  const raw = await kv.get(kvKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  return ((FREE_QUOTA_LIMIT - current) / FREE_QUOTA_LIMIT) * 100;
}

/**
 * Consume quota for a request based on the user's tier.
 *
 * - Pro users: keyed by hashed Polar license key. Quota is stored as a
 *   remaining-usage counter in KV and decremented by `cost`.
 * - Free users: keyed by session ID. A running counter is incremented by
 *   `cost` and capped at FREE_QUOTA_LIMIT.
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
  },
): Promise<{ quotaPercent: number }> {
  const cost = opts.cost ?? 1;

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
    const quotaPercent = (newRemaining / PRO_INITIAL_QUOTA) * 100;
    return { quotaPercent };
  }

  // Free tier
  const kvKey = `free:${opts.sessionId}`;
  const raw = await kv.get(kvKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;

  if (current + cost > FREE_QUOTA_LIMIT) {
    throw new QuotaExhaustedError("free");
  }

  const newUsage = current + cost;
  await kv.put(kvKey, String(newUsage));
  const quotaPercent = ((FREE_QUOTA_LIMIT - newUsage) / FREE_QUOTA_LIMIT) * 100;
  return { quotaPercent };
}
