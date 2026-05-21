// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type React from "react";
import {
  cleanupRenderedTerminal,
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
  createUseMultiplayerModule,
  createUseSoundEffectsModule,
  createUseTerminalEffectsModule,
  createUseTipManagerModule,
} from "./TerminalTipManager.mockSetup";

const {
  executeSlashCommandMock,
  isMobileViewportRef,
  recordConversationRoundMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
  renderGrowthControlRef,
  submitChatMessageMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  isMobileViewportRef: { current: false },
  recordConversationRoundMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
  renderGrowthControlRef: {
    current: () => {
      throw new Error("assistant render growth control is not ready");
    },
  } as { current: () => void },
  submitChatMessageMock: vi.fn(),
}));

vi.mock("../../config", () => createConfigModule());
vi.mock("../../hooks/gameStateUtils", () => ({
  calculateActiveMultiplier: () => 1,
  isFreeUser: () => false,
  isPaidUser: () => false,
}));
vi.mock("../chatApi", () => createChatApiModule(submitChatMessageMock));
vi.mock("../slashCommands", () => ({
  getSlashMenuItems: () => [],
  resolveSlashMenuSelection: (command: string) => ({
    mode: "input",
    value: command,
    nextQuery: command,
  }),
}));
vi.mock("../slashCommandExecutor", () => createSlashCommandExecutorModule(executeSlashCommandMock));
vi.mock("../../hooks/profileSync", () => createProfileSyncModule());
vi.mock("../keyCommandHandler", () => ({ handleKeyCommand: vi.fn(async () => false) }));
vi.mock("../ticketPrompt", () => ({ fetchRandomTicketPrompt: vi.fn() }));
vi.mock("../filterChatHistory", () => ({ filterChatHistory: (history: unknown[]) => history }));
vi.mock("../../hooks/useMultiplayer", () => ({
  ...createUseMultiplayerModule(),
  useMultiplayer: () => ({
    ...createUseMultiplayerModule().useMultiplayer(),
    activeOutageScenario: null,
  }),
}));
vi.mock("../../hooks/useTerminalEffects", () => createUseTerminalEffectsModule());
vi.mock("../../hooks/useSoundEffects", () => createUseSoundEffectsModule());
vi.mock("../../hooks/usePingAcknowledged", () => ({ usePingAcknowledged: () => false }));
vi.mock("../../hooks/useOverlays", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../hooks/useOverlays")>();
  const mocked = await (await import("./TerminalTipManager.testUtils")).createUseOverlaysModule()();
  return {
    ...actual,
    ...mocked,
  };
});
vi.mock("../../hooks/useTipManager", () => createUseTipManagerModule({
  recordConversationRoundMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: vi.fn(async () => true) }));
