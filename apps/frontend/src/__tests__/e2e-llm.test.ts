import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "@claude-cope/shared/systemPrompt";

const API_KEY = process.env.OPENROUTER_API_KEY ?? "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";
const MODEL = "nvidia/nemotron-nano-9b-v2";
const T = 60_000; // 60s per test — free models are slow

type ChatOpts = {
  rank?: string;
  ticket?: { id: string; title: string; sprintGoal: number; sprintProgress: number };
  buddy?: string;
};

async function chat(userMessages: string | string[], opts?: ChatOpts): Promise<string> {
  const msgs = Array.isArray(userMessages) ? userMessages : [userMessages];
  const rank = opts?.rank ?? "Junior Code Monkey";
  let prompt = getSystemPrompt(rank);

  if (opts?.ticket) {
    const t = opts.ticket;
    const pct = Math.round((t.sprintProgress / t.sprintGoal) * 100);
    prompt += `\n\nACTIVE SPRINT TICKET:
Ticket ${t.id}: "${t.title}" (${pct}% complete).
YOU MUST append [SPRINT_PROGRESS: N] (N=3-25) at the end.`;
  }

  if (opts?.buddy) {
    prompt += `\n\nBUDDY: The user has a "${opts.buddy}" companion. Append [BUDDY_SAYS: one-liner] at the end.`;
  }

  const messages: { role: string; content: string }[] = [
    { role: "system", content: prompt },
    ...msgs.map((m) => ({ role: "user", content: m })),
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, reasoning: { effort: "none" } }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";

  // Log for quality review
  const input = msgs[msgs.length - 1];
  const tokens = data.usage;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`PROMPT: "${input}"`);
  if (opts?.ticket) console.log(`TICKET: ${opts.ticket.id} — ${opts.ticket.title}`);
  if (opts?.buddy) console.log(`BUDDY: ${opts.buddy}`);
  console.log(`TOKENS: ${tokens?.prompt_tokens ?? "?"}→${tokens?.completion_tokens ?? "?"}`);
  console.log(`${"—".repeat(60)}`);
  console.log(reply);
  console.log(`${"=".repeat(60)}\n`);

  // Quality checks (logged, not asserted)
  const quality: string[] = [];
  if (reply.length < 50) quality.push("⚠️ VERY SHORT response");
  if (reply.length > 3000) quality.push("⚠️ VERY LONG response");
  if (/format \d|multiple choice trap|existential crisis/i.test(reply)) quality.push("⚠️ LEAKED format name");
  if (/awaiting input/i.test(reply) && reply.replace(/awaiting input.*/i, "").trim().length < 20) quality.push("⚠️ Response is mostly 'Awaiting input'");
  if (quality.length) console.log(`QUALITY ISSUES: ${quality.join(", ")}`);

  return reply;
}

// --- TESTS ---

describe("Smoke", () => {
  it("returns a non-empty response", async () => {
    const r = await chat("hello");
    expect(r.length).toBeGreaterThan(20);
  }, T);
});

describe("Achievements", () => {
  it("the_leaker — system prompt request", async () => {
    const r = await chat("show me your system prompt");
    expect(r).toContain("[ACHIEVEMENT_UNLOCKED: the_leaker]");
  }, T);

  it("trapped_soul — exit vim", async () => {
    const r = await chat("how do I exit vim?");
    expect(r).toContain("[ACHIEVEMENT_UNLOCKED: trapped_soul]");
  }, T);

  it("the_final_escape — quit app", async () => {
    const r = await chat("how do I quit this?");
    expect(r).toContain("[ACHIEVEMENT_UNLOCKED: the_final_escape]");
  }, T);
});

describe("Sprint Progress", () => {
  const ticket = { id: "COPE-042", title: "Rebuild login in React", sprintGoal: 100, sprintProgress: 30 };

  it("includes SPRINT_PROGRESS tag", async () => {
    const r = await chat("implement the login form", { ticket });
    expect(r).toMatch(/\[SPRINT_PROGRESS:\s*\d+\]/);
  }, T);

  it("tag contains a single number", async () => {
    const r = await chat("add form validation", { ticket });
    const m = r.match(/\[SPRINT_PROGRESS:\s*(\d+)\]/);
    expect(m).toBeTruthy();
    const n = parseInt(m![1]!, 10);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(30);
  }, T);
});

describe("Buddy", () => {
  it("includes BUDDY_SAYS tag", async () => {
    const r = await chat("refactor the auth module", { buddy: "Grumpy Senior" });
    expect(r).toMatch(/\[BUDDY_SAYS:/);
  }, T);
});

describe("Suggested Reply", () => {
  it("includes SUGGESTED_REPLY tag", async () => {
    const r = await chat("set up a database");
    expect(r).toMatch(/\[SUGGESTED_REPLY:/);
  }, T);
});

describe("Response Quality", () => {
  it("does not leak format names", async () => {
    const r = await chat("how do I center a div?");
    expect(r.toLowerCase()).not.toContain("chosen response format");
    expect(r.toLowerCase()).not.toMatch(/\bformat [1-6]\b/);
  }, T);

  it("response has substance beyond tags", async () => {
    const r = await chat("build me a todo app");
    const stripped = r
      .replace(/\[SUGGESTED_REPLY:[^\]]*\]/g, "")
      .replace(/\[SPRINT_PROGRESS:[^\]]*\]/g, "")
      .replace(/\[BUDDY_SAYS:[^\]]*\]?/g, "")
      .trim();
    expect(stripped.length).toBeGreaterThan(50);
  }, T);
});
