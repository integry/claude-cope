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

vi.mock("../../config", () => createConfigModule());
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: isFreeUserMock }));
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
vi.mock("../../hooks/useOverlays", async () => (await import("./TerminalTipManager.testUtils")).createUseOverlaysModule((value) => setShowUpgradeMock(value))());
vi.mock("../../hooks/useTipManager", () => createUseTipManagerModule({
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: runFreeTierDelayMock }));
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

async function commitAcceptedPrompt(callIndex: number) {
  const request = submitChatMessageMock.mock.calls[callIndex]?.[0] as {
    setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
    onAccepted?: () => void;
    scheduleHistoryCommitCallback?: (callback: () => void) => void;
  };
  await act(async () => {
    request.setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
    request.scheduleHistoryCommitCallback?.(() => request.onAccepted?.());
    await Promise.resolve();
  });
}

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

    await commitAcceptedPrompt(0);

    await replayNaggedPrompt("button");
    expect(submitChatMessageMock.mock.calls[1]?.[0]?.chatMessages.at(-1)?.content).toBe("retry me");
  });

  it("keeps a quota-armed nag latched until the replayed prompt is accepted", async () => {
    isFreeUserMock.mockReturnValue(true);
    submitChatMessageMock.mockImplementationOnce(({ setHistory, onQuotaUpdate, onAccepted, scheduleHistoryCommitCallback }: {
      setHistory: (updater: (prev: unknown[]) => unknown[]) => void;
      onQuotaUpdate?: (quotaPercent: number) => void;
      onAccepted?: () => void;
      scheduleHistoryCommitCallback?: (callback: () => void) => void;
    }) => {
      act(() => {
        onQuotaUpdate?.(0);
        setHistory((prev) => [...prev, { role: "system", content: "accepted" }]);
        scheduleHistoryCommitCallback?.(() => onAccepted?.());
      });
    }).mockImplementation(({ setHistory, onAccepted, scheduleHistoryCommitCallback }: {
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
