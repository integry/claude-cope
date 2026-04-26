/** Mask a credential-equivalent hash for admin display (first 8 + last 4 chars). */
export function maskHash(hash: string | null | undefined): string | null {
  if (!hash || typeof hash !== "string") return null;
  if (hash.length <= 12) return hash.slice(0, 4) + "…";
  return hash.slice(0, 8) + "…" + hash.slice(-4);
}
