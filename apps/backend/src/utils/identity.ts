import { getClientIp } from "../middleware/rateLimiter";

export type RequestIdentity = {
  cope_id: string;
  ip_hash: string;
  asn: number | undefined;
  country: string | undefined;
};

type HeaderSource = { header: (name: string) => string | undefined };

type CfProperties = {
  asn?: number;
  country?: string;
};

function getCurrentDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * SHA-256 hash of the raw IP concatenated with the current UTC date.
 * The daily rotation ensures stored hashes cannot be correlated across days.
 */
export async function hashIpDaily(ip: string, dateStr?: string): Promise<string> {
  const date = dateStr ?? getCurrentDateString();
  const encoded = new TextEncoder().encode(ip + date);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build a normalized identity for the current request. The returned object
 * contains no raw IP — only a daily-rotating SHA-256 hash — so it is safe
 * to persist in limiter state keys, telemetry, and logs.
 */
export async function resolveRequestIdentity(
  sessionId: string,
  req: { header: (name: string) => string | undefined; raw: unknown },
): Promise<RequestIdentity> {
  const ip = getClientIp(req as HeaderSource);
  const ip_hash = await hashIpDaily(ip);

  const cf = (req.raw as { cf?: CfProperties } | undefined)?.cf;

  return {
    cope_id: sessionId,
    ip_hash,
    asn: cf?.asn,
    country: cf?.country,
  };
}
