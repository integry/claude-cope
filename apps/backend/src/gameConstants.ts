/** Minimal generator data needed for server-side multiplier validation. */
export const GENERATORS: { id: string; baseOutput: number }[] = [
  { id: "stackoverflow-copy-paster", baseOutput: 5 },
  { id: "intern", baseOutput: 10 },
  { id: "hotfix", baseOutput: 18 },
  { id: "npm", baseOutput: 30 },
  { id: "microservice", baseOutput: 50 },
  { id: "rogue-api-key", baseOutput: 75 },
  { id: "llm-code-wrapper", baseOutput: 120 },
  { id: "agile", baseOutput: 200 },
  { id: "blockchain", baseOutput: 350 },
  { id: "kubernetes-overlord", baseOutput: 600 },
  { id: "vibe-coder", baseOutput: 1000 },
];

export const UPGRADES: { id: string; targetGeneratorId: string; requiredGeneratorId: string; multiplier: number; synergyPercent?: number }[] = [
  { id: "intern-boost-copypaster", targetGeneratorId: "stackoverflow-copy-paster", requiredGeneratorId: "intern", multiplier: 2 },
  { id: "hotfix-boost-intern", targetGeneratorId: "intern", requiredGeneratorId: "hotfix", multiplier: 2 },
  { id: "npm-boost-hotfix", targetGeneratorId: "hotfix", requiredGeneratorId: "npm", multiplier: 2 },
  { id: "microservice-boost-npm", targetGeneratorId: "npm", requiredGeneratorId: "microservice", multiplier: 2 },
  { id: "rogue-api-key-boost-llm-wrapper", targetGeneratorId: "rogue-api-key", requiredGeneratorId: "llm-code-wrapper", multiplier: 2 },
  { id: "llm-boost-microservice", targetGeneratorId: "microservice", requiredGeneratorId: "llm-code-wrapper", multiplier: 2 },
  { id: "agile-boost-llm", targetGeneratorId: "llm-code-wrapper", requiredGeneratorId: "agile", multiplier: 2, synergyPercent: 1 },
  { id: "blockchain-boost-agile", targetGeneratorId: "agile", requiredGeneratorId: "blockchain", multiplier: 2 },
  { id: "kubernetes-boost-blockchain", targetGeneratorId: "blockchain", requiredGeneratorId: "kubernetes-overlord", multiplier: 2 },
  { id: "vibe-boost-kubernetes", targetGeneratorId: "kubernetes-overlord", requiredGeneratorId: "vibe-coder", multiplier: 2 },
];

/** Compute active multiplier server-side (mirrors frontend calculateActiveMultiplier). */
export function computeMultiplier(inventory: Record<string, number>, ownedUpgrades: string[] = []): number {
  const synergies: Record<string, number> = {};
  for (const upgradeId of ownedUpgrades) {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) continue;
    const effective = upgrade.synergyPercent != null
      ? 1 + ((inventory[upgrade.requiredGeneratorId] ?? 0) * upgrade.synergyPercent) / 100
      : upgrade.multiplier;
    synergies[upgrade.targetGeneratorId] = (synergies[upgrade.targetGeneratorId] ?? 1) * effective;
  }

  let bonusPercent = 0;
  for (const gen of GENERATORS) {
    const count = inventory[gen.id] ?? 0;
    const synergy = synergies[gen.id] ?? 1;
    bonusPercent += count * gen.baseOutput * synergy;
  }
  return 1 + bonusPercent / 100;
}
