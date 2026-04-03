export const BUDDY_ICONS: Record<string, string> = {
  "Agile Snail": "@/\"",
  "Sarcastic Clippy": "/|\\",
  "10x Dragon": ">~<",
};

export const BUDDY_INTERJECTIONS: Record<string, string[]> = {
  "Agile Snail": [
    "Would you like to schedule a retrospective?",
    "Have you updated the Jira board?",
    "Let's circle back on that in the next standup.",
    "Can we timebox this discussion?",
    "I think we need a story point estimation session.",
  ],
  "Sarcastic Clippy": [
    "It looks like you're writing spaghetti code. Would you like help?",
    "Have you considered rewriting this in Rust?",
    "I see you're importing a 2MB library for a single function. Classic.",
    "That's certainly... one way to do it.",
    "Ah yes, the 'it works on my machine' approach. Bold.",
  ],
  "10x Dragon": [
    "is judging your variable names.",
    "went to sleep because your codebase is boring.",
    "refactored your code while you weren't looking. It's worse now.",
    "deployed to production without telling you.",
    "deleted your node_modules for fun. Good luck.",
  ],
};
