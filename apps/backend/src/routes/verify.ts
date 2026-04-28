import { Hono } from "hono";

type Env = {
  Bindings: {
    TURNSTILE_SECRET_KEY?: string;
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
};

const HUMAN_TTL_SECONDS = 60 * 60 * 24;
const verify = new Hono<Env>();

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

  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip");
  if (ip) form.set("remoteip", ip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  if (!resp.ok) {
    return c.json({ verified: false, error: "Failed to verify token" }, 502);
  }

  const data = await resp.json() as TurnstileVerifyResponse;
  if (!data.success) {
    return c.json({ verified: false }, 403);
  }

  await kv.put(`human:${sessionId}`, "1", { expirationTtl: HUMAN_TTL_SECONDS });
  return c.json({ verified: true });
});

export default verify;
