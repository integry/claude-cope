import type { Dispatch, SetStateAction } from "react";
import type { Message } from "../hooks/gameStateUtils";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { TURNSTILE_REQUIRED_EVENT } from "../turnstileEvents";
import { BOT_PROTECTION_REASON } from "@claude-cope/shared/turnstile";

type StreamUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  cost?: number;
};

type StreamResult = {
  rawReply: string;
  usage?: StreamUsage;
};

type ParsedResponse = {
  rawReply: string;
  tokensSent?: number;
  tokensReceived?: number;
  cost?: number;
  quotaPercent?: number;
};

function processSSEChunk(
  chunk: string,
  state: { rawReply: string; usage?: StreamUsage },
  setHistory: Dispatch<SetStateAction<Message[]>>,
) {
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      if (parsed?.usage) {
        state.usage = {
          prompt_tokens: parsed.usage.prompt_tokens ?? 0,
          completion_tokens: parsed.usage.completion_tokens ?? 0,
          cost: parsed.usage.cost ?? parsed.usage.total_cost ?? undefined,
        };
      }
      const delta = parsed?.choices?.[0]?.delta?.content;
      if (!delta) continue;
      state.rawReply += delta;
      const currentReply = state.rawReply;
      setHistory((prev) =>
        prev.map((msg) =>
          msg.role === "loading" ? { ...msg, content: currentReply } : msg,
        ),
      );
    } catch {
      // Skip malformed JSON chunks
    }
  }
}

async function readStreamedResponse(
  res: Response,
  setHistory: Dispatch<SetStateAction<Message[]>>,
): Promise<StreamResult> {
  const state: { rawReply: string; usage?: StreamUsage } = { rawReply: "" };
  const reader = res.body?.getReader();
  if (!reader) return { rawReply: "" };
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) processSSEChunk(decoder.decode(value, { stream: true }), state, setHistory);
  }
  return { rawReply: state.rawReply, usage: state.usage };
}

function extractJsonResponseFields(data: Record<string, unknown>): ParsedResponse {
  const choices = data?.choices as Array<{ message?: { content?: string } }> | undefined;
  const rawReply = choices?.[0]?.message?.content ?? "";
  const usage = data?.usage as { prompt_tokens?: number; completion_tokens?: number; cost?: number; total_cost?: number } | undefined;
  const quotaPercent = typeof data?.quotaPercent === "number" ? data.quotaPercent : undefined;
  return {
    rawReply,
    tokensSent: usage?.prompt_tokens,
    tokensReceived: usage?.completion_tokens,
    cost: usage?.cost ?? usage?.total_cost,
    quotaPercent,
  };
}

function extractStreamFields(usage: StreamResult["usage"]): Omit<ParsedResponse, "rawReply" | "quotaPercent"> {
  return {
    tokensSent: usage?.prompt_tokens,
    tokensReceived: usage?.completion_tokens,
    cost: usage?.cost,
  };
}

export async function parseChatResponseBody(
  res: Response,
  setHistory: Dispatch<SetStateAction<Message[]>>,
  addActiveTD?: (n: number, raw?: boolean) => void,
  onProfileUpdate?: (profile: ServerProfile) => void,
): Promise<ParsedResponse> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream")) {
    const streamResult = await readStreamedResponse(res, setHistory);
    return { rawReply: streamResult.rawReply, ...extractStreamFields(streamResult.usage) };
  }

  const data = await res.json();
  const fields = extractJsonResponseFields(data);
  if (data?.profile && onProfileUpdate) {
    onProfileUpdate(data.profile as ServerProfile);
  } else if (data?.td_awarded && addActiveTD) {
    addActiveTD(data.td_awarded, true);
  }
  return fields;
}

