import type { OverlayState } from "../hooks/useOverlays";

export type OverlayVisibility = OverlayState;

export function isAnyOverlayOpen(overlays: OverlayVisibility) {
  return Object.values(overlays).some(Boolean);
}

export function getPromptString(activeRegression: string | null) {
  return activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";
}
