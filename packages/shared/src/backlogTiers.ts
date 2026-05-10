export interface BacklogCategoryTierMeta {
  prefix: string;
  label: string;
  description: string;
  tier: "free" | "premium";
}

export interface BacklogCategoryUpgradeGroupMeta {
  id: string;
  title: string;
  description: string;
  categories: readonly BacklogCategoryTierMeta[];
}

export const BACKLOG_CATEGORY_ALL = "ALL";

type BacklogCategoryDefinition = readonly [
  prefix: string,
  slug: string,
  label?: string,
  description?: string,
];

const FREE_BACKLOG_CATEGORY_PREFIX_LIST = [
  "YELL",
  "OOPS",
  "BLAME",
  "SNEER",
  "BLORT",
  "BLOAT",
  "GLARE",
  "PANIC",
  "FLAKE",
  "SHARD",
  "TANGLE",
  "WAIL",
  "VOID",
] as const;

const FREE_BACKLOG_CATEGORY_PREFIX_LOOKUP = new Set<string>(FREE_BACKLOG_CATEGORY_PREFIX_LIST);

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const BACKLOG_CATEGORY_DEFINITIONS: readonly BacklogCategoryDefinition[] = [
  ["ADDON", "addon", "Add-ons & Extensions", "Plugin ecosystems, extension breakage, and marketplace politics"],
  ["ATLAS", "atlas", "Mapping / Geo", "Routing, geocoding, and spatial suffering"],
  ["BLAME", "blame", "Scapegoating & Postmortems", "Incident blame theater"],
  ["BLISS", "bliss", "Culture & Wellness Theater", "Mandatory joy, team rituals, and morale cosplay"],
  ["BLOAT", "bloat", "Toolchain Sprawl", "Dependency hell and build sludge"],
  ["BLORT", "blort", "Modern Frameworks", "Frontend churn and tool fashion"],
  ["BOOKS", "books", "Fintech / Accounting", "Ledgers, tax rules, and cursed books"],
  ["BOSS", "boss", "Game Dev", "Launchers, live ops, and battle pass pain"],
  ["BRICK", "brick", "Firmware / IoT", "OTA danger and device pain"],
  ["BUNK", "bunk", "Bullshit Architecture", "Platform castles, empty abstractions, and diagram worship"],
  ["CART", "cart", "E-Commerce", "Catalogs, carts, and promo rot"],
  ["CHANT", "chant", "Team Slogans", "Mission statements, catchphrases, and alignment recitals"],
  ["CIVIC", "civic", "Govtech", "Government software and procedural misery"],
  ["CLASS", "class", "Edtech", "Learning platforms and LMS suffering"],
  ["CLICK", "click", "SEO / CRO", "Landing pages, A/B tests, and funnel rot"],
  ["CLINIC", "clinic", "Healthtech", "Clinical software and patient portal dread"],
  ["CRASH", "crash", "Runtime Failures", "Hard crashes, corrupted state, and surprise explosions"],
  ["CRUD", "crud", "Enterprise CRUD", "Admin panels, forms, and line-of-business slog"],
  ["CULT", "cult", "Vendor Dogma", "Tool evangelism, frameworks as religion, and platform sects"],
  ["DESK", "desk", "IT Helpdesks", "Internal support queues, forms, and access purgatory"],
  ["DRIFT", "drift", "Configuration Drift", "Environment mismatch and entropy by YAML"],
  ["DUST", "dust", "Dead Code & Fossils", "Abandoned jobs, stale flags, and code nobody owns"],
  ["FEED", "feed", "Social Feeds", "Ranking loops, engagement traps, and content sludge"],
  ["FLAGS", "flags", "Feature Flags", "Toggle debt, rollout rituals, and conditional chaos"],
  ["FLAKE", "flake", "Testing Misery", "Flaky tests and mock-based despair"],
  ["FRAUD", "fraud", "Billing / Tax", "Finance systems and reimbursement sludge"],
  ["GASP", "gasp", "Performance Panics", "Latency spikes, load fear, and optimization theater"],
  ["GEAR", "gear", "Manufacturing", "Factory code and safety integrations"],
  ["GHOUL", "ghoul", "Compliance / Audits", "Policy horror and audit hauntings"],
  ["GLARE", "glare", "Design Systems", "Figma versus reality"],
  ["GLUE", "glue", "Integrations & Glue Code", "Adapters, brittle scripts, and duct-tape interfaces"],
  ["GRIFT", "grift", "Growth Schemes", "Dark patterns, upsells, and KPI opportunism"],
  ["GRIME", "grime", "Data Hygiene", "Messy exports, bad imports, and spreadsheet residue"],
  ["GUNK", "gunk", "Legacy Middleware", "Sticky middleware layers and impossible cleanup"],
  ["HAUNT", "haunt", "IAM / Access", "Permission sprawl and entitlement ghosts"],
  ["HAVOC", "havoc", "Chaos Engineering by Accident", "Unplanned experiments and blast-radius surprises"],
  ["HUSH", "hush", "Legal / Privacy", "Approvals, secrecy, and privacy theater"],
  ["HYPE", "hype", "AI / Agents", "Prompt stacks, evals, and benchmark vanity"],
  ["ITIN", "itin", "Travel", "Booking systems and itinerary chaos"],
  ["LOOT", "loot", "Affiliates / Marketplaces", "Payout abuse and incentive sludge"],
  ["LURK", "lurk", "Shadow Requirements", "Hidden asks, side channels, and spooky stakeholder creep"],
  ["MAIL", "mail", "Email & Notifications", "Deliverability, templates, and notification dread"],
  ["MELT", "melt", "Mainframes / Legacy", "Ancient stacks and migration curses"],
  ["MERGE", "merge", "Collaboration Collisions", "PR traffic, merge queues, and branch pileups"],
  ["MESH", "mesh", "Service Meshes", "Traffic policies, sidecars, and distributed confusion"],
  ["MOOD", "mood", "Sentiment Dashboards", "Vibe metrics, pulse surveys, and executive feelings"],
  ["OMEN", "omen", "Security Portents", "Risk scans, red alerts, and doom-laden dashboards"],
  ["OOPS", "oops", "Accidental Disasters", "Prod mistakes and self-inflicted damage"],
  ["PANIC", "panic", "Outages & Deploys", "Friday deploys and rollback fear"],
  ["PIXEL", "pixel", "Ad Creative Pipelines", "Asset churn, resize hell, and banner entropy"],
  ["RAGE", "rage", "Stakeholder Escalations", "Angry threads, urgent asks, and executive heat"],
  ["RANK", "rank", "Career Ladder Theater", "Performance matrices, calibration drama, and title inflation"],
  ["REEL", "reel", "Video Streaming", "Transcoding, playback, and CDN misery"],
  ["RELIC", "relic", "Ancient Systems", "Sacred cron jobs, frozen binaries, and artifact worship"],
  ["RIFT", "rift", "Platform Fragmentation", "Forked stacks, divergent tooling, and organizational split-brain"],
  ["ROT", "rot", "Maintenance Neglect", "Bit-rot, abandoned ownership, and quiet decay"],
  ["SCAM", "scam", "Web3 / Crypto", "Wallet theater and tokenized nonsense"],
  ["SHARD", "shard", "Databases", "Migration pain and query suffering"],
  ["SHIV", "shiv", "Internal Sabotage", "Passive-aggressive blockers and workflow backstabs"],
  ["SLIME", "slime", "Ad-tech / Pixels", "Tracking grime and martech overreach"],
  ["SLOP", "slop", "LLM Slop", "Synthetic content, auto-generated mush, and prompt landfill"],
  ["SNEER", "sneer", "Management Politics", "Executive dashboards and status theater"],
  ["SPIN", "spin", "PR / Comms", "Launch copy and narrative laundering"],
  ["SPOOK", "spook", "Observability Ghosts", "Phantom alerts, empty traces, and haunted telemetry"],
  ["SWAMP", "swamp", "Enterprise Swamps", "Process bogs, approvals, and slow-moving mud"],
  ["TANGLE", "tangle", "BPM & Workflows", "Jira, approvals, and routing hell"],
  ["VERSE", "verse", "VR / Metaverse", "Avatars, virtual plazas, and immersive delusion"],
  ["VOID", "void", "Analytics Dread", "Broken metrics and warehouse lies"],
  ["WAIL", "wail", "Support Grief", "Escalations, macros, and customer pain"],
  ["WIRE", "wire", "Payments & Banking Rails", "Settlement mysteries, webhooks, and money movement stress"],
  ["YELL", "yell", "Office Politics & Delusions", "Agile, PM, and workplace delusion"],
  ["ZANY", "zany", "Startup Chaos", "Pivot energy, founder vibes, and reckless enthusiasm"],
];

