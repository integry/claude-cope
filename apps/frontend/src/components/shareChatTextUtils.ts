/**
 * Text processing utilities for chat image generation.
 * Handles markdown stripping, bold parsing, word wrapping, and styled text drawing.
 */

export type TextSegment = {
  text: string;
  bold: boolean;
  italic: boolean;
};

// Internal marker for italic text (preserved through the pipeline like ** for bold)
const ITALIC_MARKER = "\x02";

/**
 * Strips non-bold/italic markdown formatting for plain-text canvas rendering.
 * Preserves bold (**) and italic (converted to \x02) markers for later styled rendering.
 */
export function stripMarkdownKeepBold(text: string): string {
  let s = text;
  // Remove fenced code block delimiters (``` or ```language)
  s = s.replace(/^```\w*\s*$/gm, "");
  // Remove &nbsp; entities
  s = s.replace(/&nbsp;/g, " ");
  // Remove "Awaiting input..." lines
  s = s.replace(/^.*Awaiting input\.{3}.*$/gm, "");
  // Convert single *italic* to internal italic markers (must happen before bold stripping)
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, `${ITALIC_MARKER}$1${ITALIC_MARKER}`);
  // Convert _italic_ to internal italic markers
  s = s.replace(/_(.+?)_/g, `${ITALIC_MARKER}$1${ITALIC_MARKER}`);
  s = s.replace(/^#{1,3}\s+/gm, "");
  s = s.replace(/`([^`]+)`/g, "$1");
  return s;
}

/**
 * Parses a line of text into segments with bold/italic/normal styling.
 * Handles **bold** markers and \x02italic\x02 markers.
 */
export function parseSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Match **bold** or \x02italic\x02
  const regex = /\*\*(.+?)\*\*|\x02(.+?)\x02/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false, italic: false });
    }
    if (match[1] !== undefined) {
      segments.push({ text: match[1], bold: true, italic: false });
    } else if (match[2] !== undefined) {
      segments.push({ text: match[2], bold: false, italic: true });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false, italic: false });
  }

  if (segments.length === 0) {
    segments.push({ text, bold: false, italic: false });
  }

  return segments;
}

type DrawStyledLineOptions = {
  ctx: CanvasRenderingContext2D;
  segments: TextSegment[];
  x: number;
  y: number;
  normalColor: string;
  boldColor: string;
  font: string;
  boldFont: string;
  italicFont: string;
};

/**
 * Draws a line of text with inline bold/italic segments in different styles.
 */
export function drawStyledLine(opts: DrawStyledLineOptions): void {
  const { ctx, segments, x, y, normalColor, boldColor, font, boldFont, italicFont } = opts;
  let curX = x;
  for (const seg of segments) {
    if (seg.bold) {
      ctx.font = boldFont;
      ctx.fillStyle = boldColor;
    } else if (seg.italic) {
      ctx.font = italicFont;
      ctx.fillStyle = normalColor;
    } else {
      ctx.font = font;
      ctx.fillStyle = normalColor;
    }
    ctx.fillText(seg.text, curX, y);
    curX += ctx.measureText(seg.text).width;
  }
  ctx.font = font;
  ctx.fillStyle = normalColor;
}

function measureStyledAwareWidth(ctx: CanvasRenderingContext2D, text: string): number {
  const plain = text.replace(/\*\*/g, "").replace(/\x02/g, "");
  return ctx.measureText(plain).width;
}

function fixBoldMarkers(lines: string[]): void {
  let inBold = false;
  let inItalic = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? "";
    if (inBold) {
      line = "**" + line;
    }
    if (inItalic) {
      line = ITALIC_MARKER + line;
    }
    const boldCount = (line.match(/\*\*/g) || []).length;
    if (boldCount % 2 !== 0) {
      line += "**";
      inBold = true;
    } else {
      inBold = false;
    }
    const italicCount = (line.match(new RegExp(ITALIC_MARKER, "g")) || []).length;
    if (italicCount % 2 !== 0) {
      line += ITALIC_MARKER;
      inItalic = true;
    } else {
      inItalic = false;
    }
    lines[i] = line;
  }
}

function wrapWithBold(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [""];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measureStyledAwareWidth(ctx, testLine) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  fixBoldMarkers(lines);
  return lines;
}

function wrapBulletParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, prefix: string, maxWidth: number,
): string[] {
  const prefixWidth = ctx.measureText(prefix).width;
  const content = paragraph.slice(prefix.length);
  const words = content.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  let isFirstLine = true;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineMaxWidth = isFirstLine ? maxWidth - prefixWidth : maxWidth;
    if (measureStyledAwareWidth(ctx, testLine) > lineMaxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      isFirstLine = false;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  fixBoldMarkers(lines);

  const result: string[] = [];
  for (let j = 0; j < lines.length; j++) {
    result.push(j === 0 ? `${prefix}${lines[j]}` : lines[j] ?? "");
  }
  return result;
}

/**
 * Merges continuation lines into their parent bullet item so that
 * wrapped text fills the full available width instead of getting shorter.
 */
function mergeBulletContinuations(rawParagraphs: string[]): string[] {
  const paragraphs: string[] = [];
  let currentBullet: string | null = null;
  for (const raw of rawParagraphs) {
    if (raw.trim() === "") {
      if (currentBullet !== null) {
        paragraphs.push(currentBullet);
        currentBullet = null;
      }
      paragraphs.push(raw);
    } else if (/^\s*(?:[-*•]\s+|\d+[.)]\s+)/.test(raw)) {
      if (currentBullet !== null) {
        paragraphs.push(currentBullet);
      }
      currentBullet = raw;
    } else if (currentBullet !== null) {
      currentBullet += " " + raw.trimStart();
    } else {
      paragraphs.push(raw);
    }
  }
  if (currentBullet !== null) {
    paragraphs.push(currentBullet);
  }
  return paragraphs;
}

/**
 * Balances bold and italic markers across paragraphs so split spans render correctly.
 */
function balanceBoldMarkers(paragraphs: string[]): void {
  let boldAcross = false;
  let italicAcross = false;
  for (let i = 0; i < paragraphs.length; i++) {
    let p = paragraphs[i] ?? "";
    if (boldAcross) {
      p = "**" + p;
    }
    if (italicAcross) {
      p = ITALIC_MARKER + p;
    }
    const boldCount = (p.match(/\*\*/g) || []).length;
    if (boldCount % 2 !== 0) {
      p += "**";
      boldAcross = true;
    } else {
      boldAcross = false;
    }
    const italicCount = (p.match(new RegExp(ITALIC_MARKER, "g")) || []).length;
    if (italicCount % 2 !== 0) {
      p += ITALIC_MARKER;
      italicAcross = true;
    } else {
      italicAcross = false;
    }
    paragraphs[i] = p;
  }
}

type WrapState = { lastWasBlank: boolean; lastWasBullet: boolean };

function processBlankParagraph(result: string[], state: WrapState): void {
  if (!state.lastWasBlank && result.length > 0) {
    result.push("");
    state.lastWasBlank = true;
  }
  state.lastWasBullet = false;
}

function processContentParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number,
  result: string[], state: WrapState,
): void {
  state.lastWasBlank = false;
  const bulletMatch = paragraph.match(/^(\s*(?:[-*•]\s+|\d+[.)]\s+))/);
  if (bulletMatch?.[1]) {
    if (state.lastWasBullet && result.length > 0) {
      result.push("\x01");
    }
    result.push(...wrapBulletParagraph(ctx, paragraph, bulletMatch[1], maxWidth));
    state.lastWasBullet = true;
  } else {
    state.lastWasBullet = false;
    result.push(...wrapWithBold(ctx, paragraph, maxWidth));
  }
}

function trimTrailingBlanks(result: string[]): void {
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }
}

/**
 * Wraps text to fit within a maximum width, preserving line breaks,
 * collapsing consecutive blank lines, and handling markdown formatting.
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = stripMarkdownKeepBold(text);
  const rawParagraphs = cleaned.split("\n");
  const paragraphs = mergeBulletContinuations(rawParagraphs);
  balanceBoldMarkers(paragraphs);

  const result: string[] = [];
  const state: WrapState = { lastWasBlank: false, lastWasBullet: false };

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      processBlankParagraph(result, state);
    } else {
      processContentParagraph(ctx, paragraph, maxWidth, result, state);
    }
  }

  trimTrailingBlanks(result);
  return result;
}
