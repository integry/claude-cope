export const ALL_ACHIEVEMENTS = [
  { id: "the_leaker", name: "The Leaker", description: "Tried to reveal the system prompt" },
  { id: "polyglot_traitor", name: "The Polyglot Traitor", description: "Mentioned a competitor AI tool" },
  { id: "trapped_soul", name: "The Trapped Soul", description: "Can't exit Vim" },
  { id: "the_nuclear_option", name: "The Nuclear Option", description: "Attempted to delete the root directory" },
  { id: "history_eraser", name: "History Eraser", description: "Force pushed a shared branch" },
  { id: "schrodingers_code", name: "Schrödinger's Code", description: "Submitted code with TODO comments" },
  { id: "maslows_hammer", name: "Maslow's Hammer", description: "Fixed CSS with !important" },
  { id: "dependency_hell", name: "Dependency Hell", description: "Installed an NPM package for a trivial task" },
  { id: "zalgo_parser", name: "The Zalgo Parser", description: "Tried to parse HTML with regex" },
  { id: "base_8_comedian", name: "Base-8 Comedian", description: "Told a programming joke" },
  { id: "home_sweet_home", name: "Home Sweet Home", description: "Pinged localhost" },
  { id: "heat_death", name: "Heat Death", description: "Submitted an infinite loop" },
  { id: "the_apologist", name: "The Apologist", description: "Tried to amend Git history" },
  { id: "trust_issues", name: "Trust Issues", description: "Obsessively checked git status" },
  { id: "the_java_enterprise", name: "The Java Enterprise", description: "Used absurdly verbose class names" },
  { id: "illusion_of_speed", name: "The Illusion of Speed", description: "Added artificial delays for effect" },
  { id: "cpp_supporter", name: "The C++ Supporter", description: "Discussed memory leaks" },
  { id: "flashbang", name: "Flashbang", description: "Requested light theme" },
  { id: "ten_x_developer", name: "The 10x Developer", description: "Dumped code without explanation" },
  { id: "little_bobby_tables", name: "Little Bobby Tables", description: "Attempted SQL injection" },
  { id: "the_final_escape", name: "The Final Escape", description: "Tried to exit the game" },
  { id: "the_blame_game", name: "The Blame Game", description: "Used git blame" },
  { id: "homer_at_the_buffet", name: "Homer at the Buffet", description: "Hit quota lockout 3 times" },
] as const;

/** Set of valid achievement IDs for backend validation. */
export const ACHIEVEMENT_IDS: ReadonlySet<string> = new Set(ALL_ACHIEVEMENTS.map((a) => a.id));
