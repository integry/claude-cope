// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupRenderedTerminal,
  getButton,
  getInput,
  renderTerminal,
  submitCommand,
  type RenderedTerminal,
} from "./TerminalTipManager.testUtils";

const {
  executeSlashCommandMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
  runFreeTierDelayMock,
  submitChatMessageMock,
  setShowUpgradeMock,
  shouldShowNagMock,
  isFreeUserMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
  runFreeTierDelayMock: vi.fn(),
  submitChatMessageMock: vi.fn(),
  setShowUpgradeMock: vi.fn(),
  shouldShowNagMock: vi.fn(() => false),
  isFreeUserMock: vi.fn(() => false),
}));

vi.mock("../../config", () => ({
  BYOK_ENABLED: false,
  TICKET_REFINE_ENABLED: false,
}));
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: isFreeUserMock }));
vi.mock("../chatApi", () => ({
  computeBuddyInterjection: () => null,
  mergeSuggestedReply: (_prev: string | null, next: string) => next,
  submitChatMessage: submitChatMessageMock,
}));
vi.mock("../slashCommandExecutor", () => ({
  executeSlashCommand: executeSlashCommandMock,
}));
vi.mock("../../hooks/profileSync", () => ({
  applyAuthoritativeProfile: (prev: unknown) => prev,
  applyServerProfile: (prev: unknown) => prev,
  settlePendingCompletedRewards: (prev: unknown) => prev,
}));
vi.mock("../keyCommandHandler", () => ({ handleKeyCommand: vi.fn() }));
vi.mock("../ticketPrompt", () => ({ fetchRandomTicketPrompt: vi.fn() }));
vi.mock("../filterChatHistory", () => ({ filterChatHistory: (history: unknown[]) => history }));
vi.mock("../../hooks/useMultiplayer", () => ({
  useMultiplayer: () => ({
    onlineCount: 0,
    onlineUsers: [],
    sendPing: vi.fn(),
    pendingReviewPing: null,
    acceptReviewPing: vi.fn(),
    outageHp: null,
    sendDamage: vi.fn(),
  }),
}));
vi.mock("../../hooks/useTerminalEffects", () => ({
  useTerminalEffects: () => ({ isBooting: false, regressionGlitch: null, activeRegression: null }),
}));
vi.mock("../../hooks/useSoundEffects", () => ({
  useSoundEffects: () => ({ playError: vi.fn(), playChime: vi.fn() }),
}));
vi.mock("../../hooks/usePingAcknowledged", () => ({ usePingAcknowledged: () => false }));
vi.mock("../../hooks/useOverlays", async () => (await import("./TerminalTipManager.testUtils")).createUseOverlaysModule((value) => setShowUpgradeMock(value))());
vi.mock("../../hooks/useTipManager", () => ({
  useTipManager: () => ({
    recordEnter: recordEnterMock,
    recordValidCommand: recordValidCommandMock,
    recordMessageWithoutTicket: (...args: unknown[]) => recordMessageWithoutTicketMock(...args),
  }),
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: runFreeTierDelayMock }));
vi.mock("../buildChatSubmitArgs", () => ({
  buildSprintCallbacks: () => ({
    onSprintProgress: vi.fn(),
    getSprintCompleteMessage: vi.fn(),
  }),
}));
vi.mock("../terminalHandlers", () => ({
  triggerQuotaLockout: vi.fn(),
  triggerInstantBan: vi.fn(),
}));
vi.mock("../../hooks/useTerminalKeyboard", async () => (await import("./TerminalTipManager.testUtils")).createUseTerminalKeyboardModule());
vi.mock("../terminalInputHandlers", () => ({
  handleBragSubmit: vi.fn(),
  handleBuddyConfirm: vi.fn(),
  tryOutageDamage: () => false,
}));
vi.mock("../winrarNag", () => ({
  shouldShowNag: shouldShowNagMock,
}));
vi.mock("../TerminalView", async () => (await import("./TerminalTipManager.testUtils")).createTerminalViewModule());
vi.mock("../terminalViewUtils", () => ({
  getPromptString: () => ">",
  isAnyOverlayOpen: () => false,
}));
vi.mock("../useCheckoutLicenseSync", () => ({ useCheckoutLicenseSync: vi.fn() }));
vi.mock("../../hooks/useGameState", async () => (await import("./TerminalTipManager.testUtils")).createUseGameStateModule()());

import Terminal from "../Terminal";

let rendered: RenderedTerminal | null = null;

async function triggerNaggedPrompt() {
  rendered = await renderTerminal(Terminal);
  await submitCommand(rendered.container, "first prompt");
  shouldShowNagMock.mockReturnValueOnce(true);
  await submitCommand(rendered.container, "retry me");
}

