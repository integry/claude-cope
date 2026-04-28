/**
 * Chat Image Generation Utility for Social Sharing
 *
 * Renders chat messages onto an HTML5 Canvas styled like the terminal,
 * and provides clipboard copying functionality with fallback to plaintext.
 */

import { parseSegments, drawStyledLine, wrapText } from "./shareChatTextUtils";
import { SHARE_PUNCHLINES } from "./sharePunchlines";
import { BUDDY_ICONS } from "./buddyConstants";

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
const LOGO_PATH = "/media/logo-400-transparent.png";
const LOGO_HEIGHT = 20;
const USER_PROMPT_COLOR = "#e6edf3";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const BOLD_TEXT_COLOR = "#e6edf3";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#facc15";
const BUDDY_COLOR = "#fb923c"; // orange-400, matches BuddyDisplay web styling
const HEADER_BAR_HEIGHT = 36;

const PARAGRAPH_BREAK_RATIO = 0.8;
const LIST_ITEM_GAP_RATIO = 0;
const SPACING_RATIO = 0.6;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Renders a chat card with user message and system response onto a canvas
 */
export async function renderChatCard(userMessage: string, systemMessage: string, username?: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(LOGO_PATH);
  } catch {
    // Logo failed to load; header will omit logo
  }

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

  // Detect buddy ASCII art prefix in system message
  let buddyArtLines: string[] = [];
  let buddyLabelLine: string | null = null;
  let systemBody = systemMessage;
  for (const [, art] of Object.entries(BUDDY_ICONS)) {
    if (systemMessage.startsWith(art)) {
      buddyArtLines = art.split("\n");
      const afterArt = systemMessage.slice(art.length);
      const labelMatch = afterArt.match(/^\n(\[.+?\].+?)(?:\n|$)/);
      if (labelMatch?.[1]) {
        buddyLabelLine = labelMatch[1];
        systemBody = afterArt.slice(labelMatch[0].length);
      } else {
        systemBody = afterArt.replace(/^\n/, "");
      }
      break;
    }
  }

  const systemLines = wrapText(ctx, systemBody, contentMaxWidth);
  const headerText = username ?? "";

  const PARAGRAPH_BREAK_HEIGHT = Math.round(lineHeight * PARAGRAPH_BREAK_RATIO);
  const LIST_ITEM_GAP = Math.round(lineHeight * LIST_ITEM_GAP_RATIO);
  const calcBlockHeight = (lines: string[]) =>
    lines.reduce((h, line) =>
      h + (line === "" ? PARAGRAPH_BREAK_HEIGHT : line === "\x01" ? LIST_ITEM_GAP : lineHeight), 0);

  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const buddyBlockHeight = (buddyArtLines.length + (buddyLabelLine ? 1 : 0)) * lineHeight;
  const buddySpacing = buddyArtLines.length > 0 ? Math.round(lineHeight * SPACING_RATIO) : 0;
  const spacingBetween = Math.round(lineHeight * SPACING_RATIO);

  const fixedHeight = HEADER_BAR_HEIGHT + CANVAS_PADDING + userBlockHeight + spacingBetween + buddyBlockHeight + buddySpacing + CANVAS_PADDING;

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

  drawHeader(ctx, canvas.width, { fontSize, font, headerText, logoImg });

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

  // Draw buddy ASCII art left-aligned in orange, preserving leading whitespace
  if (buddyArtLines.length > 0) {
    ctx.fillStyle = BUDDY_COLOR;
    ctx.font = font;
    for (const artLine of buddyArtLines) {
      ctx.fillText(artLine, CANVAS_PADDING, y);
      y += lineHeight;
    }
    if (buddyLabelLine) {
      ctx.fillText(buddyLabelLine, CANVAS_PADDING, y);
      y += lineHeight;
    }
    y += buddySpacing;
  }

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

