import { getClientIp } from "./clientIp";

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

const hmacKeyCache = new Map<string, CryptoKey>();

export async function hashIpDaily(ip: string, pepper: string, dateStr?: string): Promise<string> {
  const date = dateStr ?? getCurrentDateString();
  const encoder = new TextEncoder();

  let key = hmacKeyCache.get(pepper);
  if (!key) {
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pepper),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    hmacKeyCache.set(pepper, key);
  }

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ip + "|" + date));

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function resolveRequestIdentity(
  sessionId: string,
  req: { header: (name: string) => string | undefined; raw: unknown },
  pepper: string,
  precomputedIpHash?: string,
): Promise<RequestIdentity> {
  const ip_hash = precomputedIpHash ?? await hashIpDaily(getClientIp(req as HeaderSource), pepper);

  const cf = (req.raw as { cf?: CfProperties } | undefined)?.cf;

  return {
    cope_id: sessionId,
    ip_hash,
    asn: cf?.asn,
    country: cf?.country,
  };
}
