import { OVERLAY_STATE_KEYS, type OverlayState } from "../hooks/useOverlays";

export type OverlayVisibility = OverlayState;

export function isAnyOverlayOpen(overlays: OverlayVisibility) {
  return OVERLAY_STATE_KEYS.some((key) => overlays[key]);
}

export function getPromptString(activeRegression: string | null) {
  return activeRegression === "windows_prompt" ? "C:\\WINDOWS\\system32>" : "❯ ";
}
