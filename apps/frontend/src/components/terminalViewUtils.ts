export type OverlayVisibility = {
  showStore: boolean;
  showLeaderboard: boolean;
  showAchievements: boolean;
  showSynergize: boolean;
  showHelp: boolean;
  showAbout: boolean;
  showPrivacy: boolean;
  showTerms: boolean;
  showContact: boolean;
  showProfile: boolean;
  showParty: boolean;
  showUpgrade: boolean;
};

export function isAnyOverlayOpen(overlays: OverlayVisibility) {
  return Object.values(overlays).some(Boolean);
}

export function getPromptString(activeRegression: string | null) {
  return activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";
}
