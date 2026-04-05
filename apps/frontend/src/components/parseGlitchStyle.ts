export function parseGlitchStyle(regressionGlitch: string | null | undefined) {
  if (!regressionGlitch) return undefined;
  return Object.fromEntries(
    regressionGlitch.split(";").filter(Boolean).map((s) => {
      const [k, ...v] = s.split(":");
      return [k!.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(":").trim()];
    })
  );
}
