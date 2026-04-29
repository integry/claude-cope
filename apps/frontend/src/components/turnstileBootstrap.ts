import { VERIFY_URL } from "../config";
import {
  VERIFY_STATUS,
  UNAVAILABLE_REASON,
  VERIFY_FAILURE_REASON,
  type VerifyStatusResponse,
} from "@claude-cope/shared/turnstile";

export type VerifyTokenResult = {
  verified: boolean;
  retryable: boolean;
  message?: string;
};

export type BackendVerificationStatus =
  | { status: "enabled" | "disabled" | "verified" }
  | { status: "misconfigured"; message: string }
  | { status: "unavailable"; message: string; retryable: boolean };

export function parseBackendVerificationStatus(data: unknown): BackendVerificationStatus {
  const payload = data as
    | (Partial<VerifyStatusResponse> & {
        status?: string;
        reason?: string;
        bypassed?: boolean;
        enabled?: boolean;
        misconfigured?: boolean;
      })
    | undefined;

  if (payload?.status === VERIFY_STATUS.MISCONFIGURED) {
    return {
      status: "misconfigured",
      message: "Human verification is unavailable because the server is misconfigured.",
    };
  }
  if (payload?.status === VERIFY_STATUS.UNAVAILABLE) {
    if (payload.reason === UNAVAILABLE_REASON.SESSION_UNAVAILABLE) {
      return {
        status: "unavailable",
        message: "Human verification could not start because the session is unavailable. Please retry.",
        retryable: false,
      };
    }
    if (payload.reason === UNAVAILABLE_REASON.VERIFICATION_CHECK_FAILED) {
      return {
        status: "unavailable",
        message: "Human verification status could not be checked. Please retry.",
        retryable: true,
      };
    }
    return {
      status: "unavailable",
      message:
        "Human verification is temporarily unavailable.",
      retryable: true,
    };
  }
  if (payload?.status === VERIFY_STATUS.DISABLED || payload?.status === VERIFY_STATUS.ENABLED || payload?.status === VERIFY_STATUS.VERIFIED) {
    return { status: payload.status };
  }
  if (typeof payload?.bypassed === "boolean") {
    return { status: payload.bypassed ? "disabled" : "enabled" };
  }
  if (typeof payload?.enabled === "boolean") {
    return payload.enabled
      ? { status: "enabled" }
      : {
        status: "unavailable",
        message: payload.misconfigured
          ? "Human verification is unavailable because the server is misconfigured."
          : "Human verification is temporarily unavailable.",
        retryable: !payload.misconfigured,
        };
  }

  return {
    status: "unavailable",
    message: "Unable to determine verification status from the server.",
    retryable: true,
  };
}

export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return {
      verified: Boolean(data?.verified),
      retryable: !data?.verified,
    };
  }

  if (res.status === 403) {
    const reason = data?.reason as string | undefined;
    const retryable = reason === VERIFY_FAILURE_REASON.CHALLENGE_FAILED || reason === VERIFY_FAILURE_REASON.TOKEN_EXPIRED || typeof data?.error !== "string";
    return {
      verified: false,
      retryable,
      message: typeof data?.error === "string" ? data.error : undefined,
    };
  }

  if (res.status === 429) {
    return {
      verified: false,
      retryable: false,
      message: typeof data?.error === "string" ? data.error : "Too many verification attempts. Please wait and try again.",
    };
  }

  if (res.status >= 500) {
    return {
      verified: false,
      retryable: false,
      message: typeof data?.error === "string" ? data.error : "Verification service is temporarily unavailable.",
    };
  }

  return {
    verified: false,
    retryable: false,
    message: typeof data?.error === "string" ? data.error : undefined,
  };
}

export async function getBackendVerificationStatus(): Promise<BackendVerificationStatus> {
  const res = await fetch(VERIFY_URL, {
    method: "GET",
    credentials: "include",
  }).catch(() => null);
  if (!res) {
    return { status: "unavailable", message: "Unable to determine verification status from the server.", retryable: true };
  }
  if (res.status === 429) {
    return { status: "unavailable", message: "Human verification is temporarily rate limited. Please retry shortly.", retryable: true };
  }
  if (res.status >= 500) {
    return { status: "unavailable", message: "Human verification is temporarily unavailable. Please retry shortly.", retryable: true };
  }
  if (!res.ok) {
    return { status: "unavailable", message: "Verification service is temporarily unavailable.", retryable: true };
  }

  const data = await res.json().catch(() => ({}));
  return parseBackendVerificationStatus(data);
}

export type BootstrapResult =
  | { outcome: "enabled" }
  | { outcome: "verified" }
  | { outcome: "error"; message: string };

export async function pollBootstrapStatus(
  isCancelled: () => boolean,
  maxRetries = 3,
): Promise<BootstrapResult> {
  let retries = 0;
  const wait = (ms: number) => new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

  while (true) {
    const status = await getBackendVerificationStatus();
    if (isCancelled()) return { outcome: "error", message: "Cancelled" };

    if (status.status === "disabled" || status.status === "verified") {
      return { outcome: "verified" };
    }
    if (status.status === "enabled") {
      return { outcome: "enabled" };
    }
    if (status.status === "misconfigured") {
      return { outcome: "error", message: status.message };
    }
    if (status.status !== "unavailable") {
      return { outcome: "error", message: "Unable to determine verification status from the server." };
    }
    if (!status.retryable || retries >= maxRetries) {
      return { outcome: "error", message: status.message };
    }

    retries += 1;
    await wait(Math.min(1000 * 2 ** (retries - 1), 4000));
    if (isCancelled()) return { outcome: "error", message: "Cancelled" };
  }
}
