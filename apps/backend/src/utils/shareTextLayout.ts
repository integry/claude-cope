const ELLIPSIS = "...";

const graphemeSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter("en", { granularity: "grapheme" })
  : null;

export type RenderedTextBlock = {
  html: string;
  truncated: boolean;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitGraphemes(value: string): string[] {
  if (!value) return [];
  if (!graphemeSegmenter) return Array.from(value);
  return Array.from(graphemeSegmenter.segment(value), ({ segment }) => segment);
}

export function truncateGraphemes(value: string, maxLength: number): string {
  const graphemes = splitGraphemes(value);
  if (graphemes.length <= maxLength) return value;
  if (maxLength <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxLength);
  return `${graphemes.slice(0, maxLength - ELLIPSIS.length).join("")}${ELLIPSIS}`;
}

const ZERO_WIDTH_RANGES: Array<readonly [number, number]> = [
  [0x0000, 0x001f],
  [0x007f, 0x009f],
  [0x0300, 0x036f],
  [0x0483, 0x0489],
  [0x0591, 0x05bd],
  [0x05c1, 0x05c2],
  [0x05c4, 0x05c5],
  [0x0610, 0x061a],
  [0x064b, 0x065f],
  [0x06d6, 0x06dc],
  [0x06df, 0x06e4],
  [0x06e7, 0x06e8],
  [0x06ea, 0x06ed],
  [0xfe00, 0xfe0f],
  [0xe0100, 0xe01ef],
];
const ZERO_WIDTH_CODE_POINTS = new Set([0x05bf, 0x05c7, 0x0670, 0x200d]);
const WIDE_RANGES: Array<readonly [number, number]> = [
  [0x1100, 0x115f],
  [0x2e80, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f300, 0x1faff],
  [0x20000, 0x3fffd],
];
const WIDE_CODE_POINTS = new Set([0x2329, 0x232a]);

function isInRanges(codePoint: number, ranges: Array<readonly [number, number]>): boolean {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function isZeroWidthCodePoint(codePoint: number): boolean {
  return ZERO_WIDTH_CODE_POINTS.has(codePoint) || isInRanges(codePoint, ZERO_WIDTH_RANGES);
}

function isWideCodePoint(codePoint: number): boolean {
  if (codePoint === 0x303f) return false;
  return WIDE_CODE_POINTS.has(codePoint) || isInRanges(codePoint, WIDE_RANGES);
}

function getCodePointWidth(codePoint: number): number {
  if (isZeroWidthCodePoint(codePoint)) return 0;
  if (isWideCodePoint(codePoint)) return 2;
  return 1;
}

function getGraphemeDisplayWidth(value: string): number {
  let width = 0;
  for (const char of value) {
    width = Math.max(width, getCodePointWidth(char.codePointAt(0) ?? 0));
  }
  return width || (value ? 1 : 0);
}

function truncateOverflowLine(value: string, maxColumns: number): string {
  if (maxColumns <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxColumns);

  const graphemes = splitGraphemes(value);
  const limit = maxColumns - ELLIPSIS.length;
  let width = 0;
  const visible: string[] = [];

  for (const grapheme of graphemes) {
    const graphemeWidth = getGraphemeDisplayWidth(grapheme);
    if (width + graphemeWidth > limit) break;
    visible.push(grapheme);
    width += graphemeWidth;
  }

  return `${visible.join("")}${ELLIPSIS}`;
}

function wrapLineByColumns(line: string, maxColumns: number): string[] {
  if (line.length === 0) return [""];

  const wrapped: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const grapheme of splitGraphemes(line)) {
    const graphemeWidth = getGraphemeDisplayWidth(grapheme);
    if (currentLine && currentWidth + graphemeWidth > maxColumns) {
      wrapped.push(currentLine);
      currentLine = grapheme;
      currentWidth = graphemeWidth;
      continue;
    }
    currentLine += grapheme;
    currentWidth += graphemeWidth;
  }

  if (currentLine || wrapped.length === 0) wrapped.push(currentLine);

  return wrapped;
}

export function renderBoundedTextBlock(value: string, maxColumns: number, maxLines: number): RenderedTextBlock {
  const wrapped = value.replace(/\r\n?/g, "\n").split("\n").flatMap((line) => wrapLineByColumns(line, maxColumns));
  const overflow = wrapped.length > maxLines;
  const visible = wrapped.slice(0, maxLines);

  if (overflow && visible.length > 0) {
    visible[visible.length - 1] = truncateOverflowLine(visible[visible.length - 1] ?? "", maxColumns);
  }

  return {
    html: visible.map((line) => `<div class="line">${line ? escapeHtml(line) : "&nbsp;"}</div>`).join(""),
    truncated: overflow,
  };
}
