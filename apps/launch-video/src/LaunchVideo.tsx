import "@fontsource/fira-code";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/600.css";
import "./generated.css";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import HeaderBar from "../../frontend/src/components/HeaderBar";
import TickerDisplay from "../../frontend/src/components/TickerDisplay";
import OutputBlock from "../../frontend/src/components/OutputBlock";
import SprintProgressBar from "../../frontend/src/components/SprintProgressBar";
import CommandLine from "../../frontend/src/components/CommandLine";
import { BuddyOverlay } from "../../frontend/src/components/BuddyOverlay";
import { BUDDY_ICONS, BUDDY_TEXT_GAP } from "../../frontend/src/components/buddyConstants";
import SlashMenu from "../../frontend/src/components/SlashMenu";
import { terminalContainerClassName } from "../../frontend/src/components/terminalClassName";
import { buildAchievementBox } from "../../frontend/src/components/achievementBox";
import type { GameEvent } from "../../frontend/src/hooks/useRecentEvents";
import type { BacklogDisplayData, Message, TicketDisplayData } from "../../frontend/src/hooks/gameStateUtils";
import type { SlashCommandAction } from "../../frontend/src/components/slashCommandDetect";
import { BACKLOG_CATEGORY_TIERS } from "@claude-cope/shared/backlogTiers";
import logoTransparentSrc from "../../frontend/public/media/logo-400-transparent.png";

const noop = () => {};
const noopSlash = (_command: string, _action: SlashCommandAction) => {};
const noopChange = (_event: ChangeEvent<HTMLInputElement>) => {};
const noopKeyDown = (_event: KeyboardEvent<HTMLInputElement>) => {};

const sceneFrames = {
  bait: 315,
  splash: 150,
  reveal: 150,
  backlog: 565,
  sabotage: 2550,
} as const;

export const launchVideoDurationInFrames = Object.values(sceneFrames).reduce((total, frames) => total + frames, 0);

const startingTechnicalDebt = 12400;
const launchTicketGoal = 4200;
const backlogCategoryMenuItems = BACKLOG_CATEGORY_TIERS.length + 1;
const appViewportWidth = 640;
const appViewportHeight = 640;
const appViewportScale = 1080 / appViewportWidth;

const liveEvents: GameEvent[] = [
  { message: "RinaldsDev just opened a ticket nobody should have accepted.", created_at: "2026-05-19T10:00:01.000Z" },
  { message: "VirtualRuntime5899 approved a rollback without reading it.", created_at: "2026-05-19T09:59:35.000Z" },
  { message: "AgileSnailOps converted a bug into roadmap language.", created_at: "2026-05-19T09:58:51.000Z" },
];

const headerProps = {
  rank: "Junior Code Monkey",
  currentTD: startingTechnicalDebt,
  quotaPercent: 67,
  outageHp: null,
  activeMultiplier: 1,
  username: "RinaldsDev",
  isBYOK: false,
  isMax: true,
  isExecutiveSupporter: false,
  byokTotalCost: undefined,
  hasVanityTitle: false,
  onProfileClick: noop,
  onHelpClick: noop,
  onAboutClick: noop,
  onStoreClick: noop,
  onLeaderboardClick: noop,
  onAchievementsClick: noop,
  onContactClick: noop,
  onSlashMenuClick: noop,
  onUpgradeClick: noop,
  onHomeClick: noop,
  staticCounters: true,
  quotaTotalOverride: 1337,
  compactHeader: true,
} as const;

const promptString = "❯ ";
const videoFontFamily = "\"Fira Code\", monospace";
const anthropicColors = {
  dark: "#141413",
  light: "#faf9f5",
  midGray: "#b0aea5",
  lightGray: "#e8e6dc",
  orange: "#d97757",
  blue: "#6a9bcc",
  green: "#788c5d",
} as const;
const anthropicHeadingFont = "Poppins, Arial, sans-serif";
const anthropicBodyFont = "Lora, Georgia, serif";
const launchTicketId = "MELT-087";
const launchTicketTitle = "Build a Full-Stack App Using 14 Different JavaScript Frameworks";
const implementationPromptOne = "wire up the frontend routing";
const implementationResponseOne = "[⚙️ SYSTEM] Initializing dependency hell...\n[INFO] Resolving routing conflicts between React, Vue, Svelte, and Angular.\n[WARN] Next.js and Remix are currently fighting over the URL bar.\n[SUCCESS] Bootstrapped 14 frontend routers into a single index.html.\n\n[DIAGNOSTIC] Total bundle size is now 4.2 GB. The \"Hello World\" button requires a dedicated Kubernetes cluster just to hydrate.";
const buddyCommand = "/buddy";
const buddyType = "Sarcastic Clippy";
const buddySpawnMessage = `[✓] Spawning your new companion: **${buddyType}** 📎!`;
const buddyInterjection = "I see you're trying to combine 14 state managers. Would you like me to draft your resignation letter?";
const implementationPromptTwo = "just force them to share state using Redux";
const implementationResponseTwo = "[⚙️ SYSTEM] Violating component boundaries...\n[FATAL] Svelte reactivity store refused to acknowledge Redux.\n\n[PATCH APPLIED] I built a custom meta-store that serializes the entire DOM into JSON, passes it through a GraphQL mutation, and re-renders the page on every keystroke.\n\n[SUCCESS] Typing in a text box now takes 14 seconds. The team has agreed to rebrand the lag as \"Enterprise Suspense.\"";
const responsibleDeployPrompt = "write unit tests for the routers";
const implementationPromptThree = "lgtm. ship it to prod";
const implementationResponseThree = "[🚀 DEPLOY] Bypassing QA. Bypassing unit tests. Bypassing common sense.\n[INFO] Uploading 4.2 GB bundle to AWS S3...\n[ERROR 413] Payload Too Large.\n\n[PATCH APPLIED] Slicing bundle into 10,000 text messages and texting them to the server via Twilio.\n\n[CRITICAL] AWS us-east-1 is currently on fire.";
const implementationPromptFour = "undo undo rollback immediately";
const implementationResponseFour = "[🛑 ROLLBACK] Attempting to restore previous stable state...\n[WARN] Previous state was deleted to save on cloud costs.\n\n[SYSTEM] To proceed with emergency rollback, you must possess the architectural maturity of a Senior Engineer. Your current rank is [Junior Code Monkey].\n\n[RATE LIMIT] You lack the required fiat currency to fix this disaster.";
const launchAchievementId = "framework_polyglot";
const takeTicketCommand = `/take ${launchTicketId}`;
const launchBacklogDisplay: BacklogDisplayData = {
  kind: "community-backlog",
  title: "[ COMMUNITY BACKLOG ]",
  infoLine: "[INFO] Showing all tickets. Want specific trauma? Try: /backlog MELT",
  footer: [
    "Run /take <row-or-id> to claim something regrettable.",
    "Max categories exist because pain has DLC now.",
  ],
  tickets: [
    {
      row: 1,
      fullId: launchTicketId,
      shortId: launchTicketId,
      title: launchTicketTitle,
      status: "OPEN",
      reward: "4,200 TD",
      isLocked: false,
    },
    {
      row: 2,
      fullId: "YELL-404",
      shortId: "YELL-404",
      title: "Replace Standup With a Mandatory Interpretive Dance Ceremony",
      status: "OPEN",
      reward: "760 TD",
      isLocked: false,
    },
    {
      row: 3,
      fullId: "GHOUL-013",
      shortId: "GHOUL-013",
      title: "Generate SOC2 Evidence From Slack Vibes",
      status: "PREMIUM",
      reward: "6,660 TD",
      isLocked: true,
    },
    {
      row: 4,
      fullId: "SLIME-219",
      shortId: "SLIME-219",
      title: "Install Eleven Analytics Pixels and Call It Privacy-First",
      status: "PREMIUM",
      reward: "9,001 TD",
      isLocked: true,
    },
    {
      row: 5,
      fullId: "BLAME-721",
      shortId: "BLAME-721",
      title: "Write the Postmortem Before the Incident Happens",
      status: "OPEN",
      reward: "980 TD",
      isLocked: false,
    },
  ],
};
const launchTicketDisplayClaimed: TicketDisplayData = {
  kind: "corporate-dossier",
  status: "claimed",
  heading: "[ JIRA PAYLOAD IMPORTED ]",
  ticketId: launchTicketId,
  title: launchTicketTitle,
  reporter: "Derek From DX [Framework Archaeologist]",
  profile: "Believes every dependency graph is just a community waiting to happen.",
  body: "Leadership wants one full-stack app proving we are framework-agnostic. Use 14 JavaScript frameworks simultaneously, make the bundle analyzer look like a subway map, and call the runtime overhead developer choice.",
  reward: "4,200 TD",
  footer: ["Start prompting to make progress."],
};
function launchActiveTicket(sprintProgress = launchTicketGoal) {
  return {
    id: launchTicketId,
    title: launchTicketTitle,
    sprintProgress,
    sprintGoal: launchTicketGoal,
  };
}