function drawHeader(ctx: CanvasRenderingContext2D, canvasWidth: number, opts: { fontSize: number; font: string; headerText: string; logoImg: HTMLImageElement | null }): void {
  const { fontSize, font, headerText, logoImg } = opts;
  ctx.fillStyle = HEADER_BG_COLOR;
  ctx.fillRect(0, 0, canvasWidth, HEADER_BAR_HEIGHT);

  ctx.strokeStyle = HEADER_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_BAR_HEIGHT);
  ctx.lineTo(canvasWidth, HEADER_BAR_HEIGHT);
  ctx.stroke();

  // Draw logo in place of macOS-style colored circles
  if (logoImg) {
    const logoH = LOGO_HEIGHT;
    const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
    const logoY = (HEADER_BAR_HEIGHT - logoH) / 2;
    ctx.drawImage(logoImg, CANVAS_PADDING, logoY, logoW, logoH);
  }

  if (headerText) {
    ctx.fillStyle = HEADER_COLOR;
    ctx.font = font;
    const headerTextWidth = ctx.measureText(headerText).width;
    ctx.fillText(headerText, (canvasWidth - headerTextWidth) / 2, (HEADER_BAR_HEIGHT - fontSize) / 2);
  }

  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = font;
  const brandText = "cope.bot";
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

function getRandomPunchline(): string {
  return SHARE_PUNCHLINES[Math.floor(Math.random() * SHARE_PUNCHLINES.length)] ?? SHARE_PUNCHLINES[0]!;
}

/**
 * Algorithm-bait hashtags — surfaced to the dev/AI/tech feeds where the
 * crowd actually scrolls. Kept generic on purpose (no specific languages,
 * tools, or company brands) so the rotation never looks like ad-bait.
 */
const SERIOUS_TAGS = [
  "TechTwitter", "SoftwareEngineering", "CodeReview", "WebDev", "DevOps",
  "AI", "TechnicalDebt", "LLM", "AIcoding", "Coding", "Programming",
  "DevTools", "CodingHumor", "DeveloperLife", "Frontend", "Backend",
  "FullStack", "StartupLife", "TechHumor", "BuildInPublic", "CleanCode",
  "PromptEngineering", "Engineering", "Productivity", "Refactor",
  "VibeCoding", "OpenSource", "IndieHacker", "IndieDev",
  "MachineLearning", "ML", "GenAI", "GenerativeAI", "DataScience",
  "CyberSecurity", "Cloud", "SaaS", "ProductManagement",
  "TechLeadership", "EngineeringManagement", "DistributedSystems",
  "Microservices", "APIDesign", "TDD", "DesignPatterns", "SystemDesign",
  "DeveloperExperience", "DX", "CodeQuality", "SoftwareArchitecture",
  "TechBlog", "DevBlog", "HackerNews", "SoftwareCraftsmanship",
  "DevRel", "CodingLife", "EngineeringCulture", "MobileDev",
  "A11y", "WebAccessibility", "UX", "UI", "UXDesign", "ProductDesign",
  "DataEngineering", "Observability", "SRE", "Hackathon",
  "CICD", "ContinuousDelivery", "RemoteWork", "RemoteDev",
  "AgileDev", "DevCommunity", "100DaysOfCode", "CodeNewbie",
  "TechCareers", "TechCulture", "TechWriter", "EngLeadership",
  "ProductDev", "ShipIt", "ProgrammingHumor", "DeveloperHumor",
  "CodeAndCoffee", "ReadTheDocs", "DocsAsCode",
] as const;

/**
 * Lore hashtags — the absurd-corporate punchline that makes a developer
 * stop scrolling. Pairing one of these with a serious tag is the trojan
 * horse: the algorithm distributes the post on tech feeds, the
 * unhinged tag converts the click.
 */
