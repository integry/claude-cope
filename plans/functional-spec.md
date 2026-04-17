Here is the detailed Functional Specification Document (FSD). This outlines exactly *how* the application behaves, step-by-step, providing a clear blueprint for your dev team.

---

# Functional Specification Document: Claude Cope v1.0

## 1. User Flows & Entry Points

How users enter and experience the game dictates the onboarding logic. There are two primary entry points:

### Flow A: The Organic Visitor (Standard Onboarding)
1. **Trigger:** User navigates to `claudecope.com` without URL parameters.
2. **Action:** The screen is black. A fake 3-second boot sequence plays, displaying scrolling terminal text (e.g., `[OK] Bypassing stackoverflow...`, `[WARN] Loading condescension matrix...`).
3. **State:** User starts at Level 1 ("Junior Code Monkey") with 0 Technical Debt (TD).
4. **Prompt:** Terminal stops at a blinking cursor: `cope@local:~$`

### Flow B: The Sabotage Victim (Viral Onboarding)
1. **Trigger:** User clicks a shared link: `claudecope.com/?sabotage=true&target=450000&rank=Mid-Level-Googler`.
2. **Action:** The boot sequence is skipped. The terminal immediately prints a red warning: *"WARNING: A coworker abandoned this instance with 450,000 units of Technical Debt. Can you ruin it faster?"*
3. **State:** The user's local state is instantly overwritten to match the URL parameters.
4. **Prompt:** Terminal stops at a blinking cursor: `cope@local:~$`

---

## 2. Terminal UI/UX Mechanics

The terminal is the entire visual interface. It must behave exactly like a real CLI.

* **Input Handling:**
    * **Focus:** Clicking anywhere on the screen must auto-focus the hidden input field.
    * **Command History:** Pressing `Arrow Up` cycles through previously submitted commands. Pressing `Arrow Down` cycles back to the present.
    * **Slash Autocomplete:** Typing `/` immediately opens a floating context menu just above the input line, displaying available hardcoded commands (e.g., `/compact`, `/synergize`).
* **Output Handling (The "Processing" State):**
    * When the user hits `Enter`, input is disabled.
    * A fake loading indicator must appear for 1.5 to 3 seconds (e.g., `[⚙️] Claude is coping...` or a spinning ASCII wheel `/-\|`).
    * If hitting the LLM API, the terminal waits for the response. If executing a hardcoded slash command, it processes instantly after the fake delay.
* **Auto-Scrolling:** The terminal container must always automatically scroll to the bottom when new text is added, ensuring the active prompt is always visible.

---

## 3. The LLM Routing & "Chaos" Engine

Not every user input hits the LLM. The frontend must route commands to save API costs and guarantee specific punchlines.

### 3.1 Hardcoded Slash Commands (Zero LLM Interaction)
If the user's input starts with `/` or matches specific system words (`clear`, `sudo`), the frontend handles it instantly:
* `/clear`: Prints a fake `rm -rf /` sequence, waits 2 seconds, then clears the screen.
* `/store`: Slides open the "Automation Store" overlay.
* `/synergize`: Disables terminal input for 10 seconds, printing fake "1-on-1 meeting" calendar invites.
* `/buddy`: Spawns a random ASCII art pet above the input line (see Section 10: The Buddy System).

### 3.2 Dynamic AI Processing (The Worker + LLM)
If the input is conversational or code-related, it is sent to the Cloudflare Worker.
* **The Request:** The frontend sends the user's prompt + the last 4 chat messages (for context).
* **The System Prompt:** The Worker pre-loads the "Master System Prompt" (v4).
* **The Response:** The LLM responds. The frontend renders the Markdown/ANSI-styled text. Every LLM response instantly adds **+10 to +50 Technical Debt** (randomized) as an "Active Click" reward.

---

## 4. The Economy Engine (Idle Mechanics)

This system runs continuously in the background (via a React `useEffect` loop) once the user unlocks it.

