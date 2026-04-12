/**
 * Chat Image Generation Utility for Social Sharing
 *
 * Renders chat messages onto an HTML5 Canvas styled like the terminal,
 * and provides clipboard copying functionality with fallback to plaintext.
 */

import { parseSegments, drawStyledLine, wrapText } from "./shareChatTextUtils";

export type ChatMessage = {
  role: "user" | "system";
  content: string;
};

// Terminal styling constants
const CANVAS_PADDING = 24;
const LINE_HEIGHT = 20;
const FONT_SIZE = 14;
const FONT_FAMILY = '"Courier New", Courier, monospace';
const MAX_WIDTH = 720;
const MAX_HEIGHT = 800;
const BG_COLOR = "#0d1117";
const HEADER_BG_COLOR = "#161b22";
const HEADER_BORDER_COLOR = "#30363d";
const HEADER_DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];
const USER_PROMPT_COLOR = "#e6edf3";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const BOLD_TEXT_COLOR = "#e6edf3";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#facc15";
const HEADER_BAR_HEIGHT = 36;

const PARAGRAPH_BREAK_RATIO = 0.4;
const LIST_ITEM_GAP_RATIO = 0.4;
const SPACING_RATIO = 0.6;

/**
 * Renders a chat card with user message and system response onto a canvas
 */
export function renderChatCard(userMessage: string, systemMessage: string, username?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const contentMaxWidth = MAX_WIDTH - CANVAS_PADDING * 2;
  const fontSize = FONT_SIZE;
  const lineHeight = LINE_HEIGHT;
  const font = `${fontSize}px ${FONT_FAMILY}`;
  const boldFont = `bold ${fontSize}px ${FONT_FAMILY}`;
  const italicFont = `italic ${fontSize}px ${FONT_FAMILY}`;
  ctx.font = font;

  const userPrefix = "❯ ";
  const userPrefixWidth = ctx.measureText(userPrefix).width;
  const userLines = wrapText(ctx, userMessage, contentMaxWidth - userPrefixWidth);
  const systemLines = wrapText(ctx, systemMessage, contentMaxWidth);
  const headerText = username ?? "";

  const PARAGRAPH_BREAK_HEIGHT = Math.round(lineHeight * PARAGRAPH_BREAK_RATIO);
  const LIST_ITEM_GAP = Math.round(lineHeight * LIST_ITEM_GAP_RATIO);
  const calcBlockHeight = (lines: string[]) =>
    lines.reduce((h, line) =>
      h + (line === "" ? PARAGRAPH_BREAK_HEIGHT : line === "\x01" ? LIST_ITEM_GAP : lineHeight), 0);

  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const spacingBetween = Math.round(lineHeight * SPACING_RATIO);

  const fixedHeight = HEADER_BAR_HEIGHT + CANVAS_PADDING + userBlockHeight + spacingBetween + CANVAS_PADDING;

  const truncatedSystemLines = truncateLines(systemLines, systemBlockHeight, MAX_HEIGHT - fixedHeight, lineHeight, calcBlockHeight);
  const truncatedSystemBlockHeight = calcBlockHeight(truncatedSystemLines);
  const totalHeight = Math.min(MAX_HEIGHT, fixedHeight + truncatedSystemBlockHeight);

  canvas.width = MAX_WIDTH;
  canvas.height = totalHeight;

  // Draw background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = font;
  ctx.textBaseline = "top";

  drawHeader(ctx, canvas.width, fontSize, font, headerText);

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
  y += spacingBetween;

  // Draw system message with inline bold styling
  truncatedSystemLines.forEach((line) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    if (line === "\x01") {
      y += LIST_ITEM_GAP;
      return;
    }
    const segments = parseSegments(line);
    drawStyledLine({ ctx, segments, x: CANVAS_PADDING, y, normalColor: SYSTEM_TEXT_COLOR, boldColor: BOLD_TEXT_COLOR, font, boldFont, italicFont });
    y += lineHeight;
  });

  return canvas;
}

function truncateLines(
  lines: string[], blockHeight: number, available: number,
  lineHeight: number, calcBlockHeight: (l: string[]) => number,
): string[] {
  if (blockHeight <= available || available <= 0) return lines;

  const truncated: string[] = [];
  let usedHeight = 0;
  const ellipsisHeight = lineHeight;
  for (const line of lines) {
    const lineH = calcBlockHeight([line]);
    if (usedHeight + lineH + ellipsisHeight > available) break;
    truncated.push(line);
    usedHeight += lineH;
  }
  truncated.push("...");
  return truncated;
}

