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
    id: "intern",
    name: "Unpaid Intern",
    baseCost: 10,
    baseOutput: 1,
  },
  {
    id: "hotfix",
    name: "Hotfix Pipeline",
    baseCost: 50,
    baseOutput: 5,
  },
  {
    id: "npm",
    name: "NPM Dependency",
    baseCost: 250,
    baseOutput: 20,
  },
  {
    id: "microservice",
    name: "Microservice",
    baseCost: 1000,
    baseOutput: 75,
  },
  {
    id: "agile",
    name: "Agile Consultant",
    baseCost: 5000,
    baseOutput: 300,
  },
  {
    id: "rogue-api-key",
    name: "Rogue API Key",
    baseCost: 450000,
    baseOutput: 15000,
  },
  {
    id: "kubernetes-overlord",
    name: "Kubernetes Overlord",
    baseCost: 5100000000,
    baseOutput: 260000,
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
