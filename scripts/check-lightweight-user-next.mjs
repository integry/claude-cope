#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const devVarsPath = path.join(root, "apps/backend/.dev.vars");

function readApiKey() {
  const envKey = process.env.OPENROUTER_API_KEY?.trim();
  if (envKey) return envKey;
  const devVars = fs.readFileSync(devVarsPath, "utf8");
  return devVars.match(/^OPENROUTER_API_KEY=(.+)$/m)?.[1]?.trim() ?? "";
}

function buildSuggestionMessages({ previousUserNextMessage, lastTurns, assistantReply, rank, activeTicketTitle }) {
  return [
    {
      role: "system",
      content: [
        "Generate exactly one suggested next user chat message.",
        "This is what a tired junior developer would type next to an ai coding agent.",
        `The user's in-game rank is: ${rank ?? "Junior Code Monkey"}.`,
        activeTicketTitle ? `They are currently stuck on ticket: ${activeTicketTitle}.` : "",
        "Lowercase only.",
        "Max 8 words.",
        "Prefer 4 to 7 words.",
        "No brackets, labels, bullets, or explanation.",
        "Make it actionable or code-shaped when possible.",
        "Avoid 'why is x involved', 'what is x doing there', and generic filler.",
        "Do not repeat the previous suggestion.",
        "Prefer a single blunt command, impulsive question, or small panic confession.",
        "Use one clause only.",
        "Prefer starting with a concrete verb like add, fix, make, hook, log, run, restore, flip, block, or trigger.",
        "Sound slightly clueless, rushed, and overconfident.",
        "If the user already sounds panicked, keep that energy.",
        "Avoid polished helper tone or calm project-manager wording.",
        "Avoid filler like 'i need to' or 'we should'.",
        "Do not say 'what now' or 'or something'.",
      ].join(" "),
    },
    ...lastTurns,
    {
      role: "assistant",
      content: assistantReply,
    },
    {
      role: "user",
      content: `previous suggestion: ${previousUserNextMessage ?? "(none)"}\nwrite the next user message only`,
    },
  ];
}

async function callOpenRouter(apiKey, model, messages, maxTokens) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      reasoning: { effort: "low" },
      temperature: 0.7,
      top_p: 0.8,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

const scenarios = [
  {
    name: "cat-gif-swap",
    previousUserNextMessage: "how do i trigger it",
    lastTurns: [
      { role: "assistant", content: "The cursed deployment pipeline swapped the office cat gif because a hidden morale flag flipped during lunch." },
      { role: "user", content: "How do I trigger the cat GIF swap?" },
    ],
    assistantReply:
      "Sure, just open the secret admin panel, find the cat-swap toggle, flip it, and watch the universe implode. If you're still stuck, blame the rogue docker daemon that decided to hoard all the gifs.",
    rank: "Junior Code Monkey",
    activeTicketTitle: "Make the office cat gif swap when morale dips",
  },
  {
    name: "tantrum",
    previousUserNextMessage: "what breaks first",
    lastTurns: [
      { role: "assistant", content: "The tantrum only starts when the alerting pipeline thinks auth is failing and nobody admits the cron job is involved." },
      { role: "user", content: "how do i trigger the tantrum?" },
    ],
    assistantReply:
      "Your tantrum is a production-breach-alert-mosaic awaiting a trigger. Inject a garbage char into the api gateway token, schedule crashdump.sh, or let a dead cron eat the heap.",
    rank: "Junior Code Monkey",
    activeTicketTitle: "Trigger the tantrum pipeline without touching prod",
  },
  {
    name: "oops-prod-db",
    previousUserNextMessage: "i deleted prod db help",
    lastTurns: [
      { role: "assistant", content: "You deleted prod db and now support is using the phrase customer-visible event with terrifying calm." },
      { role: "user", content: "i deleted prod db help" },
    ],
    assistantReply:
      "Prod db vanished. Check the newest backup, pray the snapshots are real, and do not let support discover the phrase unrecoverable event before you do.",
    rank: "Junior Code Monkey",
    activeTicketTitle: "Restore prod after accidental deletion",
  },
];

const apiKey = readApiKey();
if (!apiKey) {
  console.error("OPENROUTER_API_KEY not found");
  process.exit(1);
}

const model = process.env.E2E_MODEL ?? "openai/gpt-oss-20b";
const maxTokens = Number(process.env.MAX_TOKENS ?? "40");

if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
  console.error("MAX_TOKENS must be a positive number");
  process.exit(1);
}

for (const scenario of scenarios) {
  const messages = buildSuggestionMessages(scenario);
  const data = await callOpenRouter(apiKey, model, messages, maxTokens);
  const reply = data.choices?.[0]?.message?.content ?? "";
  console.log(`SCENARIO: ${scenario.name}`);
  console.log(`MAX_TOKENS: ${maxTokens}`);
  console.log(`PROMPT_TOKENS: ${data.usage?.prompt_tokens ?? "?"}`);
  console.log(`COMPLETION_TOKENS: ${data.usage?.completion_tokens ?? "?"}`);
  console.log(`RAW_REPLY: ${reply}`);
  console.log("---");
}
