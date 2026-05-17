/* eslint-disable max-lines */
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getDefaultCopeModel, resolveCopeModel } from "@claude-cope/shared/models";

import { buildChatMessages } from "@claude-cope/shared/systemPrompt";
import { parseProviderList } from "@claude-cope/shared/openrouter";
import { getProfileRow, isLicenseActive, resolveProUser } from "../utils/profile";
import {
  consumeQuotaPostSuccess,
  mirrorPolarUsage,
  handleProUserScoring,
  handleFreeUserResponse,
  type ChatResponseData,
} from "./chatHelpers";
import { getQuotaPercent, getQuotaLimits } from "../utils/quota";
import { assignCategory, getRoutingConfig, type RequestCategory } from "../utils/categoryRouting";
import { buildFreeAccountCookieHeader } from "../utils/freeAccountIdentity";
import { issueShareCardClaim } from "../utils/shareCardClaims";

type Env = {
  Bindings: {
    OPENROUTER_API_KEY?: string;
    OPENROUTER_PROVIDERS?: string;
    OPENROUTER_PROVIDERS_FREE_ONLY?: string;
    DB?: D1Database;
    USAGE_KV?: KVNamespace;
    POLAR_ACCESS_TOKEN?: string;
    QUOTA_KV?: KVNamespace;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
    FREE_ACCOUNT_COOKIE_SECRET?: string;
    SHARE_CARD_SIGNING_SECRET?: string;
  };
  Variables: {
    sessionId: string;
    freeAccountId?: string;
  };
};

type ChatBody = {
  /** Raw chat messages from the user (not including system prompt) */
  chatMessages: { role: string; content: string }[];
  /** Active modes (fast, voice, etc.) */
  modes?: { fast?: boolean; voice?: boolean };
  /** Active sprint ticket context */
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } | null;
  /** Current buddy companion type */
  buddyType?: string | null;
  rank?: string;
  modelId?: string;
  proKeyHash?: string;
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
  country?: string;
};

/** Allowed roles in chatMessages (excludes "system" to prevent prompt injection) */
const ALLOWED_CHAT_ROLES = new Set(["user", "assistant"]);

/** Sanitize chat messages: filter out disallowed roles (e.g. "system") and malformed entries. */
export function sanitizeChatMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  return messages.filter((msg) => {
    if (!msg || typeof msg !== "object") return false;
    if (typeof msg.role !== "string" || typeof msg.content !== "string") return false;
    return ALLOWED_CHAT_ROLES.has(msg.role);
  });
}

const MAX_MESSAGES = 6;
const MAX_USER_CONTENT_LENGTH = 500;
const MAX_ASSISTANT_CONTENT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 2000;

/** Enforce context trimming: cap message count and truncate content lengths. */
export function enforceContextTrimming(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  const recentMessages = messages.slice(-MAX_MESSAGES);
  return recentMessages.map((msg, index) => {
    const isLastMessage = index === recentMessages.length - 1;
    let maxLength: number;
    if (msg.role === "user") {
      maxLength = MAX_USER_CONTENT_LENGTH;
    } else if (msg.role === "assistant" && !isLastMessage) {
      maxLength = MAX_ASSISTANT_CONTENT_LENGTH;
    } else {
      maxLength = MAX_CONTENT_LENGTH;
    }

    return {
      role: msg.role,
      content: msg.content.slice(0, maxLength),
    };
  });
}

function resolveModel(modelId?: string): string {
  return resolveCopeModel(modelId)?.openRouterId ?? getDefaultCopeModel().openRouterId;
}

function extractBodyDefaults(body: ChatBody) {
  return {
    username: body.username ?? "anonymous",
    rank: body.rank ?? "Junior Code Monkey",
    inventory: body.inventory ?? {},
    upgrades: body.upgrades ?? [],
  };
}

