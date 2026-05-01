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

// Sentinel value used in PUT requests to indicate the existing value should be
// kept (e.g. when editing a sensitive key without changing its secret).
export const PRESERVE_VALUE_SENTINEL = "__PRESERVE_EXISTING__";

export const WELL_KNOWN_KEYS = [
  { key: "openrouter_api_key", description: "OpenRouter API key for LLM requests" },
  { key: "openrouter_providers", description: "Preferred OpenRouter providers (comma-separated)" },
  { key: "openrouter_providers_free_only", description: "Apply provider preference to free tier only (true/false)" },
  { key: "turnstile_secret_key", description: "Cloudflare Turnstile secret key" },
  { key: "free_quota_limit", description: "Per-session free-tier request allowance" },
  { key: "pro_initial_quota", description: "Per-license Pro-tier initial request allowance" },
  { key: "model_multiplier", description: "Credit multiplier override for a model (tier = model ID)" },
  { key: "enable_ticket_refine", description: "Enable ticket refinement endpoint (true/false)" },
  { key: "enable_byok", description: "Enable Bring Your Own Key feature (true/false)" },
  { key: "category_model", description: "OpenRouter model ID for a request category (tier = max/free/depleted)" },
  { key: "category_api_key", description: "OpenRouter API key for a request category (tier = max/free/depleted)" },
] as const;
