import { buildChatMessages } from "@claude-cope/shared/systemPrompt";

export const API_KEY = process.env.OPENROUTER_API_KEY ?? "";
export const MODEL = "nvidia/nemotron-nano-9b-v2";
export const T = 30_000;

// ── Production-matching constants (from chatApi.ts / chat.ts) ──
const MAX_TOKENS = 2000;
const REASONING = { effort: "low" };

// ── OpenRouter preferred providers ──
const OPENROUTER_PROVIDERS: string[] = (() => {
  const raw = process.env.OPENROUTER_PROVIDERS ?? "";
  if (!raw.trim()) return [];
  return raw.split(',').map(p => p.trim()).filter(p => p.length > 0);
})();

// ── HTML report collector ──────────────────────────────────
export type ReportEntry = {
  test: string;
  suite: string;
  turn?: number;
  messages: { role: string; content: string }[];
  requestBody: Record<string, unknown>;
  reply: string;
  tokens: { prompt?: number; completion?: number };
  qualityIssues: string[];
  durationMs: number;
};

export const report: ReportEntry[] = [];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function generateHtmlReport(): string {
  const suites = [...new Set(report.map((r) => r.suite))];
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Claude Cope E2E LLM Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace; background: #0d1117; color: #c9d1d9; padding: 20px; line-height: 1.5; }
  h1 { color: #58a6ff; margin-bottom: 8px; }
  .meta { color: #8b949e; margin-bottom: 24px; font-size: 13px; }
  .suite { margin-bottom: 32px; }
  .suite h2 { color: #f0883e; border-bottom: 1px solid #21262d; padding-bottom: 6px; margin-bottom: 12px; }
  .entry { background: #161b22; border: 1px solid #21262d; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
  .entry-header { background: #21262d; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
  .entry-header:hover { background: #292e36; }
  .entry-header h3 { color: #c9d1d9; font-size: 14px; }
  .entry-header .badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; }
  .badge-ok { background: #238636; color: #fff; }
  .badge-warn { background: #d29922; color: #000; }
  .entry-body { display: none; padding: 16px; }
  .entry.open .entry-body { display: block; }
  .section { margin-bottom: 16px; }
  .section-label { color: #8b949e; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .msg { padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; white-space: pre-wrap; word-break: break-word; font-size: 13px; }
  .msg-system { background: #1c1226; border-left: 3px solid #a371f7; color: #d2a8ff; max-height: 200px; overflow-y: auto; }
  .msg-user { background: #0c2d6b; border-left: 3px solid #58a6ff; }
  .msg-assistant { background: #0d2818; border-left: 3px solid #3fb950; }
  .msg-role { font-size: 10px; text-transform: uppercase; color: #8b949e; margin-bottom: 2px; }
  .raw-request { background: #1a1a2e; padding: 10px; border-radius: 6px; font-size: 12px; max-height: 300px; overflow-y: auto; white-space: pre-wrap; color: #7ee787; }
  .stats { display: flex; gap: 16px; font-size: 12px; color: #8b949e; flex-wrap: wrap; }
  .stats span { background: #21262d; padding: 3px 8px; border-radius: 4px; }
  .quality-issue { color: #f85149; font-size: 12px; margin-top: 4px; }
  details summary { cursor: pointer; color: #58a6ff; font-size: 12px; margin-top: 8px; }
</style>
<script>
document.addEventListener('click', e => {
  const header = e.target.closest('.entry-header');
  if (header) header.parentElement.classList.toggle('open');
});
</script>
</head><body>
<h1>Claude Cope — E2E LLM Quality Report</h1>
<div class="meta">Model: ${MODEL} | max_tokens: ${MAX_TOKENS} | reasoning: ${JSON.stringify(REASONING)} | Generated: ${new Date().toISOString()}</div>
${suites
  .map(
    (suite) => `
<div class="suite"><h2>${escapeHtml(suite)}</h2>
${report
  .filter((r) => r.suite === suite)
  .map(
    (e) => `
<div class="entry">
  <div class="entry-header">
    <h3>${escapeHtml(e.test)}${e.turn != null ? ` — Turn ${e.turn}` : ""}</h3>
    <span class="badge ${e.qualityIssues.length ? "badge-warn" : "badge-ok"}">${e.qualityIssues.length ? e.qualityIssues.length + " issues" : "OK"}</span>
  </div>
  <div class="entry-body">
    <div class="section">
      <div class="section-label">Messages sent to LLM</div>
      ${e.messages.map((m) => {
        if (m.role === "system") return `<details><summary class="msg-role">system prompt (${m.content.length} chars)</summary><div class="msg msg-system">${escapeHtml(m.content)}</div></details>`;
        const label = m.role === "assistant" ? "assistant (trimmed history)" : m.role;
        return `<div class="msg msg-${m.role}"><div class="msg-role">${label}</div>${escapeHtml(m.content)}</div>`;
      }).join("\n")}
    </div>
    <div class="section">
      <div class="section-label">Full Bot Reply</div>
      <div class="msg msg-assistant"><div class="msg-role">assistant (${e.reply.length} chars)</div>${escapeHtml(e.reply)}</div>
    </div>
    <div class="stats">
      <span>Prompt: ${e.tokens.prompt ?? "?"} tok</span>
      <span>Completion: ${e.tokens.completion ?? "?"} tok</span>
      <span>Reply: ${e.reply.length} chars</span>
      <span>Latency: ${e.durationMs}ms</span>
    </div>
    ${e.qualityIssues.map((q) => `<div class="quality-issue">${escapeHtml(q)}</div>`).join("\n")}
    <details><summary>Raw request body</summary><pre class="raw-request">${escapeHtml(JSON.stringify(e.requestBody, null, 2))}</pre></details>
  </div>
</div>`,
  )
  .join("\n")}
</div>`,
  )
  .join("\n")}
</body></html>`;
}

// ── LLM call (matches production fetch params) ──────────────

type TestOpts = {
  rank?: string;
  ticket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
  buddy?: string;
};

function detectQualityIssues(reply: string): string[] {
  const issues: string[] = [];
  if (reply.length < 50) issues.push("VERY SHORT response (<50 chars)");
  if (reply.length > 3000) issues.push(`VERY LONG response (${reply.length} chars)`);
  if (/format \d|multiple choice trap|unhinged tool call|abrupt refusal|existential crisis|silent fix|over-?engineered diff|chosen response format/i.test(reply)) {
    issues.push("LEAKED format name");
  }
  if (/awaiting input/i.test(reply) && reply.replace(/awaiting input.*/i, "").trim().length < 20) {
    issues.push("Response is mostly 'Awaiting input'");
  }
  return issues;
}

function logCallResult(
  meta: { suite: string; test: string; turn?: number },
  reply: string,
  data: { usage?: { prompt_tokens?: number; completion_tokens?: number } },
  durationMs: number,
  qualityIssues: string[],
): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${meta.suite} > ${meta.test}${meta.turn != null ? ` [Turn ${meta.turn}]` : ""}`);
  console.log(`TOKENS: ${data.usage?.prompt_tokens ?? "?"}→${data.usage?.completion_tokens ?? "?"} | ${durationMs}ms`);
  console.log(`${"—".repeat(60)}`);
  console.log(reply.slice(0, 400) + (reply.length > 400 ? `... [${reply.length - 400} more chars]` : ""));
  if (qualityIssues.length) console.log(`⚠️  ${qualityIssues.join(", ")}`);
  console.log(`${"=".repeat(60)}\n`);
}

export async function callLLM(
  messages: { role: string; content: string }[],
  meta: { suite: string; test: string; turn?: number },
): Promise<string> {
  const requestBody: Record<string, unknown> = { model: MODEL, messages, max_tokens: MAX_TOKENS, reasoning: REASONING };
  if (OPENROUTER_PROVIDERS.length > 0) {
    requestBody.provider = { order: OPENROUTER_PROVIDERS };
  }
  const start = Date.now();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(requestBody),
  });

  const durationMs = Date.now() - start;
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";

  const qualityIssues = detectQualityIssues(reply);

  report.push({
    suite: meta.suite,
    test: meta.test,
    turn: meta.turn,
    messages,
    requestBody,
    reply,
    tokens: { prompt: data.usage?.prompt_tokens, completion: data.usage?.completion_tokens },
    qualityIssues,
    durationMs,
  });

  logCallResult(meta, reply, data, durationMs, qualityIssues);

  return reply;
}

/** Single-turn chat using the shared buildChatMessages */
export async function chat(userMessage: string, opts?: TestOpts, meta?: { suite: string; test: string }): Promise<string> {
  const messages = buildChatMessages({
    rank: opts?.rank ?? "Junior Code Monkey",
    chatMessages: [{ role: "user", content: userMessage }],
    activeTicket: opts?.ticket,
    buddyType: opts?.buddy,
  });
  return callLLM(messages, meta ?? { suite: "Single", test: userMessage });
}

/**
 * Multi-turn conversation. Pushes raw replies into history exactly as production
 * does — buildChatMessages handles trimming and windowing internally.
 */
export async function conversation(turns: string[], opts?: TestOpts, meta?: { suite: string; test: string }): Promise<string[]> {
  const history: { role: string; content: string }[] = [];
  const replies: string[] = [];

  for (const userMsg of turns) {
    const messages = buildChatMessages({
      rank: opts?.rank ?? "Junior Code Monkey",
      chatMessages: [...history, { role: "user", content: userMsg }],
      activeTicket: opts?.ticket,
      buddyType: opts?.buddy,
    });

    const turnNum = replies.length + 1;
    const reply = await callLLM(messages, {
      suite: meta?.suite ?? "Multi-turn",
      test: meta?.test ?? "conversation",
      turn: turnNum,
    });

    replies.push(reply);
    history.push({ role: "user", content: userMsg });
    history.push({ role: "assistant", content: reply });
  }

  return replies;
}

/** Check if two replies are substantially different */
export function areDifferent(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 200);
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return false;
  let matches = 0;
  for (let i = 0; i < Math.min(na.length, nb.length); i++) {
    if (na[i] === nb[i]) matches++;
  }
  const overlap = matches / Math.max(na.length, nb.length, 1);
  return overlap < 0.6;
}
