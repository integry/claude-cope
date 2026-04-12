/**
 * Chat Image Generation Utility for Social Sharing
 *
 * Renders chat messages onto an HTML5 Canvas styled like the terminal,
 * and provides clipboard copying functionality with fallback to plaintext.
 */

export type ChatMessage = {
  role: "user" | "system";
  content: string;
};

// Terminal styling constants
const CANVAS_PADDING = 24;
const LINE_HEIGHT = 20;
const FONT_SIZE = 14;
const FONT_FAMILY = '"Courier New", Courier, monospace';
const MAX_WIDTH = 600;
const MAX_HEIGHT = 800;
const BG_COLOR = "#0d1117";
const BORDER_COLOR = "#22c55e";
const USER_PROMPT_COLOR = "#22c55e";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const BOLD_TEXT_COLOR = "#e6edf3";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#484f58";

type TextSegment = {
  text: string;
  bold: boolean;
};

/**
 * Strips non-bold markdown formatting for plain-text canvas rendering.
 * Preserves bold markers for later styled rendering.
 */
function stripMarkdownKeepBold(text: string): string {
  let s = text;
  // Remove italic markers (but not bold **)
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
  s = s.replace(/_(.+?)_/g, "$1");
  // Convert heading markers to plain text
  s = s.replace(/^#{1,3}\s+/gm, "");
  // Remove inline code backticks
  s = s.replace(/`([^`]+)`/g, "$1");
  return s;
}

/**
 * Parses a line of text into segments with bold/normal styling.
 */
function parseSegments(text: string): TextSegment[] {
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
function drawStyledLine(opts: DrawStyledLineOptions): void {
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
  // Reset
  ctx.font = font;
  ctx.fillStyle = normalColor;
}

/**
 * Wraps a single line of text to fit within a maximum width
 */
function wrapSingleLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [""];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Extracts bold-aware text from a source string up to a target plain-text length.
 * Returns the extracted string with bold markers properly closed.
 */
function extractBoldAware(source: string, targetPlainLen: number): { extracted: string; remaining: string } {
  let extracted = "";
  let plainCount = 0;
  let k = 0;
  while (plainCount < targetPlainLen && k < source.length) {
    if (source.startsWith("**", k)) {
      extracted += "**";
      k += 2;
    } else {
      extracted += source[k];
      plainCount++;
      k++;
    }
  }
  const opens = (extracted.match(/\*\*/g) || []).length;
  if (opens % 2 !== 0) extracted += "**";
  let remaining = source.slice(k);
  if (opens % 2 !== 0 && remaining.length > 0) {
    remaining = "**" + remaining;
  }
  return { extracted, remaining };
}

/**
 * Wraps a bullet/list paragraph, preserving the prefix and indentation.
 */
function wrapBulletParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, prefix: string, maxWidth: number,
): string[] {
  const content = paragraph.slice(prefix.length);
  const prefixWidth = ctx.measureText(prefix).width;
  const plainContent = content.replace(/\*\*(.+?)\*\*/g, "$1");
  const contentLines = wrapSingleLine(ctx, plainContent, maxWidth - prefixWidth);
  const indent = " ".repeat(prefix.length);

  if (contentLines.length <= 1) {
    return [`${prefix}${content}`];
  }

  const result: string[] = [];
  let remaining = content;
  for (let j = 0; j < contentLines.length; j++) {
    const linePlain = contentLines[j] ?? "";
    const { extracted, remaining: rest } = extractBoldAware(remaining, linePlain.length);
    const linePrefix = j === 0 ? prefix : indent;
    result.push(`${linePrefix}${extracted}`);
    remaining = rest;
  }
  return result;
}

/**
 * Wraps a non-list paragraph, mapping wrapped plain lines back to bold-containing text.
 */
function wrapPlainParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number,
): string[] {
  const plainParagraph = paragraph.replace(/\*\*(.+?)\*\*/g, "$1");
  const wrapped = wrapSingleLine(ctx, plainParagraph, maxWidth);

  if (wrapped.length <= 1) {
    return [paragraph];
  }

  const result: string[] = [];
  let remaining = paragraph;
  for (const wrappedLine of wrapped) {
    const { extracted, remaining: rest } = extractBoldAware(remaining, wrappedLine.length);
    result.push(extracted);
    remaining = rest;
  }
  return result;
}

/**
 * Wraps text to fit within a maximum width, preserving line breaks,
 * collapsing consecutive blank lines, and handling markdown formatting.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = stripMarkdownKeepBold(text);
  const paragraphs = cleaned.split("\n");
  const result: string[] = [];
  let lastWasBlank = false;

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      if (!lastWasBlank && result.length > 0) {
        result.push("");
        lastWasBlank = true;
      }
      continue;
    }

    lastWasBlank = false;

    const bulletMatch = paragraph.match(/^(\s*(?:[-*•]\s+|\d+[.)]\s+))/);
    if (bulletMatch?.[1]) {
      result.push(...wrapBulletParagraph(ctx, paragraph, bulletMatch[1], maxWidth));
    } else {
      result.push(...wrapPlainParagraph(ctx, paragraph, maxWidth));
    }
  }

  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result;
}

/**
 * Renders a chat card with user message and system response onto a canvas
 */
export function renderChatCard(userMessage: string, systemMessage: string, username?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const contentMaxWidth = MAX_WIDTH - CANVAS_PADDING * 2;

  // Estimate total content length to decide if we need a smaller font
  const totalTextLength = userMessage.length + systemMessage.length;
  const fontSize = totalTextLength > 800 ? FONT_SIZE - 2 : totalTextLength > 500 ? FONT_SIZE - 1 : FONT_SIZE;
  const lineHeight = Math.round(LINE_HEIGHT * (fontSize / FONT_SIZE));
  const font = `${fontSize}px ${FONT_FAMILY}`;
  const boldFont = `bold ${fontSize}px ${FONT_FAMILY}`;
  ctx.font = font;

  // Prepare wrapped lines for user message (with prompt prefix on first line)
  const userPrefix = "❯ ";
  const userPrefixWidth = ctx.measureText(userPrefix).width;
  const userLines = wrapText(ctx, userMessage, contentMaxWidth - userPrefixWidth);

  // Prepare wrapped lines for system message (preserves line breaks and formatting)
  const systemLines = wrapText(ctx, systemMessage, contentMaxWidth);

  // Header shows username on the left if available
  const headerText = username ?? "";

  // Paragraph breaks are compact
  const PARAGRAPH_BREAK_HEIGHT = Math.round(lineHeight * 0.4);
  const calcBlockHeight = (lines: string[]) =>
    lines.reduce((h, line) => h + (line === "" ? PARAGRAPH_BREAK_HEIGHT : lineHeight), 0);

  // Calculate total height
  const headerHeight = lineHeight;
  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const spacingBetween = Math.round(lineHeight * 0.6);

  // Fixed overhead (everything except system message content)
  const fixedHeight =
    CANVAS_PADDING +
    headerHeight +
    userBlockHeight +
    spacingBetween +
    CANVAS_PADDING;

  // Truncate system message lines if they would exceed MAX_HEIGHT
  const availableForSystem = MAX_HEIGHT - fixedHeight;
  let truncatedSystemLines = systemLines;
  let truncated = false;

  if (systemBlockHeight > availableForSystem && availableForSystem > 0) {
    truncatedSystemLines = [];
    let usedHeight = 0;
    const ellipsisHeight = lineHeight;
    for (const line of systemLines) {
      const lineH = line === "" ? PARAGRAPH_BREAK_HEIGHT : lineHeight;
      if (usedHeight + lineH + ellipsisHeight > availableForSystem) {
        truncated = true;
        break;
      }
      truncatedSystemLines.push(line);
      usedHeight += lineH;
    }
    if (truncated) {
      truncatedSystemLines.push("...");
    }
  }

  const truncatedSystemBlockHeight = calcBlockHeight(truncatedSystemLines);

  const totalHeight = Math.min(
    MAX_HEIGHT,
    fixedHeight + truncatedSystemBlockHeight,
  );

  // Set canvas dimensions
  canvas.width = MAX_WIDTH;
  canvas.height = totalHeight;

  // Draw background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw subtle border
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // Set text rendering
  ctx.font = font;
  ctx.textBaseline = "top";

  let y = CANVAS_PADDING;

  // Draw header - username on left, claudecope.com on top right
  if (headerText) {
    ctx.fillStyle = HEADER_COLOR;
    ctx.fillText(headerText, CANVAS_PADDING, y);
  }
  ctx.fillStyle = WATERMARK_COLOR;
  const brandText = "claudecope.com";
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, canvas.width - CANVAS_PADDING - brandWidth, y);
  y += headerHeight;

  // Draw user message with prompt chevron
  ctx.fillStyle = USER_PROMPT_COLOR;
  ctx.fillText(userPrefix, CANVAS_PADDING, y);
  ctx.fillStyle = USER_TEXT_COLOR;
  ctx.font = boldFont;

  userLines.forEach((line, i) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    const xOffset = i === 0 ? userPrefixWidth : 0;
    ctx.fillText(line, CANVAS_PADDING + xOffset, y);
    y += lineHeight;
  });

  ctx.font = font;

  // Add spacing between user and system message
  y += spacingBetween;

  // Draw system message with inline bold styling (truncated if needed)
  truncatedSystemLines.forEach((line) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    const segments = parseSegments(line);
    drawStyledLine({ ctx, segments, x: CANVAS_PADDING, y, normalColor: SYSTEM_TEXT_COLOR, boldColor: BOLD_TEXT_COLOR, font, boldFont });
    y += lineHeight;
  });

  return canvas;
}

/**
 * Converts a canvas to a PNG blob
 */
async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

/**
 * Copies an image blob to the clipboard
 */
async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies plaintext to the clipboard as a fallback
 */
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates share text for social media
 */
function generateShareText(userMessage: string, systemMessage: string): string {
  return `> ${userMessage}\n\n${systemMessage}\n\n— via claudecope.com`;
}

/**
 * Opens a social media share intent URL
 */
function openShareIntent(platform: "twitter" | "linkedin", text: string): void {
  const encodedText = encodeURIComponent(text);
  const url =
    platform === "twitter"
      ? `https://twitter.com/intent/tweet?text=${encodedText}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://claudecope.com")}&summary=${encodedText}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

export type ShareResult = {
  success: boolean;
  method: "image" | "text" | "none";
  message: string;
};

export type ShareChatOptions = {
  userMessage: string;
  systemMessage: string;
  platform?: "twitter" | "linkedin";
  openShareUrl?: boolean;
  username?: string;
};

/**
 * Main function to share a chat interaction.
 * Renders the chat card, copies to clipboard, and optionally opens share intent.
 *
 * @param options - The share options
 * @returns ShareResult indicating success/failure and the method used
 */
export async function shareChatImage(options: ShareChatOptions): Promise<ShareResult> {
  const { userMessage, systemMessage, platform, openShareUrl = false, username } = options;

  // Generate the share text for fallback and social sharing
  const shareText = generateShareText(userMessage, systemMessage);

  // Render the chat card
  const canvas = renderChatCard(userMessage, systemMessage, username);

  // Try to copy the image to clipboard
  const blob = await canvasToBlob(canvas);

  if (blob) {
    const imageCopied = await copyImageToClipboard(blob);

    if (imageCopied) {
      // Image successfully copied
      if (openShareUrl && platform) {
        openShareIntent(platform, shareText);
      }

      return {
        success: true,
        method: "image",
        message: "Share card image copied to clipboard! Paste it anywhere to share.",
      };
    }
  }

  // Fallback: try to copy plaintext
  const textCopied = await copyTextToClipboard(shareText);

  if (textCopied) {
    if (openShareUrl && platform) {
      openShareIntent(platform, shareText);
    }

    return {
      success: true,
      method: "text",
      message: "Chat copied to clipboard as text (image copy not supported in this browser).",
    };
  }

  // Both methods failed
  if (openShareUrl && platform) {
    openShareIntent(platform, shareText);
    return {
      success: true,
      method: "none",
      message: "Opening share dialog... (clipboard access denied)",
    };
  }

  return {
    success: false,
    method: "none",
    message: "Failed to copy to clipboard. Please try again or check browser permissions.",
  };
}

/**
 * Utility to get a PNG data URL from the chat card (useful for previews)
 */
export function getChatCardDataUrl(userMessage: string, systemMessage: string): string {
  const canvas = renderChatCard(userMessage, systemMessage);
  return canvas.toDataURL("image/png");
}
