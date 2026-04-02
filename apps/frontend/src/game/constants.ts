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
];

export const CORPORATE_RANKS: CorporateRank[] = [
  { title: "Junior Developer", threshold: 0 },
  { title: "Mid-Level Developer", threshold: 50 },
  { title: "Senior Developer", threshold: 200 },
  { title: "Tech Lead", threshold: 500 },
  { title: "Staff Engineer", threshold: 1300 },
  { title: "Principal Engineer", threshold: 3400 },
  { title: "VP of Engineering", threshold: 8900 },
  { title: "CTO", threshold: 23300 },
];
