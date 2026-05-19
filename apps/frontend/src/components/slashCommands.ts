import { BYOK_ENABLED, TICKET_REFINE_ENABLED } from "../config";
import {
  BACKLOG_CATEGORY_ALL,
  BACKLOG_CATEGORY_TIERS,
} from "@claude-cope/shared/backlogTiers";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { SUPPORTER_VANITY_TITLES } from "../game/constants";

export type SlashCommandGroup = {
  title: string;
  commands: string[];
};

// /ping is a paid code-review request (see useMultiplayer). /accept handles
// both ticket offers and incoming review-pings — there is no separate defense
// command, because the new protocol is opt-in and ignoring a ping just refunds
// the sender.
export const SLASH_COMMAND_GROUPS: SlashCommandGroup[] = [
  {
    title: "SYSTEM DIRECTIVES",
    commands: ["/help", "/clear", "/compact", "/fast", "/voice", "/theme"],
  },
  {
    title: "COPING MECHANISMS",
    commands: ["/backlog", "/take", "/support", "/preworkout", "/buddy", "/synergize", "/brrrrrr", "/abandon"],
  },
  {
    title: "GUILD HALL",
    commands: ["/who", "/party", "/ping", "/accept", "/shill"],
  },
  {
    title: "LEDGER OF SUFFERING",
    commands: ["/store", "/leaderboard", "/achievements", "/profile", "/upgrade"],
  },
  {
    title: "PAPERWORK & PENANCE",
    commands: ["/ticket", "/bug", "/feedback", "/blame", "/alias", "/model", "/promote", "/user", "/key", "/sync"],
  },
  {
    title: "LORE & LEGALITIES",
    commands: ["/about", "/privacy", "/terms", "/contact"],
  },
];

export const ALL_SLASH_COMMANDS = SLASH_COMMAND_GROUPS.flatMap((group) => group.commands);

// Feature-gated: `/key` requires BYOK; `/ticket` requires ticket refinement.
export const SLASH_COMMANDS = ALL_SLASH_COMMANDS.filter((cmd) => {
  if (cmd === "/key" && !BYOK_ENABLED) return false;
  if (cmd === "/ticket" && !TICKET_REFINE_ENABLED) return false;
  return true;
});

export const SLASH_COMMAND_DESCRIPTIONS: Record<string, string> = {
  "/backlog": "Stare into the abyss of unfulfilled promises",
  "/clear": "Hide your shame from the console",
  "/support": "Shout into the void",
  "/preworkout": "Inject pure, unadulterated anxiety",
  "/buddy": "Configure your emotional support AI",
  "/store": "Purchase premium technical debt",
  "/synergize": "Multiply your errors by 10x",
  "/compact": "Sweep the garbage under the rug",
  "/who": "Find other suffering developers",
  "/ping": "Pay a coworker 50 TD to review your active ticket",
  "/help": "There is no help. Only commands.",
  "/about": "Read the origin story nobody asked for",
  "/privacy": "Pretend we respect your data",
  "/terms": "The contract you never signed but always agreed to",
  "/contact": "Reach out to absolutely no one",
  "/fast": "Break things at double speed",
  "/voice": "Scream into the microphone",
  "/blame": "Find a suitable scapegoat",
  "/brrrrrr": "Ship directly to prod on a Friday",
  "/feedback": "Send data directly to a shredder",
  "/bug": "Report an undocumented feature",
  "/key": "Your OpenRouter key, unlimited suffering",
  "/upgrade": "Open the Max upgrade flow",
  "/leaderboard": "Compare your suffering to others",
  "/achievements": "Trophies for terrible decisions",
  "/profile": "Review your miserable statistics",
  "/ticket": "Submit a plea to /dev/null",
  "/take": "Voluntarily accept more pain",
  "/accept": "Accept a paid review request, or a ticket from the PM",
  "/abandon": "Give up. We knew you would.",
  "/alias": "Change your identity. Witness protection for devs.",
  "/model": "Swap out the hallucination engine",
  "/promote": "Buy a vanity title and wear it in public",
  "/user": "Confirm you exist (debatable)",
  "/sync": "Link your Polar license key to unlock Max",
  "/shill": "Tweet about us for 5 free tokens. Dignity sold separately.",
  "/party": "Watch chaos unfold in realtime",
  "/theme": "Switch your terminal theme",
};

export type SlashMenuCommandItem = {
  type: "command";
  value: string;
  groupTitle: string;
  description?: string;
  argumentHint?: string;
};

export type SlashMenuBacklogCategoryItem = {
  type: "backlog-category";
  value: string;
  prefix: string;
  label: string;
  description: string;
  locked: boolean;
};

export type SlashMenuModelChoiceItem = {
  type: "model-choice";
  value: string;
  modelId: string;
  label: string;
  description: string;
  locked: boolean;
};

