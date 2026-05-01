export const SENSITIVE_KEYS = new Set(["openrouter_api_key", "turnstile_secret_key", "category_api_key"]);
export const CATEGORY_KEYS = new Set(["category_model", "category_api_key"]);
export const VALID_CATEGORY_TIERS = ["*", "max", "free", "depleted"] as const;
export const VALID_CATEGORY_TIERS_SET = new Set<string>(VALID_CATEGORY_TIERS);

export const GLOBAL_ONLY_KEYS = new Set([
  "openrouter_api_key",
  "openrouter_providers",
  "openrouter_providers_free_only",
  "turnstile_secret_key",
  "free_quota_limit",
  "pro_initial_quota",
  "enable_ticket_refine",
  "enable_byok",
]);
