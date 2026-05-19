export interface Generator {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  /** Percentage bonus added to active TD multiplier per unit owned. */
  baseOutput: number;
}

export interface Theme {
  id: string;
  name: string;
  /** Cost in TD to unlock the theme. */
  cost: number;
}

export interface CorporateRank {
  title: string;
  threshold: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  /** The generator whose output gets boosted. */
  targetGeneratorId: string;
  /** The generator you must own to unlock this upgrade. */
  requiredGeneratorId: string;
  /** Multiplier applied to the target generator's output (used when synergy is not set). */
  multiplier: number;
  /**
   * When set, the multiplier scales dynamically based on the count of
   * `requiredGeneratorId` owned: effective multiplier = 1 + (count * synergyPercent / 100).
   * For example, synergyPercent=1 means +1% per required generator owned.
   */
  synergyPercent?: number;
}

export const GROWTH_RATE = 1.15;

/**
 * Fixed TD cost a sender commits to when requesting a code review via `/ping`.
 * Kept here (not server-side) because the economy is client-authoritative; the
 * server only validates the payload shape and enforces transient lifecycle
 * rules. The target is paid this same amount on acceptance.
 */
export const PING_COST = 50;

export const GENERATORS: Generator[] = [
  {
    id: "stackoverflow-copy-paster",
    name: "StackOverflow Copy-Paster",
    description: "Ctrl+C, Ctrl+V. Who needs to understand the code?",
    baseCost: 15,
    baseOutput: 5,
  },
  {
    id: "intern",
    name: "Unpaid Bootcamp Intern",
    description: "Writes untestable spaghetti code in exchange for 'industry exposure'.",
    baseCost: 100,
    baseOutput: 10,
  },
  {
    id: "hotfix",
    name: '"Temporary" Hotfix',
    description: "A comment reads: // TODO: Fix this later. The Git blame is from 2015.",
    baseCost: 1100,
    baseOutput: 18,
  },
  {
    id: "npm",
    name: "NPM Dependency Importer",
    description: "Downloads 800MB of unvetted node_modules just to pad a string to the left.",
    baseCost: 12000,
    baseOutput: 30,
  },
  {
    id: "microservice",
    name: "Microservices Architect",
    description: "Splits a highly functional, simple monolith into 40 completely unmanageable Lambda functions.",
    baseCost: 130000,
    baseOutput: 50,
  },
  {
    id: "rogue-api-key",
    name: "Rogue API Key",
    description: "A leaked API key that an undergrad is using to generate crypto whitepapers on your dime.",
    baseCost: 450000,
    baseOutput: 75,
  },
  {
    id: "llm-code-wrapper",
    name: "LLM Code Wrapper",
    description: "Prompt-engineers solutions that compile perfectly but fail silently in production environments.",
    baseCost: 1400000,
    baseOutput: 120,
  },
  {
    id: "agile",
    name: "Agile Scrum Master",
    description: "Generates zero actual code, but creates endless Jira tickets and blocks development with stand-ups.",
    baseCost: 20000000,
    baseOutput: 200,
  },
  {
    id: "blockchain",
    name: "Blockchain Integration",
    description: "Migrating a basic relational database onto a decentralized ledger for 'synergy'.",
    baseCost: 330000000,
    baseOutput: 350,
  },
  {
    id: "kubernetes-overlord",
    name: "Kubernetes Overlord",
    description: "Spinning up twelve containerized pods across three availability zones to host a static HTML site.",
    baseCost: 5100000000,
    baseOutput: 600,
  },
  {
    id: "vibe-coder",
    name: "Vibe Coder Protocol",
    description: "Replaces the entire engineering department with a guy who just 'vibes' with the codebase.",
    baseCost: 75000000000,
    baseOutput: 1000,
  },
];

