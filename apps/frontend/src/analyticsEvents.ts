/** Centralised analytics event names — prevents typo drift across call sites. */
export const AnalyticsEvents = {
  GENERATOR_PURCHASED: "generator_purchased",
  UPGRADE_PURCHASED: "upgrade_purchased",
  THEME_PURCHASED: "theme_purchased",
  SLASH_COMMAND_ATTEMPTED: "slash_command_attempted",
  SLASH_COMMAND_FAILED: "slash_command_failed",
  ACCOUNT_RESTORED: "account_restored",
  ACCOUNT_UPGRADED: "account_upgraded",
} as const;