vi.mock("../buildChatSubmitArgs", () => createBuildSprintCallbacksModule());
vi.mock("../terminalHandlers", () => createTerminalHandlersModule());
vi.mock("../../hooks/useTerminalKeyboard", async () => (await import("./TerminalTipManager.testUtils")).createUseTerminalKeyboardModule());
vi.mock("../terminalInputHandlers", () => createTerminalInputHandlersModule());
vi.mock("../winrarNag", () => ({ shouldShowNag: () => false }));
vi.mock("../useIsMobileViewport", () => ({
  useIsMobileViewport: () => isMobileViewportRef.current,
}));
vi.mock("../useCheckoutLicenseSync", () => ({ useCheckoutLicenseSync: vi.fn() }));
vi.mock("../../hooks/useGameState", async () => (await import("./TerminalTipManager.testUtils")).createUseGameStateModule()());
vi.mock("../CommandLine", async () => {
  const React = await import("react");
  return {
    default: React.forwardRef<HTMLInputElement, {
      value: string;
      disabled?: boolean;
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      placeholder?: string;
    }>(function MockCommandLine({ value, disabled, onChange, onKeyDown, placeholder }, ref) {
      return (
        <input
          ref={ref}
          aria-label="terminal-input"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          onInput={(event) => onChange(event as unknown as React.ChangeEvent<HTMLInputElement>)}
          onKeyDown={onKeyDown}
        />
      );
    }),
  };
});
vi.mock("../SlashMenu", () => ({ default: () => null }));
vi.mock("../HeaderBar", () => ({ default: () => null }));
vi.mock("../TerminalFooter", () => ({ TerminalFooter: () => null }));
vi.mock("../Ticker", () => ({ default: () => null }));
vi.mock("../OutageBar", () => ({ OutageBar: () => null }));
vi.mock("../SprintProgressBar", () => ({ default: () => null }));
vi.mock("../TerminalOverlays", () => ({ TerminalOverlays: () => null }));
vi.mock("../BuddyOverlay", () => ({ BuddyOverlay: () => null }));
vi.mock("../MessageList", async () => {
  const React = await import("react");
  return {
    default: ({
      history,
      messageKeys,
    }: {
      history: Array<{ id?: number; role: string; content: string }>;
      messageKeys: number[];
    }) => {
      const [expanded, setExpanded] = React.useState(false);
      renderGrowthControlRef.current = () => setExpanded(true);

      React.useEffect(() => {
        if (!history.some((message) => message.role === "system")) {
          setExpanded(false);
        }
      }, [history]);

      return (
        <div data-testid="message-list">
          {history.map((message, index) => (
            <div key={messageKeys[index] ?? index} data-message-key={messageKeys[index] ?? index}>
              <div data-role={message.role}>{message.content}</div>
              {message.role === "system" ? (
                <div data-testid="assistant-rendered" data-expanded={expanded ? "true" : "false"}>
                  {expanded ? "final reply with extra rendered lines" : "final reply"}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      );
    },
  };
});

import Terminal from "../Terminal";

type ScrollHarness = {
  viewport: HTMLDivElement;
  metrics: {
    contentHeight: number;
    scrollTop: number;
    viewportHeight: number;
  };
};

let rendered: RenderedTerminal | null = null;
let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;

function createRect(height: number): DOMRect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height,
    top: 0,
    right: 0,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function installScrollHarness(container: HTMLDivElement): ScrollHarness {
  const viewport = container.querySelector('[data-terminal-scroll-viewport="true"]') as HTMLDivElement | null;
  const content = container.querySelector('[data-terminal-scroll-content="true"]') as HTMLDivElement | null;

  if (!viewport || !content) {
    throw new Error("terminal scroll elements not found");
  }

  const metrics = {
    contentHeight: 120,
    scrollTop: 0,
    viewportHeight: 80,
  };

  Object.defineProperty(viewport, "scrollHeight", {
    configurable: true,
    get: () => metrics.contentHeight,
  });
  Object.defineProperty(viewport, "clientHeight", {
    configurable: true,
    get: () => metrics.viewportHeight,
  });
  Object.defineProperty(viewport, "scrollTop", {
    configurable: true,
    get: () => metrics.scrollTop,
    set: (value: number) => {
      metrics.scrollTop = value;
    },
  });
  viewport.getBoundingClientRect = () => createRect(metrics.viewportHeight);

  Object.defineProperty(content, "scrollHeight", {
    configurable: true,
    get: () => metrics.contentHeight,
  });
  Object.defineProperty(content, "offsetHeight", {
    configurable: true,
    get: () => metrics.contentHeight,
  });
  content.getBoundingClientRect = () => createRect(metrics.contentHeight);

  return { viewport, metrics };
}

describe("Terminal desktop scroll orchestration", () => {
  beforeEach(() => {
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof globalThis.requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn();
    executeSlashCommandMock.mockReset();
    isMobileViewportRef.current = false;
    recordConversationRoundMock.mockReset();
    recordEnterMock.mockReset();
    recordValidCommandMock.mockReset();
    recordMessageWithoutTicketMock.mockReset();
    recordMessageWithoutTicketMock.mockReturnValue(vi.fn());
    renderGrowthControlRef.current = () => {
      throw new Error("assistant render growth control is not ready");
    };
    submitChatMessageMock.mockReset();
    submitChatMessageMock.mockImplementation(({
      setHistory,
      setIsProcessing,
    }: {
      setHistory: (updater: (prev: Array<{ id?: number; role: string; content: string }>) => Array<{ id?: number; role: string; content: string }>) => void;
      setIsProcessing: (value: boolean) => void;
    }) => {
      act(() => {
        setHistory((prev) => [
          ...prev.filter((message) => message.role !== "loading"),
          { id: 999, role: "system", content: "final reply" },
        ]);
        setIsProcessing(false);
      });
    });
  });

  afterEach(() => {
    cleanupRenderedTerminal(rendered);
    rendered = null;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    vi.clearAllMocks();
  });

  it("keeps desktop pinned to the bottom while the final assistant render keeps growing after processing stops", async () => {
    rendered = await renderTerminal(Terminal);
    const { viewport, metrics } = installScrollHarness(rendered.container);

    metrics.contentHeight = 180;
    await submitCommand(rendered.container, "ship it");

    expect(getInput(rendered.container).disabled).toBe(false);
    expect(viewport.scrollTop).toBe(180);

    await act(async () => {
      metrics.contentHeight = 320;
      renderGrowthControlRef.current();
      globalThis.__triggerResizeObserver?.();
    });

    expect(viewport.scrollTop).toBe(320);
  });

  it("does not force mobile terminals to the bottom when the rendered reply grows", async () => {
    isMobileViewportRef.current = true;
    rendered = await renderTerminal(Terminal);
    const { viewport, metrics } = installScrollHarness(rendered.container);

    metrics.contentHeight = 180;
    await submitCommand(rendered.container, "ship it");

    metrics.scrollTop = 24;

    await act(async () => {
      metrics.contentHeight = 320;
      renderGrowthControlRef.current();
      globalThis.__triggerResizeObserver?.();
    });

    expect(viewport.scrollTop).toBe(24);
  });
});
