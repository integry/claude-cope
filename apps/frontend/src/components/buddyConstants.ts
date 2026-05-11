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
const BUDDY_INTERJECTION_MARKER_PREFIX = "[[BUDDY:";
const BUDDY_INTERJECTION_MARKER_SUFFIX = "]]";

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBuddyMarker(type: string): string {
  return `${BUDDY_INTERJECTION_MARKER_PREFIX}${type}${BUDDY_INTERJECTION_MARKER_SUFFIX}`;
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

  return `${buildBuddyMarker(type)}\n${output.join("\n")}`;
}

function buildBuddyHeaderPattern(type: string, art: string): RegExp {
  const firstArtLine = art.split("\n")[0] ?? "";
  const escapedArt = escapeRegExp(firstArtLine);
  const escapedType = escapeRegExp(type);
  return new RegExp(`^${escapedArt}\\s{3,}\\[${escapedType}\\]$`);
}

type BuddyVariant = {
  artLines: string[];
  artWidth: number;
  headerPattern: RegExp;
  type: string;
};

function getBuddyVariant(type: string): BuddyVariant {
  const artLines = (BUDDY_ICONS[type] ?? BUDDY_FALLBACK_ICON).split("\n");
  return {
    artLines,
    artWidth: Math.max(...artLines.map((line) => line.length)),
    headerPattern: buildBuddyHeaderPattern(type, artLines.join("\n")),
    type,
  };
}

const LEGACY_BUDDY_VARIANTS = Object.keys(BUDDY_ICONS).map(getBuddyVariant);

function extractBuddyMarker(content: string): { rest: string; type: string } | null {
  const firstLineBreak = content.indexOf("\n");
  const firstLine = firstLineBreak >= 0 ? content.slice(0, firstLineBreak) : content;
  if (
    !firstLine.startsWith(BUDDY_INTERJECTION_MARKER_PREFIX) ||
    !firstLine.endsWith(BUDDY_INTERJECTION_MARKER_SUFFIX)
  ) {
    return null;
  }

  const type = firstLine.slice(
    BUDDY_INTERJECTION_MARKER_PREFIX.length,
    firstLine.length - BUDDY_INTERJECTION_MARKER_SUFFIX.length,
  );
  const rest = firstLineBreak >= 0 ? content.slice(firstLineBreak + 1) : "";
  return type ? { rest, type } : null;
}

function matchBuddyBlockLines(lines: string[], variant: BuddyVariant): number {
  if (!variant.headerPattern.test(lines[0] ?? "")) {
    return 0;
  }

  const blankArt = " ".repeat(variant.artWidth);
  let lineCount = 1;

  while (lineCount < lines.length) {
    const line = lines[lineCount] ?? "";
    if (line === "") {
      break;
    }

    const artLine = variant.artLines[lineCount];
    if (artLine) {
      const paddedArt = artLine.padEnd(variant.artWidth, " ");
      if (line === artLine || line.startsWith(`${paddedArt}${BUDDY_TEXT_GAP}`)) {
        lineCount += 1;
        continue;
      }
      break;
    }

    if (line.startsWith(`${blankArt}${BUDDY_TEXT_GAP}`)) {
      lineCount += 1;
      continue;
    }
    break;
  }

  return lineCount;
}

function buildBuddyExtraction(
  trimmedContent: string,
  variant: BuddyVariant,
): { block: string; body: string } | null {
  const lines = trimmedContent.split("\n");
  const blockLineCount = matchBuddyBlockLines(lines, variant);
  if (blockLineCount === 0) {
    return null;
  }

  const block = lines.slice(0, blockLineCount).join("\n");
  const body = lines.slice(blockLineCount).join("\n").replace(/^\n+/, "");
  return { block, body };
}

export function extractBuddyInterjectionBlock(content: string): { block: string; body: string } | null {
  const trimmedContent = content.replace(/^\n+/, "");
  const marker = extractBuddyMarker(trimmedContent);

  if (marker) {
    return buildBuddyExtraction(marker.rest, getBuddyVariant(marker.type));
  }

  for (const variant of LEGACY_BUDDY_VARIANTS) {
    const extracted = buildBuddyExtraction(trimmedContent, variant);
    if (extracted) {
      return extracted;
    }
  }

  return null;
}
