const HOSTNAME_PATTERN = /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*)$/i;

export const normalizeHostname = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(",") || trimmed.includes("/") || /\s/.test(trimmed)) {
    return undefined;
  }
  const parts = trimmed.split(":");
  if (parts.length > 2) {
    return undefined;
  }
  const [hostname, port] = parts;
  if (!hostname || !HOSTNAME_PATTERN.test(hostname)) {
    return undefined;
  }
  if (port) {
    const portNumber = Number(port);
    if (!/^\d{1,5}$/.test(port) || !Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65_535) {
      return undefined;
    }
  }
  return hostname.toLowerCase();
};

export const getExpectedHostnameConfig = (raw: string | undefined): { hostname?: string; invalid: boolean } => {
  const trimmed = raw?.trim();
  if (!trimmed) return { invalid: false };

  const hostname = normalizeHostname(trimmed);
  if (!hostname) {
    return { invalid: true };
  }
  return { hostname, invalid: false };
};
