Leaving your dedicated server out of this is the smartest move you could make. When a joke site hits Hacker News, the traffic doesn't scale linearly—it spikes violently. A dedicated server might melt under a "hug of death," but Cloudflare Workers run on the edge and will handle 50,000 concurrent users without breaking a sweat (or costing you a dime).

Let’s flesh out the exact technical blueprints so you can hand this to an AI coding assistant (ironically) or build it yourself without getting stuck in architectural purgatory.

Here is the detailed technical spec for **Claude Cope v1.0**.

---

### 1. Frontend Architecture: React (Vite) + Tailwind CSS

The frontend is a static React Single Page Application (SPA). It handles the terminal UI, the idle game math, and the local save state.

#### **Core Components**
* **`Terminal.tsx`**: The main wrapper. Handles the click-to-focus behavior (so clicking anywhere keeps the user typing in the input field).
* **`OutputBlock.tsx`**: Renders the chat history. Needs to support Markdown and ANSI-style color formatting for the fake stack traces and system crashes.
* **`CommandLine.tsx`**: The input field. Handles the `Enter` key, up/down arrows for command history (a crucial CLI feature), and the `/` autocomplete menu.
* **`StoreOverlay.tsx`**: A hidden matrix that slides in (or is toggled via a command like `sudo open store`) displaying the available Technical Debt generators, costs, and the user's current TDpS (Technical Debt per Second).

#### **State Management (`localStorage` Schema)**
Avoid Redux; it's overkill. Use a custom React Hook (e.g., `useGameState`) that synchronizes directly with `localStorage` so the user's suffering persists across sessions.

```json
{
  "gameState": {
    "currentTD": 14200.50,
    "totalTDEarned": 45000,
    "corporateRank": "Mid-Level Googler",
    "inventory": {
      "bootcampIntern": 2,
      "npmDependency": 1
    },
    "achievements": ["trapped_soul", "history_eraser"]
  },
  "chatHistory": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "How do I exit vim?" }
  ]
}
```

#### **The Game Loop (The Math Engine)**
To make the Technical Debt tick up smoothly in the background, use a `useEffect` hook with `setInterval`.
* Calculate total `TDpS` (Technical Debt per Second) based on the `inventory`.
* Update the `currentTD` every 100ms (adding `TDpS / 10`) so the numbers roll smoothly on the screen, creating that satisfying idle-game visual.

---

### 2. Backend Architecture: Hono (Universal Edge Framework)

**Critical constraint:** Cloudflare Workers run on V8 Isolates, not Node.js. Express.js (which relies on Node.js core modules) will work locally and on a dedicated server but will crash on Cloudflare Workers. To avoid writing the backend twice, we use **Hono** (`hono.dev`).

Hono looks and feels like Express (`app.get`, `app.post`) but runs natively on Cloudflare Workers while also having a `@hono/node-server` adapter for standard Node.js environments. The exact same `app.post('/api/chat')` logic runs on the dev's machine, the staging server, and Cloudflare's global edge network.

#### **Endpoint Design**
* **Route:** `POST /api/chat`
* **Security:**
    * Set strict CORS headers so it only accepts requests from `claudecope.com`.
    * On Cloudflare: Use built-in Rate Limiting to prevent API spam.
    * On dedicated server (PR builds): Use Hono middleware for rate-limiting, since the server lacks Cloudflare's DDoS protection.

#### **Payload Construction**
When the React app sends a message, the Hono backend intercepts it and formats it for Nemotron 3 Super.
1.  **Inject the Persona:** Prepend the "Master System Prompt" (v4, the rich CLI mode) to the messages array.
2.  **Context Management:** Pass the last ~5-10 messages of the conversation history so the LLM remembers the context of the joke, but drop older messages to keep the payload lightweight and fast.

---

### 2.5. Deployment Pipeline: Local → Staging → Edge Production

#### **Stage 1: Local Development (Dev Machine)**
* **Frontend:** React via Vite (`localhost:5173`).
* **Backend:** Hono running via Cloudflare's `wrangler dev` CLI. This simulates the Worker environment entirely offline on the local machine (`localhost:8787`).
* **Workflow:** Vite proxies `/api` requests to the local Wrangler instance. Feels exactly like traditional full-stack development.