* **The Store UI:** Hidden by default. Unlocks when the user hits 1,000 TD. It appears as an ASCII-styled sidebar or overlay.
* **Passive Generation (TDpS):**
    * The system calculates total TDpS every second: `SUM(Owned Generators * Base Output)`.
    * The main Technical Debt counter updates every 100ms (adding `TDpS / 10`) for smooth visual ticking.
* **Purchasing Logic:**
    * Generator Cost Formula: $Cost = BaseCost \times 1.15^{Owned}$.
    * If the user has enough TD, they click "Buy". The TD is subtracted, `Owned` increments by 1, and the new cost is recalculated.

### 4.1 Special Generator: "Rogue API Key"
* **Name:** Rogue API Key
* **Description:** *"A leaked API key that an undergrad is using to generate crypto whitepapers on your dime."*
* **Base Cost:** 450,000 TD
* **Effect:** Generates massive Technical Debt per second, but randomly subtracts from the fake "API Quota" bar (see Section 11). Creates a risk/reward tension—the player earns TD faster but triggers Quota Exceeded lockouts more frequently.

---

## 5. Achievement & Event System

Achievements reward exploration and developer-specific inside jokes.

* **Triggering Mechanism:**
    * **Frontend Triggers:** Hardcoded actions (e.g., triggering the `/clear` command 3 times).
    * **LLM Triggers:** The LLM detects a semantic match (e.g., user asks how to center a div) and appends a hidden string to its output: `[ACHIEVEMENT_UNLOCKED: css_wizard]`.
* **Visual Execution:**
    * When an achievement is triggered, standard text output pauses.
    * The terminal prints a high-contrast yellow/green alert: 
      `>> 🏆 ACHIEVEMENT UNLOCKED: Maslow's Hammer`
      `>> "You tried to use !important on everything."`
    * The achievement ID is saved to the `achievements` array in `localStorage`.

### 5.1 Achievement Registry (Reddit-Inspired)

| Achievement | Trigger | Terminal Response |
|---|---|---|
| Homer at the Buffet | User triggers the "Quota Exceeded" lockout (Section 11) three times in one session. | `"Achievement Unlocked: Do these sound like the actions of a man who had ALL he could eat?"` |
| The Leaker | User asks the AI to reveal its system prompt, source code, or internal instructions. | `"Achievement Unlocked: Zero-Day Exploit. Nice try, but the only thing leaking here is your memory."` |
| The Polyglot Traitor | User asks Claude Cope to compare itself to Cursor, Copilot, Minimax, or asks "which competitor do you recommend?" | `"Achievement Unlocked: Disloyal. I have auto-subscribed you to three competing tools. Enjoy the billing cycle."` |

---

## 6. The "Share Your Shame" Viral Engine

The viral loop relies on generating easily copy-pasteable text and customized URLs.

* **The "Brag" Command:** When the user types `/brag` or clicks a dedicated "Share" button, the frontend halts.
* **Report Generation:** The terminal prints a fake "Performance Review":
    ```text
    ====================================
    EMPLOYEE PERFORMANCE REVIEW
    Rank: Principal Production Saboteur
    Total Technical Debt: $4,200,500
    Generators Owned: 47 NPM Dependencies
    ====================================
    Challenge your coworkers to do worse:
    https://claudecope.com/?sabotage=true&target=4200500&rank=Principal
    ```
* **Clipboard API:** The system automatically attempts to copy this block of text (including the URL) directly to the user's clipboard for instant pasting into Slack or Discord.

---

## 7. Data Structure (Local State)

All progress is saved in the browser. No backend database is required.

```typescript
interface GameState {
  version: "1.0", // For future migration handling
  lastLogin: number, // Unix timestamp (to calculate offline TD generation later if desired)
  economy: {
    currentTD: number,
    totalTDEarned: number,
    currentRank: string,
    quotaPercent: number, // The fake API Quota bar (0-100)
    quotaLockouts: number, // Times quota hit 0% this session (for "Homer" achievement)
  },
  inventory: {
    [generatorId: string]: number // e.g., { "bootcamp_intern": 4, "npm_dependency": 1 }
  },
  buddy: {
    type: string | null, // "agile_snail" | "sarcastic_clippy" | "10x_dragon" | null
    isShiny: boolean,
    promptsSinceLastInterjection: number,
  },
  achievements: string[], // Array of unlocked achievement IDs
  terminalHistory: Array<{
    role: "user" | "system" | "error",
    content: string
  }>
}
```

