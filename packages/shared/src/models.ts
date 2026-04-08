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
    openRouterId: "cope/botnet-0.007",
    multiplier: 1,
    tier: "free",
  },
  {
    id: "bogus",
    name: "Cope Bogus vFINAL_v2_USE_THIS_ONE",
    openRouterId: "cope/bogus-vfinal-v2",
    multiplier: 5,
    tier: "pro",
  },
  {
    id: "typos-enterprise",
    name: "Cope Typos Enterprise Edition",
    openRouterId: "cope/typos-enterprise",
    multiplier: 10,
    tier: "pro",
  },
];