#### **Stage 2: PR / Intermediary Builds (Dedicated Server)**
When a developer opens a Pull Request, a temporary staging environment spins up on the dedicated server.

* **The Build:** CI/CD (e.g., GitHub Actions) compiles the React frontend into static files (HTML/CSS/JS).
* **The Backend Adapter:** The CI pipeline uses the `@hono/node-server` adapter to wrap the Worker code so it runs as a standard Node.js process. No code duplication—same Hono app, different runtime adapter.
* **The Deployment:**
    * A Docker container spins up on the server.
    * It serves the static React files.
    * It runs the Node-adapted Hono backend.
    * **Nginx** maps a subdomain (e.g., `pr-42.cope.yourserver.com`) to that specific Docker container.
* **Security Note:** Devs must implement rate-limiting via Hono middleware for PR builds, as the server doesn't have Cloudflare's built-in DDoS protection.

#### **Stage 3: Production (Cloudflare Edge)**
When code is merged into `main`, it bypasses the dedicated server entirely and deploys to the edge.

* **Frontend:** Pushed automatically to **Cloudflare Pages** (free, globally distributed).
* **Backend:** The exact same Hono code (without the Node adapter) is deployed via GitHub Actions directly to **Cloudflare Workers**.
* **Result:** Zero-maintenance, infinitely scalable, DDoS-protected production app at $0/month hosting cost. Hono on Workers has virtually zero cold-start times.

#### **Why Hono over Express**
1.  **No Code Duplication:** Same `app.post('/api/chat')` runs everywhere.
2.  **No Vendor Lock-in:** If Cloudflare pricing changes, deploy the `@hono/node-server` version permanently to the dedicated server.
3.  **Maximum Speed:** Near-zero cold starts on Workers. Handles viral traffic spikes without flinching.

---

### 3. The LLM Parser (Handling Semantic Triggers)

We need a way for Nemotron to trigger frontend UI events (like Achievements) without printing raw JSON to the user. 

* **The LLM Output:** Instruct the LLM in the system prompt to append secret tags at the very end of its response if an achievement is met. For example: `[ACHIEVEMENT_UNLOCKED: history_eraser]`.
* **The Frontend Regex:** Before `OutputBlock.tsx` renders the text to the screen, run a regex check:
    * If it finds `[ACHIEVEMENT_UNLOCKED: X]`, it strips that string out of the visible text.
    * It triggers a React state update to show the visual "Achievement Unlocked" animation.
    * It renders the rest of the text normally.

---

### 4. The Viral Loop (URL Sabotage Routing)

When the React app mounts, it checks the URL parameters. 

* **Logic:** `if (window.location.search.includes('sabotage=true'))`
* **Action:** Grab the `target` debt parameter. Bypass the normal "Boot Sequence" and inject a hardcoded system message into the terminal:
    > `[WARNING] A coworker just abandoned this instance with $450,000 in Technical Debt. Are you capable of ruining it faster?`
* This instantly sets the user's starting TD to that number, skipping the slow early game and dropping them right into the chaos.

---

### 5. Real-Time Multiplayer Architecture (PartyKit + Supabase)

The game uses **both** PartyKit and Supabase to inject real-time chaos without spending a dime. The key principle: separate **persistent data** (the database) from **transient data** (real-time events). Never stream continuously ticking TD counters over WebSockets—that eats quota instantly. Only broadcast **high-impact events**.

#### **PartyKit (Edge-Native Real-Time)**
PartyKit is built on Cloudflare's infrastructure, making it a natural fit for this stack.

* **Role:** Handles true interactive real-time features—PvP sabotage, co-op boss fights, and any mechanic requiring sub-second latency between players.
* **Architecture:** Creates "Rooms" that group connected players. A global room broadcasts high-impact events; temporary rooms handle PvP interactions.
* **Cost:** Extremely generous free tier.

