export interface CopeModel {
  id: string;
  name: string;
  openRouterId: string;
  multiplier: number;
  tier: "free" | "pro";
}

export const DEFAULT_COPE_MODEL_ID = "regret";

const LEGACY_COPE_MODEL_IDS: Readonly<Record<string, string>> = {
  botnet: "regret",
  bogus: "copus",
  enterprise: "psychos",
  "typos-enterprise": "psychos",
};

export const COPE_MODELS: readonly Readonly<CopeModel>[] = [
  {
    id: DEFAULT_COPE_MODEL_ID,
    name: "Cope Regret vFINAL_v2_USE_THIS_ONE",
    openRouterId: "nvidia/nemotron-nano-9b-v2",
    // Base model costs 1 credit per prompt to maximize free tier engagement duration
    multiplier: 1,
    tier: "free",
  },
  {
    id: "copus",
    name: "Cope Copus 4.69",
    openRouterId: "openai/gpt-oss-20b",
    // Premium models consume quota faster to encourage B2B upgrades once hooked
    multiplier: 5,
    tier: "pro",
  },
  {
    id: "psychos",
    name: "Cope Psychos (Red-Teamed)",
    openRouterId: "x-ai/grok-4.1-fast",
    // The highest tier model burns through credits rapidly, acting as a whale sink
    multiplier: 10,
    tier: "pro",
  },
];

export function migrateLegacyCopeModelId(modelId?: string): string | undefined {
  if (!modelId) return undefined;
  const normalizedModelId = modelId.toLowerCase();
  return LEGACY_COPE_MODEL_IDS[normalizedModelId] ?? modelId;
}

export function isCopeModelId(modelId?: string): boolean {
  return Boolean(modelId && COPE_MODELS.some((model) => model.id === modelId.toLowerCase()));
}

export function resolveCopeModelId(modelId?: string): string | undefined {
  const migratedModelId = migrateLegacyCopeModelId(modelId);
  const canonicalModelId = migratedModelId?.toLowerCase();
  return isCopeModelId(canonicalModelId) ? canonicalModelId : undefined;
}

export function getDefaultCopeModel(): CopeModel {
  return COPE_MODELS.find((model) => model.id === DEFAULT_COPE_MODEL_ID) ?? COPE_MODELS[0]!;
}

export function resolveCopeModel(modelId?: string): CopeModel | undefined {
  const resolvedModelId = resolveCopeModelId(modelId);
  return resolvedModelId ? COPE_MODELS.find((model) => model.id === resolvedModelId) : undefined;
}
