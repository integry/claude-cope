export type SplashVariant = {
  id: string;
  splashMobile: string;
  splashDesktop: string;
};

export type WordmarkVariant = {
  id: string;
  wordmark: string;
};

const SPLASH_IDS = [
  "2jt6db", "749ofw", "836vt1", "8rh43q", "b2fwp0", "b53lnh",
  "d8714i", "dg0zd8", "du0waw", "f88afs", "fqwyhj", "gg2497",
  "gltpvw", "gp4zlp", "gp7mot", "i27mjt", "io0dt8", "ke0zvb",
  "lq0sms", "mn3v09", "n8gt9n", "nzh76p", "ogohad", "oxpp04",
  "qh2r6l", "rc2njk", "wf33fh", "wz1puj", "xifzyr", "yx19n8",
] as const;

const WORDMARK_IDS = [
  "2jt6db", "749ofw", "836vt1", "b2fwp0", "d8714i", "dg0zd8",
  "du0waw", "f88afs", "fqwyhj", "gltpvw", "gp7mot", "i27mjt",
  "io0dt8", "ke0zvb", "lq0sms", "n8gt9n", "nzh76p", "ogohad",
  "qh2r6l", "rc2njk", "yx19n8",
] as const;

export const SPLASH_VARIANTS: readonly SplashVariant[] = SPLASH_IDS.map((id) => ({
  id,
  splashMobile: `/media/logo-rotation/splash/${id}-640.webp`,
  splashDesktop: `/media/logo-rotation/splash/${id}-1280.webp`,
}));

export const WORDMARK_VARIANTS: readonly WordmarkVariant[] = WORDMARK_IDS.map((id) => ({
  id,
  wordmark: `/media/logo-rotation/wordmark/${id}.webp`,
}));

function selectVariant<T>(variants: readonly T[], random: () => number): T {
  const index = Math.min(variants.length - 1, Math.max(0, Math.floor(random() * variants.length)));
  return variants[index]!;
}

export function selectSplashVariant(random: () => number = Math.random): SplashVariant {
  return selectVariant(SPLASH_VARIANTS, random);
}

export function selectWordmarkVariant(random: () => number = Math.random): WordmarkVariant {
  return selectVariant(WORDMARK_VARIANTS, random);
}

export function selectWordmarkForSplash(
  splash: SplashVariant,
  random: () => number = Math.random,
): WordmarkVariant {
  return WORDMARK_VARIANTS.find(({ id }) => id === splash.id) ?? selectWordmarkVariant(random);
}

export const ACTIVE_SPLASH_VARIANT = selectSplashVariant();
// Pair the header when an approved crop exists; otherwise use another approved wordmark.
export const ACTIVE_WORDMARK_VARIANT = selectWordmarkForSplash(ACTIVE_SPLASH_VARIANT);