export const BACKLOG_CATEGORY_TIERS: readonly BacklogCategoryTierMeta[] = BACKLOG_CATEGORY_DEFINITIONS.map(
  ([prefix, slug, label, description]) => {
    const resolvedLabel = label ?? titleCaseSlug(slug);
    return {
      prefix,
      label: resolvedLabel,
      description: description ?? `${resolvedLabel} backlog tickets`,
      tier: FREE_BACKLOG_CATEGORY_PREFIX_LOOKUP.has(prefix) ? "free" : "premium",
    };
  },
);

const BACKLOG_CATEGORY_TIER_LOOKUP = new Map(
  BACKLOG_CATEGORY_TIERS.map((entry) => [entry.prefix, entry] as const),
);

const BACKLOG_CATEGORY_UPGRADE_GROUP_DEFINITIONS = [
  {
    id: "industry-verticals",
    title: "Industry Verticals",
    description: "Sector-specific nightmares with regulations, customers, and domain-specific rot.",
    prefixes: ["ATLAS", "BOOKS", "BOSS", "BRICK", "CART", "CIVIC", "CLASS", "CLINIC", "CRUD", "DESK", "FEED", "GEAR", "ITIN", "REEL", "WIRE"],
  },
  {
    id: "deep-infrastructure",
    title: "Deep Infrastructure",
    description: "The plumbing layer where incidents, integrations, and architecture debt breed.",
    prefixes: ["ADDON", "CRASH", "DRIFT", "DUST", "FLAGS", "GASP", "GLUE", "GUNK", "HAUNT", "HAVOC", "MAIL", "MELT", "MERGE", "MESH", "OMEN", "RELIC", "RIFT", "ROT", "SPOOK", "SWAMP"],
  },
  {
    id: "dark-corporate-arts",
    title: "Dark Corporate Arts",
    description: "Process cults, compliance rites, executive heat, and institutional sabotage.",
    prefixes: ["BLISS", "BUNK", "CHANT", "CULT", "GHOUL", "HUSH", "LURK", "MOOD", "RAGE", "RANK", "SHIV", "SPIN", "ZANY"],
  },
  {
    id: "marketing-growth-sludge",
    title: "Marketing / Growth Sludge",
    description: "Funnels, affiliates, dark patterns, and every KPI scam in between.",
    prefixes: ["CLICK", "FRAUD", "GRIFT", "GRIME", "LOOT", "PIXEL", "SLIME"],
  },
  {
    id: "emerging-hype",
    title: "Emerging Hype",
    description: "Freshly funded delusions, synthetic mush, and trend-chasing platform bets.",
    prefixes: ["HYPE", "SCAM", "SLOP", "VERSE"],
  },
] as const;

