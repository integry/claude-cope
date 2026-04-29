export function getQuotaStatus(credits: number): string {
  if (credits <= 0) return "Depleted";
  if (credits <= 5) return "Pathetic";
  if (credits <= 15) return "Embarrassing";
  if (credits <= 50) return "Insufficient";
  if (credits <= 200) return "Mediocre";
  if (credits <= 500) return "Tolerable";
  return "Adequate";
}
