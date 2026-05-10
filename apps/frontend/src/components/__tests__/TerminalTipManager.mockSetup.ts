import { vi } from "vitest";

export function createConfigModule() {
  return {
    BYOK_ENABLED: false,
    TICKET_REFINE_ENABLED: false,
  };
}

export function createChatApiModule(submitChatMessageMock: ReturnType<typeof vi.fn>) {
  return {
    computeBuddyInterjection: () => null,
    mergeSuggestedReply: (_prev: string | null, next: string) => next,
    submitChatMessage: submitChatMessageMock,
  };
}

export function createSlashCommandExecutorModule(executeSlashCommandMock: ReturnType<typeof vi.fn>) {
  return {
    executeSlashCommand: executeSlashCommandMock,
  };
}

export function createProfileSyncModule() {
  return {
    applyAuthoritativeProfile: (prev: unknown) => prev,
    applyServerProfile: (prev: unknown) => prev,
    settlePendingCompletedRewards: (prev: unknown) => prev,
  };
}

export function createUseMultiplayerModule() {
  return {
    useMultiplayer: () => ({
      onlineCount: 0,
      onlineUsers: [],
      sendPing: vi.fn(),
      pendingReviewPing: null,
      acceptReviewPing: vi.fn(),
      outageHp: null,
      sendDamage: vi.fn(),
    }),
  };
}

export function createUseTerminalEffectsModule() {
  return {
    useTerminalEffects: () => ({ isBooting: false, regressionGlitch: null, activeRegression: null }),
  };
}

export function createUseSoundEffectsModule() {
  return {
    useSoundEffects: () => ({ playError: vi.fn(), playChime: vi.fn() }),
  };
}

export function createUseTipManagerModule({
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
}: {
  recordEnterMock: ReturnType<typeof vi.fn>;
  recordValidCommandMock: ReturnType<typeof vi.fn>;
  recordMessageWithoutTicketMock: ReturnType<typeof vi.fn>;
}) {
  return {
    useTipManager: () => ({
      recordEnter: recordEnterMock,
      recordValidCommand: recordValidCommandMock,
      recordMessageWithoutTicket: (...args: unknown[]) => recordMessageWithoutTicketMock(...args),
    }),
  };
}

export function createBuildSprintCallbacksModule() {
  return {
    buildSprintCallbacks: () => ({
      onSprintProgress: vi.fn(),
      getSprintCompleteMessage: vi.fn(),
    }),
  };
}

export function createTerminalHandlersModule() {
  return {
    triggerQuotaLockout: vi.fn(),
    triggerInstantBan: vi.fn(),
  };
}

export function createTerminalInputHandlersModule() {
  return {
    handleBragSubmit: vi.fn(),
    handleBuddyConfirm: vi.fn(),
    tryOutageDamage: () => false,
  };
}

export function createTerminalViewUtilsModule() {
  return {
    getPromptString: () => ">",
    isAnyOverlayOpen: () => false,
  };
}
