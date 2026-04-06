export const BUDDY_ICONS: Record<string, string> = {
  "Agile Snail": [
    "   @..@  ",
    "  (----)  ",
    " ( >__< ) ",
    ' ^^ "" ^^',
  ].join("\n"),
  "Sarcastic Clippy": [
    "  ___  ",
    " | o | ",
    " | _ | ",
    " |/ \\| ",
    "  | |  ",
    "  |_|  ",
  ].join("\n"),
  "10x Dragon": [
    "  /\\_/\\  ",
    " ( o.o ) ",
    "  > ^ <  ",
    " /|   |\\ ",
    "(_|   |_)",
  ].join("\n"),
  "Grumpy Senior": [
    "  .-\"\"\"-.  ",
    " /        \\ ",
    "|  O    O  |",
    "|  \\____/  |",
    " \\  ----  / ",
    "  '------'  ",
  ].join("\n"),
  "Panic Intern": [
    "  .-----.  ",
    " / O   O \\ ",
    "|   ___   |",
    "|  /   \\  |",
    " \\_______/ ",
  ].join("\n"),
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
  "Grumpy Senior": [
    "Back in my day, we didn't have TypeScript. We had raw pointers and fear.",
    "I've seen this exact bug before. In 2003. On a Sun Microsystem.",
    "Why are you using a framework for this? Just write the bytes yourself.",
    "This code would never pass review at my old company. Or any company.",
    "I'm not angry. I'm just disappointed. Again.",
  ],
  "Panic Intern": [
    "Oh no oh no oh no is that a production error?!",
    "I accidentally ran something and I'm too scared to check what it did.",
    "Should I be worried about this warning? I'm worried about this warning.",
    "I pushed to main. I PUSHED TO MAIN. HOW DO I UNDO?!",
    "The CI is red. MY CAREER IS OVER.",
  ],
};
