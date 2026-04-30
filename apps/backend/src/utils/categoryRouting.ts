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
