import { Hono } from "hono";
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

verify.get("/", async (c) => {
  const secret = c.env?.TURNSTILE_SECRET_KEY;
  return c.json({ enabled: Boolean(secret), bypassed: !secret });
});

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

  const body = await c.req.json<VerifyBody>().catch((): VerifyBody => ({}));
  const token = body.token;
  if (!token) {
    return c.json({ verified: false, error: "token is required" }, 400);
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);

  const ip = getClientIp(c.req);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  let resp: Response;
  try {
    resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
  } catch {
    return c.json({ verified: false, error: "Verification service unavailable" }, 503);
  }

  if (!resp.ok) {
    return c.json({ verified: false, error: "Failed to verify token" }, 502);
  }

  const data = await resp.json().catch(() => null) as TurnstileVerifyResponse | null;
  if (!data || typeof data.success !== "boolean") {
    return c.json({ verified: false, error: "Invalid verification response" }, 502);
  }

  if (!data.success) {
    if (Array.isArray(data["error-codes"]) && data["error-codes"].length > 0) {
      console.warn("Turnstile verification failed", { errorCodes: data["error-codes"] });
    }
    return c.json({ verified: false }, 403);
  }

  const expectedHostname =
    c.env?.TURNSTILE_EXPECTED_HOSTNAME ??
    c.req.header("x-forwarded-host") ??
    c.req.header("host");
  if (expectedHostname && data.hostname && data.hostname !== expectedHostname) {
    console.warn("Turnstile hostname mismatch", {
      expectedHostname,
      actualHostname: data.hostname,
    });
    return c.json({ verified: false, error: "Unexpected verification hostname" }, 403);
  }

  await kv.put(`human:${sessionId}`, "1", { expirationTtl: HUMAN_TTL_SECONDS });
  return c.json({ verified: true });
});

export default verify;
