/**
 * Shared Turnstile verification status types used by both the backend
 * verify route and the frontend TurnstileWidget.
 *
 * Keeping these in one place reduces drift risk when the verify API changes.
 */

/** Status strings returned by GET /api/verify */
export const VERIFY_STATUS = {
  DISABLED: "disabled",
  ENABLED: "enabled",
  VERIFIED: "verified",
  MISCONFIGURED: "misconfigured",
  UNAVAILABLE: "unavailable",
} as const;

export type VerifyStatus = (typeof VERIFY_STATUS)[keyof typeof VERIFY_STATUS];

/** Reason strings for unavailable status */
export const UNAVAILABLE_REASON = {
  SESSION_UNAVAILABLE: "session_unavailable",
  STORAGE_UNAVAILABLE: "storage_unavailable",
} as const;

export type UnavailableReason = (typeof UNAVAILABLE_REASON)[keyof typeof UNAVAILABLE_REASON];

/** Reason strings for POST /api/verify 403 responses */
export const VERIFY_FAILURE_REASON = {
  TOKEN_EXPIRED: "token_expired",
  CHALLENGE_FAILED: "challenge_failed",
} as const;

export type VerifyFailureReason = (typeof VERIFY_FAILURE_REASON)[keyof typeof VERIFY_FAILURE_REASON];

/** Misconfigured reason strings */
export const MISCONFIGURED_REASON = {
  INVALID_EXPECTED_HOSTNAME: "invalid_expected_hostname",
} as const;

export type MisconfiguredReason = (typeof MISCONFIGURED_REASON)[keyof typeof MISCONFIGURED_REASON];
