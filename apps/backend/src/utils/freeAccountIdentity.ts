import type { Context } from "hono";
import { getCookie } from "hono/cookie";

export const FREE_ACCOUNT_COOKIE_NAME = "cope_free_account";
const FREE_ACCOUNT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const encoder = new TextEncoder();
const signingKeyCache = new Map<string, Promise<CryptoKey>>();

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

async function getSigningKey(secret: string): Promise<CryptoKey> {
  let cached = signingKeyCache.get(secret);
  if (!cached) {
    cached = crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    signingKeyCache.set(secret, cached);
  }
  return cached;
}

export async function signFreeAccountCookieValue(secret: string, accountId: string): Promise<string> {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(accountId));
  return `${accountId}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readFreeAccountIdCookie(c: Context, secret: string | undefined): Promise<string | undefined> {
  if (!secret) return undefined;
  const raw = getCookie(c, FREE_ACCOUNT_COOKIE_NAME);
  if (!raw) return undefined;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0 || dot === raw.length - 1) return undefined;
  const accountId = raw.slice(0, dot);
  const signature = fromBase64Url(raw.slice(dot + 1));
  if (!signature) return undefined;
  const key = await getSigningKey(secret);
  const valid = await crypto.subtle.verify("HMAC", key, signature as unknown as BufferSource, encoder.encode(accountId));
  return valid ? accountId : undefined;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "Lax" as const,
    path: "/",
    maxAge: FREE_ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  };
}

function serializeCookieHeader(name: string, value: string, options: ReturnType<typeof cookieOptions>): string {
  const attributes = [
    `${name}=${value}`,
    `Max-Age=${options.maxAge}`,
    `Path=${options.path}`,
    options.httpOnly ? "HttpOnly" : null,
    options.secure ? "Secure" : null,
    options.sameSite ? `SameSite=${options.sameSite}` : null,
  ].filter(Boolean);
  return attributes.join("; ");
}

async function buildSignedFreeAccountCookieHeader(
  secret: string,
  accountId: string,
): Promise<string> {
  const options = cookieOptions();
  const value = await signFreeAccountCookieValue(secret, accountId);
  return serializeCookieHeader(FREE_ACCOUNT_COOKIE_NAME, value, options);
}

export async function issueFreeAccountCookie(
  c: Pick<Context, "header">,
  secret: string | undefined,
  accountId: string | null | undefined,
): Promise<void> {
  if (!secret || !accountId) return;
  c.header("Set-Cookie", await buildSignedFreeAccountCookieHeader(secret, accountId), { append: true });
}

export async function buildFreeAccountCookieHeader(secret: string | undefined, accountId: string | null | undefined): Promise<string | null> {
  if (!secret || !accountId) return null;
  return buildSignedFreeAccountCookieHeader(secret, accountId);
}
