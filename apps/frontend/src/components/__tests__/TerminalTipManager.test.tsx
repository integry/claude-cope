// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupRenderedTerminal,
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
  rollbackMessageWithoutTicketMocks,
  submitChatMessageMock,
  shouldShowNagMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
  rollbackMessageWithoutTicketMocks: [] as Array<ReturnType<typeof vi.fn>>,
  submitChatMessageMock: vi.fn(),
  shouldShowNagMock: vi.fn(() => false),
}));

vi.mock("../../config", () => ({
  BYOK_ENABLED: false,
  TICKET_REFINE_ENABLED: false,
}));
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: () => false }));
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
vi.mock("../../hooks/useOverlays", async () => (await import("./TerminalTipManager.testUtils")).createUseOverlaysModule()());
vi.mock("../../hooks/useTipManager", () => ({
  useTipManager: () => ({
    recordEnter: recordEnterMock,
    recordValidCommand: recordValidCommandMock,
    recordMessageWithoutTicket: (...args: unknown[]) => recordMessageWithoutTicketMock(...args),
  }),
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: vi.fn() }));
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

describe("Terminal tip-manager wiring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T00:00:00.000Z"));
    rollbackMessageWithoutTicketMocks.length = 0;
    recordMessageWithoutTicketMock.mockImplementation(() => {
      const rollback = vi.fn();
      rollbackMessageWithoutTicketMocks.push(rollback);
      return rollback;
    });
    executeSlashCommandMock.mockImplementation((command: string, ctx: { onValidSlashCommand?: (baseCommand: string) => void }) => {
      ctx.onValidSlashCommand?.(command.trim());
    });
    submitChatMessageMock.mockReset();
    shouldShowNagMock.mockReset();
    shouldShowNagMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanupRenderedTerminal(rendered);
    rendered = null;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("does not let /clear repopulate the terminal through tip-manager callbacks", async () => {
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "/clear");
    expect(recordEnterMock).toHaveBeenCalledTimes(1);
    expect(recordValidCommandMock).toHaveBeenCalledWith("/clear", { suppressTip: true });
    expect(recordMessageWithoutTicketMock).not.toHaveBeenCalled();
  });

  it("does not count slash commands toward backlog reminders", async () => {
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "/help");
    expect(recordValidCommandMock).toHaveBeenCalledWith("/help");
    expect(recordMessageWithoutTicketMock).not.toHaveBeenCalled();
  });

  it("counts prompt submissions toward backlog reminders before the reply succeeds", async () => {
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
  });

  it("rolls back backlog reminders when the prompt fails generically", async () => {
    submitChatMessageMock.mockImplementation(({ onError }: { onError?: () => void }) => {
      onError?.();
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    expect(rollbackMessageWithoutTicketMocks[0]).toHaveBeenCalledTimes(1);
  });

  it("rolls back backlog reminders when an in-flight prompt is aborted", async () => {
    submitChatMessageMock.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      signal.addEventListener("abort", () => {});
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");
    await vi.advanceTimersByTimeAsync(0);
    const input = getInput(rendered.container);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    expect(rollbackMessageWithoutTicketMocks[0]).toHaveBeenCalledTimes(1);
  });

  it("does not count accepted chat prompts toward slash-command milestone tips", async () => {
    submitChatMessageMock.mockImplementation(({ onAccepted }: { onAccepted?: () => void }) => {
      onAccepted?.();
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");
    expect(submitChatMessageMock.mock.calls[0]?.[0]?.onAccepted).toEqual(expect.any(Function));
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    expect(recordValidCommandMock).not.toHaveBeenCalled();
  });

  it("settles backlog accounting per prompt when submissions overlap", async () => {
    submitChatMessageMock.mockImplementation(() => {});
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    await submitCommand(rendered.container, "second prompt");
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);

    const firstRequest = submitChatMessageMock.mock.calls[0]?.[0] as { onAccepted?: () => void };
    const secondRequest = submitChatMessageMock.mock.calls[1]?.[0] as { onError?: () => void };
    firstRequest.onAccepted?.();
    secondRequest.onError?.();

    expect(rollbackMessageWithoutTicketMocks[0]).not.toHaveBeenCalled();
    expect(rollbackMessageWithoutTicketMocks[1]).toHaveBeenCalledTimes(1);
  });
});
