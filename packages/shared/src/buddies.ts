/** Canonical list of buddy companion types. */
export const BUDDY_TYPES = [
  "Agile Snail",
  "Sarcastic Clippy",
  "10x Dragon",
  "Grumpy Senior",
  "Panic Intern",
] as const;

export type BuddyType = (typeof BUDDY_TYPES)[number];

/** Set of valid buddy types for backend validation. */
export const BUDDY_TYPE_SET: ReadonlySet<string> = new Set(BUDDY_TYPES);