export type SlashMenuPromoteChoiceItem = {
  type: "promote-choice";
  value: string;
  titleId: string;
  label: string;
  description: string;
  locked: boolean;
};

export type SlashMenuItem = SlashMenuCommandItem | SlashMenuBacklogCategoryItem | SlashMenuModelChoiceItem | SlashMenuPromoteChoiceItem;

export type SlashMenuSelectionTrigger = "click" | "tab" | "enter";

export type SlashMenuSelection = {
  mode: "execute" | "prefill";
  value: string;
  nextQuery: string;
};

function matchesBacklogCategoryQuery(query: string, prefix: string, label: string, description: string): boolean {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  return prefix.toLowerCase().includes(normalized)
    || label.toLowerCase().includes(normalized)
    || description.toLowerCase().includes(normalized);
}

function matchesModelQuery(query: string, modelId: string, label: string): boolean {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  return modelId.toLowerCase().includes(normalized)
    || label.toLowerCase().includes(normalized);
}

export function getSlashMenuItems(
  query: string,
  totalTechnicalDebt: number,
  paidUser: boolean,
  isExecutiveSupporter = false,
): SlashMenuItem[] {
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.startsWith("/backlog ")) {
    const categoryQuery = query.slice("/backlog ".length);
    const items: SlashMenuBacklogCategoryItem[] = [];

    if (matchesBacklogCategoryQuery(categoryQuery, BACKLOG_CATEGORY_ALL, "All Categories", "The normal mixed backlog feed")) {
      items.push({
        type: "backlog-category",
        value: `/backlog ${BACKLOG_CATEGORY_ALL}`,
        prefix: BACKLOG_CATEGORY_ALL,
        label: "All Categories",
        description: "The normal mixed backlog feed",
        locked: false,
      });
    }

    for (const category of BACKLOG_CATEGORY_TIERS) {
      if (!matchesBacklogCategoryQuery(categoryQuery, category.prefix, category.label, category.description)) {
        continue;
      }

      items.push({
        type: "backlog-category",
        value: `/backlog ${category.prefix}`,
        prefix: category.prefix,
        label: category.label,
        description: category.description,
        locked: category.tier === "premium" && !paidUser,
      });
    }

    return items;
  }

  if (normalizedQuery.startsWith("/model ")) {
    const modelQuery = query.slice("/model ".length);

    return COPE_MODELS
      .filter((model) => matchesModelQuery(modelQuery, model.id, model.name))
      .map((model) => ({
        type: "model-choice" as const,
        value: `/model ${model.id}`,
        modelId: model.id,
        label: model.name,
        description: model.tier === "pro" ? "Max model" : "Default model",
        locked: model.tier === "pro" && !paidUser,
      }));
  }

  if (normalizedQuery.startsWith("/promote ")) {
    const titleQuery = query.slice("/promote ".length).trim().toLowerCase();

    return SUPPORTER_VANITY_TITLES
      .filter((title) => {
        if (!titleQuery) return true;
        return title.id.includes(titleQuery) || title.title.toLowerCase().includes(titleQuery);
      })
      .map((title) => ({
        type: "promote-choice" as const,
        value: `/promote ${title.id}`,
        titleId: title.id,
        label: title.title,
        description: title.profile,
        locked: !isExecutiveSupporter,
      }));
  }

  return SLASH_COMMAND_GROUPS.flatMap((group) =>
    group.commands.flatMap((cmd): SlashMenuCommandItem[] => {
      if (!SLASH_COMMANDS.includes(cmd)) return [];
      if (cmd === "/store" && totalTechnicalDebt < 1000) return [];
      if (!cmd.startsWith(normalizedQuery)) return [];

      return [{
        type: "command",
        value: cmd,
        groupTitle: group.title,
        description: SLASH_COMMAND_DESCRIPTIONS[cmd],
        argumentHint: cmd === "/backlog" ? "[category]" : cmd === "/model" ? "[model-id]" : cmd === "/promote" ? "[title-id]" : undefined,
      }];
    }),
  );
}

export function resolveSlashMenuSelection(
  value: string,
  trigger: SlashMenuSelectionTrigger,
): SlashMenuSelection {
  if (value === "/backlog") {
    return {
      mode: "prefill",
      value: "/backlog ",
      nextQuery: "/backlog ",
    };
  }

  if (value === "/model") {
    return {
      mode: "prefill",
      value: "/model ",
      nextQuery: "/model ",
    };
  }

  if (value === "/promote") {
    return {
      mode: "prefill",
      value: "/promote ",
      nextQuery: "/promote ",
    };
  }

  if (trigger === "tab") {
    return {
      mode: "prefill",
      value,
      nextQuery: value,
    };
  }

  return {
    mode: "execute",
    value,
    nextQuery: "",
  };
}
