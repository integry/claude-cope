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
const CANVAS_PADDING = 32;
const LINE_HEIGHT = 24;
const FONT_SIZE = 16;
const FONT_FAMILY = '"Courier New", Courier, monospace';
const MAX_WIDTH = 600;
const BG_COLOR = "#0d1117";
const BORDER_COLOR = "#22c55e";
const USER_PROMPT_COLOR = "#22c55e";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#484f58";

/**
 * Strips basic markdown formatting for plain-text canvas rendering.
 * Converts bold markers, headers, and bullets into readable plain text.
 */
function stripMarkdown(text: string): string {
  let s = text;
  // Remove bold markers
  s = s.replace(/\*\*(.+?)\*\*/g, "$1");
  // Remove italic markers
  s = s.replace(/\*(.+?)\*/g, "$1");
  s = s.replace(/_(.+?)_/g, "$1");
  // Convert heading markers to plain text
  s = s.replace(/^#{1,3}\s+/gm, "");
  // Remove inline code backticks
  s = s.replace(/`([^`]+)`/g, "$1");
  return s;
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
 * Wraps text to fit within a maximum width, preserving line breaks
 * and handling basic markdown formatting (bullets, numbered lists, paragraphs).
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = stripMarkdown(text);
  const paragraphs = cleaned.split("\n");
  const result: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph;

    // Preserve blank lines as empty strings (paragraph breaks)
    if (trimmed.trim() === "") {
      result.push("");
      continue;
    }

    // Detect bullet/list prefixes and preserve indentation
    const bulletMatch = trimmed.match(/^(\s*(?:[-*•]\s+|\d+[.)]\s+))/);
    if (bulletMatch && bulletMatch[1]) {
      const prefix = bulletMatch[1];
      const content = trimmed.slice(prefix.length);
      const prefixWidth = ctx.measureText(prefix).width;
      const contentLines = wrapSingleLine(ctx, content, maxWidth - prefixWidth);
      const indent = " ".repeat(prefix.length);
      contentLines.forEach((line, i) => {
        result.push(i === 0 ? `${prefix}${line}` : `${indent}${line}`);
      });
    } else {
      const wrapped = wrapSingleLine(ctx, trimmed, maxWidth);
      result.push(...wrapped);
    }
  }

  return result;
}

/**
 * Renders a chat card with user message and system response onto a canvas
 */
export function renderChatCard(userMessage: string, systemMessage: string, username?: string, currentTD?: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.font = font;

  const contentMaxWidth = MAX_WIDTH - CANVAS_PADDING * 2;

  // Prepare wrapped lines for user message (with prompt prefix on first line)
  const userPrefix = "> ";
  const userPrefixWidth = ctx.measureText(userPrefix).width;
  const userLines = wrapText(ctx, userMessage, contentMaxWidth - userPrefixWidth);

  // Prepare wrapped lines for system message (preserves line breaks and formatting)
  const systemLines = wrapText(ctx, systemMessage, contentMaxWidth);

  // Calculate header line - show username and TD balance if available
  const headerText = username ? `${username}  |  TD: ${(currentTD ?? 0).toLocaleString()}` : "claudecope.com";

  // Calculate line height for each line (empty lines are half-height paragraph breaks)
  const PARAGRAPH_BREAK_HEIGHT = Math.round(LINE_HEIGHT * 0.5);
  const calcBlockHeight = (lines: string[]) =>
    lines.reduce((h, line) => h + (line === "" ? PARAGRAPH_BREAK_HEIGHT : LINE_HEIGHT), 0);

  // Calculate total height
  const headerHeight = LINE_HEIGHT;
  const separatorHeight = LINE_HEIGHT;
  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const spacingBetween = LINE_HEIGHT;
  const watermarkHeight = LINE_HEIGHT;

  const totalHeight =
    CANVAS_PADDING +
    headerHeight +
    separatorHeight +
    userBlockHeight +
    spacingBetween +
    systemBlockHeight +
    watermarkHeight +
    CANVAS_PADDING;

  // Set canvas dimensions
  canvas.width = MAX_WIDTH;
  canvas.height = totalHeight;

  // Draw background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw border
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Set text rendering
  ctx.font = font;
  ctx.textBaseline = "top";

  let y = CANVAS_PADDING;

  // Draw header
  ctx.fillStyle = HEADER_COLOR;
  ctx.fillText(headerText, CANVAS_PADDING, y);
  y += headerHeight;

  // Draw separator
  ctx.fillStyle = BORDER_COLOR;
  const separatorLine = "─".repeat(Math.floor(contentMaxWidth / ctx.measureText("─").width));
  ctx.fillText(separatorLine, CANVAS_PADDING, y);
  y += separatorHeight;

  // Draw user message with prompt
  ctx.fillStyle = USER_PROMPT_COLOR;
  ctx.fillText(userPrefix, CANVAS_PADDING, y);
  ctx.fillStyle = USER_TEXT_COLOR;

  userLines.forEach((line, i) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    const xOffset = i === 0 ? userPrefixWidth : 0;
    ctx.fillText(line, CANVAS_PADDING + xOffset, y);
    y += LINE_HEIGHT;
  });

  // Add spacing
  y += spacingBetween / 2;

  // Draw system message
  ctx.fillStyle = SYSTEM_TEXT_COLOR;
  systemLines.forEach((line) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    ctx.fillText(line, CANVAS_PADDING, y);
    y += LINE_HEIGHT;
  });

  // Draw watermark
  y = canvas.height - CANVAS_PADDING - LINE_HEIGHT / 2;
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = `${FONT_SIZE - 2}px ${FONT_FAMILY}`;
  const watermarkText = "claudecope.com";
  const watermarkWidth = ctx.measureText(watermarkText).width;
  ctx.fillText(watermarkText, canvas.width - CANVAS_PADDING - watermarkWidth, y);

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
  currentTD?: number;
};

/**
 * Main function to share a chat interaction.
 * Renders the chat card, copies to clipboard, and optionally opens share intent.
 *
 * @param options - The share options
 * @returns ShareResult indicating success/failure and the method used
 */
export async function shareChatImage(options: ShareChatOptions): Promise<ShareResult> {
  const { userMessage, systemMessage, platform, openShareUrl = false, username, currentTD } = options;

  // Generate the share text for fallback and social sharing
  const shareText = generateShareText(userMessage, systemMessage);

  // Render the chat card
  const canvas = renderChatCard(userMessage, systemMessage, username, currentTD);

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