function drawHeader(ctx: CanvasRenderingContext2D, canvasWidth: number, fontSize: number, font: string, headerText: string): void {
  ctx.fillStyle = HEADER_BG_COLOR;
  ctx.fillRect(0, 0, canvasWidth, HEADER_BAR_HEIGHT);

  ctx.strokeStyle = HEADER_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_BAR_HEIGHT);
  ctx.lineTo(canvasWidth, HEADER_BAR_HEIGHT);
  ctx.stroke();

  const dotRadius = 5;
  const dotY = HEADER_BAR_HEIGHT / 2;
  const dotStartX = CANVAS_PADDING;
  HEADER_DOT_COLORS.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotStartX + i * 18, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  if (headerText) {
    ctx.fillStyle = HEADER_COLOR;
    ctx.font = font;
    const headerTextWidth = ctx.measureText(headerText).width;
    ctx.fillText(headerText, (canvasWidth - headerTextWidth) / 2, (HEADER_BAR_HEIGHT - fontSize) / 2);
  }

  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = font;
  const brandText = "claudecope.com";
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, canvasWidth - CANVAS_PADDING - brandWidth, (HEADER_BAR_HEIGHT - fontSize) / 2);
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const SHARE_PUNCHLINES = [
  "My AI therapist just mass-produced technical debt and called it healing.",
  "Asked Claude to cope. It did not disappoint.",
  "This is what happens when you let AI run unsupervised.",
  "I'm not crying, I'm generating technical debt.",
  "Claude said the quiet part out loud again.",
  "My terminal is judging me and it's right.",
  "This AI has zero chill and I'm here for it.",
  "Sometimes the best therapy is mass-producing bugs.",
  "I came for productivity. I stayed for the roasts.",
  "Claude woke up and chose violence today.",
  "My code review just got personal.",
  "The AI is coping harder than I am.",
  "I asked for help. I got existential dread instead.",
  "This is the most productive unproductive thing I've ever done.",
  "Breaking production one prompt at a time.",
  "My therapist charges $200/hr. Claude does it for free.",
  "The AI saw my code and started coping too.",
  "I'm in this image and I don't like it.",
  "Claude just told me what my coworkers won't.",
  "Technical debt goes brrrr.",
  "POV: You let an AI review your life choices.",
  "No tests were harmed in the making of this technical debt.",
  "My terminal has more emotional intelligence than my team lead.",
  "I didn't choose the cope life, the cope life chose me.",
  "This AI understands my codebase better than I do. That's the problem.",
  "Just got performance-reviewed by an AI. Spoiler: I failed.",
  "The only thing shipping faster than my bugs is Claude's sass.",
  "I asked Claude to fix my code. It fixed my ego instead.",
  "AI-generated therapy for human-generated disasters.",
  "Somewhere, a senior dev just felt a disturbance in the force.",
  "My git blame just became git shame.",
  "Claude is the coworker who actually reads the error logs.",
  "I've mass-produced more debt here than in my actual career.",
  "This is what peak engineering looks like. You may not like it.",
  "My stand-up just got a lot more interesting.",
  "Claude: turning imposter syndrome into a spectator sport.",
  "The AI roasted my architecture and honestly? Fair.",
  "One does not simply close the terminal.",
  "My pull request was rejected by an AI. New low unlocked.",
  "Claude just speedran my five stages of grief.",
];

function getRandomPunchline(): string {
  return SHARE_PUNCHLINES[Math.floor(Math.random() * SHARE_PUNCHLINES.length)] ?? SHARE_PUNCHLINES[0]!;
}

export function generateShareText(): string {
  const punchline = getRandomPunchline();
  return `${punchline}\n\n[paste your image here]\n\n#ClaudeCope #AI #TechnicalDebt\nhttps://claudecope.com`;
}

export function openShareIntent(platform: "twitter" | "linkedin"): void {
  const punchline = getRandomPunchline();
  if (platform === "twitter") {
    const tweetText = `${punchline}\n\n#ClaudeCope #AI #TechnicalDebt\nhttps://claudecope.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://claudecope.com")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
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
 */
export async function shareChatImage(options: ShareChatOptions): Promise<ShareResult> {
  const { userMessage, systemMessage, platform, openShareUrl = false, username } = options;
  const canvas = renderChatCard(userMessage, systemMessage, username);
  const blob = await canvasToBlob(canvas);

  if (blob) {
    const imageCopied = await copyImageToClipboard(blob);
    if (imageCopied) {
      if (openShareUrl && platform) openShareIntent(platform);
      return { success: true, method: "image", message: "Share card image copied to clipboard! Paste it anywhere to share." };
    }
  }

  const shareText = generateShareText();
  const textCopied = await copyTextToClipboard(shareText);
  if (textCopied) {
    if (openShareUrl && platform) openShareIntent(platform);
    return { success: true, method: "text", message: "Chat copied to clipboard as text (image copy not supported in this browser)." };
  }

  if (openShareUrl && platform) {
    openShareIntent(platform);
    return { success: true, method: "none", message: "Opening share dialog... (clipboard access denied)" };
  }

  return { success: false, method: "none", message: "Failed to copy to clipboard. Please try again or check browser permissions." };
}

/**
 * Utility to get a PNG data URL from the chat card (useful for previews)
 */
export function getChatCardDataUrl(userMessage: string, systemMessage: string): string {
  const canvas = renderChatCard(userMessage, systemMessage);
  return canvas.toDataURL("image/png");
}