export const UPGRADES: Upgrade[] = [
  {
    id: "intern-boost-copypaster",
    name: "Intern Mentorship Program",
    description: "Interns teach Copy-Pasters advanced Ctrl+V techniques.",
    cost: 500,
    targetGeneratorId: "stackoverflow-copy-paster",
    requiredGeneratorId: "intern",
    multiplier: 2,
  },
  {
    id: "hotfix-boost-intern",
    name: "Hotfix Cargo Cult",
    description: "Interns worship the ancient hotfixes and code twice as fast.",
    cost: 5000,
    targetGeneratorId: "intern",
    requiredGeneratorId: "hotfix",
    multiplier: 2,
  },
  {
    id: "npm-boost-hotfix",
    name: "left-pad Insurance Policy",
    description: "NPM dependencies make hotfixes self-replicating.",
    cost: 50000,
    targetGeneratorId: "hotfix",
    requiredGeneratorId: "npm",
    multiplier: 2,
  },
  {
    id: "microservice-boost-npm",
    name: "Dependency Injection Overdose",
    description: "Microservices import so many packages they collapse into a singularity of node_modules.",
    cost: 500000,
    targetGeneratorId: "npm",
    requiredGeneratorId: "microservice",
    multiplier: 2,
  },
  {
    id: "rogue-api-key-boost-llm-wrapper",
    name: "Leaked Key Synergy",
    description: "The LLM Code Wrapper exploits rogue API keys to hallucinate twice as fast.",
    cost: 1500000,
    targetGeneratorId: "rogue-api-key",
    requiredGeneratorId: "llm-code-wrapper",
    multiplier: 2,
  },
  {
    id: "llm-boost-microservice",
    name: "AI-Powered Architecture Reviews",
    description: "The LLM suggests splitting every function into its own microservice.",
    cost: 5000000,
    targetGeneratorId: "microservice",
    requiredGeneratorId: "llm-code-wrapper",
    multiplier: 2,
  },
  {
    id: "agile-boost-llm",
    name: "Sprint-Driven Prompt Engineering",
    description: "Each Agile Scrum Master refines AI prompts, boosting LLM output by +1% per Scrum Master owned.",
    cost: 75000000,
    targetGeneratorId: "llm-code-wrapper",
    requiredGeneratorId: "agile",
    multiplier: 2,
    synergyPercent: 1,
  },
  {
    id: "blockchain-boost-agile",
    name: "Decentralized Standup Meetings",
    description: "Standup notes are now immutable on-chain. No one reads them either way.",
    cost: 1000000000,
    targetGeneratorId: "agile",
    requiredGeneratorId: "blockchain",
    multiplier: 2,
  },
  {
    id: "kubernetes-boost-blockchain",
    name: "Container-Orchestrated Consensus",
    description: "Each blockchain node runs in its own Kubernetes pod across 12 regions.",
    cost: 15000000000,
    targetGeneratorId: "blockchain",
    requiredGeneratorId: "kubernetes-overlord",
    multiplier: 2,
  },
  {
    id: "vibe-boost-kubernetes",
    name: "Vibes-Based Auto-Scaling",
    description: "Kubernetes scales pods based on the vibe coder's energy levels.",
    cost: 200000000000,
    targetGeneratorId: "kubernetes-overlord",
    requiredGeneratorId: "vibe-coder",
    multiplier: 2,
  },
];

export const CORPORATE_RANKS: CorporateRank[] = [
  { title: "Junior Code Monkey", threshold: 0 },
  { title: "Mid-Level Googler", threshold: 89000 },
  { title: "Merge Conflict Fighter", threshold: 377000 },
  { title: "CSS JadooGaar", threshold: 987000 },
  { title: "Principal Production Saboteur", threshold: 11000000 },
  { title: "Digital Overlord Engineer", threshold: 121000000 },
  { title: "Ultimate API Baba", threshold: 1300000000 },
];

export const FREE_TIER_RANK_CAP = CORPORATE_RANKS[0]!.title;

export const ALIAS_CHANGES_PER_DAY = 3;

export const PROMOTE_ACCESS_DENIED_MESSAGE = "[HR ERROR] Only Executive Supporters get to use /promote. Run /upgrade to buy your way into the vanity org chart.";

export type SupporterVanityTitle = {
  id: string;
  title: string;
  profile: string;
};

export const SUPPORTER_VANITY_TITLES: SupporterVanityTitle[] = [
  { id: "10x", title: "10x Rockstar Ninja", profile: "Leaves a trail of unmaintainable genius. Quits after 6 months." },
  { id: "crypto", title: "Web3 Degen", profile: "Still waiting for Ethereum to solve supply chain logistics." },
  { id: "vibe", title: "Vibe Coder", profile: "Doesn't write code. Just prompts LLMs and trusts the universe." },
  { id: "thought", title: "LinkedIn Thought Leader", profile: "Extracts 5 paragraphs of leadership advice from a delayed flight." },
  { id: "growth", title: "Growth Hacker", profile: "Will ruin the entire UX just to get a 0.02% bump in conversions." },
  { id: "stealth", title: "Founder in Stealth", profile: "Building something \"disruptive.\" It's just a ChatGPT wrapper." },
  { id: "evangelist", title: "Developer Evangelist", profile: "Hasn't pushed to production since 2019. Has great stickers." },
  { id: "prompt", title: "Head of Prompt Engineering", profile: "Actually believes typing in English is computer science." },
  { id: "maverick", title: "Agile Maverick", profile: "Will hold your hotfix hostage until you assign it story points." },
  { id: "paradigm", title: "Chief Paradigm Officer", profile: "Has not fixed the bug, but has aligned the roadmap around it." },
];

export const PRO_GATED_COMMANDS: ReadonlySet<string> = new Set([
  "/brrrrrr",
  "/blame",
  "/synergize",
  "/alias",
]);

export const THEMES: Theme[] = [
  { id: "default", name: "Default", cost: 0 },
  { id: "amber", name: "Amber", cost: 5000 },
  { id: "matrix", name: "Matrix", cost: 10000 },
  { id: "light", name: "Light", cost: 25000 },
  { id: "corporate-beige", name: "Corporate Beige", cost: 40000 },
  { id: "syntax-error", name: "Syntax Error", cost: 50000 },
];

/** Geometric series sum: total cost to buy `amount` generators starting at `owned`. */
export function calcBulkCost(baseCost: number, owned: number, amount: number): number {
  const rOwned = Math.pow(GROWTH_RATE, owned);
  const rAmount = Math.pow(GROWTH_RATE, amount);
  return Math.floor(baseCost * rOwned * (rAmount - 1) / (GROWTH_RATE - 1));
}

/** Compute active multiplier from owned team members and upgrades. */
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