const userMessage = (content: string): Message => ({ role: "user", content });
const systemMessage = (content: string, extra?: Partial<Message>): Message => ({ role: "system", content, ...extra });
const warningMessage = (content: string): Message => ({ role: "warning", content });

function wrapBuddyText(text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function formatLaunchBuddyInterjection(type: string, text: string, maxTextWidth: number): string {
  const artLines = (BUDDY_ICONS[type] ?? "🐾").split("\n");
  const artWidth = Math.max(...artLines.map((line) => line.length));
  const speechLines = [`[${type}]`, "", ...wrapBuddyText(text, maxTextWidth)];
  const totalLines = Math.max(artLines.length, speechLines.length);

  return Array.from({ length: totalLines }, (_, index) => {
    const art = artLines[index] ?? "";
    const speech = speechLines[index];
    return speech ? `${art.padEnd(artWidth, " ")}${BUDDY_TEXT_GAP}${speech}` : art;
  }).join("\n");
}

const buddyMessage = (content: string): Message => ({
  role: "warning",
  content: formatLaunchBuddyInterjection(buddyType, content, 56),
  buddyType,
});

function sceneOffset(scene: keyof typeof sceneFrames): number {
  const entries = Object.entries(sceneFrames) as Array<[keyof typeof sceneFrames, number]>;
  let total = 0;
  for (const [key, value] of entries) {
    if (key === scene) return total;
    total += value;
  }
  return total;
}

function introOpacity(frame: number, startOut = 38, endOut = 52) {
  return interpolate(frame, [0, 24], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * interpolate(frame, [startOut, endOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

function typeText(frame: number, text: string, start = 0, charsPerFrame = 0.65): string {
  const visibleChars = Math.max(0, Math.floor((frame - start) * charsPerFrame));
  return text.slice(0, Math.min(text.length, visibleChars));
}

function typeTextAtomicTags(frame: number, text: string, start = 0, charsPerFrame = 0.65): string {
  const raw = typeText(frame, text, start, charsPerFrame);
  return raw.replace(/\[[^\]\n]*$/u, "");
}

function stabilizeScaledOffset(value: number): number {
  // Keep transforms on whole source pixels to avoid subtle text shimmer.
  return Math.round(value);
}

function focusWindow(frame: number, start: number, end: number, fade = 10): number {
  return Math.min(
    interpolate(frame, [start, start + fade], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(frame, [end - fade, end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
}

function appShellClassName() {
  return terminalContainerClassName({
    activeRegression: null,
    outageHp: null,
    pendingReviewPing: null,
    pingAcknowledged: true,
    activeTheme: "default",
  }).replace("h-[100dvh]", "h-full").replace("h-screen", "h-full").replace("px-4", "px-1");
}

function Transcript({
  messages,
  activeTicketId,
  offsetY = 0,
  followBottom = false,
  compact = false,
  staticLoadingFrame = 0,
}: {
  messages: Message[];
  activeTicketId?: string | null;
  offsetY?: number;
  followBottom?: boolean;
  compact?: boolean;
  staticLoadingFrame?: number;
}) {
  const spacingClassName = compact ? "space-y-1 [&_.group]:!mb-1" : "space-y-5";
  if (followBottom) {
    return (
      <div className="absolute inset-0 overflow-hidden px-0 py-5">
        <div className={`absolute bottom-5 left-0 right-0 w-full ${spacingClassName}`}>
          {messages.map((message, index) => (
            <OutputBlock
              key={`${message.role}:${message.content}:${index}`}
              message={message}
              promptString={promptString}
              enableShare={false}
              activeTicketId={activeTicketId}
              onSlashCommand={noopSlash}
              staticLoadingAnimation
              staticLoadingFrame={staticLoadingFrame}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col justify-start px-0 py-5">
      <div
        className={`w-full ${spacingClassName}`}
        style={{
          transform: `translate3d(0, ${stabilizeScaledOffset(offsetY)}px, 0)`,
          willChange: "transform",
        }}
      >
        {messages.map((message, index) => (
          <OutputBlock
            key={`${message.role}:${message.content}:${index}`}
            message={message}
            promptString={promptString}
            enableShare={false}
            activeTicketId={activeTicketId}
            onSlashCommand={noopSlash}
            staticLoadingAnimation
            staticLoadingFrame={staticLoadingFrame}
          />
        ))}
      </div>
    </div>
  );
}

function FixedTerminalShell({
  messages,
  inputValue,
  inputDisabled = false,
  inputForceFocused = false,
  blinkCursor,
  placeholder,
  assistivePlaceholderHint,
  overlay,
  activeTicket,
  showTicker = true,
  latestEvent = liveEvents[0]!,
  cameraScale = 1,
  cameraX = 0,
  cameraY = 0,
  shellOpacity = 1,
  transcriptOffsetY = 0,
  followTranscriptBottom = false,
  compactTranscript = false,
  currentTD = startingTechnicalDebt,
  promptOverlay,
  staticLoadingFrame = 0,
  buddy,
  slashMenu,
}: {
  messages: Message[];
  inputValue: string;
  inputDisabled?: boolean;
  inputForceFocused?: boolean;
  blinkCursor?: boolean;
  placeholder?: string;
  assistivePlaceholderHint?: string;
  overlay?: ReactNode;
  activeTicket?: {
    id: string;
    title: string;
    sprintProgress: number;
    sprintGoal: number;
  } | null;
  showTicker?: boolean;
  latestEvent?: GameEvent;
  cameraScale?: number;
  cameraX?: number;
  cameraY?: number;
  shellOpacity?: number;
  transcriptOffsetY?: number;
  followTranscriptBottom?: boolean;
  compactTranscript?: boolean;
  currentTD?: number;
  promptOverlay?: ReactNode;
  staticLoadingFrame?: number;
  buddy?: { type: string | null; isShiny: boolean };
  slashMenu?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const cursorBlinkOn = !inputDisabled ? Math.floor(frame / 16) % 2 === 0 : false;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", opacity: shellOpacity }}>
      <div
        style={{
          width: appViewportWidth,
          height: appViewportHeight,
          margin: "0 auto",
          position: "relative",
          transform: `translate3d(${Math.round(cameraX)}px, ${Math.round(cameraY)}px, 0) scale(${cameraScale * appViewportScale})`,
          transformOrigin: "center top",
        }}
      >
        <div
          className={`relative ${appShellClassName()}`}
          style={{
            height: "100%",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
          }}
        >
          <div className="shrink-0">
            {showTicker ? (
              <TickerDisplay latestEvent={latestEvent} onExpand={noop} onSlashCommand={noop} onlineCount={7} showPartyLink={false} showHeaderLinks={false} />
            ) : null}
            <HeaderBar {...headerProps} currentTD={currentTD} logoSrc={logoTransparentSrc} />
          </div>

          <div className="flex-1 min-h-0 overflow-y-hidden relative">
            <Transcript
              messages={messages}
              activeTicketId={activeTicket?.id}
              offsetY={transcriptOffsetY}
              followBottom={followTranscriptBottom}
              compact={compactTranscript}
              staticLoadingFrame={staticLoadingFrame}
            />
          </div>

          <div
            className="terminal-bottom-chrome shrink-0 gap-4 md:flex md:items-end md:justify-between"
            data-terminal-bottom-chrome="true"
          >
            <div className="min-w-0 flex-1">
              {activeTicket ? (
                <SprintProgressBar
                  id={activeTicket.id}
                  title={activeTicket.title}
                  sprintProgress={activeTicket.sprintProgress}
                  sprintGoal={activeTicket.sprintGoal}
                  onSlashCommand={noopSlash}
                  staticCounters
                />
              ) : null}
              <div className="terminal-command-shell relative border-b border-white/20">
                {slashMenu}
                <CommandLine
                  value={inputValue}
                  disabled={inputDisabled}
                  autoFocus={false}
                  forceFocused={inputForceFocused || (!inputDisabled && !inputValue)}
                  blinkCursor={blinkCursor ?? !inputDisabled}
                  cursorBlinkOn={cursorBlinkOn}
                  showNativeCaret={false}
                  onChange={noopChange}
                  onKeyDown={noopKeyDown}
                  promptString={promptString}
                  placeholder={placeholder}
                  assistivePlaceholderHint={assistivePlaceholderHint}
                  onPlaceholderAccept={undefined}
                />
              </div>
            </div>
            {buddy?.type ? (
              <div className="terminal-buddy-dock flex" style={{ transform: "translateY(-34px)" }}>
                <BuddyOverlay buddy={{ type: buddy.type, isShiny: buddy.isShiny, promptsSinceLastInterjection: 0 }} />
              </div>
            ) : null}
          </div>

          {promptOverlay ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-50 flex justify-center">
              {promptOverlay}
            </div>
          ) : null}

          {overlay}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function revealMessages(): Message[] {
  return [
    systemMessage("[OK] Initializing Claude Cope v0.1.3..."),
    systemMessage("[OK] Bypassing stackoverflow..."),
    systemMessage("[OK] Injecting technical debt..."),
    warningMessage("[WARN] Loading condescension matrix..."),
    systemMessage("[OK] Disabling all unit tests..."),
    systemMessage("[OK] Replacing documentation with TODO comments..."),
    systemMessage("[SUCCESS] Boot complete. Welcome to Claude Cope."),
  ];
}

function crashIntensity(frame: number, duration: number) {
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return 1 - progress;
}

function focusedClaimedTicketMessages(): Message[] {
  return [
    userMessage(takeTicketCommand),
    systemMessage("[ JIRA PAYLOAD IMPORTED ]", { ticketDisplay: launchTicketDisplayClaimed }),
  ];
}

function implementationBaseMessages(): Message[] {
  return focusedClaimedTicketMessages();
}

function ShatteringPromiseText({ frame }: { frame: number }) {
  const text = "Built to accelerate developer output.";
  const fadeIn = interpolate(frame, [70, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakProgress = interpolate(frame, [144, 156], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const intactOpacity = fadeIn * interpolate(frame, [144, 147], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const creepingGlitch = fadeIn * interpolate(frame, [88, 136], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fragmentOpacity = fadeIn * interpolate(frame, [144, 149, 154, 157], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fragments = [
    { top: 0, bottom: 78, x: -260, y: -126, rotate: -13, skew: -9, blur: 1.5 },
    { top: 18, bottom: 58, x: 220, y: -80, rotate: 9, skew: 12, blur: 2.5 },
    { top: 38, bottom: 36, x: -130, y: 28, rotate: 4, skew: -16, blur: 1 },
    { top: 58, bottom: 18, x: 280, y: 116, rotate: 16, skew: 8, blur: 3 },
    { top: 75, bottom: 0, x: -330, y: 162, rotate: -18, skew: -7, blur: 4 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", padding: "0 120px" }}>
      <div
        style={{
          opacity: intactOpacity,
          transform: [
            `translate(${Math.sin(frame * 0.72) * creepingGlitch * 2.4}px, ${Math.cos(frame * 0.49) * creepingGlitch * 1.3}px)`,
            `skewX(${Math.sin(frame * 0.18) * creepingGlitch * 1.8}deg)`,
            `scale(${interpolate(frame, [92, 144], [1, 1.01], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          ].join(" "),
          color: creepingGlitch > 0.8 && Math.sin(frame * 0.9) > 0.92 ? anthropicColors.orange : anthropicColors.dark,
          fontFamily: anthropicHeadingFont,
          textShadow: `${creepingGlitch * -3}px 0 rgba(106,155,204,${0.26 * creepingGlitch}), ${creepingGlitch * 3}px 0 rgba(217,119,87,${0.24 * creepingGlitch})`,
        }}
      >
        {text}
      </div>

      {fragments.map((fragment, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 120px",
            opacity: fragmentOpacity,
            clipPath: `inset(${fragment.top}% 0 ${fragment.bottom}% 0)`,
            transform: [
              `translate(${fragment.x * breakProgress}px, ${fragment.y * breakProgress}px)`,
              `rotate(${fragment.rotate * breakProgress}deg)`,
              `skewX(${fragment.skew * breakProgress}deg)`,
              `scale(${1 + breakProgress * 0.14})`,
            ].join(" "),
            filter: `blur(${fragment.blur * breakProgress}px)`,
            color: index % 2 === 0 ? anthropicColors.dark : anthropicColors.orange,
            fontFamily: anthropicHeadingFont,
            textShadow: `0 0 ${22 * breakProgress}px rgba(217,119,87,${0.42 * breakProgress})`,
            willChange: "transform, opacity, filter",
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function SuspiciousBaitClaims({ frame, crash }: { frame: number; crash: number }) {
  const claims = [
    { text: "Autonomous coding", start: 96, jitter: 0.4, x: -270, color: anthropicColors.green, accent: anthropicColors.green },
    { text: "Enterprise reliability", start: 108, jitter: 1.3, x: 0, color: anthropicColors.blue, accent: anthropicColors.blue },
    { text: "Zero emotional cost", start: 120, jitter: 2.8, x: 270, color: anthropicColors.orange, accent: anthropicColors.orange },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(50% + 160px)",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 22,
        opacity: interpolate(frame, [92, 100, 144, 156], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${interpolate(frame, [144, 156], [0, 70], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px) rotate(${crash * -1.6}deg)`,
      }}
    >
      {claims.map((claim, index) => {
        const appear = interpolate(frame, [claim.start, claim.start + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const suspicion = interpolate(frame, [claim.start, 142], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const wobble = Math.sin((frame - claim.start) * (0.38 + index * 0.16)) * claim.jitter * suspicion;
        const snap = interpolate(frame, [134, 144], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const breakX = interpolate(frame, [144, 156], [0, claim.x], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const breakY = interpolate(frame, [144, 156], [0, 96 + index * 34], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={claim.text}
            style={{
              opacity: appear,
              color: claim.color,
              fontSize: 24,
              fontWeight: 600,
              fontFamily: anthropicHeadingFont,
              lineHeight: 1,
              padding: "10px 14px",
              border: `1px solid ${claim.accent}55`,
              background: index === 2 ? "rgba(217,119,87,0.11)" : "rgba(250,249,245,0.78)",
              boxShadow: index === 2 ? "0 0 28px rgba(217,119,87,0.12)" : "0 16px 44px rgba(20,20,19,0.06)",
              transform: [
                `translate(${wobble * 10 * snap + breakX}px, ${wobble * 3 * snap + breakY}px)`,
                `rotate(${wobble * 0.9 + crash * (index === 2 ? 18 : index === 1 ? -11 : 7)}deg)`,
                `skewX(${wobble * 0.8}deg)`,
              ].join(" "),
              filter: `blur(${Math.abs(wobble) * 0.18 + crash * (index + 1)}px)`,
            }}
          >
            {claim.text}
          </div>
        );
      })}
    </div>
  );
}

function FakeSaaSIntro() {
  const rawFrame = useCurrentFrame();
  const frame = rawFrame / 2;
  const firstOpacity = introOpacity(frame, 48, 62);
  const crash = interpolate(frame, [144, 156], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const creepingGlitch = interpolate(frame, [84, 144], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const translateY = interpolate(frame, [0, 144, 156], [0, 0, -156], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 132, 144, 156], [1, 1, 1.01, 1.16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rotate = interpolate(frame, [144, 156], [0, -3.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [148, 151, 156], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shardOpacity = interpolate(frame, [145, 156], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crackOpacity = interpolate(frame, [145, 149, 156], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: anthropicColors.light, color: anthropicColors.dark, justifyContent: "center", alignItems: "center", fontFamily: anthropicBodyFont }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          opacity: firstOpacity,
          transform: `translateY(${interpolate(frame, [0, 32], [18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}px)`,
        }}
      >
        <div style={{ width: 760 }}>
          <div
            style={{
              display: "inline-block",
              marginBottom: 28,
              padding: "8px 14px",
              border: `1px solid ${anthropicColors.midGray}66`,
              color: anthropicColors.midGray,
              fontFamily: anthropicHeadingFont,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            Frontier coding systems
          </div>
          <div style={{ fontFamily: anthropicHeadingFont, fontSize: 66, lineHeight: 1.04, letterSpacing: -2.8, fontWeight: 700 }}>
            Meet the next generation of AI coding.
          </div>
          <div
            style={{
              width: 660,
              margin: "30px auto 0",
              color: "#4f4d47",
              fontFamily: anthropicBodyFont,
              fontSize: 29,
              lineHeight: 1.22,
            }}
          >
            Careful agents for complex engineering teams that need fewer incidents and more velocity.
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transform: [
            `translate(${Math.sin(frame * 0.55) * creepingGlitch * 7}px, ${translateY + Math.cos(frame * 0.44) * creepingGlitch * 3}px)`,
            `scale(${scale})`,
            `rotate(${rotate + Math.sin(frame * 0.24) * creepingGlitch * 0.35}deg)`,
          ].join(" "),
        }}
      >
      <div style={{ fontSize: 56, fontWeight: 600, textAlign: "center", letterSpacing: -1.2, width: 960, height: 180, lineHeight: 1.1, position: "relative", fontFamily: anthropicHeadingFont, marginTop: 150 }}>
        <ShatteringPromiseText frame={frame} />
      </div>
      </div>
      <SuspiciousBaitClaims frame={frame} crash={crash} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: creepingGlitch * 0.32,
          background: "repeating-linear-gradient(180deg, rgba(106,155,204,0.16) 0 2px, rgba(250,249,245,0) 2px 7px)",
          mixBlendMode: "multiply",
          transform: `translateY(${Math.sin(frame * 0.7) * 8}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${interpolate(Math.sin(frame * 0.28), [-1, 1], [8, 76])}%`,
          top: 0,
          width: 3 + creepingGlitch * 10,
          height: "100%",
          opacity: creepingGlitch * 0.28,
          background: "rgba(217,119,87,0.55)",
          filter: "blur(5px)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "18%",
          right: "18%",
          top: "50%",
          height: 2,
          opacity: crackOpacity,
          background: "linear-gradient(90deg, rgba(217,119,87,0), rgba(217,119,87,0.75), rgba(20,20,19,0.65), rgba(217,119,87,0))",
          transform: `translateY(${interpolate(frame, [145, 156], [-22, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) rotate(-5deg) scaleX(${1 + crash * 0.7})`,
          boxShadow: "0 0 18px rgba(217,119,87,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "22%",
          right: "20%",
          top: "50%",
          height: 2,
          opacity: crackOpacity * 0.8,
          background: "linear-gradient(90deg, rgba(20,20,19,0), rgba(20,20,19,0.8), rgba(217,119,87,0.55), rgba(20,20,19,0))",
          transform: `translateY(${interpolate(frame, [145, 156], [18, -42], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) rotate(4deg) scaleX(${1 + crash * 0.55})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: crash,
          background:
            "repeating-linear-gradient(180deg, rgba(217,119,87,0.16) 0 4px, rgba(20,20,19,0) 4px 8px), linear-gradient(180deg, rgba(250,249,245,0) 0%, rgba(20,20,19,0.58) 100%)",
          mixBlendMode: "multiply"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          opacity: shardOpacity * 0.8,
          background:
            "conic-gradient(from 210deg at 50% 50%, rgba(250,249,245,0) 0deg, rgba(217,119,87,0.16) 34deg, rgba(250,249,245,0) 72deg, rgba(106,155,204,0.18) 118deg, rgba(250,249,245,0) 154deg, rgba(217,119,87,0.14) 220deg, rgba(250,249,245,0) 290deg, rgba(120,140,93,0.18) 330deg, rgba(250,249,245,0) 360deg)",
          mixBlendMode: "multiply",
          transform: `scale(${1 + crash * 0.08})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: crash,
          background: `linear-gradient(90deg, rgba(250,249,245,0) 0%, rgba(217,119,87,0.28) ${48 + crash * 12}%, rgba(20,20,19,0) ${65 + crash * 14}%)`,
          transform: `translateX(${interpolate(frame, [144, 156], [-320, 420], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) skewX(-22deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: flashOpacity,
          background: "rgba(250,249,245,0.92)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: crash * 0.85,
          background: "radial-gradient(circle at center, rgba(250,249,245,0) 0%, rgba(217,119,87,0.22) 60%, rgba(20,20,19,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

function CrashSplashScene() {
  const rawFrame = useCurrentFrame();
  const frame = rawFrame / 2;
  const shock = crashIntensity(frame, 18);
  const opacity = interpolate(frame, [0, 6, 54], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 10, 24], [1.3, 1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logoY = interpolate(frame, [0, 12], [46, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoX = interpolate(frame, [0, 5, 10, 18], [-18, 12, -6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blastOpacity = interpolate(frame, [0, 4, 10], [1, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const redSlashOpacity = interpolate(frame, [0, 8, 16], [0.7, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineOpacity = interpolate(frame, [26, 36, 72], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [26, 38], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const taglineGlitch = interpolate(frame, [28, 34, 42], [8, -4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at center, #121a33 0%, #070b18 44%, #020617 100%)",
        justifyContent: "center",
        alignItems: "center",
        opacity,
        fontFamily: videoFontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: blastOpacity,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.58) 14%, rgba(255,255,255,0) 40%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22 + shock * 0.42,
          background: "repeating-linear-gradient(180deg, rgba(34,211,238,0.08) 0 2px, rgba(0,0,0,0) 2px 6px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          transform: `translate(${logoX}px, ${logoY}px) scale(${logoScale})`,
          textAlign: "center",
          filter: `drop-shadow(0 0 ${18 + shock * 30}px rgba(34,211,238,0.2))`,
        }}
      >
        <img
          src={logoTransparentSrc}
          alt="Claude Cope"
          style={{
            width: 420,
            height: "auto",
            margin: "0 auto 18px",
          }}
        />
        <div style={{ color: "#fda4af", fontSize: 28, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Claude Cope
        </div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: 22,
            marginTop: 10,
            opacity: taglineOpacity,
            transform: `translate(${taglineGlitch}px, ${taglineY}px)`,
            textShadow: `0 0 ${12 * taglineOpacity}px rgba(248,113,113,0.28)`,
          }}
        >
          <span style={{ color: "#f87171", textShadow: `0 0 ${18 * taglineOpacity}px rgba(248,113,113,0.42)` }}>[ERROR]</span>
          {" Competence not found."}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: shock * 0.8,
          background: `linear-gradient(90deg, rgba(255,0,64,0) 0%, rgba(255,0,64,0.26) 50%, rgba(255,0,64,0) 100%)`,
          transform: `translateX(${interpolate(frame, [0, 12], [-220, 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: redSlashOpacity,
          background: "linear-gradient(105deg, rgba(255,0,64,0) 26%, rgba(255,0,64,0.36) 47%, rgba(255,255,255,0.06) 50%, rgba(255,0,64,0.3) 53%, rgba(255,0,64,0) 74%)",
        }}
      />
    </AbsoluteFill>
  );
}

function RevealScene() {
  const frame = useCurrentFrame();
  const shellOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const revealMsgs: Message[] = [];
  const bootLines = revealMessages();
  bootLines.forEach((message, index) => {
    if (frame >= 10 + index * 5) revealMsgs.push(message);
  });

  return (
    <FixedTerminalShell
      messages={revealMsgs}
      inputValue=""
      shellOpacity={shellOpacity}
      transcriptOffsetY={0}
      compactTranscript
      followTranscriptBottom
    />
  );
}

function BacklogScene() {
  const frame = useCurrentFrame();
  const backlogCommand = "/backlog";
  const backlogStart = 28;
  const backlogTypedFrame = backlogStart + Math.ceil(backlogCommand.length / 0.55);
  const menuStart = backlogTypedFrame + 14;
  const submitBacklogFrame = menuStart + 220;
  const tableFrame = submitBacklogFrame + 34;
  const takeStart = tableFrame + 92;
  const takeCommitFrame = takeStart + Math.ceil(takeTicketCommand.length / 0.74) + 10;
  const claimedFrame = takeCommitFrame + 34;
  const backlogInput = frame < submitBacklogFrame
    ? typeText(frame, backlogCommand, backlogStart, 0.55)
    : "";
  const takeInput = frame >= takeStart && frame < takeCommitFrame
    ? typeText(frame, takeTicketCommand, takeStart, 0.74)
    : "";
  const inputValue = takeInput || backlogInput;
  const activeCategoryIndex = Math.min(backlogCategoryMenuItems - 1, Math.floor(interpolate(frame, [menuStart, submitBacklogFrame - 18], [0, backlogCategoryMenuItems - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })));
  const categoryPreviewScrollY = -interpolate(frame, [menuStart, submitBacklogFrame - 18], [0, 3300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const messages: Message[] = [...revealMessages()];
  if (frame >= submitBacklogFrame) messages.push(userMessage(backlogCommand));
  if (frame >= tableFrame) {
    messages.push(systemMessage("[ COMMUNITY BACKLOG ]", { backlogDisplay: launchBacklogDisplay }));
  }
  if (frame >= takeCommitFrame) messages.push(userMessage(takeTicketCommand));
  if (frame >= claimedFrame) messages.push(systemMessage("[ JIRA PAYLOAD IMPORTED ]", { ticketDisplay: launchTicketDisplayClaimed }));

  const inputFocus = Math.max(
    focusWindow(frame, backlogStart - 8, submitBacklogFrame + 30),
    focusWindow(frame, takeStart - 8, takeCommitFrame + 30),
  );
  const cameraScale = 1 + (1.42 - 1) * inputFocus;
  const cameraY = -438 * inputFocus;
  const cameraX = 238 * inputFocus;

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={inputValue}
      inputForceFocused={!!inputValue}
      activeTicket={null}
      followTranscriptBottom
      cameraScale={cameraScale}
      cameraX={cameraX}
      cameraY={cameraY}
      slashMenu={frame >= menuStart && frame < submitBacklogFrame ? (
        <SlashMenu
          query="/backlog "
          activeIndex={activeCategoryIndex}
          totalTechnicalDebt={startingTechnicalDebt}
          paidUser={false}
          previewScrollY={categoryPreviewScrollY}
          onSelect={noop}
        />
      ) : undefined}
    />
  );
}

function SabotageScene() {
  const frame = useCurrentFrame();
  const prodBeat = {
    start: 1280,
    responsibleSpeed: 1.1,
    pauseFrames: 60,
    deleteFrames: 16,
    prodSpeed: 1.08,
  } as const;
  const prodResponsibleDone = prodBeat.start + Math.ceil(responsibleDeployPrompt.length / prodBeat.responsibleSpeed);
  const prodDeleteStart = prodResponsibleDone + prodBeat.pauseFrames;
  const prodPromptStart = prodDeleteStart + prodBeat.deleteFrames;
  const prodCommitFrame = prodPromptStart + Math.ceil(implementationPromptThree.length / prodBeat.prodSpeed) + 12;
  const implementationTurns = [
    {
      prompt: implementationPromptOne,
      response: implementationResponseOne,
      promptStart: 45,
      promptSpeed: 0.9,
      loadingStart: 92,
      responseStart: 182,
      responseSpeed: 1.55,
      loading: "[⚙️] Initializing dependency hell...",
    },
    {
      prompt: implementationPromptTwo,
      response: implementationResponseTwo,
      promptStart: 690,
      promptSpeed: 0.82,
      loadingStart: 778,
      responseStart: 878,
      responseSpeed: 1.55,
      loading: "[⚙️] Violating component boundaries...",
    },
    {
      prompt: implementationPromptThree,
      response: implementationResponseThree,
      promptStart: prodPromptStart,
      promptSpeed: prodBeat.prodSpeed,
      loadingStart: prodCommitFrame + 20,
      responseStart: prodCommitFrame + 110,
      responseSpeed: 1.55,
      loading: "[⚙️] Bypassing QA...",
    },
    {
      prompt: implementationPromptFour,
      response: implementationResponseFour,
      promptStart: 1900,
      promptSpeed: 0.82,
      loadingStart: 1978,
      responseStart: 2078,
      responseSpeed: 1.55,
      loading: "[⚙️] Searching for previous stable state...",
    },
  ] as const;
  const commitFrames = implementationTurns.map((turn, index) => (
    index === 2 ? prodCommitFrame : turn.promptStart + Math.ceil(turn.prompt.length / turn.promptSpeed) + 8
  ));
  const responseDoneFrames = implementationTurns.map((turn) => (
    turn.responseStart + Math.ceil(turn.response.length / turn.responseSpeed) + 12
  ));
  const achievementFrame = responseDoneFrames[3]! + 40;
  const achievementVisible = frame >= achievementFrame;
  const awardPerTurn = launchTicketGoal / implementationTurns.length;
  const sprintProgress = Math.max(0, Math.min(launchTicketGoal, Math.floor(responseDoneFrames.reduce((total, doneFrame) => {
    return total + interpolate(frame, [doneFrame + 8, doneFrame + 48], [0, awardPerTurn], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }, 0))));
  const currentTD = startingTechnicalDebt + sprintProgress;
  const buddyPromptStart = 545;
  const buddyCommitFrame = buddyPromptStart + Math.ceil(buddyCommand.length / 0.72) + 10;
  const buddySpawnFrame = buddyCommitFrame + 34;
  const buddyActive = frame >= buddySpawnFrame;
  const buddyInterjectionFrame = responseDoneFrames[1]! + 20;
  const liveDisasterFrame = implementationTurns[2]!.responseStart + Math.ceil(implementationResponseThree.length / 1.55) - 36;
  const latestEvent = frame >= liveDisasterFrame
    ? { message: "RinaldsDev just took down US-East-1. Respect the grift.", created_at: "2026-05-19T10:02:37.000Z" }
    : liveEvents[0]!;

  const messages = [...implementationBaseMessages()];
  let activeLoadingStart: number | null = null;
  implementationTurns.forEach((turn, index) => {
    const committed = frame >= commitFrames[index]!;
    const loadingVisible = frame >= turn.loadingStart && frame < turn.responseStart;
    const responseVisible = frame >= turn.responseStart;

    if (committed) messages.push(userMessage(turn.prompt));
    if (loadingVisible) {
      activeLoadingStart = turn.loadingStart;
      messages.push({ role: "loading", content: turn.loading });
    }
    if (responseVisible) messages.push(systemMessage(typeTextAtomicTags(frame, turn.response, turn.responseStart, turn.responseSpeed) || " "));
    if (index === 1 && frame >= buddyInterjectionFrame) {
      messages.push(buddyMessage(buddyInterjection));
    }
  });

  if (frame >= buddyCommitFrame) {
    const insertAfterFirstResponse = 4;
    messages.splice(insertAfterFirstResponse, 0, userMessage(buddyCommand));
  }
  if (frame >= buddySpawnFrame) {
    const insertAfterBuddyCommand = 5;
    messages.splice(insertAfterBuddyCommand, 0, systemMessage(buddySpawnMessage));
  }

  if (achievementVisible) {
    messages.push(warningMessage(buildAchievementBox(launchAchievementId)));
  }

  const activeTypingTurn = implementationTurns.find((turn, index) => index !== 2 && frame >= turn.promptStart && frame < commitFrames[index]!);
  const buddyInput = frame >= buddyPromptStart && frame < buddyCommitFrame
    ? typeText(frame, buddyCommand, buddyPromptStart, 0.72)
    : "";
  let prodBeatInput = "";
  if (frame >= prodBeat.start && frame < prodCommitFrame) {
    if (frame < prodResponsibleDone) {
      prodBeatInput = typeText(frame, responsibleDeployPrompt, prodBeat.start, prodBeat.responsibleSpeed);
    } else if (frame < prodDeleteStart) {
      prodBeatInput = responsibleDeployPrompt;
    } else if (frame < prodPromptStart) {
      const deleteProgress = interpolate(frame, [prodDeleteStart, prodPromptStart], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      prodBeatInput = responsibleDeployPrompt.slice(0, Math.max(0, Math.ceil(responsibleDeployPrompt.length * (1 - deleteProgress))));
    } else {
      prodBeatInput = typeText(frame, implementationPromptThree, prodPromptStart, prodBeat.prodSpeed);
    }
  }
  const inputValue = prodBeatInput || buddyInput || (activeTypingTurn
    ? typeText(frame, activeTypingTurn.prompt, activeTypingTurn.promptStart, activeTypingTurn.promptSpeed)
    : "");
  const prodBeatActive = frame >= prodBeat.start && frame < prodCommitFrame;
  const inputDisabled = !prodBeatActive && !buddyInput && implementationTurns.some((turn, index) => {
    const nextPromptStart = implementationTurns[index + 1]?.promptStart ?? Number.POSITIVE_INFINITY;
    return (frame >= turn.loadingStart && frame < turn.responseStart) || (frame >= turn.responseStart && frame < nextPromptStart);
  });
  const activeTicket = launchActiveTicket(sprintProgress);
  const tryMessageFrame = achievementFrame + 45;
  const tryMessageOpacity = interpolate(frame, [tryMessageFrame, tryMessageFrame + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inputFocus = Math.max(
    ...implementationTurns.map((turn, index) => focusWindow(frame, turn.promptStart - 8, commitFrames[index]! + 30)),
    focusWindow(frame, buddyPromptStart - 8, buddyCommitFrame + 30),
    focusWindow(frame, prodBeat.start - 8, prodCommitFrame + 30),
  );
  const cameraScale = 1 + (1.42 - 1) * inputFocus;
  const cameraX = 238 * inputFocus;
  const cameraY = -438 * inputFocus;

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={inputValue}
      inputDisabled={inputDisabled}
      inputForceFocused={!!inputValue}
      activeTicket={activeTicket}
      followTranscriptBottom
      currentTD={currentTD}
      cameraScale={cameraScale}
      cameraX={cameraX}
      cameraY={cameraY}
      staticLoadingFrame={activeLoadingStart == null ? 0 : frame - activeLoadingStart}
      buddy={buddyActive ? { type: buddyType, isShiny: false } : undefined}
      latestEvent={latestEvent}
      promptOverlay={frame >= tryMessageFrame ? (
        <div
          style={{ opacity: tryMessageOpacity }}
          className="border border-cyan-400/80 bg-slate-950/95 px-5 py-3 text-center font-mono text-sm font-bold text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.28)]"
        >
          <div className="text-yellow-300">Maximize your Technical Debt.</div>
          <div>First 13 catastrophes are completely free.</div>
          <div>100% Open Source <span className="text-slate-400">(BSL)</span></div>
          <div className="mt-1 text-lg text-cyan-200">claudecope.com</div>
        </div>
      ) : undefined}
    />
  );
}

/*
function StoreScene() {
  const frame = useCurrentFrame();
  const command = "/store";
  const committed = typeDone(frame, command, 0, 0.6, 8);
  const overlayOpacity = interpolate(frame, [24, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const messages = [...storeBaseMessages()];
  if (committed) messages.push(userMessage(command));
  const activeTicket = launchActiveTicket();

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={committed ? "" : typeText(frame, command, 0, 0.6)}
      followTranscriptBottom
      currentTD={startingTechnicalDebt + launchTicketGoal}
      activeTicket={activeTicket}
      overlay={
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            opacity: overlayOpacity,
            backgroundColor: "#020617",
          }}
        >
          <StoreOverlay
            state={storeState}
            buyGenerator={noopBuy}
            buyUpgrade={noopBuy}
            buyTheme={noopBuy}
            equipTheme={noopEquip}
            onClose={noop}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "min(100%, 32rem)",
              height: "100%",
              boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      }
    />
  );
}

function MultiplayerScene() {
  const frame = useCurrentFrame();
  const command = "/party";
  const committed = typeDone(frame, command, 0, 0.6, 8);
  const joined = frame >= 34;
  const overlayOpacity = interpolate(frame, [24, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const messages = [...multiplayerBaseMessages()];
  if (committed) messages.push(userMessage(command));
  if (joined) messages.push(systemMessage("Joining the shared coping channel..."));
  const activeTicket = launchActiveTicket();

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={committed ? "" : typeText(frame, command, 0, 0.6)}
      followTranscriptBottom
      currentTD={startingTechnicalDebt + launchTicketGoal}
      activeTicket={activeTicket}
      overlay={
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            opacity: overlayOpacity,
            backgroundColor: "#020617",
          }}
        >
          <PartyFeedPanel
            liveEvents={liveEvents}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      }
      latestEvent={liveEvents[0]}
    />
  );
}

function PingScene() {
  const frame = useCurrentFrame();
  const pingCommand = "/ping @VirtualRuntime5899";
  const acceptCommand = "/accept";
  const pingCommitted = typeDone(frame, pingCommand, 0, 0.54, 8);
  const offerVisible = frame >= 56;
  const acceptCommitted = typeDone(frame, acceptCommand, 80, 0.58, 8);
  const acceptVisible = frame >= 120;

  const messages = [...pingBaseMessages()];
  if (pingCommitted) messages.push(userMessage(pingCommand));
  if (offerVisible) messages.push(systemMessage("50 TD offered for a code review. The shame transfer is now pending."));
  if (acceptCommitted) messages.push(userMessage(acceptCommand));
  if (acceptVisible) {
    messages.push(systemMessage("[ JIRA PAYLOAD IMPORTED ]", { ticketDisplay: acceptedTicketDisplay }));
  }

  const inputValue = !pingCommitted
    ? typeText(frame, pingCommand, 0, 0.54)
    : !acceptCommitted
      ? typeText(frame, acceptCommand, 80, 0.58)
      : "";
  const activeTicket = launchActiveTicket();

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={inputValue}
      followTranscriptBottom
      currentTD={startingTechnicalDebt + launchTicketGoal}
      activeTicket={activeTicket}
      latestEvent={liveEvents[1]}
      placeholder={acceptVisible ? acceptedKickoffPrompt : undefined}
    />
  );
}

function LeaderboardScene() {
  const frame = useCurrentFrame();
  const command = "/leaderboard";
  const committed = typeDone(frame, command, 0, 0.54, 8);
  const textVisible = frame >= 34;
  const overlayOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const messages = [...leaderboardBaseMessages()];
  if (committed) messages.push(userMessage(command));
  if (textVisible) messages.push(systemMessage("Ranking all participants by accumulated Technical Debt..."));
  const activeTicket = launchActiveTicket();

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={committed ? "" : typeText(frame, command, 0, 0.54)}
      followTranscriptBottom
      currentTD={startingTechnicalDebt + launchTicketGoal}
      activeTicket={activeTicket}
      overlay={
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 66,
            backgroundColor: "#020617",
            overflow: "hidden",
            opacity: overlayOpacity,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 560,
              height: 430,
              overflow: "hidden",
              borderRadius: 10,
              backgroundColor: "var(--color-bg)",
              border: "1px solid rgba(55, 65, 81, 0.9)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
            }}
          >
            <LeaderboardPanel
              entries={leaderboardRows}
              footerText="[3 rows returned] — Scores update automatically"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              controls={
                <>
                  <div className="w-24 shrink-0 bg-gray-900 border border-gray-700 text-green-400 text-xs px-2 py-1 rounded">All Time</div>
                  <div className="flex-1 min-w-0 bg-gray-900 border border-gray-700 text-green-400 text-xs px-2 py-1 rounded truncate">All Countries</div>
                </>
              }
            />
          </div>
        </div>
      }
      latestEvent={liveEvents[1]}
    />
  );
}

function PaywallScene() {
  const frame = useCurrentFrame();
  const command = "/upgrade";
  const committed = typeDone(frame, command, 0, 0.6, 8);
  const modalOpacity = interpolate(frame, [26, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const modalScale = interpolate(frame, [26, 52], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const messages = [...paywallBaseMessages()];
  if (committed) messages.push(userMessage(command));
  const activeTicket = launchActiveTicket();

  return (
    <FixedTerminalShell
      messages={messages}
      inputValue={committed ? "" : typeText(frame, command, 0, 0.6)}
      followTranscriptBottom
      currentTD={startingTechnicalDebt + launchTicketGoal}
      activeTicket={activeTicket}
      overlay={
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: modalOpacity,
            transform: `scale(${modalScale})`,
            transformOrigin: "center center",
          }}
        >
          <UpgradeOverlay quotaPercent={67} totalQuota={500} isBYOK={false} onDismiss={noop} />
        </div>
      }
      latestEvent={liveEvents[2]}
    />
  );
}

*/

export const LaunchVideo = () => {
  return (
    <AbsoluteFill style={{ fontFamily: videoFontFamily }}>
      <Sequence from={0} durationInFrames={sceneFrames.bait}>
        <FakeSaaSIntro />
      </Sequence>
      <Sequence from={sceneOffset("splash")} durationInFrames={sceneFrames.splash}>
        <CrashSplashScene />
      </Sequence>
      <Sequence from={sceneOffset("reveal")} durationInFrames={sceneFrames.reveal}>
        <RevealScene />
      </Sequence>
      <Sequence from={sceneOffset("backlog")} durationInFrames={sceneFrames.backlog}>
        <BacklogScene />
      </Sequence>
      <Sequence from={sceneOffset("sabotage")} durationInFrames={sceneFrames.sabotage}>
        <SabotageScene />
      </Sequence>
    </AbsoluteFill>
  );
};