export const FREE_BACKLOG_CATEGORY_PREFIXES = new Set(
  BACKLOG_CATEGORY_TIERS.filter((entry) => entry.tier === "free").map((entry) => entry.prefix),
);

export const PREMIUM_BACKLOG_CATEGORY_PREFIXES = new Set(
  BACKLOG_CATEGORY_TIERS.filter((entry) => entry.tier === "premium").map((entry) => entry.prefix),
);

export const FREE_BACKLOG_CATEGORY_COUNT = BACKLOG_CATEGORY_TIERS.filter((entry) => entry.tier === "free").length;

export const PREMIUM_BACKLOG_CATEGORY_COUNT = BACKLOG_CATEGORY_TIERS.filter((entry) => entry.tier === "premium").length;

export const BACKLOG_CATEGORY_UPGRADE_GROUPS: readonly BacklogCategoryUpgradeGroupMeta[] = (() => {
  const seenPremiumPrefixes = new Set<string>();
  const groups = BACKLOG_CATEGORY_UPGRADE_GROUP_DEFINITIONS.map((group) => {
    const categories = group.prefixes.map((prefix) => {
      const category = BACKLOG_CATEGORY_TIER_LOOKUP.get(prefix);
      if (!category) {
        throw new Error(`Unknown backlog upgrade category prefix: ${prefix}`);
      }
      if (category.tier !== "premium") {
        throw new Error(`Upgrade group "${group.id}" includes non-premium category: ${prefix}`);
      }
      if (seenPremiumPrefixes.has(prefix)) {
        throw new Error(`Duplicate backlog upgrade category prefix in groups: ${prefix}`);
      }
      seenPremiumPrefixes.add(prefix);
      return category;
    });

    return {
      id: group.id,
      title: group.title,
      description: group.description,
      categories,
    };
  });

  const missingPremiumPrefixes = BACKLOG_CATEGORY_TIERS
    .filter((entry) => entry.tier === "premium" && !seenPremiumPrefixes.has(entry.prefix))
    .map((entry) => entry.prefix);

  if (missingPremiumPrefixes.length > 0) {
    throw new Error(`Missing premium backlog categories in upgrade groups: ${missingPremiumPrefixes.join(", ")}`);
  }

  return groups;
})();

export function getBacklogCategoryPrefix(taskId: string): string | null {
  const rawPrefix = taskId.split("-")[0]?.trim().toUpperCase();
  if (!rawPrefix) return null;
  return BACKLOG_CATEGORY_TIER_LOOKUP.has(rawPrefix) ? rawPrefix : null;
}

export function getBacklogCategoryTierMeta(taskIdOrPrefix: string): BacklogCategoryTierMeta | null {
  const normalized = taskIdOrPrefix.includes("-")
    ? getBacklogCategoryPrefix(taskIdOrPrefix)
    : taskIdOrPrefix.trim().toUpperCase();

  if (!normalized) return null;
  return BACKLOG_CATEGORY_TIER_LOOKUP.get(normalized) ?? null;
}

export function isFreeBacklogCategory(taskId: string): boolean {
  const prefix = getBacklogCategoryPrefix(taskId);
  return prefix !== null && FREE_BACKLOG_CATEGORY_PREFIXES.has(prefix);
}

export function isPremiumBacklogCategory(taskId: string): boolean {
  const prefix = getBacklogCategoryPrefix(taskId);
  return prefix !== null && PREMIUM_BACKLOG_CATEGORY_PREFIXES.has(prefix);
}