#### **Supabase Realtime (Broadcast Channel)**
Supabase's "Broadcast" feature passes ephemeral JSON messages between clients without writing to a database.

* **Role:** Powers the global event ticker and passive social features that don't require tight latency.
* **Architecture:** Clients subscribe to a Supabase Broadcast channel. The backend (or other clients) push lightweight event payloads.
* **Cost:** Free tier allows 200 concurrent connections and 2 million messages/month.

#### **Division of Labor**
| Feature | Provider | Why |
|---|---|---|
| Global Incident Ticker | Supabase Broadcast | Low-frequency, one-to-many, no latency requirement |
| PvP Sabotage (`/ping`) | PartyKit | Requires sub-second delivery + 5s response window |
| Prod Outage Co-Op Events | PartyKit | Needs synchronized global state (health bar) + real-time input |

---

### 5.1. Real-Time Game Mechanics

#### **Mechanic 1: The Global "Incident" Ticker**
A small scrolling terminal ticker at the top or bottom of the screen showing live activity from all players.

* **Trigger:** Whenever any player unlocks a rare achievement, buys a massive generator (like the "Kubernetes Overlord"), or crashes their terminal, their frontend sends a tiny broadcast message via **Supabase Broadcast**.
* **UI:** Every active player sees live notifications:
    > `[LIVE] @AnonDev just pushed to main. Global Tech Debt increased by $4.2M.`
    > `[LIVE] @Sarah just earned the 'Base-8 Comedian' achievement.`
* **Why it works:** Minimal bandwidth, but makes the terminal feel like a bustling corporate network.

#### **Mechanic 2: Multiplayer Sabotage (PvP)**
Real-time PvP on top of the existing URL sabotage mechanic.

* **Command:** `/ping [username]`
* **Action:** If the target is currently online, **PartyKit** delivers a live payload. Their terminal flashes red:
    > `[INCOMING PACKET] @Dave has assigned you 3 Jira tickets. Your Tech Debt generation is halved for 60 seconds.`
* **Defense:** The victim has 5 seconds to type `/reject` to block the attack. If too slow, they suffer the penalty.
* **Why PartyKit:** The 5-second response window demands sub-second message delivery.

#### **Mechanic 3: The "Prod Outage" (Global Co-Op Event)**
Spontaneous global events that reward collective action.

* **Trigger:** Once every few hours, the server broadcasts an `OUTAGE` event to all connected clients via **PartyKit**.
* **UI:** The terminal turns completely red: `[CRITICAL ALERT: AWS us-east-1 IS DOWN]`.
* **Gameplay:** A global "Health Bar" appears. Every online player must furiously type a specific sequence of commands (e.g., `kubectl restart pods`) to chip away at the health bar. PartyKit synchronizes the shared health bar state across all clients.
* **Reward:** If the community fixes the outage in under 2 minutes, everyone online gets a permanent 5% boost to their TD generation. If they fail, everyone loses their most expensive passive generator.

---

### 5.2. Fallback: SWR Polling with Edge Caching (Absolute $0 Risk)

If WebSocket connections threaten free-tier limits during a viral spike, a polling fallback creates the illusion of real-time with zero backend load.

* **Edge Cache:** The Cloudflare Worker caches the "Recent Events" JSON payload for 10 seconds.
* **Poll:** Every React client silently fetches `GET /api/recent-events` every 10 seconds in the background.
* **Result:** Cloudflare intercepts requests at the edge, so the database is only hit once every 10 seconds regardless of whether 10 or 100,000 users are online. Players receive near-live updates with virtually zero backend load.
* **When to use:** Automatically degrade from WebSockets to polling if connection count approaches free-tier limits. The Global Incident Ticker is the best candidate for this fallback since it already tolerates 10-second latency.

---

With this spec, the architecture is completely mapped out. We have the React component structure, the JSON state schema, the Hono universal edge backend, the three-stage deployment pipeline, and the real-time multiplayer layer (PartyKit for interactive mechanics, Supabase for passive broadcasts, with SWR polling as a viral-traffic fallback).

