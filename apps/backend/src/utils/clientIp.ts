type HeaderSource = { header: (name: string) => string | undefined };

export function getClientIp(headers: HeaderSource): string {
  const cfIp = headers.header("cf-connecting-ip");
  if (cfIp) return cfIp;

  return (
    headers.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.header("x-real-ip") ??
    "unknown"
  );
}
