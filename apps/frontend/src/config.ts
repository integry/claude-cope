export const API_BASE = import.meta.env.VITE_API_BASE || "";

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
