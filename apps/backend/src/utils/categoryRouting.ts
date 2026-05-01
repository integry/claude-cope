export type RequestCategory = "max" | "free" | "depleted";

export function assignCategory(opts: {
  isProUser: boolean;
  quotaPercent: number;
}): RequestCategory {
  if (opts.quotaPercent <= 0) return "depleted";
  if (opts.isProUser) return "max";
  return "free";
}

export interface CategoryConfig {
  model: string | null;
  apiKey: string | null;
}

export interface OpenRouterConfig {
  apiKey: string | null;
  providers: string | null;
  providersFreeOnly: string | null;
}

export interface CombinedRoutingConfig {
  openRouter: OpenRouterConfig;
  category: CategoryConfig;
}

export async function getOpenRouterConfig(db: D1Database): Promise<OpenRouterConfig> {
  const { results } = await db
    .prepare(
      `SELECT key, value FROM system_config
       WHERE key IN ('openrouter_api_key', 'openrouter_providers', 'openrouter_providers_free_only')
       AND tier = '*'`,
    )
    .all<{ key: string; value: string }>();

  let apiKey: string | null = null;
  let providers: string | null = null;
  let providersFreeOnly: string | null = null;

  for (const row of results ?? []) {
    if (row.key === "openrouter_api_key") apiKey = row.value;
    if (row.key === "openrouter_providers") providers = row.value;
    if (row.key === "openrouter_providers_free_only") providersFreeOnly = row.value;
  }

  return { apiKey, providers, providersFreeOnly };
}

export async function getCategoryConfig(
  db: D1Database,
  category: RequestCategory,
): Promise<CategoryConfig> {
  const { results } = await db
    .prepare(
      `SELECT key, tier, value FROM system_config
       WHERE key IN ('category_model', 'category_api_key')
       AND tier IN (?, '*')
       ORDER BY key, CASE WHEN tier = ? THEN 0 ELSE 1 END`,
    )
    .bind(category, category)
    .all<{ key: string; tier: string; value: string }>();

  let model: string | null = null;
  let apiKey: string | null = null;

  for (const row of results ?? []) {
    if (row.key === "category_model" && model === null) model = row.value;
    if (row.key === "category_api_key" && apiKey === null) apiKey = row.value;
  }

  return { model, apiKey };
}

export async function getRoutingConfig(
  db: D1Database,
  category: RequestCategory,
): Promise<CombinedRoutingConfig> {
  const { results } = await db
    .prepare(
      `SELECT key, tier, value FROM system_config
       WHERE (key IN ('openrouter_api_key', 'openrouter_providers', 'openrouter_providers_free_only') AND tier = '*')
          OR (key IN ('category_model', 'category_api_key') AND tier IN (?, '*'))
       ORDER BY key, CASE WHEN tier = ? THEN 0 ELSE 1 END`,
    )
    .bind(category, category)
    .all<{ key: string; tier: string; value: string }>();

  let orApiKey: string | null = null;
  let providers: string | null = null;
  let providersFreeOnly: string | null = null;
  let categoryModel: string | null = null;
  let categoryApiKey: string | null = null;

  for (const row of results ?? []) {
    if (row.key === "openrouter_api_key") orApiKey = row.value;
    if (row.key === "openrouter_providers") providers = row.value;
    if (row.key === "openrouter_providers_free_only") providersFreeOnly = row.value;
    if (row.key === "category_model" && categoryModel === null) categoryModel = row.value;
    if (row.key === "category_api_key" && categoryApiKey === null) categoryApiKey = row.value;
  }

  return {
    openRouter: { apiKey: orApiKey, providers, providersFreeOnly },
    category: { model: categoryModel, apiKey: categoryApiKey },
  };
}
