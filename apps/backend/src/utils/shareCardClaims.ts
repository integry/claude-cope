import { SHARE_CARD_RENDERER_VERSION } from "@claude-cope/shared/shareCards";

const encoder = new TextEncoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

export type ShareCardClaimPayload = {
  sid: string;
  p: string;
  r: string;
  u: string;
  rv: string;
  iat: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function resolveSigningSecret(env: {
  SHARE_CARD_SIGNING_SECRET?: string;
  FREE_ACCOUNT_COOKIE_SECRET?: string;
}): string | undefined {
  return env.SHARE_CARD_SIGNING_SECRET?.trim() || env.FREE_ACCOUNT_COOKIE_SECRET?.trim() || undefined;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  let cached = keyCache.get(secret);
  if (!cached) {
    cached = crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    keyCache.set(secret, cached);
  }
  return cached;
}

function buildCanonicalPayload(payload: ShareCardClaimPayload): string {
  return JSON.stringify(payload);
}

export async function issueShareCardClaim(
  env: { SHARE_CARD_SIGNING_SECRET?: string; FREE_ACCOUNT_COOKIE_SECRET?: string },
  params: { sessionId: string; prompt: string; response: string; username: string },
): Promise<string | null> {
  const secret = resolveSigningSecret(env);
  if (!secret) return null;
  const payload: ShareCardClaimPayload = {
    sid: params.sessionId,
    p: params.prompt,
    r: params.response,
    u: params.username,
    rv: SHARE_CARD_RENDERER_VERSION,
    iat: Date.now(),
  };
  const payloadJson = buildCanonicalPayload(payload);
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadJson));
  return `${toBase64Url(encoder.encode(payloadJson))}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyShareCardClaim(
  env: { SHARE_CARD_SIGNING_SECRET?: string; FREE_ACCOUNT_COOKIE_SECRET?: string },
  claim: string,
  expectedSessionId: string,
): Promise<ShareCardClaimPayload | null> {
  const secret = resolveSigningSecret(env);
  if (!secret) return null;
  const dot = claim.lastIndexOf(".");
  if (dot <= 0 || dot === claim.length - 1) return null;
  const payloadBytes = fromBase64Url(claim.slice(0, dot));
  const signatureBytes = fromBase64Url(claim.slice(dot + 1));
  if (!payloadBytes || !signatureBytes) return null;

  const payloadJson = new TextDecoder().decode(payloadBytes);
  const key = await getSigningKey(secret);
  const valid = await crypto.subtle.verify("HMAC", key, signatureBytes as unknown as BufferSource, encoder.encode(payloadJson));
  if (!valid) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" || parsed === null
    || typeof (parsed as Record<string, unknown>).sid !== "string"
    || typeof (parsed as Record<string, unknown>).p !== "string"
    || typeof (parsed as Record<string, unknown>).r !== "string"
    || typeof (parsed as Record<string, unknown>).u !== "string"
    || typeof (parsed as Record<string, unknown>).rv !== "string"
    || typeof (parsed as Record<string, unknown>).iat !== "number"
  ) {
    return null;
  }

  const payload = parsed as ShareCardClaimPayload;
  if (payload.sid !== expectedSessionId) return null;
  if (payload.rv !== SHARE_CARD_RENDERER_VERSION) return null;
  return payload;
}