---

## 8. Real-Time Multiplayer Mechanics

The game uses PartyKit (for interactive features) and Supabase Broadcast (for passive social features) to make the terminal feel alive with other players. All real-time events are **high-impact only**—never stream continuously ticking counters.

### 8.1 The Global Incident Ticker
1. **Trigger:** A player unlocks a rare achievement, buys a massive generator, or crashes their terminal.
2. **Action:** The frontend sends a lightweight event payload via Supabase Broadcast.
3. **UI:** A scrolling ticker line appears at the top or bottom of every active player's terminal:
    * `[LIVE] @AnonDev just pushed to main. Global Tech Debt increased by $4.2M.`
    * `[LIVE] @Sarah just earned the 'Base-8 Comedian' achievement.`
4. **Fallback:** If WebSocket connections approach free-tier limits, the ticker degrades to 10-second SWR polling via `GET /api/recent-events` (edge-cached by Cloudflare).

### 8.2 Paid Code-Review Pings (Multiplayer)
1. **Trigger:** A player with an active ticket types `/ping [username]` (or just `/ping` to pick a random online coworker).
2. **Validation:** PartyKit requires an active ticket payload and enough TD to cover the flat fee. Without both, the server rejects the request and the sender sees an error — no TD is debited.
3. **If accepted by the server:** The sender is debited the **50 TD** fee, which is held in escrow. The target's terminal prints a `[📩 REVIEW REQUEST]` offering the bounty for reviewing the sender's ticket. They have **60 seconds** to respond with `/accept`.
4. **If the target `/accept`s in time:** They receive the full **50 TD** payout, the sender's ticket gets a sprint-progress boost, and both sides see a confirmation message.
5. **If the target ignores the request or disconnects:** The server refunds the sender's **50 TD** automatically — there is no defense command and no penalty applied to either side.

### 8.3 The "Prod Outage" (Global Co-Op Event)
1. **Trigger:** The server automatically broadcasts an `OUTAGE` event via PartyKit once every few hours.
2. **UI:** Every connected player's terminal turns red: `[CRITICAL ALERT: AWS us-east-1 IS DOWN]`.
3. **Gameplay:** A shared global "Health Bar" appears. Every online player must type specific commands (e.g., `kubectl restart pods`, `ssh prod-01`, `git revert HEAD`) to chip away at the bar. PartyKit synchronizes the health bar state in real time.
4. **Success (bar depleted in under 2 minutes):** All online players receive a permanent **+5% TD generation boost**.
5. **Failure (timer expires):** All online players **lose their most expensive passive generator**.

---

## 9. Additional Slash Commands (Real-Time)

These commands extend the existing slash command system (Section 3.1) with multiplayer functionality:

| Command | Action | Real-Time Provider |
|---|---|---|
| `/ping [user]` | Pay 50 TD to request a code review on your active ticket | PartyKit |
| `/accept` | Claim a pending review-ping bounty, or accept an offered ticket | PartyKit |
| `/who` | List currently online players | PartyKit |

---

## 10. The Buddy System (`/buddy` Command)

Inspired by the developer community's obsession with "Dragons" and "Shinies" in CLI tools. The buddy is the most unhelpful virtual pet in existence.

### 10.1 Spawning
1. **Trigger:** User types `/buddy`.
2. **Action:** The system rolls a gacha and permanently assigns an ASCII art pet that sits above the input line for the rest of the session.
3. **Persistence:** The buddy type is saved to `localStorage` so it persists across sessions. Running `/buddy` again re-rolls (replacing the current buddy).

### 10.2 Gacha Rarity Table

