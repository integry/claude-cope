import { shouldUseNativeShareFlowForDevice } from "./shareButtonNativeShare";

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return uaData.platform.toLowerCase().includes("mac");
  return /mac/i.test(navigator.platform || "");
}

export function supportsNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function getTransientUserActivationState(): boolean | null {
  if (typeof navigator === "undefined") return null;
  const activation = (navigator as Navigator & { userActivation?: { isActive?: boolean } }).userActivation;
  return typeof activation?.isActive === "boolean" ? activation.isActive : null;
}

export function shouldUseNativeShareFlow(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  return shouldUseNativeShareFlowForDevice({
    supportsNativeShare: supportsNativeShare(),
    userAgentDataMobile: uaData.userAgentData?.mobile,
    userAgent: navigator.userAgent || "",
    maxTouchPoints: navigator.maxTouchPoints,
  });
}
