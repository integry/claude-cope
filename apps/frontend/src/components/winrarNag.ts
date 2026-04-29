/**
 * WinRAR nag helper (issue #736).
 *
 * Determines whether the WinRAR-style upgrade nag should be shown.
 * Extracted so both the component and tests can share the same logic.
 */
export function shouldShowNag(
  effectiveApiKey: string | undefined,
  proKey: string | undefined,
  proKeyHash: string | undefined,
  quotaPercent: number,
): boolean {
  return !effectiveApiKey && !proKey && !proKeyHash && quotaPercent <= 0;
}