const UNHINGED_TAGS = [
  "HRViolation", "PIP", "ToxicWorkplace", "CorporateDystopia", "FiredByAI",
  "RageQuit", "PerformanceReview", "ManagerEnergy", "StandupTrauma",
  "SprintFromHell", "MergeConflict", "ItsAFeature", "WorksOnMyMachine",
  "LegacyCode", "Burnout", "BlamedTheIntern", "LiveInProd", "CodeMonkey",
  "OnCallSurvival", "ExitInterview", "TheJiraKnows", "Hotfix",
  "StakeholderTears", "KPIPanic", "ReviewerFromHell", "LayoffSeason",
  "DeprecatedHuman", "WeeklySync", "BackToTheOffice", "AgileCeremony",
  "SynergyOps", "RetroOfShame", "OutOfBudget", "Q4Targets",
  "CalendarChaos", "ZeroProgressTuesday", "MondayDeploy",
  "ArchitectureAstronaut", "ScopeCreep", "ColdMergedToMain",
  "GhostedByPM", "PerformanceSpiral", "9To5Hostage", "OfficeHostage",
  "PlsAdvise", "GentleReminder", "CircleBack", "TouchBase",
  "SlackTrauma", "EmailHell", "InboxBankruptcy", "OnboardingFromHell",
  "OffboardingSpeedrun", "BurnoutCertified", "RageRefactor",
  "JiraHell", "BacklogGrooming", "EstimationTheater", "PlanningPoker",
  "MandatoryFun", "PowerPointKaraoke", "DeckOfDoom", "JobHopping",
  "RTOFatigue", "LayoffSurvivor", "LinkedinPremium", "RecruiterSpam",
  "GhostJob", "ImposterSyndrome", "VibeRecession", "ReorgSeason",
  "NewCEO", "AlignmentMeeting", "TakeItOffline", "StockOptionsExpired",
  "VestingCliff", "NoDeployFriday", "MondayMortem", "AlertFatigue",
  "PagerHell", "SilentReorg", "QuietFiring", "MeetingHell",
  "CalendarHell", "StatusUpdateHell", "WhatHaveYouDone",
  "DailyMicromanage", "StakeholderHell", "BlueDotMisery",
  "AlwaysOnSlack", "ResumeUpdate", "ZeroProgressFriday",
  "PlanningTheater", "ScrumOfShame", "DevPainOlympics",
  "ProductivityTheater", "ChartCrime", "BurnoutBingo",
  "QuarterlyExistentialism", "OffsiteSurvivor", "RetreatTrauma",
  "AllHandsHostage", "TownHallHostage", "OffsiteRebrand",
  "MisalignedPriorities", "ExecutiveSummary", "EmptyVision",
  "RoadmapTheater", "GoalCascade", "OKRapocalypse",
] as const;

function pickRandom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/**
 * Build the rotated hashtag triplet for share posts. `#ClaudeCope` is
 * always first (brand anchor); the second slot rotates through serious
 * tags for algorithmic distribution; the third rotates through lore tags
 * for click-through. Returned as a space-separated string with the `#`
 * prefix already applied so callers can drop it straight into a tweet.
 */
export function generateShareHashtags(): string {
  return `#ClaudeCope #${pickRandom(SERIOUS_TAGS)} #${pickRandom(UNHINGED_TAGS)}`;
}

export function generateShareText(): string {
  const punchline = getRandomPunchline();
  return `${punchline}\n\n[paste your image here]\n\n${generateShareHashtags()}\nhttps://cope.bot`;
}

export function openShareIntent(platform: "twitter" | "linkedin"): void {
  const punchline = getRandomPunchline();
  if (platform === "twitter") {
    // Twitter expands the URL inline anyway, so the longer canonical domain
    // costs no characters. The image card still renders the short cope.bot
    // brand for compact visual readability.
    const tweetText = `${punchline}\n\n${generateShareHashtags()}\nhttps://claudecope.com`;
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
  previewBlob?: Blob;
};

/**
 * Main function to share a chat interaction.
 * Renders the chat card, copies to clipboard, and optionally opens share intent.
 */
export async function shareChatImage(options: ShareChatOptions): Promise<ShareResult> {
  const { userMessage, systemMessage, platform, openShareUrl = false, username, previewBlob } = options;

  let blob: Blob | null = previewBlob ?? null;
  if (!blob) {
    const canvas = await renderChatCard(userMessage, systemMessage, username);
    blob = await canvasToBlob(canvas);
  }

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
 * Utility to get a PNG Blob from the chat card (useful for previews and sharing)
 */
export async function getChatCardBlob(userMessage: string, systemMessage: string, username?: string): Promise<Blob> {
  const canvas = await renderChatCard(userMessage, systemMessage, username);
  const blob = await canvasToBlob(canvas);
  if (!blob) throw new Error("Failed to convert canvas to blob");
  return blob;
}
