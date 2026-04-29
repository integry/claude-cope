/** Centralised analytics event names — prevents typo drift across call sites. */
export const AnalyticsEvents = {
  GENERATOR_PURCHASED: "generator_purchased",
  UPGRADE_PURCHASED: "upgrade_purchased",
  THEME_PURCHASED: "theme_purchased",
  SLASH_COMMAND_ATTEMPTED: "slash_command_attempted",
  SLASH_COMMAND_FAILED: "slash_command_failed",
  ACCOUNT_RESTORED: "account_restored",
  ACCOUNT_UPGRADED: "account_upgraded",
  SHILL_COMPLETED: "shill_completed",
} as const;

/** Centralised slash-command failure reasons to prevent reporting drift. */
export const SlashCommandFailureReasons = {
  ALREADY_ACTIVE: "already_active",
  DISABLED: "disabled",
  INSUFFICIENT_TD: "insufficient_td",
  INVALID_CHARACTERS: "invalid_characters",
  LOCKED: "locked",
  NETWORK_ERROR: "network_error",
  NO_ARGUMENT: "no_argument",
  NO_BUDDY: "no_buddy",
  NO_KEY: "no_key",
  NO_OFFER: "no_offer",
  NO_TICKET: "no_ticket",
  NOT_FOUND: "not_found",
  SERVER_ERROR: "server_error",
  TAKEN: "taken",
  TOO_LONG: "too_long",
  TOO_SHORT: "too_short",
  UNAVAILABLE: "unavailable",
  UNKNOWN_COMMAND: "unknown_command",
  UNKNOWN_THEME: "unknown_theme",
  VALIDATION_FAILED: "validation_failed",
} as const;

export type SlashCommandFailureReason =
  typeof SlashCommandFailureReasons[keyof typeof SlashCommandFailureReasons];