async function replayNaggedPrompt(action: "button" | "escape") {
  const input = getInput(rendered!.container);
  if (action === "button") {
    await act(async () => {
      getButton(rendered!.container, "dismiss-upgrade").click();
    });
  } else {
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
  }
  expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
  expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    vi.advanceTimersByTime(3000);
    await Promise.resolve();
  });
  expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);
  expect(submitChatMessageMock).toHaveBeenCalledTimes(2);
  return input;
}

describe("Terminal tip-manager nag replay wiring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T00:00:00.000Z"));
    recordMessageWithoutTicketMock.mockImplementation(() => vi.fn());
    isFreeUserMock.mockReset();
    isFreeUserMock.mockReturnValue(false);
    runFreeTierDelayMock.mockReset();
    runFreeTierDelayMock.mockResolvedValue(true);
    executeSlashCommandMock.mockImplementation((command: string, ctx: { onValidSlashCommand?: (baseCommand: string) => void }) => {
      ctx.onValidSlashCommand?.(command.trim());
    });
    submitChatMessageMock.mockReset();
    setShowUpgradeMock.mockReset();
    shouldShowNagMock.mockReset();
    shouldShowNagMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanupRenderedTerminal(rendered);
    rendered = null;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("replays nagged prompts with normal backlog accounting and cleared input", async () => {
    await triggerNaggedPrompt();
    expect(setShowUpgradeMock).toHaveBeenCalledWith(true);
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    const input = await replayNaggedPrompt("button");
    expect(input.value).toBe("");
  });

  it("replays a nagged prompt through the same path when dismissed by keyboard", async () => {
    await triggerNaggedPrompt();
    const input = await replayNaggedPrompt("escape");
    expect(input.value).toBe("");
  });

  it("fully disarms a nagged prompt when the overlay is manually dismissed", async () => {
    await triggerNaggedPrompt();
    await act(async () => {
      getButton(rendered!.container, "manual-dismiss-upgrade").click();
    });
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      vi.advanceTimersByTime(3000);
    });
    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
    expect(setShowUpgradeMock.mock.calls.filter(([value]) => value === true)).toHaveLength(1);
  });

  it("replays a nagged prompt after the forced dismiss cycle completes", async () => {
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    shouldShowNagMock.mockReturnValue(true);
    await submitCommand(rendered.container, "retry me");
    await replayNaggedPrompt("button");
    expect(setShowUpgradeMock).toHaveBeenCalledTimes(2);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(1, true);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(2, false);
  });

  it("disarms the quota nag after a replayed prompt is accepted", async () => {
    submitChatMessageMock.mockImplementation(({ setHistory, onAccepted }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onAccepted?: () => void;
    }) => {
      act(() => {
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        onAccepted?.();
      });
    });
    await triggerNaggedPrompt();
    await replayNaggedPrompt("button");
    await submitCommand(rendered!.container, "third prompt");
    expect(submitChatMessageMock).toHaveBeenCalledTimes(3);
    expect(setShowUpgradeMock).toHaveBeenCalledTimes(2);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(1, true);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(2, false);
  });

  it("does not let an earlier accepted prompt clear a different queued nag replay", async () => {
    submitChatMessageMock.mockImplementation(() => {});
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    shouldShowNagMock.mockReturnValueOnce(true);
    await submitCommand(rendered.container, "retry me");

    const firstRequest = submitChatMessageMock.mock.calls[0]?.[0] as {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onAccepted?: () => void;
    };
    await act(async () => {
      firstRequest.setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
      firstRequest.onAccepted?.();
    });

    await replayNaggedPrompt("button");
    expect(submitChatMessageMock.mock.calls[1]?.[0]?.chatMessages.at(-1)?.content).toBe("retry me");
  });

  it("keeps a quota-armed nag latched until the replayed prompt is accepted", async () => {
    isFreeUserMock.mockReturnValue(true);
    submitChatMessageMock.mockImplementationOnce(({ setHistory, onQuotaUpdate, onAccepted }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onQuotaUpdate?: (quotaPercent: number) => void;
      onAccepted?: () => void;
    }) => {
      act(() => {
        onQuotaUpdate?.(0);
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        onAccepted?.();
      });
    }).mockImplementation(({ setHistory, onAccepted }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onAccepted?: () => void;
    }) => {
      act(() => {
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        onAccepted?.();
      });
    });

    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    await submitCommand(rendered.container, "second prompt");

    expect(setShowUpgradeMock).toHaveBeenCalledWith(true);
    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);

    await replayNaggedPrompt("button");
    await submitCommand(rendered!.container, "third prompt");

    expect(submitChatMessageMock).toHaveBeenCalledTimes(3);
    expect(setShowUpgradeMock).toHaveBeenCalledTimes(2);
  });
});
