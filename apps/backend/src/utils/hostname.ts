function hasInvalidCharacters(value: string): boolean {
  return !value || value.includes(",") || value.includes("/") || /\s/.test(value);
}

function isBareIpv6Literal(value: string): boolean {
  return value.includes(":") && !value.startsWith("[") && value.split(":").length > 2;
}

function toUrlHost(value: string): string {
  return isBareIpv6Literal(value) ? `[${value}]` : value;
}

function parseHostname(value: string): URL | undefined {
  try {
    return new URL(`http://${toUrlHost(value)}`);
  } catch {
    return undefined;
  }
}

function stripIpv6Brackets(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
}

function getExplicitPort(value: string): string | undefined {
  if (value.startsWith("[")) {
    const match = /^\[[^\]]+\](?::([^:]+))?$/.exec(value);
    return match?.[1];
  }
  if (isBareIpv6Literal(value)) {
    return undefined;
  }
  const parts = value.split(":");
  return parts.length === 2 ? parts[1] : undefined;
}

function isValidPort(port: string): boolean {
  if (!/^\d{1,5}$/.test(port)) return false;
  const portNumber = Number(port);
  return Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65_535;
}

function isValidIpv4(hostname: string): boolean {
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return false;
  return hostname.split(".").every((octet) => {
    const n = Number(octet);
    return n >= 0 && n <= 255;
  });
}

function isValidIpv6(hostname: string): boolean {
  try {
    const parsed = new URL(`http://[${hostname}]`);
    return stripIpv6Brackets(parsed.hostname.toLowerCase()) === hostname.toLowerCase();
  } catch {
    return false;
  }
}

const HOSTNAME_PATTERN = /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*)$/i;

function isValidHostname(hostname: string): boolean {
  if (hostname.includes(":")) return isValidIpv6(hostname);
  if (/^\d+(?:\.\d+){3}$/.test(hostname)) return isValidIpv4(hostname);
  return HOSTNAME_PATTERN.test(hostname);
}

function hasInvalidParsedComponents(url: URL): boolean {
  return (
    url.protocol !== "http:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  );
}

export const normalizeHostname = (value: string | undefined, preservePort = false): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (hasInvalidCharacters(trimmed)) return undefined;
  const explicitPort = getExplicitPort(trimmed);
  if (explicitPort && !isValidPort(explicitPort)) return undefined;

  const parsed = parseHostname(trimmed);
  if (!parsed || hasInvalidParsedComponents(parsed) || !parsed.hostname) {
    return undefined;
  }

  const hostname = stripIpv6Brackets(parsed.hostname.toLowerCase());
  if (!isValidHostname(hostname)) {
    return undefined;
  }
  const port = parsed.port;
  if (!preservePort || !port) {
    return hostname;
  }

  const host = parsed.host.toLowerCase();
  return host.startsWith("[") ? host : `${hostname}:${port}`;
};

export const getExpectedHostnameConfig = (raw: string | undefined): { hostname?: string; invalid: boolean } => {
  const trimmed = raw?.trim();
  if (!trimmed) return { invalid: false };

  // Validate the full value (including port syntax) but return only the
  // hostname for comparison. Cloudflare's siteverify API returns the bare
  // hostname without a port, so a port in the config is accepted for
  // convenience but cannot be enforced at verification time.
  const hostname = normalizeHostname(trimmed);
  if (!hostname) {
    return { invalid: true };
  }
  return { hostname, invalid: false };
};