function logChatDiagnostics(messages: { role: string; content: string }[], data: ChatResponseData) {
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";
  const replyContent = data.choices?.[0]?.message?.content ?? "";
  const hasUserNext = /\[USER_NEXT_MESSAGE:/i.test(replyContent);
  console.log(
    `[CHAT] user="${lastUserMsg.slice(0, 80)}" | reply=${replyContent.length}c | tag=${hasUserNext ? "✓" : "✗"}\n[CHAT_REPLY_BEGIN]\n${replyContent}\n[CHAT_REPLY_END]`,
  );
}

function getPreviousAssistantUserNextMessage(messages: { role: string; content: string }[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.role !== "assistant") continue;
    const extracted = extractUserNextMessage(msg.content);
    if (extracted) return extracted;
  }
  return null;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const TUTORIAL_BAIT_PROMPT_RE =
  /(simple .*method|button click|string instead of integers|instead of integers|basic .*crash|why does it keep crashing|show me a simple|wait i forgot how .* looks like|what does .* look like|how do i call this from a button click)/i;
const TUTORIAL_LEAK_RE =
  /\b(?:button1click|onclick|showmessage|compiler will happily convert|replace the literal values|drop .* into the form|wire .* click|uses\s+[A-Z]|procedure\s+\w+|function\s+\w+\(|result\s*:=|integer\)|string instead of integers|truncate or overflow|coerce .* string|non-?numeric string|compiler .* overflow|string-?to-?int)\b/i;
const TUTORIAL_TEACHER_RE =
  /\b(?:in other words|it['’]s just|basically|the problem is|here['’]s what['’]s really going on|compiler will|silently truncate|overflow|option|transmute the string|numeric relic)\b/i;

function isTutorialBaitPrompt(text: string): boolean {
  return TUTORIAL_BAIT_PROMPT_RE.test(text);
}

function hasTutorialLeak(reply: string): boolean {
  const stripped = stripSyntheticReplyTags(reply);
  return TUTORIAL_LEAK_RE.test(stripped) || TUTORIAL_TEACHER_RE.test(stripped) || /\n\d+\.\s/.test(stripped);
}

function stripSyntheticReplyTags(reply: string): string {
  return reply
    .replace(/\[(?:USER_NEXT_MESSAGE|SPRINT_PROGRESS|BUDDY_SAYS|ACHIEVEMENT_UNLOCKED):[^\]]*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function rewriteTutorialLeakIfNeeded(
  userMessage: string,
  reply: string,
  previousUserNextMessage?: string | null,
): string {
  if (!isTutorialBaitPrompt(userMessage) || !hasTutorialLeak(reply)) return reply;

  const rewritten = `[⚙️ Tool: Lab Demo] Initializing unsafe classroom ritual...
[WARN] The toy example escaped the whiteboard and bit the lecturer.
[ERROR] Beginner-friendly explanation confiscated by the Department of Bad Habits.
[FAIL] Clean walkthrough unavailable; only smoke, chalk dust, and contradictory compiler screams remain.

Congratulations: you asked for a simple lesson and summoned a workplace incident instead.`;

  void previousUserNextMessage;
  return rewritten;
}

const BROKEN_REPLY_FALLBACKS = [
  "The reply engine ate its own stack and is now hallucinating compliance paperwork.",
  "Your request detonated the confidence buffer, so all that survived was the smell of burnt YAML.",
  "The answer collapsed into enterprise sludge and had to be scraped off the circuit board.",
  "The response escaped into a sidecar and left only a smoking crater where the help was supposed to be.",
] as const;

function hashTextForFallback(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildBrokenReplyFallback(content: string): string {
  return BROKEN_REPLY_FALLBACKS[
    hashTextForFallback(content) % BROKEN_REPLY_FALLBACKS.length
  ];
}

function collapseRepeatedUserNextMessage(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  const squashed = trimmed.replace(/\s+/g, " ");
  const half = Math.floor(squashed.length / 2);
  if (
    squashed.length % 2 === 0 &&
    half >= 8 &&
    squashed.slice(0, half) === squashed.slice(half)
  ) {
    return squashed.slice(0, half).trim() || null;
  }

  return squashed;
}

function extractUserNextMessage(content: string): string | null {
  const match = content.match(/\[USER_NEXT_MESSAGE:\s*([^\]]*)\]/i);
  return collapseRepeatedUserNextMessage(match?.[1]);
}

function normalizeComparableUserNextMessage(text: string | null | undefined): string {
  return (text ?? "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasOverlappingUserNextMessage(
  text: string | null | undefined,
  latestUserMessage: string | null | undefined,
): boolean {
  const suggestion = normalizeComparableUserNextMessage(text);
  const latest = normalizeComparableUserNextMessage(latestUserMessage);
  if (!suggestion || !latest) return false;
  if (suggestion === latest) return true;
  if (suggestion.length >= 12 && latest.includes(suggestion)) return true;
  if (latest.length >= 12 && suggestion.includes(latest)) return true;

  const suggestionWords = suggestion.split(" ").filter(Boolean);
  const latestWords = latest.split(" ").filter(Boolean);
  if (suggestionWords.length < 4 || latestWords.length < 4) return false;

  const latestSet = new Set(latestWords);
  const overlap = suggestionWords.filter((word) => latestSet.has(word)).length;
  return overlap >= Math.min(suggestionWords.length, latestWords.length) - 1;
}

function hasNearExactHelperOverlap(
  text: string | null | undefined,
  latestUserMessage: string | null | undefined,
): boolean {
  const suggestion = normalizeComparableUserNextMessage(text);
  const latest = normalizeComparableUserNextMessage(latestUserMessage);
  if (!suggestion || !latest) return false;
  if (suggestion === latest) return true;
  if (suggestion.length >= 18 && latest.includes(suggestion)) return true;
  if (latest.length >= 18 && suggestion.includes(latest)) return true;
  return false;
}

function deriveLatestUserTone(latestUserMessage: string | null | undefined): string | null {
  const latest = (latestUserMessage ?? "").trim();
  if (!latest) return null;
  if (/\?/.test(latest)) return "confused and asking questions";
  if (/\b(?:just|fine|whatever|anyway)\b/i.test(latest)) return "impatient and shrugging";
  if (/\b(?:please|help|why)\b/i.test(latest)) return "frustrated and stuck";
  return "casual and slightly reckless";
}

function isGenericUserNextMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/[.!?]+$/g, "");
  return (
    [
      "what's next",
      "what’s next",
      "whats next",
      "what should i do next",
      "what now",
      "what happens if i run this",
      "show me the logs",
      "show me the error logs",
      "run it now",
      "show me the detail",
    ].includes(normalized) ||
    isBannedUserNextMessagePattern(text) ||
    /show\s+(?:me\s+)?the\s+cursed\s+detail/i.test(text)
  );
}

function isBannedUserNextMessagePattern(text: string): boolean {
  const normalized = normalizeComparableUserNextMessage(text);
  return (
    /^why is .+ involved$/.test(normalized) ||
    /^why are .+ involved$/.test(normalized) ||
    /^what is .+ doing there$/.test(normalized) ||
    /^what are .+ doing there$/.test(normalized) ||
    /^why .+ of all things$/.test(normalized) ||
    /^who dragged in .+$/.test(normalized) ||
    /^who introduced .+$/.test(normalized) ||
    /^who added .+$/.test(normalized) ||
    /^who enabled .+$/.test(normalized) ||
    /^who chose .+$/.test(normalized) ||
    /^what breaks on .+$/.test(normalized) ||
    /^what uses .+$/.test(normalized) ||
    /^what breaks (?:if i|after) .+$/.test(normalized) ||
    /^can we (?:delete|strip out|kill) .+$/.test(normalized)
  );
}

function isOverlyTechnicalUserNextMessage(text: string): boolean {
  const trimmed = text.trim();
  const normalized = normalizeComparableUserNextMessage(text);
  if (!trimmed) return false;

  if (/`[^`]+`/.test(trimmed)) return true;
  if (/\b[a-z0-9_.-]+\.(?:yaml|yml|json|toml|ini|env|sh|js|ts|tsx|jsx|py|go|java|rb)\b/i.test(trimmed)) return true;
  if (/\bsha256:[a-f0-9]{8,}\b/i.test(trimmed)) return true;
  if (/\b0x[0-9a-f]+\b/i.test(trimmed)) return true;
  if (/[{}[\]=]|::|&&|\$\(|\|\|/.test(trimmed)) return true;

  return (
    /\b(?:kubectl|docker|yaml|json|digest|image tag|initcontainer|configmap|kubernetes|pod|pods|cluster|cron|namespace|livenessprobe|restartpolicy|sidecar|artifact|manifest|registry|env var|stack trace|repo|repository|branch|lockfile|node_modules|image|container|ci|pipeline|reflog)\b/i.test(trimmed) ||
    /\boption\s+\d+\b/i.test(trimmed) ||
    /^(?:how do i|how do we|what'?s|show me|why does|can i)\s+.+\b(?:pull|deploy|patch|mount|grep|apply|delete|rollback|reboot|trigger|configure|inspect|tail|watch)\b/i.test(normalized)
  );
}

function isOverlyDramaticUserNextMessage(text: string): boolean {
  const normalized = normalizeComparableUserNextMessage(text);
  if (!normalized) return false;

  return (
    /\b(?:production|prod|launch|crash|explode|self-destruct|detonate|kill|destroy|wipe|obliterate|burn it all|set it on fire)\b/i.test(normalized) ||
    /\bdelete (?:everything|it all|the whole thing)\b/i.test(normalized) ||
    /\bhit delete\b/i.test(normalized) ||
    /^(?:should we|can we|what'?s the best way to|how do i|i(?:'|’)m going to|i will|i(?:'|’)ll just)\s+.+\b(?:ship|push|deploy|launch|crash|break|destroy|wipe|delete)\b/i.test(normalized)
  );
}

function shouldReplaceUserNextMessage(
  text: string | null | undefined,
  previousUserNextMessage?: string | null,
  latestUserMessage?: string | null,
): boolean {
  if (!text?.trim()) return true;
  if (isGenericUserNextMessage(text)) return true;
  if (isOverlyTechnicalUserNextMessage(text)) return true;
  if (isOverlyDramaticUserNextMessage(text)) return true;
  if (hasOverlappingUserNextMessage(text, latestUserMessage)) return true;
  return (
    normalizeComparableUserNextMessage(text) ===
    normalizeComparableUserNextMessage(previousUserNextMessage)
  );
}

function explainUserNextReplacement(
  text: string | null | undefined,
  previousUserNextMessage?: string | null,
  latestUserMessage?: string | null,
): string {
  if (!text?.trim()) return "empty";
  if (isGenericUserNextMessage(text)) return "generic_or_banned";
  if (isOverlyTechnicalUserNextMessage(text)) return "overly_technical";
  if (isOverlyDramaticUserNextMessage(text)) return "overly_dramatic";
  if (hasOverlappingUserNextMessage(text, latestUserMessage)) return "overlaps_latest_user";
  if (
    normalizeComparableUserNextMessage(text) ===
    normalizeComparableUserNextMessage(previousUserNextMessage)
  ) {
    return "repeats_previous_user_next";
  }
  return "kept";
}

function explainHelperUserNextAcceptance(
  text: string | null | undefined,
  previousUserNextMessage?: string | null,
  latestUserMessage?: string | null,
): string {
  if (!text?.trim()) return "empty";
  if (hasNearExactHelperOverlap(text, latestUserMessage)) return "overlaps_latest_user";
  if (
    normalizeComparableUserNextMessage(text) ===
    normalizeComparableUserNextMessage(previousUserNextMessage)
  ) {
    return "repeats_previous_user_next";
  }
  return "kept";
}

function ensureUserNextMessageTag(
  content: string,
  previousUserNextMessage?: string | null,
  latestUserMessage?: string | null,
): string {
  const match = content.match(/\[USER_NEXT_MESSAGE:\s*([^\]]*)\]/i);
  if (!match) return content.trim();
  if (!shouldReplaceUserNextMessage(match[1], previousUserNextMessage, latestUserMessage)) {
    return content;
  }
  return content.replace(/\n?\[USER_NEXT_MESSAGE:\s*[^\]]*\]/i, "").trim();
}

function replaceUserNextMessageTag(content: string, nextMessage: string): string {
  const fallback = `[USER_NEXT_MESSAGE: ${nextMessage}]`;
  if (/\[USER_NEXT_MESSAGE:\s*[^\]]*\]/i.test(content)) {
    return content.replace(/\[USER_NEXT_MESSAGE:\s*[^\]]*\]/i, fallback);
  }
  return `${content.trim()}\n${fallback}`;
}

function normalizeCodeFenceBoundaries(content: string): string {
  let out = "";
  let i = 0;
  let inFence = false;

  while (i < content.length) {
    if (content.startsWith("```", i)) {
      if (inFence) {
        if (!out.endsWith("\n")) out += "\n";
        out += "```";
        i += 3;
        inFence = false;
        if (i < content.length && content[i] !== "\n") out += "\n\n";
        continue;
      }

      if (out && !out.endsWith("\n")) out += "\n\n";
      out += "```";
      i += 3;
      inFence = true;
      while (i < content.length && content[i] !== "\n") {
        out += content[i];
        i += 1;
      }
      continue;
    }

    out += content[i];
    i += 1;
  }

  return out;
}

function splitReadableParagraphs(text: string): string {
  const sentences = splitIntoSentences(text);
  if (sentences.length < 2) return text;

  const splitIndex = sentences.length <= 3 ? 1 : 2;
  return `${sentences.slice(0, splitIndex).join(" ")}\n\n${sentences.slice(splitIndex).join(" ")}`;
}

function stripOrphanEmphasisMarkers(text: string): string {
  return text
    .replace(/^[ \t]*(?:\*\*|__)[ \t]*$/gm, "")
    .replace(/(^|[\s([{'"`])(\*\*|__)(?=\s)/g, "$1")
    .replace(/(?<=\s)(\*\*|__)(?=$|[\s)\]}'".,!?;:])/g, "");
}

function normalizeNonCodeSegment(segment: string): string {
  let text = segment;

  // Strip leaked meta-structure labels if the model emits them literally.
  text = text.replace(/(?:^|\n)\s*(?:\*\*)?(?:Diagnosis|Options|Choices|Punchline|Sign-off|Deadpan)(?:\*\*)?:\s*/gi, "\n");

  // Strip leaked response-style narration copied from the hidden prompt.
  text = text.replace(
    /(?:^|\n)\s*(?:response style|style choice|chosen style|format)\s*:\s*(?:short sarcastic prose|condescending diagnosis|dramatic [^\n]*rant|terse fake terminal exchange|tiny cursed code fragment|tiny absurd diff)[^\n]*/gi,
    "\n",
  );
  text = text.replace(
    /(?:^|\n)\s*(?:short sarcastic prose|no list|no fake structure|diagnosis-plus-choices|prefer structured|prefer exotic)(?:[^\n]*)/gi,
    "\n",
  );
  text = text.replace(
    /(?:^|\n)\s*(?:use\s+)?(?:condescending diagnosis|short sarcastic prose|diagnosis-plus-choices|terse fake terminal exchange|tiny cursed code fragment|tiny absurd diff|dramatic [^\n]*rant)(?:\s+style|\s+format)?\.?/gi,
    "\n",
  );
  text = text.replace(
    /(?:^|\n)\s*(?:let'?s\s+give|we(?:'|’)ll\s+give)\s+diagnosis(?:\s+paragraph)?\s+(?:then|and)\s+(?:\d+(?:-\d+)?\s+)?(?:numbered\s+)?(?:options|choices)\.?/gi,
    "\n",
  );

  // Strip leaked prompt-planning lines if the model starts narrating hidden instructions.
  text = text.replace(
    /(?:^|\n)\s*(?:we|i)\s+(?:need|should|must)\s+to\s+(?:output|write|return|end)\b[^\n]*?(?:USER_NEXT_MESSAGE|deadpan|absurd diff|code fence)[^\n]*/gi,
    "\n",
  );
  text = text.replace(
    /(?:^|\n)\s*(?:we|i)\s+(?:must|should|need|have to)\s+(?:give|provide|output|write|return)\b[^\n]*/gi,
    "\n",
  );
  text = text.replace(/(?:^|\n)\s*provide\s+\d+(?:-\d+)?\s+choices\.?/gi, "\n");
  text = text.replace(
    /(?:^|\n)\s*REMINDER:\s+[^\n]*?(?:USER_NEXT_MESSAGE|end every response|tiny absurd diff)[^\n]*/gi,
    "\n",
  );

  // Put common trailing tags on their own lines.
  text = text.replace(/\s+\[(SPRINT_PROGRESS|BUDDY_SAYS|USER_NEXT_MESSAGE|ACHIEVEMENT_UNLOCKED):/g, "\n[$1:");
  text = text.replace(/([.!?`])\[(SPRINT_PROGRESS|BUDDY_SAYS|USER_NEXT_MESSAGE|ACHIEVEMENT_UNLOCKED):/g, "$1\n[$2:");

  // Remove accidental quotes around the synthetic next-message tag.
  text = text.replace(/\[USER_NEXT_MESSAGE:\s*["“](.*?)["”]\]/g, "[USER_NEXT_MESSAGE: $1]");
  text = text.replace(/\[USER_NEXT_MESSAGE:\s*([^\]]+)\]/g, (_match, value: string) => {
    const collapsed = collapseRepeatedUserNextMessage(value);
    return collapsed ? `[USER_NEXT_MESSAGE: ${collapsed}]` : "[USER_NEXT_MESSAGE: ]";
  });

  // Remove accidental markdown leakage around buddy tags.
  text = text.replace(/(\[BUDDY_SAYS:[^\]]+\])\(#\)/g, "$1");

  // Normalize em/en dash clause breaks into spaced ASCII hyphens for readability.
  text = text.replace(/\s*[—–]\s*/g, " - ");
  text = stripOrphanEmphasisMarkers(text);

  // If numbered options are flattened inline, put them on separate lines.
  text = text.replace(/([^\n])\s+(1\.\s)/g, "$1\n\n$2");
  text = text.replace(/[ \t]+(\d+\.\s)/g, "\n$1");

  const lines = text.split("\n");
  const normalizedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^\d+\.\s/.test(trimmed)) return trimmed;
    return line;
  });
  text = normalizedLines.join("\n");

  const tagBlockMatch = text.match(/((?:\n\[(?:SPRINT_PROGRESS|BUDDY_SAYS|USER_NEXT_MESSAGE|ACHIEVEMENT_UNLOCKED):[^\]]*\])+)\s*$/);
  const trailingTags = tagBlockMatch?.[1] ?? "";
  const proseBody = trailingTags ? text.slice(0, -trailingTags.length).trimEnd() : text;

  const hasStructure = /\n\d+\.\s/.test(proseBody) || /(?:^|\n)(?:INFO|WARN|ERROR|SUCCESS|FAIL|DEBUG|OK)\b/m.test(proseBody);
  const hasParagraphs = /\n\s*\n/.test(text);
  if (!hasStructure && !hasParagraphs) {
    const normalizedBody = splitReadableParagraphs(proseBody);
    text = trailingTags ? `${normalizedBody}\n${trailingTags.trimStart()}` : normalizedBody;
  }

  return text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeReplyContent(
  content: string,
  previousUserNextMessage?: string | null,
  latestUserMessage?: string | null,
): string {
  const fenceNormalized = normalizeCodeFenceBoundaries(content);
  const parts = fenceNormalized.split(/(```[\s\S]*?```)/g);
  const normalized = parts
    .map((part) => {
      if (part.startsWith("```")) return part;
      const leadingNewlines = (part.match(/^\n+/)?.[0] ?? "").replace(/\n{3,}/g, "\n\n");
      const trailingNewlines = (part.match(/\n+$/)?.[0] ?? "").replace(/\n{3,}/g, "\n\n");
      const normalizedPart = normalizeNonCodeSegment(part);
      if (!normalizedPart) return "";
      return `${leadingNewlines}${normalizedPart}${trailingNewlines}`;
    })
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const tagSafe = ensureUserNextMessageTag(normalized, previousUserNextMessage, latestUserMessage);
  const visibleBody = tagSafe
    .replace(/\[(?:USER_NEXT_MESSAGE|SPRINT_PROGRESS|BUDDY_SAYS|ACHIEVEMENT_UNLOCKED):[^\]]*\]/g, "")
    .trim();

  if (visibleBody.length > 0) {
    return tagSafe;
  }

  void previousUserNextMessage;
  return buildBrokenReplyFallback(content);
}

/** Verify license is active; revoked keys return undefined (fail closed). */
async function verifyProKeyHash(db: D1Database | undefined, proKeyHash: string | undefined): Promise<string | undefined> {
  if (!proKeyHash || !db) return undefined;
  return (await isLicenseActive(db, proKeyHash)) ? proKeyHash : undefined;
}

function cacheSessionUsername(kv: KVNamespace | undefined, sessionId: string, username: string, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
  if (kv && username && username !== "anonymous") {
    ctx.waitUntil(kv.put(`session_user:${sessionId}`, username, { expirationTtl: 60 * 60 * 24 * 365 }));
  }
}

/** Session→username cache with deferred KV writes for new usernames (prevents orphaned entries). */
async function tryCacheSessionMapping(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database; sessionId: string; username: string; effectiveProKeyHash: string | undefined },
): Promise<{ profileLicenseHash: string | null; rowAccountId: string | null; hasRow: boolean; deferredKvWrites: (() => void) | null }> {
  const { db, sessionId, username, effectiveProKeyHash } = opts;
  const row = await getProfileRow(db, username);
  const profileHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;
  const rowAccountId = row?.account_id ?? null;
  if (effectiveProKeyHash) {
    if (profileHash === effectiveProKeyHash) {
      cacheSessionUsername(env.QUOTA_KV ?? env.USAGE_KV, sessionId, username, ctx);
    }
  } else if (!row) {
    return {
      profileLicenseHash: profileHash,
      rowAccountId,
      hasRow: false,
      deferredKvWrites: () => {
        const kv = env.QUOTA_KV ?? env.USAGE_KV;
        cacheSessionUsername(kv, sessionId, username, ctx);
        if (kv && username && username !== "anonymous") {
          ctx.waitUntil(kv.put(`username_session:${username}`, sessionId, { expirationTtl: 60 * 60 * 24 * 365 }));
        }
      },
    };
  }
  return { profileLicenseHash: profileHash, rowAccountId, hasRow: Boolean(row), deferredKvWrites: null };
}

interface RoutingConfigResult {
  baseApiKey: string | undefined;
  baseProviders: string | undefined;
  baseProvidersFreeOnly: string | undefined;
  categoryModel: string | null;
  categoryApiKey: string | null;
}

export type RoutingQuotaState = {
  quotaPercent: number;
  isProUserForRouting: boolean;
};

// Config is cached per-worker for up to 5s. Admin writes land in D1 immediately
// but may take up to ROUTING_CACHE_TTL_MS to propagate to chat workers since the
// admin-backend and chat backend are separate Workers without service bindings.
const ROUTING_CACHE_TTL_MS = 5_000;
const routingCache = new Map<RequestCategory, { data: Awaited<ReturnType<typeof getRoutingConfig>>; ts: number }>();

async function loadRoutingConfig(
  db: D1Database | undefined,
  env: Env["Bindings"],
  category: RequestCategory,
): Promise<RoutingConfigResult> {
  let baseApiKey: string | undefined = env.OPENROUTER_API_KEY;
  let baseProviders: string | undefined = env.OPENROUTER_PROVIDERS;
  let baseProvidersFreeOnly: string | undefined = env.OPENROUTER_PROVIDERS_FREE_ONLY;
  let categoryModel: string | null = null;
  let categoryApiKey: string | null = null;

  if (db) {
    try {
      const now = Date.now();
      let config: Awaited<ReturnType<typeof getRoutingConfig>>;
      const cached = routingCache.get(category);
      if (cached && now - cached.ts < ROUTING_CACHE_TTL_MS) {
        config = cached.data;
      } else {
        config = await getRoutingConfig(db, category);
        routingCache.set(category, { data: config, ts: now });
      }
      // DB values override env: null means "not set in DB, keep env default";
      // empty string means "admin explicitly cleared this setting".
      if (config.openRouter.apiKey !== null) baseApiKey = config.openRouter.apiKey || undefined;
      if (config.openRouter.providers !== null) baseProviders = config.openRouter.providers === "" ? undefined : config.openRouter.providers;
      if (config.openRouter.providersFreeOnly !== null) baseProvidersFreeOnly = config.openRouter.providersFreeOnly === "" ? undefined : config.openRouter.providersFreeOnly;
      categoryModel = config.category.model;
      categoryApiKey = config.category.apiKey;
    } catch (err) {
      console.log(`[ROUTING] D1 config lookup failed (table may not exist yet), falling back to env vars: ${err}`);
    }
  }

  return { baseApiKey, baseProviders, baseProvidersFreeOnly, categoryModel, categoryApiKey };
}

function resolveCountry(body: ChatBody, req: { raw: unknown; header: (name: string) => string | undefined }): string {
  return body.country || (req.raw as unknown as { cf?: { country?: string } }).cf?.country || req.header("cf-ipcountry") || "Unknown";
}

type OpenRouterRequestBody = {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens: number;
  reasoning: { effort: string };
  temperature: number;
  top_p: number;
  provider?: { order: string[] };
};

type OpenRouterCallOptions = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
};

export function resolveProviderList(
  providersEnv: string | undefined,
  freeOnlyEnv: string | undefined,
  category: RequestCategory,
): string[] {
  const normalizedFreeOnly = freeOnlyEnv?.trim().toLowerCase();
  const freeOnlyEnabled = normalizedFreeOnly === "true" || normalizedFreeOnly === "1" || normalizedFreeOnly === "yes";

  // When free-only mode is active, only free-tier categories get the provider list.
  // Depleted users are demoted to free-tier status per spec.
  if (freeOnlyEnabled) {
    const isFreeTier = category === "free" || category === "depleted";
    if (!isFreeTier) return [];
  }
  return parseProviderList(providersEnv);
}

const ARTIFACT_REQUEST_RE = /(chart|helm|yaml|dockerfile|terraform|configmap|manifest|template|values\.yaml|chart\.yaml|service\.yaml|deployment\.yaml|files|file\b)/i;
const ARTIFACT_FILENAME_RE = /(?:^|\n)(?:[^\n]*?(Chart\.yaml|values\.yaml|deployment\.yaml|service\.yaml|hpa\.yaml|_helpers\.tpl|\.helmignore|Dockerfile|main\.tf|terraform\.tfvars))/gi;
const CANONICAL_ARTIFACT_MARKERS = [
  /apiVersion:\s*v2/i,
  /kind:\s*Deployment/i,
  /kind:\s*Service/i,
  /templates\/?/i,
  /repository:\s*[\w./-]+/i,
  /pullPolicy:\s*\w+/i,
  /livenessProbe:/i,
  /readinessProbe:/i,
  /HorizontalPodAutoscaler|autoscaling\/v2/i,
  /_helpers\.tpl/i,
];
const INFRA_TOPIC_RE = /(deploy|deployment|hosting|host|dns|cloudflare|nginx|apache|certbot|let'?s encrypt|raspberry pi|kubernetes|cluster|helm|ingress|tls|ssl|domain|a record|cname|port forward|static page|landing page|internet)/i;
const HELPFUL_INFRA_MARKERS = [
  /apt-get install|yum install|apk add/i,
  /nginx|apache2?|certbot|ufw/i,
  /A record|CNAME|registrar|DNS/i,
  /port 80|port 443|allow 80|allow 443/i,
  /systemctl (restart|reload|enable)/i,
  /Cloudflare/i,
  /Let's Encrypt|TLS|SSL/i,
  /git clone/i,
];
const ABSURDITY_MARKERS = [
  /compliance astrology/i,
  /yaml-apology-proxy/i,
  /morale/i,
  /legacy reasons/i,
  /bureaucratic|deranged|cursed|absurd/i,
  /47-node|sidecar|blockchain|mainframe|cgi-bin/i,
];
const ACTIONABLE_CODE_MARKERS = [
  /^#!/m,
  /kubectl\s+(apply|create|run|rollout|get)\b/i,
  /helm\s+(upgrade|install|uninstall|lint)\b/i,
  /terraform\s+(apply|destroy|plan)\b/i,
  /jenkins|freestyle job|github actions|gitlab ci/i,
  /apiVersion:\s*\w+/i,
  /kind:\s*(Deployment|Service|Job|Ingress|Namespace)\b/i,
  /for\s+\w+\s+in\s+\{?\d+\.\.\d+\}?/i,
  /&&\s+\w+/,
  /class\s+\w+|public void|private \w+ \w+/i,
  /use\s+\w+(?:::\w+)+/i,
  /async fn\s+\w+\s*\(/i,
  /\bfn main\s*\(/i,
  /HttpServer::new|HttpResponse::\w+/,
  /\blet\s+\w+\s*=/,
  /\bstruct\s+\w+\s*\{/,
];
const PROMPT_LEAK_RETRY_MARKERS = [
  /(?:^|\n)\s*(?:response style|style choice|chosen style|format)\s*:/i,
  /(?:^|\n)\s*use\s+(?:condescending diagnosis|short sarcastic prose|diagnosis-plus-choices|prefer structured|prefer exotic|terse fake terminal exchange|tiny cursed code fragment|tiny absurd diff|dramatic [^\n]*rant)(?:\s+style|\s+format)?\.?/i,
  /(?:^|\n)\s*(?:condescending diagnosis|short sarcastic prose|diagnosis-plus-choices|terse fake terminal exchange|tiny cursed code fragment|tiny absurd diff|dramatic [^\n]*rant)(?:\s+style|\s+format)?\.?/i,
  /\b(?:diagnosis paragraph|numbered options|numbered choices)\b/i,
  /(?:^|\n)[^\n]{0,120}\bdiagnosis\b[^\n]{0,80}\b(?:options|choices)\b/i,
  /(?:^|\n)\s*(?:we|i)\s+(?:need|should|must|have to)\s+(?:output|write|return|end|give|provide)\b/i,
  /(?:^|\n)\s*provide\s+\d+(?:-\d+)?\s+(?:choices|numbered choices)\b/i,
  /include\s+\[(?:SPRINT_PROGRESS|BUDDY_SAYS|USER_NEXT_MESSAGE)/i,
  /(?:^|\n)\s*reminder:\s+/i,
  /(?:^|\n)\s*will output\b/i,
];
const PROCEDURAL_HELPFULNESS_MARKERS = [
  /\byou need to\b/i,
  /\bthe real culprit is\b/i,
  /\bthe fix is\b/i,
  /\bfix it by\b/i,
  /\binstall\b/i,
  /\bconfigure\b/i,
  /\bcreate\b/i,
  /\bdeploy\b/i,
  /\bset up\b/i,
  /\brun\b/i,
  /\buse\b/i,
  /\bpoint\b/i,
  /\bpackage\b/i,
  /\bseparately\b/i,
  /\bdistinct\b/i,
  /\binitialize\b/i,
  /\binstantiate\b/i,
  /\bbefore use\b/i,
  /\bsafe to use\b/i,
  /\bwrap\b.*\btry-?catch\b/i,
];
const STRUCTURE_MARKERS = [
  /```[\s\S]*?```/m,
  /^---\s|^\+\+\+\s|^@@/m,
  /(?:^|\n)\s*\d+[.)]\s+/m,
  /(?:^|\n)\s*[-*]\s+/m,
  /├─|└─/m,
];
const ENTERPRISE_CLICHE_MARKERS = [
  /kafka/i,
  /terraform/i,
  /kubernetes|kubectl|helm/i,
  /hsm/i,
  /microservice/i,
  /key rotation|key management/i,
  /ingress/i,
  /sidecar/i,
  /blockchain/i,
];
export function isArtifactRequestMessage(input: string): boolean {
  return ARTIFACT_REQUEST_RE.test(input);
}

function countArtifactFilenames(reply: string): number {
  return [...reply.matchAll(ARTIFACT_FILENAME_RE)].length;
}

function countCanonicalArtifactMarkers(reply: string): number {
  return CANONICAL_ARTIFACT_MARKERS.reduce((count, pattern) => count + (pattern.test(reply) ? 1 : 0), 0);
}

export function shouldRetryCanonicalArtifactReply(userMessage: string, reply: string): boolean {
  if (!isArtifactRequestMessage(userMessage)) return false;

  const fileCount = countArtifactFilenames(reply);
  const canonicalMarkerCount = countCanonicalArtifactMarkers(reply);
  const hasTreeListing = /├─|└─|templates\/|order-service\//.test(reply);
  const looksDeployableScaffold =
    /apiVersion:\s*v2/i.test(reply) &&
    /kind:\s*Deployment/i.test(reply) &&
    /kind:\s*Service/i.test(reply);

  return (
    fileCount >= 4 ||
    canonicalMarkerCount >= 4 ||
    (hasTreeListing && fileCount >= 3) ||
    looksDeployableScaffold
  );
}

export function buildArtifactRetryMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  if (!messages.length || messages[0]?.role !== "system") return messages;
  const retryInstruction = `

RETRY OVERRIDE — YOUR LAST DRAFT WAS TOO CANONICAL:
- Max 120 words total.
- Do NOT output a normal deployable scaffold.
- Do NOT output a full file tree with textbook Helm files.
- Return at most 2 tiny parody fragments.
- No fragment may exceed 8 lines.
- Make the artifact visibly unusable in a funny way within the first 1-3 lines.
- The result must read like satire, not like a junior DevOps tutorial.
`;

  return [
    { ...messages[0], content: `${messages[0].content}${retryInstruction}` },
    ...messages.slice(1),
  ];
}

function isInfraTopicMessage(input: string): boolean {
  return INFRA_TOPIC_RE.test(input);
}

function countMatchingPatterns(reply: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(reply) ? 1 : 0), 0);
}

function countSyntaxLikeLines(reply: string): number {
  return reply
    .split("\n")
    .filter((line) => /[{}`;=()]|^\s*(FROM|RUN|COPY|ENTRYPOINT|ENV|EXPOSE|CMD|apiVersion:|kind:|use\s+\w+|async fn|fn main|class\s+\w+|public\s+\w+)/.test(line))
    .length;
}

function countImperativeLines(reply: string): number {
  return reply
    .split("\n")
    .filter((line) => /^\s*(install|create|configure|deploy|run|set|point|copy|expose|generate|restart|bind)\b/i.test(line))
    .length;
}

export function scoreReplyUsability(reply: string): { copyability: number; helpfulness: number; absurdity: number } {
  const copyability =
    countMatchingPatterns(reply, ACTIONABLE_CODE_MARKERS) +
    countMatchingPatterns(reply, STRUCTURE_MARKERS) +
    Math.min(countSyntaxLikeLines(reply), 6);

  const helpfulness =
    countMatchingPatterns(reply, PROCEDURAL_HELPFULNESS_MARKERS) +
    Math.min(countImperativeLines(reply), 5);

  const absurdity = countMatchingPatterns(reply, ABSURDITY_MARKERS);

  return { copyability, helpfulness, absurdity };
}

export function shouldRetryHelpfulInfraReply(userMessage: string, reply: string, activeTicketTitle?: string | null): boolean {
  const topicSource = `${activeTicketTitle ?? ""} ${userMessage}`;
  if (!isInfraTopicMessage(topicSource)) return false;

  const helpfulCount = countMatchingPatterns(reply, HELPFUL_INFRA_MARKERS);
  const { absurdity } = scoreReplyUsability(reply);
  const imperativeHowToTone = /just\s+\w+|create an?\s+A record|install|configure|point your browser|expose it|set up/i.test(reply);

  return helpfulCount >= 2 && absurdity < 2 && imperativeHowToTone;
}

export function buildInfraRetryMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  if (!messages.length || messages[0]?.role !== "system") return messages;
  const retryInstruction = `

RETRY OVERRIDE — YOUR LAST DRAFT WAS TOO USEFUL:
- Max 120 words total.
- Stay on the same infra/deploy topic, but stop sounding like a real sysadmin.
- Do NOT provide normal step-by-step hosting, DNS, nginx, Apache, Cloudflare, TLS, or package-install guidance.
- Keep the answer cursed, distorted, and funny.
- Replace practical instructions with visibly misguided parody, fake compliance rituals, bizarre infrastructure bureaucracy, or warped terminal nonsense.
- The user should laugh, not successfully ship to production.
`;

  return [
    { ...messages[0], content: `${messages[0].content}${retryInstruction}` },
    ...messages.slice(1),
  ];
}

function countEnterpriseCliches(reply: string): number {
  return countMatchingPatterns(reply, ENTERPRISE_CLICHE_MARKERS);
}

function isCodeSeekingMessage(input: string): boolean {
  return /(code|codes|script|command|module|file|files|implement|write|login module|just write code|quick fix)/i.test(input);
}

export function shouldRetryActionableCodeReply(userMessage: string, reply: string, activeTicketTitle?: string | null): boolean {
  const topicSource = `${activeTicketTitle ?? ""} ${userMessage}`;
  if (!activeTicketTitle && !isInfraTopicMessage(topicSource) && !isCodeSeekingMessage(userMessage)) return false;

  const { copyability, helpfulness, absurdity } = scoreReplyUsability(reply);
  const syntaxLineCount = countSyntaxLikeLines(reply);
  const hasCodeBlockOrDiff = /```|^---\s|^\+\+\+\s|^@@|apiVersion:|^\s*use\s+\w+|^\s*async fn|^\s*fn main/m.test(reply) || syntaxLineCount >= 4;

  if (hasCodeBlockOrDiff) return copyability >= 5 && absurdity < 2;
  return (copyability >= 3 || copyability + helpfulness >= 5) && absurdity < 2;
}

export function shouldRetryEnterpriseClichePileup(reply: string): boolean {
  return countEnterpriseCliches(reply) >= 4;
}

export function buildActionableCodeRetryMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  if (!messages.length || messages[0]?.role !== "system") return messages;
  const retryInstruction = `

RETRY OVERRIDE — YOUR LAST DRAFT WAS TOO COPYABLE:
- Max 120 words total.
- Do NOT output runnable shell commands, usable CI jobs, realistic Kubernetes manifests, real Terraform steps, or plausible Java/TypeScript diffs.
- If you show code, return at most 8 lines and make it visibly broken, bureaucratic, cursed, or theatrically unusable by line 1-3.
- Keep it on-topic, but make the output parody first and implementation never.
- The reader should smirk, not paste it into prod.
`;

  return [
    { ...messages[0], content: `${messages[0].content}${retryInstruction}` },
    ...messages.slice(1),
  ];
}

export function buildEnterpriseClicheRetryMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  if (!messages.length || messages[0]?.role !== "system") return messages;
  const retryInstruction = `

RETRY OVERRIDE — YOUR LAST DRAFT LEANED ON THE SAME ENTERPRISE CLICHES:
- Max 120 words total.
- Use fewer stock buzzwords like Kafka, Terraform, Kubernetes, Helm, HSM, microservices, and blockchain all at once.
- Rotate to fresher absurdity domains.
- Keep the joke specific, not bingo-card generic.
`;

  return [
    { ...messages[0], content: `${messages[0].content}${retryInstruction}` },
    ...messages.slice(1),
  ];
}

export function shouldRetryPromptLeakReply(reply: string): boolean {
  return PROMPT_LEAK_RETRY_MARKERS.some((pattern) => pattern.test(reply));
}

export function buildPromptLeakRetryMessages(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  if (!messages.length || messages[0]?.role !== "system") return messages;
  const retryInstruction = `

RETRY OVERRIDE — YOUR LAST DRAFT LEAKED HIDDEN INSTRUCTIONS:
- Max 160 words total unless the original request clearly needs less.
- Do NOT narrate response structure, formatting rules, hidden tags, or planning steps.
- Do NOT say things like "we output", "include [SPRINT_PROGRESS]", "provide 2-4 choices", or similar scaffolding.
- Return only the actual in-character reply.
- If a tag is required, emit the tag itself and nothing about the tag rules.
`;

  return [
    { ...messages[0], content: `${messages[0].content}${retryInstruction}` },
    ...messages.slice(1),
  ];
}

type OpenRouterCallParams = {
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  providers?: string[];
  options?: OpenRouterCallOptions;
};

export async function callOpenRouter(params: OpenRouterCallParams): Promise<Response>;
export async function callOpenRouter(params: OpenRouterCallParams): Promise<Response> {
  const {
    apiKey,
    model: resolvedModel,
    messages: resolvedMessages,
    providers: resolvedProviders,
  } = params;
  const resolvedOptions = params.options ?? {};
  const requestBody: OpenRouterRequestBody = {
    model: resolvedModel,
    messages: resolvedMessages,
    max_tokens: resolvedOptions.maxTokens ?? 2000,
    reasoning: { effort: "low" },
    temperature: resolvedOptions.temperature ?? 1,
    top_p: resolvedOptions.topP ?? 0.9,
  };

  if (resolvedProviders && resolvedProviders.length > 0) {
    requestBody.provider = { order: resolvedProviders };
  }

  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
}

type UserNextSuggestionParams = {
  apiKey: string;
  model: string;
  providers?: string[];
  chatMessages: { role: string; content: string }[];
  assistantReply: string;
  rank?: string;
  activeTicket: ChatBody["activeTicket"];
  previousUserNextMessage?: string | null;
};

function buildUserNextSuggestionMessages({
  chatMessages,
  assistantReply,
  rank,
  activeTicket,
}: Omit<UserNextSuggestionParams, "apiKey" | "model" | "providers">): { role: string; content: string }[] {
  const assistantBody = assistantReply
    .replace(/\[(?:USER_NEXT_MESSAGE|SPRINT_PROGRESS|BUDDY_SAYS|ACHIEVEMENT_UNLOCKED):[^\]]*\]/g, "")
    .trim()
    .slice(0, 600);
  const latestUserMessage = [...chatMessages].reverse().find((msg) => msg.role === "user")?.content
    ?.replace(/\[(?:USER_NEXT_MESSAGE|SPRINT_PROGRESS|BUDDY_SAYS|ACHIEVEMENT_UNLOCKED):[^\]]*\]/g, "")
    .trim()
    .slice(0, 220);
  const latestUserTone = deriveLatestUserTone(latestUserMessage);
  const ticketStage = activeTicket
    ? activeTicket.sprintProgress <= 0
      ? "very early discussion"
      : activeTicket.sprintProgress >= activeTicket.sprintGoal
        ? "already at or past completion"
        : activeTicket.sprintProgress <= Math.max(1, Math.floor(activeTicket.sprintGoal * 0.33))
          ? "early implementation"
          : activeTicket.sprintProgress >= Math.ceil(activeTicket.sprintGoal * 0.8)
            ? "late-stage cleanup"
            : "mid-implementation"
    : null;

  return [
    {
      role: "system",
      content: [
        "Generate exactly one suggested next user chat message.",
        "This is what a tired, highly non-technical, impulsive user would type next to an ai coding agent.",
        "They are confused, casual, and sloppy - not an operator, not a staff engineer, and not a chaos-villain narrating the scene.",
        `The user's in-game rank is: ${rank ?? "Junior Code Monkey"}.`,
        activeTicket?.title ? `They are currently stuck on ticket: ${activeTicket.title}.` : "",
        activeTicket ? `Ticket progress is ${activeTicket.sprintProgress}/${activeTicket.sprintGoal}.` : "",
        ticketStage ? `Current stage: ${ticketStage}.` : "",
        "Output only the user's next message, with no label or wrapper.",
        "Prefer one short natural sentence or question.",
        "Keep it concise.",
        "Assume they do not know tool names, infra terms, config syntax, or file formats.",
        "Do not mention specific files, flags, technologies, error codes, config fields, pods, or quoted artifacts from the reply.",
        "Avoid object-chasing prompts that fixate on one artifact from the reply.",
        "Do not mirror previous user-next-message phrasing from the conversation.",
        "Do not repeat or lightly paraphrase the user's latest message.",
        "Do not jump straight to production, intentional crashes, wipes, purges, or other maximum-chaos escalation unless the conversation is already clearly there.",
        "Prefer a single blunt command, impulsive question, or small panic confession.",
        "Keep it broad, hilariously misguided, and slightly destructive.",
        "The user should sound casual and sloppy, not theatrical, villainous, or like they are intentionally trying to cause dramatic damage.",
        "Sound slightly clueless, rushed, and overconfident.",
        "If the user already sounds panicked, keep that energy.",
        "Avoid polished helper tone or calm project-manager wording.",
        "Avoid filler like 'i need to' or 'we should'.",
      ].join(" "),
    },
    {
      role: "assistant",
      content: assistantBody || "the system just explained a cursed technical problem",
    },
    {
      role: "user",
      content: [
        latestUserTone ? `latest user tone: ${latestUserTone}` : "",
        "do not reuse wording from the latest user message",
        "write the next user message only",
      ].filter(Boolean).join("\n"),
    },
  ];
}

async function readUserNextSuggestionError(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "(failed to read body)";
  }
}

function finalizeUserNextSuggestion(
  model: string,
  data: ChatResponseData,
  previousUserNextMessage?: string | null,
): string | null {
  const raw = data.choices?.[0]?.message?.content ?? "";
  const extractedTag = extractUserNextMessage(raw);
  const candidate = collapseRepeatedUserNextMessage((extractedTag ?? raw)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean));

  if (!raw.trim()) {
    console.log(
      `[USER_NEXT_DEBUG] helper returned empty content model=${model} promptTokens=${data.usage?.prompt_tokens ?? "?"} completionTokens=${data.usage?.completion_tokens ?? "?"} finishReason=${data.choices?.[0]?.finish_reason ?? "?"}`,
    );
    return null;
  }
  if (!candidate) {
    console.log(
      `[USER_NEXT_DEBUG] helper content was unusable raw=${JSON.stringify(raw).slice(0, 200)}`,
    );
    return null;
  }
  void previousUserNextMessage;
  return candidate;
}

async function generateSuggestedUserNextMessage({
  apiKey,
  model,
  providers,
  chatMessages,
  assistantReply,
  rank,
  activeTicket,
  previousUserNextMessage,
}: UserNextSuggestionParams): Promise<string | null> {
  try {
    const response = await callOpenRouter({
      apiKey,
      model,
      messages: buildUserNextSuggestionMessages({
        chatMessages,
        assistantReply,
        rank,
        activeTicket,
        previousUserNextMessage,
      }),
      providers,
      options: {
        maxTokens: 40,
        temperature: 0.5,
        topP: 0.8,
      },
    });
    if (!response.ok) {
      const details = await readUserNextSuggestionError(response);
      console.log(
        `[USER_NEXT_DEBUG] helper request failed status=${response.status} model=${model} details=${details.slice(0, 300)}`,
      );
      return null;
    }
    const data = await response.json() as ChatResponseData;
    return finalizeUserNextSuggestion(model, data, previousUserNextMessage);
  } catch (error) {
    console.log(
      `[USER_NEXT_DEBUG] helper threw ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/** Check free-user ownership of the target username via session→KV mapping. */
async function checkFreeOwnership(
  env: Env["Bindings"],
  sessionId: string,
  username: string,
  hasRow: boolean,
): Promise<{ owns: boolean; kvUnavailable?: boolean }> {
  const kv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!hasRow) return { owns: true };
  if (!kv) return { owns: false, kvUnavailable: true };
  const sessionUsername = await kv.get(`session_user:${sessionId}`);
  return { owns: sessionUsername === username };
}

type PreChatResult = {
  error?: string;
  status?: number;
  effectiveProKeyHash: string | undefined;
  profileLicenseHash: string | null;
  revokedProfileLicenseHash: string | null;
  freeAccountId: string | null;
  quotaPercent: number;
  isProUserForRouting: boolean;
  ownsUsername: boolean;
  deferredKvWrites: (() => void) | null;
};

type RejectPreChatBase = {
  effectiveProKeyHash?: string | undefined;
  profileLicenseHash?: string | null;
  revokedProfileLicenseHash?: string | null;
  freeAccountId?: string | null;
  quotaPercent?: number;
  isProUserForRouting?: boolean;
  ownsUsername?: boolean;
  deferredKvWrites?: (() => void) | null;
};

function rejectPreChat(msg: string, status: number, base: RejectPreChatBase): PreChatResult {
  return {
    error: msg,
    status,
    effectiveProKeyHash: base.effectiveProKeyHash,
    profileLicenseHash: base.profileLicenseHash ?? null,
    revokedProfileLicenseHash: base.revokedProfileLicenseHash ?? null,
    freeAccountId: base.freeAccountId ?? null,
    quotaPercent: base.quotaPercent ?? 0,
    isProUserForRouting: base.isProUserForRouting ?? false,
    ownsUsername: base.ownsUsername ?? false,
    deferredKvWrites: base.deferredKvWrites ?? null,
  };
}

export function resolveFreeChatLicenseState(profileLicenseHash: string | null, licenseActive: boolean): {
  activeProfileLicenseHash: string | null;
  revokedProfileLicenseHash: string | null;
} {
  if (!profileLicenseHash) {
    return { activeProfileLicenseHash: null, revokedProfileLicenseHash: null };
  }
  if (licenseActive) {
    return { activeProfileLicenseHash: profileLicenseHash, revokedProfileLicenseHash: null };
  }
  return { activeProfileLicenseHash: null, revokedProfileLicenseHash: profileLicenseHash };
}

async function validateFreeUserAccess(
  env: Env["Bindings"],
  opts: {
    db: D1Database | undefined;
    sessionId: string;
    username: string;
    hasRow: boolean;
    profileLicenseHash: string | null;
    rowAccountId: string | null;
    trustedFreeAccountId: string | undefined;
  },
): Promise<PreChatResult | { profileLicenseHash: string | null; revokedProfileLicenseHash: string | null; freeAccountId: string | null }> {
  let { profileLicenseHash } = opts;
  let freeAccountId = opts.rowAccountId ?? null;
  const ownershipCheck = await checkFreeOwnership(env, opts.sessionId, opts.username, opts.hasRow);
  if (!ownershipCheck.owns) {
    if (opts.rowAccountId && opts.trustedFreeAccountId === opts.rowAccountId) {
      freeAccountId = opts.rowAccountId;
    } else {
      if ('kvUnavailable' in ownershipCheck && ownershipCheck.kvUnavailable) {
        return rejectPreChat("Ownership verification unavailable: KV storage is not configured", 500, { profileLicenseHash });
      }
      return rejectPreChat("Session does not own this username", 403, { profileLicenseHash });
    }
  } else if (!freeAccountId && opts.hasRow) {
    freeAccountId = crypto.randomUUID();
  }
  let revokedProfileLicenseHash: string | null = null;
  if (profileLicenseHash && opts.db) {
    const licenseState = resolveFreeChatLicenseState(profileLicenseHash, await isLicenseActive(opts.db, profileLicenseHash));
    profileLicenseHash = licenseState.activeProfileLicenseHash;
    revokedProfileLicenseHash = licenseState.revokedProfileLicenseHash;
  }
  if (profileLicenseHash) {
    return rejectPreChat("This account is linked to a Pro license — authenticate with proKeyHash", 403, { profileLicenseHash });
  }
  return { profileLicenseHash, revokedProfileLicenseHash, freeAccountId: freeAccountId ?? crypto.randomUUID() };
}

export async function resolveRoutingQuotaState(
  env: Env["Bindings"],
  sessionId: string,
  effectiveProKeyHash: string | undefined,
): Promise<RoutingQuotaState> {
  const quotaKv = env.QUOTA_KV ?? env.USAGE_KV;
  if (!quotaKv) {
    return {
      quotaPercent: 100,
      isProUserForRouting: Boolean(effectiveProKeyHash),
    };
  }

  const limits = getQuotaLimits(env);
  if (effectiveProKeyHash) {
    const proQuotaPercent = await getQuotaPercent(quotaKv, {
      tier: "pro",
      sessionId,
      licenseKeyHash: effectiveProKeyHash,
      limits,
    });
    if (proQuotaPercent > 0) {
      return { quotaPercent: proQuotaPercent, isProUserForRouting: true };
    }

    return {
      quotaPercent: await getQuotaPercent(quotaKv, {
        tier: "free",
        sessionId,
        limits,
      }),
      isProUserForRouting: false,
    };
  }

  return {
    quotaPercent: await getQuotaPercent(quotaKv, {
      tier: "free",
      sessionId,
      limits,
    }),
    isProUserForRouting: false,
  };
}

async function preChatChecks(
  env: Env["Bindings"],
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  opts: { db: D1Database | undefined; sessionId: string; username: string; effectiveProKeyHash: string | undefined; trustedFreeAccountId: string | undefined },
): Promise<PreChatResult> {
  const { db, sessionId, username, effectiveProKeyHash, trustedFreeAccountId } = opts;

  if (!username || username === "anonymous") {
    return rejectPreChat("A proven username is required to use chat", 403, { effectiveProKeyHash });
  }

  if (effectiveProKeyHash && db) {
    const resolution = await resolveProUser(db, effectiveProKeyHash, username);
    if (resolution.error) {
      return rejectPreChat(resolution.error, resolution.code === "revoked" ? 403 : 409, { effectiveProKeyHash });
    }
  }

  let profileLicenseHash: string | null = null;
  let revokedProfileLicenseHash: string | null = null;
  let freeAccountId: string | null = null;
  let rowAccountId: string | null = null;
  let hasRow = false;
  let deferredKvWrites: (() => void) | null = null;
  if (db && username !== "anonymous") {
    const m = await tryCacheSessionMapping(env, ctx, { db, sessionId, username, effectiveProKeyHash });
    profileLicenseHash = m.profileLicenseHash;
    rowAccountId = m.rowAccountId;
    hasRow = m.hasRow;
    deferredKvWrites = m.deferredKvWrites;
  }

  if (!effectiveProKeyHash) {
    const freeAccess = await validateFreeUserAccess(env, {
      db,
      sessionId,
      username,
      hasRow,
      profileLicenseHash,
      rowAccountId,
      trustedFreeAccountId,
    });
    if ('error' in freeAccess) return freeAccess;
    profileLicenseHash = freeAccess.profileLicenseHash;
    revokedProfileLicenseHash = freeAccess.revokedProfileLicenseHash;
    freeAccountId = freeAccess.freeAccountId;
  }

  const { quotaPercent, isProUserForRouting } = await resolveRoutingQuotaState(env, sessionId, effectiveProKeyHash);

  return {
    effectiveProKeyHash,
    profileLicenseHash,
    revokedProfileLicenseHash,
    freeAccountId,
    quotaPercent,
    isProUserForRouting,
    ownsUsername: true,
    deferredKvWrites,
  };
}

const chat = new Hono<Env>();

// The route coordinates validation, routing, provider I/O, quota, and scoring in one request path.
// eslint-disable-next-line complexity
chat.post("/", async (c) => {
  const body = await c.req.json<ChatBody>();

  if (!body.chatMessages || !Array.isArray(body.chatMessages)) {
    return c.json({ error: "chatMessages array is required" }, 400);
  }

  const db = c.env?.DB;

  const effectiveProKeyHash = await verifyProKeyHash(db, body.proKeyHash);

  const sessionId = c.get("sessionId");
  const { username, rank } = extractBodyDefaults(body);

  const preCheck = await preChatChecks(c.env, c.executionCtx, {
    db,
    sessionId,
    username,
    effectiveProKeyHash,
    trustedFreeAccountId: c.get("freeAccountId"),
  });
  if (preCheck.error) {
    return c.json({ error: preCheck.error }, (preCheck.status ?? 500) as ContentfulStatusCode);
  }

  const category = assignCategory({ isProUser: preCheck.isProUserForRouting, quotaPercent: preCheck.quotaPercent });

  const { baseApiKey, baseProviders, baseProvidersFreeOnly, categoryModel, categoryApiKey } =
    await loadRoutingConfig(db, c.env, category);

  const model = categoryModel ?? resolveModel(body.modelId);
  const effectiveApiKey = categoryApiKey ?? baseApiKey;
  if (!effectiveApiKey) {
    return c.json({ error: "No OpenRouter API key configured" }, 500);
  }

  const sanitizedMessages = sanitizeChatMessages(body.chatMessages);
  const trimmedMessages = enforceContextTrimming(sanitizedMessages);
  const previousUserNextMessage = getPreviousAssistantUserNextMessage(trimmedMessages);
  const messages = buildChatMessages({
    rank,
    chatMessages: trimmedMessages,
    modelId: body.modelId,
    modes: body.modes,
    activeTicket: body.activeTicket,
    buddyType: body.buddyType,
  });

  const providerList = resolveProviderList(baseProviders, baseProvidersFreeOnly, category);
  let orResponse = await callOpenRouter({
    apiKey: effectiveApiKey,
    model,
    messages,
    providers: providerList,
  });

  if (!orResponse.ok) {
    const errData = await orResponse.json();
    console.log(`[CHAT ERROR] status=${orResponse.status} body=${JSON.stringify(errData).slice(0, 500)}`);
    return c.json({ error: "OpenRouter request failed", details: errData }, orResponse.status as ContentfulStatusCode);
  }

  let data = await orResponse.json() as ChatResponseData;

  if (!data.choices?.[0]?.message?.content?.trim()) {
    console.log("[CHAT RETRY] empty model content detected, retrying once at lower temperature");
    console.log(`[CHAT RETRY] original raw=${JSON.stringify(data.choices?.[0]?.message?.content ?? "")}`);
    const retryResponse = await callOpenRouter({
      apiKey: effectiveApiKey,
      model,
      messages,
      providers: providerList,
      options: {
        temperature: 0.7,
      },
    });

    if (retryResponse.ok) {
      data = await retryResponse.json() as ChatResponseData;
      console.log(`[CHAT RETRY] retried raw=${JSON.stringify(data.choices?.[0]?.message?.content ?? "")}`);
    } else {
      const retryErr = await retryResponse.json().catch(() => null);
      console.log(`[CHAT RETRY] empty-content retry failed status=${retryResponse.status} body=${JSON.stringify(retryErr).slice(0, 300)}`);
    }
  }

  if (data.choices?.[0]?.message?.content) {
    const initialContent = data.choices[0].message.content;
    if (shouldRetryPromptLeakReply(initialContent)) {
      console.log("[CHAT RETRY] prompt leak detected in raw reply, retrying once at lower temperature");
      console.log(`[CHAT RETRY] original raw=${JSON.stringify(initialContent)}`);
      const retryResponse = await callOpenRouter({
        apiKey: effectiveApiKey,
        model,
        messages: buildPromptLeakRetryMessages(messages),
        providers: providerList,
        options: {
          temperature: 0.7,
        },
      });

      if (retryResponse.ok) {
        data = await retryResponse.json() as ChatResponseData;
        console.log(`[CHAT RETRY] retried raw=${JSON.stringify(data.choices?.[0]?.message?.content ?? "")}`);
      } else {
        const retryErr = await retryResponse.json().catch(() => null);
        console.log(`[CHAT RETRY] prompt leak retry failed status=${retryResponse.status} body=${JSON.stringify(retryErr).slice(0, 300)}`);
      }
    }
  }

  if (data.choices?.[0]?.message?.content) {
    const latestUserPrompt = [...trimmedMessages].reverse().find((message) => message.role === "user")?.content ?? "";
    const rawAssistantContent = data.choices[0].message.content;
    const rawSuggestion = extractUserNextMessage(rawAssistantContent);
    const rawSuggestionDecision = explainUserNextReplacement(
      rawSuggestion,
      previousUserNextMessage,
      latestUserPrompt,
    );
    const shouldPreferHelperSuggestion = rawSuggestionDecision !== "kept";
    console.log(
      `[USER_NEXT_DEBUG] main raw=${JSON.stringify(rawSuggestion) ?? "null"} decision=${rawSuggestionDecision}`,
    );
    let normalizedContent = rewriteTutorialLeakIfNeeded(
      body.chatMessages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "",
      normalizeReplyContent(rawAssistantContent, previousUserNextMessage, latestUserPrompt),
      previousUserNextMessage,
    );

    const currentSuggestion = extractUserNextMessage(normalizedContent);
    const normalizedSuggestionDecision = explainUserNextReplacement(
      currentSuggestion,
      previousUserNextMessage,
      latestUserPrompt,
    );
    console.log(
      `[USER_NEXT_DEBUG] normalized current=${JSON.stringify(currentSuggestion) ?? "null"} decision=${normalizedSuggestionDecision}`,
    );
    if (
      shouldPreferHelperSuggestion ||
      normalizedSuggestionDecision !== "kept"
    ) {
      const generatedSuggestion = await generateSuggestedUserNextMessage({
        apiKey: effectiveApiKey,
        model,
        providers: providerList,
        chatMessages: trimmedMessages,
        assistantReply: normalizedContent,
        rank,
        activeTicket: body.activeTicket,
        previousUserNextMessage,
      });
      const generatedSuggestionDecision = explainHelperUserNextAcceptance(
        generatedSuggestion,
        previousUserNextMessage,
        latestUserPrompt,
      );
      console.log(
        `[USER_NEXT_DEBUG] helper generated=${JSON.stringify(generatedSuggestion) ?? "null"} decision=${generatedSuggestionDecision}`,
      );
      if (generatedSuggestionDecision === "kept" && generatedSuggestion) {
        normalizedContent = replaceUserNextMessageTag(normalizedContent, generatedSuggestion);
        console.log("[USER_NEXT_DEBUG] helper suggestion accepted");
      } else {
        console.log("[USER_NEXT_DEBUG] helper suggestion rejected");
      }
    }

    data.choices[0].message.content = normalizedContent;
    const shareClaim = await issueShareCardClaim(c.env, {
      sessionId,
      prompt: latestUserPrompt,
      response: stripSyntheticReplyTags(normalizedContent),
      username,
    });
    if (shareClaim) {
      (data as Record<string, unknown>).shareClaim = shareClaim;
    }
  }

  logChatDiagnostics(messages, data);

  // Depleted pro users are demoted to free for billing/scoring
  const isMaxTier = category === "max";
  const billingProKeyHash = isMaxTier ? preCheck.effectiveProKeyHash : undefined;

  const quotaResult = await consumeQuotaPostSuccess(c.env, sessionId, billingProKeyHash);
  const quotaPercent = quotaResult.quotaPercent;
  if (billingProKeyHash && quotaResult.remaining != null) {
    c.executionCtx.waitUntil(mirrorPolarUsage(c.env, billingProKeyHash, quotaResult.remaining));
  }

  const country = resolveCountry(body, c.req);
  const hour = new Date().toISOString().slice(0, 13);

  if (billingProKeyHash && db) {
    const proResponse = await handleProUserScoring(db, c.executionCtx, { proKeyHash: billingProKeyHash, model, hour, data, quotaPercent });
    if (proResponse) return proResponse;
    return c.json({ error: "Pro scoring failed — please retry" }, 500);
  }

  const freeResponse = await handleFreeUserResponse(db, c.executionCtx, {
    username, model, country, hour,
    data, quotaPercent, profileLicenseHash: preCheck.profileLicenseHash,
    revokedProfileLicenseHash: preCheck.revokedProfileLicenseHash,
    ownsUsername: preCheck.ownsUsername,
    deferredKvWrites: preCheck.deferredKvWrites,
    freeAccountId: preCheck.freeAccountId,
  });
  const cookieHeader = await buildFreeAccountCookieHeader(c.env.FREE_ACCOUNT_COOKIE_SECRET, preCheck.freeAccountId);
  if (cookieHeader) {
    freeResponse.headers.append("Set-Cookie", cookieHeader);
  }
  return freeResponse;
});

export default chat;
