const HOSTNAME_PATTERN = /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*)$/i;
const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_BRACKET_PATTERN = /^\[([^\]]+)\]$/;

function isValidIpv4(value: string): boolean {
  if (!IPV4_PATTERN.test(value)) return false;
  return value.split(".").every((octet) => {
    const n = Number(octet);
    return n >= 0 && n <= 255;
  });
}

function isValidIpv6Prefix(prefix: string): boolean {
  if (!/^[0-9a-f:]+$/i.test(prefix)) return false;
  if (prefix.includes(":::")) return false;
  const doubleColonCount = (prefix.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;
  const groups = prefix.split(":").filter((g) => g !== "");
  if (doubleColonCount === 0 && groups.length !== 6) return false;
  if (doubleColonCount === 1 && groups.length > 6) return false;
  return groups.every((g) => g.length <= 4 && /^[0-9a-f]+$/i.test(g));
}

function isValidPureIpv6(addr: string): boolean {
  if (!/^[0-9a-f:]+$/i.test(addr)) return false;
  if (addr.includes(":::")) return false;
  if (addr.startsWith(":") && !addr.startsWith("::")) return false;
  if (addr.endsWith(":") && !addr.endsWith("::")) return false;
  const doubleColonCount = (addr.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;
  const groups = addr.split(":");
  if (doubleColonCount === 0 && groups.length !== 8) return false;
  if (doubleColonCount === 1 && groups.length > 8) return false;
  return groups.every((g) => g.length <= 4 && (g.length === 0 || /^[0-9a-f]+$/i.test(g)));
}

function isValidIpv6(value: string): boolean {
  const match = IPV6_BRACKET_PATTERN.exec(value);
  const addr = match ? match[1]! : value;

  // Check for IPv4-mapped/compatible suffix (e.g. ::ffff:127.0.0.1)
  const lastColon = addr.lastIndexOf(":");
  if (lastColon !== -1) {
    const suffix = addr.slice(lastColon + 1);
    if (IPV4_PATTERN.test(suffix) && isValidIpv4(suffix)) {
      return isValidIpv6Prefix(addr.slice(0, lastColon + 1));
    }
  }

  return isValidPureIpv6(addr);
}

function isValidPort(port: string): boolean {
  const portNumber = Number(port);
  return /^\d{1,5}$/.test(port) && Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65_535;
}

function hasInvalidCharacters(value: string): boolean {
  return !value || value.includes(",") || value.includes("/") || /\s/.test(value);
}

function normalizeBracketedIpv6(trimmed: string, preservePort: boolean): string | undefined | null {
  const bracketMatch = /^\[([^\]]+)\](?::(\d+))?$/.exec(trimmed);
  if (!bracketMatch) return null;
  const ipv6Addr = bracketMatch[1]!;
  if (!isValidIpv6(ipv6Addr)) return undefined;
  const port = bracketMatch[2];
  if (port && !isValidPort(port)) return undefined;
  const base = ipv6Addr.toLowerCase();
  return preservePort && port ? `[${base}]:${port}` : base;
}

function normalizeHostOrIpv4(parts: string[], preservePort: boolean): string | undefined {
  const [hostname, port] = parts;
  if (!hostname) return undefined;

  const looksLikeIpv4 = IPV4_PATTERN.test(hostname);
  if (looksLikeIpv4) {
    if (!isValidIpv4(hostname)) return undefined;
  } else if (!HOSTNAME_PATTERN.test(hostname)) {
    return undefined;
  }
  if (port && !isValidPort(port)) return undefined;
  const base = hostname.toLowerCase();
  return preservePort && port ? `${base}:${port}` : base;
}

export const normalizeHostname = (value: string | undefined, preservePort = false): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (hasInvalidCharacters(trimmed)) return undefined;

  const bracketResult = normalizeBracketedIpv6(trimmed, preservePort);
  if (bracketResult !== null) return bracketResult;

  const parts = trimmed.split(":");
  if (parts.length > 2) {
    return isValidIpv6(trimmed) ? trimmed.toLowerCase() : undefined;
  }
  return normalizeHostOrIpv4(parts, preservePort);
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
