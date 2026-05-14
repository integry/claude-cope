export interface CopeModel {
  id: string;
  name: string;
  openRouterId: string;
  multiplier: number;
  tier: "free" | "pro";
}

export const COPE_MODELS: CopeModel[] = [
  {
    id: "regret",
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
