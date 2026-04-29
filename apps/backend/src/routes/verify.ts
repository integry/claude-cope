import { type Context, Hono } from "hono";
import { getClientIp } from "../middleware/rateLimiter";
import { createRateLimiter } from "../middleware/rateLimiter";

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

type VerifyStatusResponse =
  | {
      status: "disabled";
      enabled: false;
      bypassed: true;
      misconfigured: false;
    }
  | {
      status: "enabled";
      enabled: true;
      bypassed: false;
      misconfigured: false;
    }
  | {
      status: "misconfigured";
      enabled: false;
      bypassed: false;
      misconfigured: true;
      reason: "invalid_expected_hostname";
    }
  | {
      status: "unavailable";
      enabled: false;
      bypassed: false;
      misconfigured: false;
      reason: "session_unavailable" | "storage_unavailable";
    };

const HUMAN_TTL_SECONDS = 60 * 60 * 24;
const verify = new Hono<Env>();
type VerifyContext = Context<Env>;

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
type VerifyFailureStatus = 502 | 503;
const HOSTNAME_PATTERN = /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*)$/i;

const normalizeHostname = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(",") || trimmed.includes("/") || /\s/.test(trimmed)) {
    return undefined;
  }
  const parts = trimmed.split(":");
  if (parts.length > 2) {
    return undefined;
  }
  const [hostname, port] = parts;
  if (!hostname || !HOSTNAME_PATTERN.test(hostname)) {
    return undefined;
  }
  if (port) {
    const portNumber = Number(port);
    if (!/^\d{1,5}$/.test(port) || !Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65_535) {
      return undefined;
    }
  }
  return hostname.toLowerCase();
};

const getExpectedHostnameConfig = (c: VerifyContext): { hostname?: string; invalid: boolean } => {
  const raw = c.env?.TURNSTILE_EXPECTED_HOSTNAME?.trim();
  if (!raw) return { invalid: false };

  const hostname = normalizeHostname(raw);
  if (!hostname) {
    return { invalid: true };
  }
  return { hostname, invalid: false };
};

verify.get("/", createRateLimiter("verify-status:"), async (c) => {
  const secret = c.env?.TURNSTILE_SECRET_KEY;
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;
  const expectedHostname = getExpectedHostnameConfig(c);
  if (!secret) {
    const response: VerifyStatusResponse = {
      status: "disabled",
      enabled: false,
      bypassed: true,
      misconfigured: false,
    };
    return c.json(response);
  }
  if (expectedHostname.invalid) {
    const response: VerifyStatusResponse = {
      status: "misconfigured",
      enabled: false,
      bypassed: false,
      misconfigured: true,
      reason: "invalid_expected_hostname",
    };
    return c.json(response);
  }
  if (!sessionId) {
    const response: VerifyStatusResponse = {
      status: "unavailable",
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: "session_unavailable",
    };
    return c.json(response);
  }
  if (!kv) {
    const response: VerifyStatusResponse = {
      status: "unavailable",
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: "storage_unavailable",
    };
    return c.json(response);
  }

  const response: VerifyStatusResponse = {
    status: "enabled",
    enabled: true,
    bypassed: false,
    misconfigured: false,
  };
  return c.json(response);
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

verify.post("/", createRateLimiter("verify-submit:"), async (c) => {
  const secret = c.env?.TURNSTILE_SECRET_KEY;
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;
  const expectedHostname = getExpectedHostnameConfig(c);

  if (!secret) {
    return c.json({ verified: true, bypassed: true });
  }

  if (!kv || !sessionId) {
    return c.json({ verified: false, error: "Verification storage unavailable" }, 503);
  }

  if (expectedHostname.invalid) {
    return c.json({ verified: false, error: "Verification hostname misconfigured" }, 503);
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

  const actualHostname = normalizeHostname(data.hostname);
  if (expectedHostname.hostname) {
    if (!actualHostname || actualHostname !== expectedHostname.hostname) {
      console.warn("Turnstile hostname mismatch", {
        expectedHostname: expectedHostname.hostname,
        actualHostname,
      });
      return c.json({ verified: false, error: "Unexpected verification hostname" }, 403);
    }
  }

  await kv.put(`human:${sessionId}`, "1", { expirationTtl: HUMAN_TTL_SECONDS });
  return c.json({ verified: true });
});

export default verify;