export async function handleChatErrorResponse(
  res: Response,
  setHistory: Dispatch<SetStateAction<Message[]>>,
  onQuotaExhausted?: () => void,
  onError?: () => void,
): Promise<boolean> {
  const removeLoading = () => setHistory((prev) => prev.filter((msg) => msg.role !== "loading"));
  const pushMessage = (message: Message) =>
    setHistory((prev) => [...prev.filter((msg) => msg.role !== "loading"), message]);
  const readErrorData = () => res.json().catch(() => null);
  const matchesBotProtectionMessage = (error: unknown) =>
    typeof error === "string" && error.toLowerCase().includes("human verification required");
  const isReverifiableReason = (reason: unknown) =>
    reason === BOT_PROTECTION_REASON.HUMAN_VERIFICATION_REQUIRED
    || reason === BOT_PROTECTION_REASON.SESSION_UNAVAILABLE;
  const isServerSideFailure = (reason: unknown) =>
    reason === BOT_PROTECTION_REASON.STORAGE_UNAVAILABLE
    || reason === BOT_PROTECTION_REASON.VERIFICATION_CHECK_FAILED;

  const triggerReverification = () => {
    onError?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TURNSTILE_REQUIRED_EVENT));
    }
    removeLoading();
  };

  const handleBotProtectionFailure = async () => {
    const errorData = await readErrorData();
    if (isReverifiableReason(errorData?.reason) || matchesBotProtectionMessage(errorData?.error)) {
      triggerReverification();
      return true;
    }
    if (isServerSideFailure(errorData?.reason)) {
      onError?.();
      pushMessage({
        role: "error",
        content: `[❌ Error] ${errorData?.error ?? "Verification service is temporarily unavailable. Please try again later."}`,
      });
      return true;
    }
    onError?.();
    pushMessage({
      role: "error",
      content: `[❌ Error] ${errorData?.error?.message ?? errorData?.error ?? "Request forbidden"} (HTTP 403)`,
    });
    return true;
  };

  const handleServiceUnavailable = async () => {
    const errorData = await readErrorData();
    if (isReverifiableReason(errorData?.reason) || isServerSideFailure(errorData?.reason)) {
      triggerReverification();
      return true;
    }
    onError?.();
    pushMessage({
      role: "error",
      content: `[❌ Error] ${errorData?.error ?? "Service temporarily unavailable"} (HTTP 503)`,
    });
    return true;
  };

  const handleQuotaExceeded = async () => {
    if (onQuotaExhausted) {
      removeLoading();
      onQuotaExhausted();
    } else {
      pushMessage({
        role: "warning",
        content: "[🚫 Quota Exceeded] You've used all your available tokens.\n\n• Downgrade your expectations\n• Upgrade to Max for 1,000 tokens\n• Shill us on Twitter for bonus tokens",
      });
    }
    return true;
  };

  const handleUnauthorized = async () => {
    onError?.();
    pushMessage({
      role: "error",
      content: "[🔑 ACCESS DENIED] OpenRouter just slammed the door in your face (HTTP 401). Your API key has been **rejected**, **ghosted**, and **emotionally unavailable**.\n\n[POSSIBLE CAUSES]\n\n• Your key is disabled — like your ambition after the third standup today\n\n• Your key expired — unlike your technical debt, which is eternal\n\n• You copy-pasted it wrong — classic Junior Code Monkey energy\n\n[RECOVERY OPTIONS]\n\n• Check your key at [openrouter.ai/keys](https://openrouter.ai/keys)\n\n• `/key clear` to crawl back to the default model\n\n• `/key <new-key>` to try again with whatever dignity you have left",
    });
    return true;
  };

  const handleRateLimit = async () => {
    onError?.();
    const errorData = await readErrorData();
    const upstreamRaw = errorData?.error?.metadata?.raw
      ?? errorData?.error?.message
      ?? (typeof errorData?.error === "string" ? errorData.error : "");
    const details = upstreamRaw ? `\n\n${upstreamRaw}` : "";
    pushMessage({
      role: "warning",
      content: `[⚠️] OpenRouter rate-limited your request. Please wait before sending another message.${details}`,
    });
    return true;
  };

  const handlers: Partial<Record<number, () => Promise<boolean>>> = {
    401: handleUnauthorized,
    402: handleQuotaExceeded,
    403: handleBotProtectionFailure,
    429: handleRateLimit,
    503: handleServiceUnavailable,
  };

  const handler = handlers[res.status];
  if (handler) return handler();

  if (res.ok) return false;

  onError?.();
  const errorData = await readErrorData();
  pushMessage({
    role: "error",
    content: `[❌ Error] ${errorData?.error?.message ?? errorData?.error ?? "Request failed"} (HTTP ${res.status})`,
  });
  return true;
}
