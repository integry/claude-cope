/**
 * Text processing utilities for chat image generation.
 * Handles markdown stripping, bold parsing, word wrapping, and styled text drawing.
 */

export type TextSegment = {
  text: string;
  bold: boolean;
};

/**
 * Strips non-bold markdown formatting for plain-text canvas rendering.
 * Preserves bold markers for later styled rendering.
 */
export function stripMarkdownKeepBold(text: string): string {
  let s = text;
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
  s = s.replace(/_(.+?)_/g, "$1");
  s = s.replace(/^#{1,3}\s+/gm, "");
  s = s.replace(/`([^`]+)`/g, "$1");
  return s;
}

/**
 * Parses a line of text into segments with bold/normal styling.
 */
export function parseSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1] ?? "", bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  if (segments.length === 0) {
    segments.push({ text, bold: false });
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
};

/**
 * Draws a line of text with inline bold segments in a different color.
 */
export function drawStyledLine(opts: DrawStyledLineOptions): void {
  const { ctx, segments, x, y, normalColor, boldColor, font, boldFont } = opts;
  let curX = x;
  for (const seg of segments) {
    if (seg.bold) {
      ctx.font = boldFont;
      ctx.fillStyle = boldColor;
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

function measureBoldAwareWidth(ctx: CanvasRenderingContext2D, text: string): number {
  const plain = text.replace(/\*\*/g, "");
  return ctx.measureText(plain).width;
}

function fixBoldMarkers(lines: string[]): void {
  let inBold = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? "";
    if (inBold) {
      line = "**" + line;
    }
    const markerCount = (line.match(/\*\*/g) || []).length;
    if (markerCount % 2 !== 0) {
      line += "**";
      inBold = true;
    } else {
      inBold = false;
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
    if (measureBoldAwareWidth(ctx, testLine) > maxWidth && currentLine) {
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
    if (measureBoldAwareWidth(ctx, testLine) > lineMaxWidth && currentLine) {
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
 * Wraps text to fit within a maximum width, preserving line breaks,
 * collapsing consecutive blank lines, and handling markdown formatting.
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = stripMarkdownKeepBold(text);
  const paragraphs = cleaned.split("\n");

  let boldAcross = false;
  for (let i = 0; i < paragraphs.length; i++) {
    let p = paragraphs[i] ?? "";
    if (boldAcross) {
      p = "**" + p;
    }
    const markerCount = (p.match(/\*\*/g) || []).length;
    if (markerCount % 2 !== 0) {
      p += "**";
      boldAcross = true;
    } else {
      boldAcross = false;
    }
    paragraphs[i] = p;
  }

  const result: string[] = [];
  let lastWasBlank = false;
  let lastWasBullet = false;

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      if (!lastWasBlank && result.length > 0) {
        result.push("");
        lastWasBlank = true;
      }
      lastWasBullet = false;
      continue;
    }

    lastWasBlank = false;

    const bulletMatch = paragraph.match(/^(\s*(?:[-*•]\s+|\d+[.)]\s+))/);
    if (bulletMatch?.[1]) {
      if (lastWasBullet && result.length > 0) {
        result.push("\x01");
      }
      result.push(...wrapBulletParagraph(ctx, paragraph, bulletMatch[1], maxWidth));
      lastWasBullet = true;
    } else {
      lastWasBullet = false;
      result.push(...wrapWithBold(ctx, paragraph, maxWidth));
    }
  }

  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result;
}
