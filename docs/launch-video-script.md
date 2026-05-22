# Claude Cope Launch Video

Draft launch-video script and production notes for a Remotion build.

## Goal

Sell Claude Cope as:

- a cursed AI coding terminal
- a real progression game
- a multiplayer/status machine for developers

The video should start like a generic AI startup ad, then glitch hard into the actual product.

## Core Hooks

These are the strongest actual product features to emphasize:

1. AI-driven ticket solving in a terminal
2. TD / sprint / idle progression
3. Multiplayer presence and live feed
4. Player-to-player interactions via `/ping` and `/accept`
5. Public status through ranks, leaderboard, and Executive Supporter flex
6. The upgrade / wallet extraction modal

## Creative Direction

- Format: `1920x1080`, landscape-first
- FPS: `30`
- Target duration: `36s`
- Tone progression:
  - polished fake-SaaS intro
  - abrupt terminal/parody reveal
  - escalating multiplayer/status obsession

## Audio Direction

- `0:00-0:03`: generic corporate ambient/plucks
- `0:03+`: glitch hit into dark synth / fast pulse
- Loud mechanical keyboard SFX on terminal commands
- UI hits for:
  - TD spike
  - achievement unlock
  - leaderboard emphasis
  - upgrade modal slam

## Final Sequence

### Scene 1: Fake SaaS Bait

- Time: `0:00-0:03`
- Frames: `0-89`
- Visual:
  - pure white background
  - centered black text
  - smooth, restrained motion
- Copy:
  - `The AI platform for modern engineering teams.`
  - `Built to accelerate developer output.`
- End with a hard glitch/tear.

### Scene 2: Premise Reveal

- Time: `0:03-0:06`
- Frames: `90-179`
- Visual:
  - real Claude Cope terminal
  - brief CRT/glitch distortion
  - header visible
- Terminal copy:
  - `[CRITICAL ERROR] Competence not found.`
  - `Loading condescension matrix...`
- Must show:
  - username
  - rank
  - TD
  - MAX / EXEC badge if available

### Scene 3: Backlog Hook

- Time: `0:06-0:10`
- Frames: `180-299`
- Commands:

```txt
> /backlog
> /take MELT-089
```

- Visual:
  - real backlog view appears
  - camera pushes into one absurd ticket
- Goal:
  - prove it is a task/game loop, not just a chat terminal

### Scene 4: AI Sabotage + Reward

- Time: `0:10-0:15`
- Frames: `300-449`
- Visual:
  - assistant response types in quickly
  - only show one strong response beat
  - sprint bar moves
  - TD count jumps
  - achievement toast appears
- Response excerpt should be short and readable.
- Goal:
  - prove chatting drives progression

### Scene 5: Game Loop / Store Flash

- Time: `0:15-0:18`
- Frames: `450-539`
- Visual montage:
  - store opens
  - 2-3 funny generator names flash
  - purchase / multiplier / ownership movement
- Good candidates:
  - `Unpaid Bootcamp Intern`
  - `NPM Dependency Importer`
  - `Kubernetes Overlord`

### Scene 6: Multiplayer Proof

- Time: `0:18-0:23`
- Frames: `540-689`
- Visual:
  - `/who`
  - `[LIVE]` ticker
  - `/party`
- Goal:
  - prove other players exist in real time

### Scene 7: Player-to-Player Interaction

- Time: `0:23-0:27`
- Frames: `690-809`
- Commands:

```txt
> /ping @username
> /accept
```

- Visual:
  - one player requests a code review
  - another accepts
  - payout / sprint boost / event reaction appears
- Goal:
  - show a distinctive multiplayer mechanic

### Scene 8: Status / Leaderboard / Flex

- Time: `0:27-0:31`
- Frames: `810-929`
- Visual:
  - leaderboard overlay
  - zoom into:
    - username
    - rank
    - TD total
    - `EXEC` badge / supporter styling
- Optional quick insert:
  - `/promote`
- Goal:
  - public status is the emotional hook

### Scene 9: Paywall Slam

- Time: `0:31-0:34`
- Frames: `930-1019`
- Visual:
  - real upgrade modal slams in
  - focus on:
    - `$4.99`
    - team / Executive Supporter option briefly
- Goal:
  - end the feature escalation with the monetization joke

### Scene 10: Outro

- Time: `0:34-0:36`
- Frames: `1020-1079`
- Visual:
  - dark clean end card
  - blinking cursor / minimal terminal feel
- Copy:
  - `Claude Cope`
  - `Play free: claudecope.com`
- Small subline:
  - `If $4.99 feels excessive, clone the repo and disappoint yourself locally.`

## Readability Rules

- One joke per shot
- Keep most text to one highlighted line at a time
- Zoom tighter than feels necessary
- Optimize for phone viewing first
- Prefer real UI, but crop aggressively if the full surface is too dense

## Real UI Surfaces To Reuse

Highest-value surfaces from the codebase:

- terminal shell / header
- backlog table
- chat output block
- sprint progress / TD
- store overlay
- ticker / party overlay
- leaderboard overlay
- upgrade overlay

## Suggested Capture Checklist

Prepare these before building:

1. One great backlog ticket
2. One short AI response excerpt
3. One clean TD spike moment
4. One active `/party` or `[LIVE]` feed
5. One clear `/ping` -> `/accept` interaction
6. One leaderboard state with visible supporter flex
7. One clean upgrade modal shot

## Remotion Build Plan

There is currently no Remotion setup in this repo.

Recommended next steps:

1. Add a small `apps/launch-video` Remotion project
2. Reuse existing frontend styles, fonts, and selected React components where practical
3. Build this as a composition with:
  - hard-coded scene timings first
  - later data/script extraction for easier iteration
4. Use mocked/staged state snapshots instead of trying to drive the whole live app end-to-end inside Remotion

## Aspect Ratio Notes

- Primary launch cut: `16:9` (`1920x1080`)
- Reason:
  - terminal UI is horizontally structured
  - leaderboard and party/feed layouts read better wide
  - better fit for X desktop viewing and link previews
- Optional later variant:
  - `4:5` social crop if a feed-optimized version is needed

## Open Questions For Iteration

- Which exact backlog ticket is funniest and shortest on screen?
- Which AI reply excerpt is strongest for the montage?
- Do we want the leaderboard or `/ping` scene to come first?
- Do we show the supporter/team tier text in full, or just flash it?
- Do we want a more polished brand end card, or keep the terminal aesthetic until the last frame?
