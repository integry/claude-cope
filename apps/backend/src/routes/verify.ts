import { type Context, Hono } from "hono";
import { getClientIp } from "../middleware/rateLimiter";

type Env = {
  Bindings: {
    TURNSTILE_SECRET_KEY?: string;
    TURNSTILE_EXPECTED_HOSTNAME?: string;
    USAGE_KV?: KVNamespace;
  };
  Variables: {
    sessionId: string;
  };
};

type VerifyBody = {
  token?: string;
};

type TurnstileVerifyResponse = {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

const HUMAN_TTL_SECONDS = 60 * 60 * 24;
const verify = new Hono<Env>();
type VerifyContext = Context<Env>;

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
type VerifyFailureStatus = 502 | 503;

verify.get("/", async (c) => {
  const secret = c.env?.TURNSTILE_SECRET_KEY;
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;
  const enabled = Boolean(secret && sessionId && kv);
  const bypassed = !secret;
  const misconfigured = Boolean(secret) && !enabled;
  return c.json({ enabled, bypassed, misconfigured });
});

const parseVerifyBody = async (c: VerifyContext): Promise<VerifyBody> =>
  c.req.json<VerifyBody>().catch((): VerifyBody => ({}));

const buildTurnstileForm = (secret: string, token: string, ip: string | null): URLSearchParams => {
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);
  return form;
};

const verifyWithTurnstile = async (
  form: URLSearchParams
): Promise<
  | { ok: true; data: TurnstileVerifyResponse }
  | { ok: false; status: VerifyFailureStatus; body: { verified: false; error: string } }
> => {
  let resp: Response;
  try {
    resp = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
  } catch {
    return {
      ok: false as const,
      status: 503,
      body: { verified: false, error: "Verification service unavailable" },
    };
  }

  if (!resp.ok) {
    return { ok: false as const, status: 502, body: { verified: false, error: "Failed to verify token" } };
  }

  const data = await resp.json().catch(() => null) as TurnstileVerifyResponse | null;
  if (!data || typeof data.success !== "boolean") {
    return { ok: false as const, status: 502, body: { verified: false, error: "Invalid verification response" } };
  }

  return { ok: true as const, data };
};

const normalizeHostname = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const first = value.split(",")[0]?.trim();
  if (!first) return undefined;
  return first.replace(/:\d+$/, "").toLowerCase();
};

const expectedHostnameFromConfig = (c: VerifyContext): string | undefined =>
  normalizeHostname(c.env?.TURNSTILE_EXPECTED_HOSTNAME);

verify.post("/", async (c) => {
  const secret = c.env?.TURNSTILE_SECRET_KEY;
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;

  if (!secret) {
    return c.json({ verified: true, bypassed: true });
  }

  if (!kv || !sessionId) {
    return c.json({ verified: false, error: "Verification storage unavailable" }, 503);
  }

  const body = await parseVerifyBody(c);
  const token = body.token;
  if (!token) {
    return c.json({ verified: false, error: "token is required" }, 400);
  }

  const ip = getClientIp(c.req);
  const form = buildTurnstileForm(secret, token, ip);
  const verification = await verifyWithTurnstile(form);
  if (!verification.ok) {
    return c.json(verification.body, verification.status);
  }
  const data = verification.data;

  if (!data.success) {
    if (Array.isArray(data["error-codes"]) && data["error-codes"].length > 0) {
      console.warn("Turnstile verification failed", { errorCodes: data["error-codes"] });
    }
    return c.json({ verified: false }, 403);
  }

  const expectedHostname = expectedHostnameFromConfig(c);
  const actualHostname = normalizeHostname(data.hostname);
  if (expectedHostname) {
    if (!actualHostname || actualHostname !== expectedHostname) {
      console.warn("Turnstile hostname mismatch", {
        expectedHostname,
        actualHostname,
      });
      return c.json({ verified: false, error: "Unexpected verification hostname" }, 403);
    }
  }

  await kv.put(`human:${sessionId}`, "1", { expirationTtl: HUMAN_TTL_SECONDS });
  return c.json({ verified: true });
});

export default verify;
