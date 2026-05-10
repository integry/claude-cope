const BUDDY_OVERLAY_LEFT_PADDING = 12;
const BUDDY_OVERLAY_TOP_PADDING = 12;
const BUDDY_OVERLAY_MIN_SCALE = 0.35;

export function clampBuddyScale(scale: number) {
  return Math.max(BUDDY_OVERLAY_MIN_SCALE, Math.min(1, scale));
}

export function getBuddyOverlayScale({
  containerWidth,
  containerHeight,
  rightInset,
  bottomOffset,
  overlayWidth,
  overlayHeight,
}: {
  containerWidth: number;
  containerHeight: number;
  rightInset: number;
  bottomOffset: number;
  overlayWidth: number;
  overlayHeight: number;
}) {
  const widthScale =
    overlayWidth > 0
      ? clampBuddyScale(
          (containerWidth - rightInset - BUDDY_OVERLAY_LEFT_PADDING) /
            overlayWidth,
        )
      : 1;
  const heightScale =
    overlayHeight > 0
      ? clampBuddyScale(
          (containerHeight - bottomOffset - BUDDY_OVERLAY_TOP_PADDING) /
            overlayHeight,
        )
      : 1;

  return Math.min(widthScale, heightScale);
}
