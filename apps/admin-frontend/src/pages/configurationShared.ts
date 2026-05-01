export interface ConfigEntry {
  key: string;
  tier: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface ConfigForm {
  key: string;
  tier: string;
  value: string;
  description: string;
}

export const emptyForm: ConfigForm = { key: "", tier: "*", value: "", description: "" };

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
];
