export const API_BASE = import.meta.env.VITE_API_BASE || "";
export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? "";

/**
 * Default quota allowances — kept in sync with backend defaults in
 * `apps/backend/src/utils/quota.ts`. Operators override these per environment
 * by setting `VITE_FREE_QUOTA_LIMIT` / `VITE_PRO_INITIAL_QUOTA` (and the
 * matching backend `FREE_QUOTA_LIMIT` / `PRO_INITIAL_QUOTA`).
 */
export const DEFAULT_FREE_QUOTA_LIMIT = 20;
export const DEFAULT_PRO_INITIAL_QUOTA = 100;

function parseQuotaEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) return fallback;
  return n;
}

export const FREE_QUOTA_LIMIT = parseQuotaEnv(
  import.meta.env.VITE_FREE_QUOTA_LIMIT as string | undefined,
  DEFAULT_FREE_QUOTA_LIMIT,
);

export const PRO_QUOTA_LIMIT = parseQuotaEnv(
  import.meta.env.VITE_PRO_INITIAL_QUOTA as string | undefined,
  DEFAULT_PRO_INITIAL_QUOTA,
);

/**
 * BYOK (Bring Your Own Key) feature flag. When disabled, the `/key` slash
 * command, BYOK badges, profile messaging, and direct OpenRouter request path
 * are all hidden. Any stale `apiKey` in saved game state is ignored. Defaults
 * to enabled for backward compatibility — operators opt out by setting
 * `VITE_ENABLE_BYOK=false`.
 */
function parseBoolEnv(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }
  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }
  return fallback;
}

export const BYOK_ENABLED = parseBoolEnv(
  import.meta.env.VITE_ENABLE_BYOK as string | undefined,
  true,
);

/**
 * Checkout URLs for the upgrade overlay. Operators set these to point at their
 * payment provider (e.g. Polar, Stripe). When a URL is empty/unset the
 * corresponding button is disabled with a terminal-style error message.
 */
export const UPGRADE_CHECKOUT_SINGLE: string =
  (import.meta.env.VITE_UPGRADE_CHECKOUT_SINGLE as string | undefined) ?? "";

export const UPGRADE_CHECKOUT_MULTI: string =
  (import.meta.env.VITE_UPGRADE_CHECKOUT_MULTI as string | undefined) ?? "";

export const UPGRADE_PRICE_SINGLE: string =
  (import.meta.env.VITE_UPGRADE_PRICE_SINGLE as string | undefined) ?? "$4.99";

export const UPGRADE_PRICE_MULTI: string =
  (import.meta.env.VITE_UPGRADE_PRICE_MULTI as string | undefined) ?? "$19.99";
