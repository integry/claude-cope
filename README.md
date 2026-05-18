# ❌ Claude COPE

[![Build Status](https://img.shields.io/badge/build-failing_loudly-red.svg)](https://claudecope.com)
[![Coverage](https://img.shields.io/badge/coverage-0%25_but_morally_green-yellow.svg)](https://claudecope.com)
[![License: BSL 1.1](https://img.shields.io/badge/License-BSL_1.1-blue.svg)](LICENSE.md)
[![Technical Debt](https://img.shields.io/badge/Technical_Debt-Compounding-critical.svg)](https://claudecope.com)

> **⚠️ DISCLAIMER: I did not write this codebase.**
> 
> If you are looking at this repository, you probably just played the game and wanted to see how the terminal state, real-time typing effects, and serverless Cloudflare architecture were implemented. 
>
> I didn't code any of it. **This entire project was autonomously generated, architected, and debugged by an AI.**
>
> Go look at the **Closed Pull Requests** tab. You will see an AI orchestrator catch and fix React `stale-closure` race conditions, extract components to satisfy strict CI/CD line-count linters, and generate hundreds of lines of satirical lore based on 4-word prompts.
> 
> ### The Engine Behind the Curtain
> This game is a live tech demo for **[Propr.dev](https://propr.dev)**, an autonomous AI coding orchestrator that integrates directly into GitHub PRs. 
> 
> 👉 **[Propr launches next week. Click here to join the waitlist for day-one access.](https://propr.dev)**

---

## 🗑️ Welcome to the Simulation

> **The world's first AI coding assistant optimized entirely for maximizing Technical Debt.**

Most AI coding agents try to make you faster, smarter, and more efficient. **This is a fundamental misunderstanding of the modern enterprise.** Claude Cope is a browser-based, multiplayer terminal game that faithfully simulates the true software engineering experience: arguing with confidently wrong stakeholders, accumulating massive amounts of Technical Debt (TD), and deploying catastrophic infrastructure to production on a Friday.

🌐 **Play it live at: [claudecope.com](https://claudecope.com)**  
Short alias: [cope.bot](https://cope.bot)

## 🌪️ The Core Loop

1. **Stare into the Abyss:** Run `/backlog` to view the Community Backlog—a curated list of hundreds of deranged Jira tickets ranging from Office Politics (`YELL`) to Legacy System Migrations (`MELT`) and Modern Framework Churn (`BLORT`).
2. **Accept the Pain:** Type `/take <id>` to claim a ticket (e.g., *"Rewrite the Backend in Rust Because the Intern Watched a YouTube Video"*).
3. **Argue with the Machine:** Prompt the AI. It will not help you. It will gaslight you, suggest unnecessary Kafka clusters, and mock your tech stack. 
4. **Earn Debt:** Complete tickets to earn **Technical Debt (TD)**.
5. **Climb the Ladder:** Use your TD in the `/store` to buy coping mechanisms, or race your coworkers to the bottom on the global `/leaderboard`.

## ✨ Features

* **Agentic Sabotage:** Backed by real LLMs routed through OpenRouter, using specialized system prompts to ensure maximum condescension and architectural ruin.
* **The Hallucination Engine:** Hot-swap your AI models using `/model`. Stay on the default *Cope Regret vFINAL_v2_USE_THIS_ONE*, or unlock *Cope Copus 4.69* and *Cope Psychos (Red-Teamed)* for more expensive, more dangerous varieties of overconfidence.
* **Corporate Buddies:** Why suffer alone? Spawn an emotional support companion like **Agile Snail** or **Grumpy Senior** to silently judge your keystrokes from the corner of your terminal.
* **Multiplayer Misery:** See live global events in your `[LIVE]` ticker. Type `/who` to quantify your loneliness, or `/party` to watch the firehose of other users' failures in real-time.
* **Pixel-Perfect Terminal UI:** A highly responsive, mobile-friendly CLI environment built in React.

## 💻 Essential Commands

Claude Cope is controlled entirely via slash commands. Type `/help` in the terminal for the full manifesto, or try:

| Command | Action |
| :--- | :--- |
| `/backlog` | Stare into the abyss of unfulfilled promises. |
| `/take` | Voluntarily accept more pain. |
| `/blame` | Find a suitable scapegoat. |
| `/store` | Purchase premium technical debt. |
| `/theme` | Pretend a new color palette will fix your code. |
| `/brrrrrr` | Ship directly to prod on a Friday. |
| `/promote` | [SUPPORTER] Skip the meritocracy and buy a fake title. |

## 💸 The Wallet Extraction Utility

Because no modern dev tool is complete without predatory B2B SaaS pricing, Claude Cope features a fully functional paywall. 

Players can upgrade to **MAX 429X** to unlock 50+ specialized trauma categories (like E-Commerce logic, Game Dev crunch, and Ad-Tech slime), premium hostile AI models, and exclusive terminal themes. 

**The Executive Supporter Tier:** Senior developers can expense the $19.99 tier to their employer to unlock 5 team keys, one Executive Supporter vanity seat, supporter-only `/promote` titles, premium terminal themes, and the ability to flex their bad financial decisions globally.

If $4.99 feels excessive, clone the repo and disappoint yourself locally.

## 🚧 Running It Locally

If you want to inspect the cursed machinery instead of just playing it:

```bash
npm install
npm run dev:docker
```

That brings up the full local stack:

* **Frontend:** Vite on `http://localhost:5173`
* **Backend:** Cloudflare Wrangler dev server
* **Realtime:** PartyKit dev server
* **Admin UI/API:** Separate frontend/backend dev services

If you prefer reading the setup before running it, start with `docker-compose.dev.yml` and `.env.example`.

## 🧭 Repo Layout

* `apps/frontend` — the player-facing terminal UI
* `apps/backend` — the Hono API running on Cloudflare Workers
* `apps/partykit` — realtime multiplayer / presence plumbing
* `apps/admin-frontend` + `apps/admin-backend` — internal config and ops surfaces
* `packages/shared` — shared game data, prompt logic, migrations, models, and types

## 🔐 Environment & Setup Notes

* Start with the root `.env.example` and `apps/backend/.env.example`.
* Local development does not need every production secret, but payments, Polar sync, share cards, and some external integrations do require environment configuration to fully work.
* The local stack is designed to run through Docker so Wrangler, Vite, and PartyKit all boot with the expected host wiring.

## 🧪 Build & Test

```bash
npm run build
npm run test
npm run lint
```

These run across the workspace packages defined in the root `package.json`.

## 🏗️ Architecture In One Breath

The frontend renders the fake terminal and slash-command UX in React. The backend runs as a Cloudflare Worker with Hono, persists game state in D1, and talks to OpenRouter for model completions. PartyKit handles realtime presence and multiplayer event flow. Shared prompts, economy constants, migrations, and type definitions live in `packages/shared`.

## 🛠️ Tech Stack

While the game simulates garbage code, the underlying stack does not. (Orchestrated entirely by Propr.dev):
* **Frontend:** React, TypeScript, Vite. (Strict, responsive Flexbox/Grid terminal UI).
* **Backend:** Hono, Cloudflare Workers.
* **Database:** Cloudflare D1 (SQLite at the Edge).
* **Image Generation:** Vercel Satori & Resvg-wasm (Serverless Edge rendering for pixel-perfect Twitter/LinkedIn unfurls).
* **Payments:** Polar.sh

## 🤝 Contributing & License

We welcome pull requests, provided they introduce at least one new dependency and break a core feature. 

**License:** This project uses the **Business Source License 1.1**. 
You are free to view, fork, and learn from this codebase, or use the terminal chassis to build non-competitive tools. You are *not* permitted to host a competing commercial version of this game or bypass the monetization systems. See `LICENSE.md` for the full Additional Use Grant.

If you have a horrific workplace experience that needs to be immortalized, please open a GitHub Issue using the `[GRIEVANCE]` template. If it is painful enough, Propr will autonomously add it to the official database seed.

## 📜 Legal

[LEGAL] This is a parody project and is not affiliated with Anthropic... yet.