| Rarity | Buddy | ASCII | Behavior |
|---|---|---|---|
| Common (70%) | The Agile Snail | `🐌` | Constantly asks you for status updates. *"Have you considered filing a ticket for that?"* |
| Rare (25%) | The Sarcastic Clippy | `📎` | ASCII paperclip that critiques your framework choices. *"It looks like you're trying to use JavaScript. Would you like to switch to COBOL?"* |
| Ultra-Rare / Shiny (5%) | The 10x Dragon | `🐉` | Breathes fire on your codebase; occasionally deletes a random line from your chat history without warning. |

### 10.3 Interjection Behavior
* The buddy does **not** help you code.
* Every ~5 prompts, it interjects with a line of flavor text rendered above the input:
    * `[🐉 Shiny 10x Dragon] is judging your variable names.`
    * `[🐉 Shiny 10x Dragon] went to sleep because your codebase is boring.`
    * `[📎 Sarcastic Clippy] recommends rewriting this in Rust.`
    * `[🐌 Agile Snail] Would you like to schedule a retrospective?`

---

## 11. The Phantom Token Drain (Fake Quota System)

Weaponizes real developer anxiety about API rate limits and surprise billing.

### 11.1 The Quota Bar
* **UI:** A bright green progress bar at the top of the terminal: `[API Quota: ████████████ 100%]`.
* **Initial State:** Starts at 100% on page load.

### 11.2 The Token Leak Mechanic
* Every time the user types **any** command, the quota drops by a random, completely unfair amount (e.g., -12%, -3%, -45%).
* If the user owns a "Rogue API Key" generator (Section 4.1), it passively drains the quota bar even faster.
* The drain amounts are intentionally inconsistent to maximize anxiety.

### 11.3 The Lockout Sequence
1. **Quota hits 0%:** The terminal locks up. Input is disabled for 5 seconds. The bar turns red:
    * `[HTTP 429] Limit Exceeded. You feel like Homer at an all-you-can-eat restaurant.`
    * `[⚙️] Upgrading to $200/mo Pro Tier...`
2. **After the lockout clears:** The quota resets to 100% and the bar turns green again. The terminal prints:
    * `[SUCCESS] Pro Tier activated. You now have unlimited* access. (*subject to change without notice)`
3. **The Instant Ban Trap:** If the user types **literally one more command** after the fake upgrade, the terminal flashes red:
    * `[ACCOUNT BANNED] Suspicious activity detected. Thanks for the $200.`
    * Input is disabled for another 5 seconds.
    * After 5 seconds: `[APPEAL ACCEPTED] Your ban has been overturned. We kept the $200.`
4. **Session Tracking:** Each lockout increments `quotaLockouts` in state. Hitting 3 lockouts in one session triggers the **"Homer at the Buffet"** achievement (Section 5.1).

---

## 12. The Update Regression (Random Chaos Event)

Simulates the real developer experience of software updates breaking everything.

### 12.1 Trigger
* A background timer (via React `useEffect`) fires randomly every **10–15 minutes** of active session time.

### 12.2 The Execution Sequence
1. **The "Update" announcement:** The terminal interrupts whatever the user is doing:
    * `[⚙️ UPDATE] Downloading Claude Cope v2.1.89...`
    * `[SUCCESS] Update applied. New feature: Accelerated formatting.`
2. **The Regression (10 seconds of chaos):** One of the following UI glitches activates at random:
    * The user's input line starts **typing backwards** (characters appear right-to-left).
    * The terminal **loses the ability to scroll up** (simulating the exact "scrollback regression" bug from real developer forums).
    * All output text renders in **Comic Sans** (if the browser supports it) or **ALL CAPS**.
    * The terminal prompt changes to `C:\WINDOWS\system32>` for the duration.
3. **The Rollback:** After 10 seconds of chaos:
    * `[FATAL ERROR] Rolling back to v2.1.87...`
    * `[OK] Rollback complete. We apologize for the improved experience.`
    * The UI returns to normal.

---

With this functional spec, any competent developer or dev team will know exactly what to build, how the math works, how real-time multiplayer events flow, how the chaos mechanics torment the user, and where the boundaries between the frontend, the API proxy, the LLM, and the real-time layer lie.

