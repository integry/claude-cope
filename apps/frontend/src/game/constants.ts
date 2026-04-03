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
    id: "rogue-api-key",
    name: "Rogue API Key",
    description: "A leaked API key that an undergrad is using to generate crypto whitepapers on your dime.",
    baseCost: 450000,
    baseOutput: 15000,
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

export const CORPORATE_RANKS: CorporateRank[] = [
  { title: "Junior Code Monkey", threshold: 0 },
  { title: "Mid-Level Googler", threshold: 89000 },
  { title: "Merge Conflict Fighter", threshold: 377000 },
  { title: "CSS JadooGaar (Magician)", threshold: 987000 },
  { title: "Principal Production Saboteur", threshold: 11000000 },
  { title: "Digital Overlord Engineer", threshold: 121000000 },
  { title: "Ultimate API Baba", threshold: 1300000000 },
];
