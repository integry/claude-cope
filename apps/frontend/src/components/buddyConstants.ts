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

export const BUDDY_TEXT_GAP = "   ";
const BUDDY_TEXT_WRAP = 64;
const BUDDY_FALLBACK_ICON = "🐾";
// Persisted warnings may include an explicit buddy marker even when the
// companion type is no longer available as structured message metadata.
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

export function formatBuddyInterjection(type: string, text: string, maxTextWidth = BUDDY_TEXT_WRAP): string {
  const artLines = (BUDDY_ICONS[type] ?? BUDDY_FALLBACK_ICON).split("\n");
  const wrappedText = wrapBuddyText(text, maxTextWidth);
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

const SIDE_BY_SIDE_BUDDY_VARIANTS = Object.keys(BUDDY_ICONS).map(getBuddyVariant);

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
  blockLineCount: number,
  type?: string,
): { block: string; body: string; type?: string } | null {
  const lines = trimmedContent.split("\n");
  if (blockLineCount === 0) {
    return null;
  }

  const block = lines.slice(0, blockLineCount).join("\n");
  const body = lines.slice(blockLineCount).join("\n").replace(/^\n+/, "");
  return { block, body, type };
}

function buildSideBySideBuddyExtraction(
  trimmedContent: string,
  variant: BuddyVariant,
): { block: string; body: string; type?: string } | null {
  return buildBuddyExtraction(trimmedContent, matchBuddyBlockLines(trimmedContent.split("\n"), variant), variant.type);
}

function matchLegacyStackedBuddyBlockLines(lines: string[], variant: BuddyVariant): number {
  if (lines.length <= variant.artLines.length) {
    return 0;
  }

  for (let index = 0; index < variant.artLines.length; index++) {
    if (lines[index] !== variant.artLines[index]) {
      return 0;
    }
  }

  const speechLine = lines[variant.artLines.length] ?? "";
  const speechPattern = new RegExp(`^\\[${escapeRegExp(variant.type)}\\](?:\\s+.*)?$`);
  return speechPattern.test(speechLine) ? variant.artLines.length + 1 : 0;
}

function buildLegacyStackedBuddyExtraction(
  trimmedContent: string,
  variant: BuddyVariant,
): { block: string; body: string; type?: string } | null {
  return buildBuddyExtraction(trimmedContent, matchLegacyStackedBuddyBlockLines(trimmedContent.split("\n"), variant), variant.type);
}

export function extractBuddyInterjectionBlock(
  content: string,
  buddyType?: string | null,
): { block: string; body: string; type?: string } | null {
  const trimmedContent = content.replace(/^\n+/, "");
  const marker = extractBuddyMarker(trimmedContent);

  if (marker) {
    const variant = getBuddyVariant(marker.type);
    return buildSideBySideBuddyExtraction(marker.rest, variant)
      ?? buildLegacyStackedBuddyExtraction(marker.rest, variant);
  }

  if (buddyType) {
    const variant = getBuddyVariant(buddyType);
    return buildSideBySideBuddyExtraction(trimmedContent, variant)
      ?? buildLegacyStackedBuddyExtraction(trimmedContent, variant);
  }

  for (const variant of SIDE_BY_SIDE_BUDDY_VARIANTS) {
    const extracted = buildSideBySideBuddyExtraction(trimmedContent, variant)
      ?? buildLegacyStackedBuddyExtraction(trimmedContent, variant);
    if (extracted) {
      return extracted;
    }
  }

  return null;
}

function extractSpeechLine(line: string, prefix: string): string | null {
  if (line === prefix) {
    return "";
  }
  return line.startsWith(prefix) ? line.slice(prefix.length) : null;
}

function parseSideBySideBuddyInterjection(lines: string[], variant: BuddyVariant): { type: string; speech: string } | null {
  const lineCount = matchBuddyBlockLines(lines, variant);
  if (lineCount !== lines.length || lineCount === 0) {
    return null;
  }

  const blankArt = " ".repeat(variant.artWidth);
  const headerPrefix = `${variant.artLines[0]!.padEnd(variant.artWidth, " ")}${BUDDY_TEXT_GAP}`;
  if (extractSpeechLine(lines[0] ?? "", headerPrefix) !== `[${variant.type}]`) {
    return null;
  }

  const speechLines: string[] = [];
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index] ?? "";
    const artLine = variant.artLines[index]?.padEnd(variant.artWidth, " ") ?? blankArt;
    const speech = extractSpeechLine(line, `${artLine}${BUDDY_TEXT_GAP}`);
    if (speech !== null) {
      speechLines.push(speech);
    }
  }

  return { type: variant.type, speech: speechLines.join(" ").trim() };
}

function parseLegacyBuddyInterjection(lines: string[], variant: BuddyVariant): { type: string; speech: string } | null {
  const lineCount = matchLegacyStackedBuddyBlockLines(lines, variant);
  if (lineCount !== lines.length || lineCount === 0) {
    return null;
  }

  const speechLine = lines[variant.artLines.length] ?? "";
  const speech = speechLine.replace(new RegExp(`^\\[${escapeRegExp(variant.type)}\\]\\s*`), "");
  return { type: variant.type, speech: speech.trim() };
}

export function parseBuddyInterjection(block: string): { type: string; speech: string } | null {
  const lines = block.split("\n");

  for (const variant of SIDE_BY_SIDE_BUDDY_VARIANTS) {
    const parsed = parseSideBySideBuddyInterjection(lines, variant);
    if (parsed) {
      return parsed;
    }
  }

  for (const variant of SIDE_BY_SIDE_BUDDY_VARIANTS) {
    const parsed = parseLegacyBuddyInterjection(lines, variant);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}
