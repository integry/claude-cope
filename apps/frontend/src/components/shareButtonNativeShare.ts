export type NativeShareDeviceInfo = {
  supportsNativeShare: boolean;
  userAgentDataMobile?: boolean;
  userAgent: string;
};

export function shouldUseNativeShareFlowForDevice(device: NativeShareDeviceInfo): boolean {
  if (!device.supportsNativeShare) return false;
  if (device.userAgentDataMobile === true) return true;
  if (device.userAgentDataMobile === false) return false;
  return /android|iphone|ipad|ipod|mobile/i.test(device.userAgent);
}

export function isNativeShareCancellation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error && typeof error.name === "string" ? error.name : "";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  if (name === "AbortError") return true;
  if (name !== "NotAllowedError") return false;
  return /\b(share|sharing)\b/i.test(message) && /\b(cancelled|canceled|dismissed)\b/i.test(message);
}
