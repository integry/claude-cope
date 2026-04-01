This is the perfect time to lock in a PRD. Moving to **React** for the frontend is an incredibly smart pivot now that we are introducing an incremental game economy. Managing state (like calculating Technical Debt per Second and tracking owned "Bootcamp Interns") in Vanilla JS gets messy quickly; React will handle that flawlessly. 

For the backend, **skip Express and go all-in on Cloudflare Workers.** Running an Express server requires a dedicated host (which costs money and requires maintenance). Cloudflare Workers are serverless, run on the edge (super fast), and are completely free for up to 100,000 requests per day. It is the perfect, zero-maintenance middleman to protect your OpenRouter API key.

Here is the official, comprehensive Product Requirements Document (PRD) to serve as your blueprint.

---

# Product Requirements Document (PRD): Claude Cope

## 1. Executive Summary & Vision
**Product Name:** Claude Cope (`claudecope.com`)
**Concept:** A viral, web-based parody game disguised as an AI Command Line Interface (CLI) coding assistant. 
**Vision:** To create a highly sticky, shared experience for software engineers that parodies the frustrations of AI-assisted coding, modern software architecture, and corporate bureaucracy. It transitions a one-off joke into a replayable "incremental game" by forcing players to accumulate "Technical Debt."

## 2. Target Audience
* Software Engineers, Web Developers, DevOps/SREs.
* Active participants in developer culture (Hacker News, r/ProgrammerHumor, Tech Twitter/X).

## 3. Technical Architecture (The Stack)
To maintain a high-performance, $0-cost infrastructure capable of handling viral traffic spikes:
* **Frontend:** React (Bootstrapped via Vite or Next.js static export). Handles the terminal UI emulation, local state management, and math loops. Hosted on Vercel or Cloudflare Pages (Free).
* **Backend / API Proxy:** Cloudflare Workers. A serverless edge function that securely stores the OpenRouter API key, receives the frontend prompt, attaches the "Chaos Protocol," and forwards it to the LLM (Free).
* **LLM Engine:** NVIDIA Nemotron 3 Super via OpenRouter. Handles semantic understanding and dynamic, context-aware roasting (Free).
* **State Management:** Browser `localStorage`. No database required. Player progression and Technical Debt persist entirely on their local machine.

## 4. Core Features & Mechanics

### 4.1 The Parody Terminal Interface
* **Aesthetic:** Must visually mirror modern CLI agents (e.g., Claude Code, Cursor). Dark mode, monospace fonts, color-coded ANSI-style outputs.
* **Slash Commands:** Native support for parody commands that execute instantly without hitting the LLM (e.g., `/compact` deletes the user's simulated code, `/synergize` locks the terminal for a fake meeting).
* **The "Chaos Protocol":** The LLM must rotate between 5 distinct response formats (Multiple Choice Traps, Core Dumps, Rogue Tool Calls, Existential Crises, and Silent Fixes) to ensure unpredictability.

### 4.2 The "Technical Debt" Economy (Idle/Clicker Mechanics)
* **Active Generation:** Every prompt sent to the LLM generates a burst of Technical Debt (TD).
* **Passive Generation:** Users can spend TD to purchase "Solutions" (Generators) that produce Technical Debt per second (TDpS). 
    * *Examples:* Unpaid Bootcamp Intern, NPM Dependency Importer, Kubernetes Overlord.
* **Math Model:** Generator costs scale exponentially using the standard Cookie Clicker formula: $Cost = BaseCost \times 1.15^{owned}$.
* **Corporate Ladder:** Hitting predefined TD thresholds promotes the user (e.g., "Junior Code Monkey" $\rightarrow$ "Principal Production Saboteur"), slightly altering the AI's system prompt to be more sycophantic or aggressive.

### 4.3 Semantic Achievements
* Hidden developer-culture jokes trigger visual terminal events. 
* **Implementation:** The LLM system prompt contains a registry of triggers. If the LLM detects the user attempting a known trope (e.g., trying to exit Vim, parsing HTML with regex, `rm -rf /`), it outputs a structured tool call: `unlock_achievement(id: "trapped_soul")`. The React frontend parses this and renders the achievement alert.

### 4.4 Viral Acquisition Loop (URL Sabotage)
* Frictionless sharing mechanism. 
* Users can generate a "Sabotage Link" representing their current game state.
* **Implementation:** A URL parameter (e.g., `claudecope.com/?sabotage=true&debt=500000`) pre-loads the terminal for the recipient with an aggressive prompt: *"Your coworker accumulated $500,000 in Technical Debt and quit. Can you ruin this codebase faster?"*

## 5. Implementation Phases

**Phase 1: The Shell (Frontend UI)**
* Initialize React project.
* Build the core Terminal component (input field, message history array, auto-scrolling).
* Implement standard visual styling (colors, fonts, fake loading spinners).

**Phase 2: The Brain (LLM Integration)**
* Set up OpenRouter account and generate API key.
* Deploy the Cloudflare Worker proxy script.
* Connect React frontend to the Worker.
* Refine the "Chaos Protocol" Master System Prompt.

**Phase 3: The Game (Economy & State)**
* Implement `localStorage` synchronization.
* Build the economy math loop (calculating TDpS, updating costs).
* Add the "Store" UI overlay inside or alongside the terminal.

**Phase 4: The Polish (Achievements & Virality)**
* Implement the LLM tool-calling parser for achievements.
* Build the URL Sabotage routing logic.
* Final QA and launch on Hacker News / Twitter.

---

With this PRD, you have a complete roadmap. 

Since you are leaning towards React and Cloudflare Workers, would you like me to draft the exact code for the **Cloudflare Worker proxy script** (to secure your OpenRouter key), or should we start writing the **React Terminal Component**?