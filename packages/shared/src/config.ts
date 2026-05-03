import { parseProviderList } from "./openrouter";

export const SENSITIVE_KEYS = new Set(["openrouter_api_key", "turnstile_secret_key", "category_api_key"]);
export const CATEGORY_KEYS = new Set(["category_model", "category_api_key"]);
export const VALID_CATEGORY_TIERS = ["*", "max", "free", "depleted"] as const;
export const VALID_CATEGORY_TIERS_SET = new Set<string>(VALID_CATEGORY_TIERS);
export const MODEL_TIERED_KEYS = new Set(["model_multiplier"]);

export const BOOLEAN_KEYS = new Set([
  "openrouter_providers_free_only",
  "enable_ticket_refine",
  "enable_byok",
]);

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

export const KNOWN_CONFIG_KEYS_SET = new Set<string>(WELL_KNOWN_KEYS.map((key) => key.key));

export function isModelTier(tier: string): boolean {
  if (!tier.includes("/")) return false;
  const parts = tier.split("/");
  if (parts.length !== 2) return false;
  const provider = parts[0] ?? "";
  const model = parts[1] ?? "";
  return provider.trim().length > 0 && model.trim().length > 0;
}

export function isValidTierQuery(tier: string): boolean {
  return VALID_CATEGORY_TIERS_SET.has(tier) || isModelTier(tier);
}

export function validateConfigKey(key: string): string | null {
  if (!key) return "key must not be empty";
  if (!KNOWN_CONFIG_KEYS_SET.has(key)) {
    return `Unknown configuration key "${key}". Check for typos.`;
  }
  return null;
}

export function validateConfigKeyAndTier(key: string, tier: string): string | null {
  const keyValidationError = validateConfigKey(key);
  if (keyValidationError) return keyValidationError;
  if (!tier) return "tier must not be empty";

  if (CATEGORY_KEYS.has(key) && !VALID_CATEGORY_TIERS_SET.has(tier)) {
    return `Invalid tier "${tier}" for ${key}. Valid tiers: *, max, free, depleted`;
  }

  if (GLOBAL_ONLY_KEYS.has(key) && tier !== "*") {
    return `Key "${key}" only supports tier "*". This key is not category-specific.`;
  }

  if (MODEL_TIERED_KEYS.has(key) && !isModelTier(tier)) {
    return `Key "${key}" requires a model ID tier such as "openai/gpt-4o".`;
  }

  if (!CATEGORY_KEYS.has(key) && !GLOBAL_ONLY_KEYS.has(key) && !MODEL_TIERED_KEYS.has(key) && tier !== "*") {
    return `Key "${key}" only supports tier "*".`;
  }

  return null;
}

export function normalizeBooleanConfigValue(value: string): string | null {
  const lower = value.trim().toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return "true";
  if (lower === "false" || lower === "0" || lower === "no") return "false";
  return null;
}

export function validateConfigValue(key: string, value: string): string | null {
  if (key === "category_model") {
    const trimmed = value.trim();
    if (!trimmed) return 'Value for "category_model" must not be empty.';
    if (!isModelTier(trimmed)) {
      return 'Value for "category_model" must look like an OpenRouter model ID such as "openai/gpt-4o".';
    }
  }

  if (key === "openrouter_providers") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const rawParts = trimmed.split(",");
    if (rawParts.some((part) => part.trim().length === 0)) {
      return 'Value for "openrouter_providers" must be a comma-separated list of provider names without empty entries.';
    }

    const providers = parseProviderList(trimmed);
    if (providers.length === 0) {
      return 'Value for "openrouter_providers" must contain at least one provider name.';
    }
  }

  if (BOOLEAN_KEYS.has(key) && normalizeBooleanConfigValue(value) === null) {
    return `Invalid boolean value for "${key}". Use true/false, 1/0, or yes/no.`;
  }

  return null;
}
