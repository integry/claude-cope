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
const HEADER_BG_COLOR = "#161b22";
const HEADER_BORDER_COLOR = "#30363d";
const HEADER_DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];
const BORDER_COLOR = "#22c55e";
const USER_PROMPT_COLOR = "#22c55e";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const BOLD_TEXT_COLOR = "#e6edf3";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#facc15";
const HEADER_BAR_HEIGHT = 36;

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
 * Measures the plain-text width of a string that may contain ** bold markers.
 * The markers themselves are not counted toward width.
 */
function measureBoldAwareWidth(ctx: CanvasRenderingContext2D, text: string): number {
  const plain = text.replace(/\*\*/g, "");
  return ctx.measureText(plain).width;
}

/**
 * Word-wraps text that may contain **bold** markers.
 * Splits on spaces, measures without markers, and preserves markers in output.
 * When a bold span is split across lines, each line gets its own ** pairs.
 */
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

  // Fix bold markers: ensure each line has balanced ** pairs
  let inBold = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? "";
    if (inBold) {
      line = "**" + line;
    }
    const markerCount = (line.match(/\*\*/g) || []).length;
    if (markerCount % 2 !== 0) {
      // Odd number of markers means bold spans to next line
      line += "**";
      inBold = true;
    } else {
      inBold = false;
    }
    lines[i] = line;
  }

  return lines;
}

/**
 * Wraps a bullet/list paragraph, preserving the prefix and indentation.
 */
function wrapBulletParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, prefix: string, maxWidth: number,
): string[] {
  const content = paragraph.slice(prefix.length);
  const contentLines = wrapWithBold(ctx, content, maxWidth);

  const result: string[] = [];
  for (let j = 0; j < contentLines.length; j++) {
    const linePrefix = j === 0 ? prefix : "";
    result.push(`${linePrefix}${contentLines[j]}`);
  }
  return result;
}

/**
 * Wraps a non-list paragraph, preserving bold markers across line breaks.
 */
function wrapPlainParagraph(
  ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number,
): string[] {
  return wrapWithBold(ctx, paragraph, maxWidth);
}

/**
 * Wraps text to fit within a maximum width, preserving line breaks,
 * collapsing consecutive blank lines, and handling markdown formatting.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = stripMarkdownKeepBold(text);
  const paragraphs = cleaned.split("\n");

  // Fix bold markers across paragraph boundaries: if a **bold** span crosses
  // a \n, the closing ** ends up in the next paragraph as an orphaned marker.
  // Track bold state across paragraphs and prepend/append ** to balance them.
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
      // Add a small gap between consecutive list items
      if (lastWasBullet && result.length > 0) {
        result.push("");
      }
      result.push(...wrapBulletParagraph(ctx, paragraph, bulletMatch[1], maxWidth));
      lastWasBullet = true;
    } else {
      lastWasBullet = false;
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
  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const spacingBetween = Math.round(lineHeight * 0.6);

  // Fixed overhead (everything except system message content)
  const fixedHeight =
    HEADER_BAR_HEIGHT +
    CANVAS_PADDING +
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

  // Draw terminal header bar
  ctx.fillStyle = HEADER_BG_COLOR;
  ctx.fillRect(2, 2, canvas.width - 4, HEADER_BAR_HEIGHT);

  // Draw header bottom border
  ctx.strokeStyle = HEADER_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, HEADER_BAR_HEIGHT + 2);
  ctx.lineTo(canvas.width - 2, HEADER_BAR_HEIGHT + 2);
  ctx.stroke();

  // Draw traffic light dots
  const dotRadius = 5;
  const dotY = HEADER_BAR_HEIGHT / 2 + 2;
  const dotStartX = CANVAS_PADDING;
  HEADER_DOT_COLORS.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotStartX + i * 18, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Draw username in header center
  if (headerText) {
    ctx.fillStyle = HEADER_COLOR;
    ctx.font = font;
    const headerTextWidth = ctx.measureText(headerText).width;
    ctx.fillText(headerText, (canvas.width - headerTextWidth) / 2, (HEADER_BAR_HEIGHT - fontSize) / 2 + 2);
  }

  // Draw claudecope.com on the right side of the header
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = font;
  const brandText = "claudecope.com";
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, canvas.width - CANVAS_PADDING - brandWidth, (HEADER_BAR_HEIGHT - fontSize) / 2 + 2);

  let y = HEADER_BAR_HEIGHT + CANVAS_PADDING;

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
