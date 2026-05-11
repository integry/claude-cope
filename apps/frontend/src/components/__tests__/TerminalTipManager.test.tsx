// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupRenderedTerminal,
  commitAcceptedPrompt,
  getHistoryContents,
  getInput,
  renderTerminal,
  submitCommand,
  type RenderedTerminal,
} from "./TerminalTipManager.testUtils";
import {
  createBuildSprintCallbacksModule,
  createChatApiModule,
  createConfigModule,
  createProfileSyncModule,
  createSlashCommandExecutorModule,
  createTerminalHandlersModule,
  createTerminalInputHandlersModule,
  createTerminalViewUtilsModule,
  createUseMultiplayerModule,
  createUseSoundEffectsModule,
  createUseTerminalEffectsModule,
  createUseTipManagerModule,
} from "./TerminalTipManager.mockSetup";

const {
  executeSlashCommandMock,
  recordConversationRoundMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
  rollbackMessageWithoutTicketMocks,
  submitChatMessageMock,
  shouldShowNagMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  recordConversationRoundMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
  rollbackMessageWithoutTicketMocks: [] as Array<ReturnType<typeof vi.fn>>,
  submitChatMessageMock: vi.fn(),
  shouldShowNagMock: vi.fn(() => false),
}));

vi.mock("../../config", () => createConfigModule());
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: () => false }));
vi.mock("../chatApi", () => createChatApiModule(submitChatMessageMock));
vi.mock("../slashCommandExecutor", () => createSlashCommandExecutorModule(executeSlashCommandMock));
vi.mock("../../hooks/profileSync", () => createProfileSyncModule());
vi.mock("../keyCommandHandler", () => ({ handleKeyCommand: vi.fn() }));
vi.mock("../ticketPrompt", () => ({ fetchRandomTicketPrompt: vi.fn() }));
vi.mock("../filterChatHistory", () => ({ filterChatHistory: (history: unknown[]) => history }));
vi.mock("../../hooks/useMultiplayer", () => createUseMultiplayerModule());
vi.mock("../../hooks/useTerminalEffects", () => createUseTerminalEffectsModule());
vi.mock("../../hooks/useSoundEffects", () => createUseSoundEffectsModule());
vi.mock("../../hooks/usePingAcknowledged", () => ({ usePingAcknowledged: () => false }));
vi.mock("../../hooks/useOverlays", async () => (await import("./TerminalTipManager.testUtils")).createUseOverlaysModule()());
vi.mock("../../hooks/useTipManager", () => createUseTipManagerModule({
  recordConversationRoundMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: vi.fn() }));
