import { type Context, Hono } from "hono";
import { getClientIp, createRateLimiter } from "../middleware/rateLimiter";
import { normalizeHostname, getExpectedHostnameConfig } from "../utils/hostname";
import {
  VERIFY_STATUS,
  UNAVAILABLE_REASON,
  VERIFY_FAILURE_REASON,
  MISCONFIGURED_REASON,
  humanFlagKey,
  HUMAN_FLAG_TTL_SECONDS,
  type VerifyStatusResponse,
} from "@claude-cope/shared/turnstile";

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

const verify = new Hono<Env>();
type VerifyContext = Context<Env>;

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_VERIFY_TIMEOUT_MS = 10_000;
type VerifyFailureStatus = 502 | 503;
const VERIFY_NO_STORE = "no-store, max-age=0";

const getHostnameConfig = (c: VerifyContext) => getExpectedHostnameConfig(c.env?.TURNSTILE_EXPECTED_HOSTNAME);
const getTurnstileSecret = (c: VerifyContext): string | undefined => c.env?.TURNSTILE_SECRET_KEY;

verify.use("*", async (c, next) => {
  c.header("Cache-Control", VERIFY_NO_STORE);
  await next();
});

verify.get("/", async (c, next) => {
  if (!getTurnstileSecret(c)) {
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.DISABLED,
      enabled: false,
      bypassed: true,
      misconfigured: false,
    };
    return c.json(response);
  }
  await next();
}, createRateLimiter("verify-status:"), async (c) => {
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;
  const expectedHostname = getHostnameConfig(c);
  if (expectedHostname.invalid) {
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.MISCONFIGURED,
      enabled: false,
      bypassed: false,
      misconfigured: true,
      reason: MISCONFIGURED_REASON.INVALID_EXPECTED_HOSTNAME,
    };
    return c.json(response);
  }
  if (!sessionId) {
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.UNAVAILABLE,
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: UNAVAILABLE_REASON.SESSION_UNAVAILABLE,
    };
    return c.json(response);
  }
  if (!kv) {
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.UNAVAILABLE,
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: UNAVAILABLE_REASON.STORAGE_UNAVAILABLE,
    };
    return c.json(response);
  }

  let humanFlag: string | null;
  try {
    humanFlag = await kv.get(humanFlagKey(sessionId));
  } catch (e) {
    console.error("KV read error in verify status", e);
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.UNAVAILABLE,
      enabled: false,
      bypassed: false,
      misconfigured: false,
      reason: UNAVAILABLE_REASON.VERIFICATION_CHECK_FAILED,
    };
    return c.json(response);
  }
  if (humanFlag) {
    const response: VerifyStatusResponse = {
      status: VERIFY_STATUS.VERIFIED,
      enabled: true,
      bypassed: false,
      misconfigured: false,
    };
    return c.json(response);
  }

  const response: VerifyStatusResponse = {
    status: VERIFY_STATUS.ENABLED,
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TURNSTILE_VERIFY_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form, signal: controller.signal });
  } catch (error) {
    console.warn("Turnstile siteverify request failed", {
      error: error instanceof Error ? error.message : String(error),
      aborted: controller.signal.aborted,
    });
    return {
      ok: false as const,
      status: 503,
      body: { verified: false, error: "Verification service unavailable" },
    };
  } finally {
    clearTimeout(timeoutId);
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

verify.post("/", async (c, next) => {
  // Bypass rate limiting when Turnstile is disabled so that unconfigured
  // environments never receive 429 instead of the documented bypass response.
  if (!c.env?.TURNSTILE_SECRET_KEY) {
    return c.json({ verified: true, bypassed: true });
  }
  await next();
}, createRateLimiter("verify-submit:"), async (c) => {
  const secret = getTurnstileSecret(c);
  const sessionId = c.get("sessionId");
  const kv = c.env?.USAGE_KV;
  const expectedHostname = getHostnameConfig(c);

  if (!sessionId) {
    return c.json({ verified: false, error: "Session unavailable" }, 503);
  }

  if (!kv) {
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
    const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
    if (errorCodes.length > 0) {
      console.warn("Turnstile verification failed", { errorCodes });
    }
    const reason = errorCodes.includes("timeout-or-duplicate") ? VERIFY_FAILURE_REASON.TOKEN_EXPIRED : VERIFY_FAILURE_REASON.CHALLENGE_FAILED;
    return c.json({ verified: false, reason }, 403);
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

  try {
    await kv.put(humanFlagKey(sessionId), "1", { expirationTtl: HUMAN_FLAG_TTL_SECONDS });
  } catch (e) {
    console.error("KV write error in verify", e);
    return c.json({ verified: false, error: "Failed to store verification" }, 503);
  }
  return c.json({ verified: true });
});

export default verify;
