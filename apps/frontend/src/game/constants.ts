export interface Generator {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseOutput: number;
}

export interface CorporateRank {
  title: string;
  threshold: number;
}

export const GROWTH_RATE = 1.15;

export const GENERATORS: Generator[] = [
  {
    id: "stackoverflow-copy-paster",
    name: "StackOverflow Copy-Paster",
    description: "Ctrl+C, Ctrl+V. Who needs to understand the code?",
    baseCost: 15,
    baseOutput: 0.1,
  },
  {
    id: "intern",
    name: "Unpaid Bootcamp Intern",
    description: "Writes untestable spaghetti code in exchange for 'industry exposure'.",
    baseCost: 100,
    baseOutput: 1,
  },
  {
    id: "hotfix",
    name: '"Temporary" Hotfix',
    description: "A comment reads: // TODO: Fix this later. The Git blame is from 2015.",
    baseCost: 1100,
    baseOutput: 8,
  },
  {
    id: "npm",
    name: "NPM Dependency Importer",
    description: "Downloads 800MB of unvetted node_modules just to pad a string to the left.",
    baseCost: 12000,
    baseOutput: 47,
  },
  {
    id: "microservice",
    name: "Microservices Architect",
    description: "Splits a highly functional, simple monolith into 40 completely unmanageable Lambda functions.",
    baseCost: 130000,
    baseOutput: 260,
  },
  {
    id: "rogue-api-key",
    name: "Rogue API Key",
    description: "A leaked API key that an undergrad is using to generate crypto whitepapers on your dime.",
    baseCost: 450000,
    baseOutput: 780,
  },
  {
    id: "llm-code-wrapper",
    name: "LLM Code Wrapper",
    description: "Prompt-engineers solutions that compile perfectly but fail silently in production environments.",
    baseCost: 1400000,
    baseOutput: 1400,
  },
  {
    id: "agile",
    name: "Agile Scrum Master",
    description: "Generates zero actual code, but creates endless Jira tickets and blocks development with stand-ups.",
    baseCost: 20000000,
    baseOutput: 7800,
  },
  {
    id: "blockchain",
    name: "Blockchain Integration",
    description: "Migrating a basic relational database onto a decentralized ledger for 'synergy'.",
    baseCost: 330000000,
    baseOutput: 44000,
  },
  {
    id: "kubernetes-overlord",
    name: "Kubernetes Overlord",
    description: "Spinning up twelve containerized pods across three availability zones to host a static HTML site.",
    baseCost: 5100000000,
    baseOutput: 260000,
  },
  {
    id: "vibe-coder",
    name: "Vibe Coder Protocol",
    description: "Replaces the entire engineering department with a guy who just 'vibes' with the codebase.",
    baseCost: 75000000000,
    baseOutput: 1600000,
  },
];

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
