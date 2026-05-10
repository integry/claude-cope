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

const BUDDY_TEXT_GAP = "   ";
const BUDDY_TEXT_WRAP = 64;
const BUDDY_FALLBACK_ICON = "🐾";

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

function wrapBuddyText(text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function formatBuddyInterjection(type: string, text: string): string {
  const artLines = (BUDDY_ICONS[type] ?? BUDDY_FALLBACK_ICON).split("\n");
  const wrappedText = wrapBuddyText(text, BUDDY_TEXT_WRAP);
  const artWidth = Math.max(...artLines.map((line) => line.length));
  const totalLines = Math.max(artLines.length, wrappedText.length + 1);
  const output: string[] = [];

  for (let index = 0; index < totalLines; index++) {
    const art = artLines[index] ?? "";
    const artColumn = art.padEnd(artWidth, " ");
    let speech = "";
    if (index === 0) {
      speech = `[${type}]`;
    } else if (wrappedText[index - 1]) {
      speech = wrappedText[index - 1]!;
    }
    output.push(speech ? `${artColumn}${BUDDY_TEXT_GAP}${speech}` : art);
  }

  return output.join("\n");
}

function buildBuddyHeaderPattern(type: string | null, art: string): RegExp {
  const firstArtLine = art.split("\n")[0] ?? "";
  const escapedArt = firstArtLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (type === null) {
    return new RegExp(`^${escapedArt}\\s{3,}\\[[^\\]]+\\]$`);
  }
  const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedArt}\\s{3,}\\[${escapedType}\\]$`);
}

export function extractBuddyInterjectionBlock(content: string): { block: string; body: string } | null {
  const trimmedContent = content.replace(/^\n+/, "");
  const separatorIndex = trimmedContent.indexOf("\n\n");
  const block = separatorIndex >= 0 ? trimmedContent.slice(0, separatorIndex) : trimmedContent;
  const body = separatorIndex >= 0 ? trimmedContent.slice(separatorIndex + 2) : "";
  const lines = block.split("\n");

  const buddyVariants: ReadonlyArray<readonly [string | null, string]> = [
    ...Object.entries(BUDDY_ICONS),
    [null, BUDDY_FALLBACK_ICON],
  ];
  for (const [type, art] of buddyVariants) {
    const artLines = art.split("\n");
    const hasMatchingArt = artLines.every((artLine, index) => lines[index]?.startsWith(artLine));
    if (hasMatchingArt && buildBuddyHeaderPattern(type, art).test(lines[0] ?? "")) {
      return { block, body };
    }
  }

  return null;
}
