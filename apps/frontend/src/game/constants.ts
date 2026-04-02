export interface Generator {
  id: string;
  name: string;
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
    baseCost: 15,
    baseOutput: 0.1,
  },
  {
    id: "intern",
    name: "Unpaid Bootcamp Intern",
    baseCost: 100,
    baseOutput: 1,
  },
  {
    id: "hotfix",
    name: '"Temporary" Hotfix',
    baseCost: 1100,
    baseOutput: 8,
  },
  {
    id: "npm",
    name: "NPM Dependency Importer",
    baseCost: 12000,
    baseOutput: 47,
  },
  {
    id: "microservice",
    name: "Microservices Architect",
    baseCost: 130000,
    baseOutput: 260,
  },
  {
    id: "llm-code-wrapper",
    name: "LLM Code Wrapper",
    baseCost: 1400000,
    baseOutput: 1400,
  },
  {
    id: "agile",
    name: "Agile Scrum Master",
    baseCost: 20000000,
    baseOutput: 7800,
  },
  {
    id: "rogue-api-key",
    name: "Rogue API Key",
    baseCost: 450000,
    baseOutput: 15000,
  },
  {
    id: "blockchain",
    name: "Blockchain Integration",
    baseCost: 330000000,
    baseOutput: 44000,
  },
  {
    id: "kubernetes-overlord",
    name: "Kubernetes Overlord",
    baseCost: 5100000000,
    baseOutput: 260000,
  },
  {
    id: "vibe-coder",
    name: "Vibe Coder Protocol",
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
