export interface CopeModel {
  id: string;
  name: string;
  openRouterId: string;
  multiplier: number;
  tier: "free" | "pro";
}

export const COPE_MODELS: CopeModel[] = [
  {
    id: "botnet",
    name: "Cope Botnet 0.007",
    openRouterId: "nvidia/nemotron-nano-9b-v2",
    // Base model costs 1 credit per prompt to maximize free tier engagement duration
    multiplier: 1,
    tier: "free",
  },
  {
    id: "bogus",
    name: "Cope Bogus vFINAL_v2_USE_THIS_ONE",
    openRouterId: "openai/gpt-oss-20b",
    // Premium models consume quota faster to encourage B2B upgrades once hooked
    multiplier: 5,
    tier: "pro",
  },
  {
    id: "enterprise",
    name: "Cope Typos Enterprise Edition",
    openRouterId: "x-ai/grok-4.1-fast",
    // The highest tier model burns through credits rapidly, acting as a whale sink
    multiplier: 10,
    tier: "pro",
  },
];