vi.mock("../buildChatSubmitArgs", () => createBuildSprintCallbacksModule());
vi.mock("../terminalHandlers", () => createTerminalHandlersModule());
vi.mock("../../hooks/useTerminalKeyboard", async () => (await import("./TerminalTipManager.testUtils")).createUseTerminalKeyboardModule());
vi.mock("../terminalInputHandlers", () => createTerminalInputHandlersModule());
vi.mock("../winrarNag", () => ({
  shouldShowNag: shouldShowNagMock,
}));
vi.mock("../TerminalView", async () => (await import("./TerminalTipManager.testUtils")).createTerminalViewModule());
vi.mock("../terminalViewUtils", () => createTerminalViewUtilsModule());
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
    recordConversationRoundMock.mockReset();
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
    submitChatMessageMock.mockImplementation(({ setHistory, onAccepted, scheduleHistoryCommitCallback }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onAccepted?: () => void;
      scheduleHistoryCommitCallback?: (callback: () => void) => void;
    }) => {
      act(() => {
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        scheduleHistoryCommitCallback?.(() => onAccepted?.());
      });
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");
    expect(submitChatMessageMock.mock.calls[0]?.[0]?.onAccepted).toEqual(expect.any(Function));
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    expect(recordValidCommandMock).not.toHaveBeenCalled();
  });

  it("marks a conversation round only after the accepted prompt commits", async () => {
    submitChatMessageMock.mockImplementation(({ setHistory, onAccepted, scheduleHistoryCommitCallback }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onAccepted?: () => void;
      scheduleHistoryCommitCallback?: (callback: () => void) => void;
    }) => {
      act(() => {
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        scheduleHistoryCommitCallback?.(() => onAccepted?.());
      });
    });

    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "ship it");

    expect(recordConversationRoundMock).toHaveBeenCalledTimes(1);
  });

  it("aborts all overlapping in-flight prompts on Escape", async () => {
    submitChatMessageMock.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      signal.addEventListener("abort", () => {});
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    await submitCommand(rendered.container, "second prompt");
    await vi.advanceTimersByTimeAsync(0);

    const input = getInput(rendered.container);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);
    expect(rollbackMessageWithoutTicketMocks[0]).toHaveBeenCalledTimes(1);
    expect(rollbackMessageWithoutTicketMocks[1]).toHaveBeenCalledTimes(1);
  });

  it("keeps Escape aborting later prompts after an earlier overlapping prompt finishes", async () => {
    submitChatMessageMock.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      signal.addEventListener("abort", () => {});
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    await submitCommand(rendered.container, "second prompt");

    const firstRequest = submitChatMessageMock.mock.calls[0]?.[0] as { setIsProcessing: (value: boolean) => void };
    expect(firstRequest.setIsProcessing).toEqual(expect.any(Function));

    await act(async () => {
      firstRequest.setIsProcessing(false);
    });

    const input = getInput(rendered.container);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(rollbackMessageWithoutTicketMocks[0]).not.toHaveBeenCalled();
    expect(rollbackMessageWithoutTicketMocks[1]).toHaveBeenCalledTimes(1);
  });

  it("does not leak prompt processing when a request toggles processing true more than once", async () => {
    submitChatMessageMock.mockImplementation(() => {});
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");

    const firstRequest = submitChatMessageMock.mock.calls[0]?.[0] as { setIsProcessing: (value: boolean) => void };
    await act(async () => {
      firstRequest.setIsProcessing(true);
      firstRequest.setIsProcessing(true);
      firstRequest.setIsProcessing(false);
    });

    await submitCommand(rendered.container, "second prompt");
    expect(submitChatMessageMock).toHaveBeenCalledTimes(2);
  });

  it("settles backlog accounting per prompt when submissions overlap", async () => {
    submitChatMessageMock.mockImplementation(() => {});
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "first prompt");
    await submitCommand(rendered.container, "second prompt");
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);

    const firstRequest = submitChatMessageMock.mock.calls[0]?.[0] as { onAccepted?: () => void };
    const secondRequest = submitChatMessageMock.mock.calls[1]?.[0] as { onError?: () => void };
    expect(firstRequest.onAccepted).toEqual(expect.any(Function));
    await commitAcceptedPrompt(submitChatMessageMock, 0);
    secondRequest.onError?.();

    expect(rollbackMessageWithoutTicketMocks[0]).not.toHaveBeenCalled();
    expect(rollbackMessageWithoutTicketMocks[1]).toHaveBeenCalledTimes(1);
  });

  it("removes only the failing duplicate prompt when quota exhaustion hits overlapping submissions", async () => {
    submitChatMessageMock.mockImplementationOnce(() => {}).mockImplementationOnce(({ onQuotaExhausted }: { onQuotaExhausted?: () => void }) => {
      onQuotaExhausted?.();
    });
    rendered = await renderTerminal(Terminal);
    await submitCommand(rendered.container, "duplicate prompt");
    await submitCommand(rendered.container, "duplicate prompt");

    await commitAcceptedPrompt(submitChatMessageMock, 0);

    expect(submitChatMessageMock).toHaveBeenCalledTimes(2);
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);
    expect(rollbackMessageWithoutTicketMocks[0]).not.toHaveBeenCalled();
    expect(rollbackMessageWithoutTicketMocks[1]).toHaveBeenCalledTimes(1);
    expect(getHistoryContents(rendered.container, "user")).toEqual(["duplicate prompt"]);
    expect(getHistoryContents(rendered.container, "loading")).toEqual([]);
    expect(getHistoryContents(rendered.container, "system")).toEqual(["accepted"]);
    expect(rendered.container.querySelector("[data-role='user']")?.getAttribute("data-message-id")).toBe("0");
    expect(getInput(rendered.container).value).toBe("");
  });
});
