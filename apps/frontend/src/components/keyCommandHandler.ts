import type { Message } from "./Terminal";
import type { GameState, ByokUsage } from "../hooks/useGameState";

/**
 * Validates an OpenRouter API key by making a small test request.
 * Returns true if valid, false if invalid.
 */
type OpenRouterValidationRequestBody = {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens: number;
};

async function validateOpenRouterKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const requestBody: OpenRouterValidationRequestBody = {
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 5,
    };
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMsg = (data as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
      return { valid: false, error: errorMsg };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Formats the BYOK usage summary as a Markdown table.
 */
function formatUsageSummary(byokUsage?: Record<string, ByokUsage>, byokTotalCost?: number): string {
  if (!byokUsage || Object.keys(byokUsage).length === 0) {
    return "[📊] **No usage data yet.** Start chatting to track your token usage!";
  }

  const lines: string[] = ["[📊] **BYOK Usage Summary**", "", "| Model | Prompt Tokens | Completion Tokens | Cost |", "|-------|---------------|-------------------|------|"];

  let totalPrompt = 0;
  let totalCompletion = 0;

  for (const [model, usage] of Object.entries(byokUsage)) {
    totalPrompt += usage.prompt_tokens;
    totalCompletion += usage.completion_tokens;
    const costStr = `$${usage.cost.toFixed(6)}`;
    lines.push(`| ${model} | ${usage.prompt_tokens.toLocaleString()} | ${usage.completion_tokens.toLocaleString()} | ${costStr} |`);
  }

  lines.push(`| **Total** | **${totalPrompt.toLocaleString()}** | **${totalCompletion.toLocaleString()}** | **$${(byokTotalCost ?? 0).toFixed(6)}** |`);

  return lines.join("\n");
}

export async function handleKeyCommand(
  inputValue: string,
  setState: React.Dispatch<React.SetStateAction<GameState>>,
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
  state: GameState,
): Promise<boolean> {
  const trimmed = inputValue.trim().toLowerCase();

  // Handle /key without arguments - show usage summary
  if (trimmed === "/key") {
    const summary = formatUsageSummary(state.byokUsage, state.byokTotalCost);
    setHistory((prev) => [
      ...prev,
      { role: "user", content: "/key" },
      { role: "system", content: summary },
    ]);
    return true;
  }

  if (!trimmed.startsWith("/key ")) return false;

  const keyArg = inputValue.trim().slice(5).trim();
  if (keyArg.toLowerCase() === "clear") {
    setState((prev) => ({ ...prev, apiKey: undefined }));
    setHistory((prev) => [
      ...prev,
      { role: "user", content: "/key clear" },
      { role: "system", content: "[🔑] **API key removed**. Using default server key." },
    ]);
  } else if (keyArg.length > 0) {
    const masked = keyArg.slice(0, 6) + "..." + keyArg.slice(-4);

    // Validate OpenRouter keys (sk-or-v1-*)
    if (keyArg.startsWith("sk-or-v1-")) {
      setHistory((prev) => [
        ...prev,
        { role: "user", content: `/key ${masked}` },
        { role: "loading", content: "Validating OpenRouter key..." },
      ]);

      const result = await validateOpenRouterKey(keyArg);

      if (!result.valid) {
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "error", content: `[🔑] **Invalid API key.** ${result.error || "The key could not be validated."}` },
        ]);
        return true;
      }

      // Key is valid, set it
      setState((prev) => ({ ...prev, apiKey: keyArg }));
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "system", content: `[🔑] **API key validated and set** (\`${masked}\`). Your key will be used for all future requests.` },
      ]);
    } else {
      // Non-OpenRouter key, set without validation
      setState((prev) => ({ ...prev, apiKey: keyArg }));
      setHistory((prev) => [
        ...prev,
        { role: "user", content: `/key ${masked}` },
        { role: "system", content: `[🔑] **API key set** (\`${masked}\`). Your key will be used for all future requests.` },
      ]);
    }
  }
  return true;
}
