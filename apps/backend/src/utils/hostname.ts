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

function isValidIpv6(value: string): boolean {
  // Accept bracketed IPv6 (e.g. [::1]) — extract the inner address
  const match = IPV6_BRACKET_PATTERN.exec(value);
  const addr = match ? match[1]! : value;
  // Basic structural check: 1-8 groups of hex separated by colons, with optional :: shorthand
  if (!/^[0-9a-f:]+$/i.test(addr)) return false;
  if (addr.includes(":::")) return false;
  const doubleColonCount = (addr.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;
  const groups = addr.split(":");
  if (doubleColonCount === 0 && groups.length !== 8) return false;
  if (doubleColonCount === 1 && groups.length > 8) return false;
  return groups.every((g) => g.length <= 4);
}

export const normalizeHostname = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(",") || trimmed.includes("/") || /\s/.test(trimmed)) {
    return undefined;
  }

  // Handle bracketed IPv6 with optional port: [::1]:8080
  const bracketMatch = /^\[([^\]]+)\](?::(\d+))?$/.exec(trimmed);
  if (bracketMatch) {
    const ipv6Addr = bracketMatch[1]!;
    if (!isValidIpv6(ipv6Addr)) return undefined;
    const port = bracketMatch[2];
    if (port) {
      const portNumber = Number(port);
      if (!/^\d{1,5}$/.test(port) || !Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65_535) {
        return undefined;
      }
    }
    return ipv6Addr.toLowerCase();
  }

  const parts = trimmed.split(":");
  if (parts.length > 2) {
    // Could be bare IPv6 like ::1
    if (isValidIpv6(trimmed)) return trimmed.toLowerCase();
    return undefined;
  }
  const [hostname, port] = parts;
  if (!hostname) return undefined;

  // Check IPv4 first, then DNS hostname
  const looksLikeIpv4 = IPV4_PATTERN.test(hostname);
  if (looksLikeIpv4) {
    if (!isValidIpv4(hostname)) return undefined;
  } else if (!HOSTNAME_PATTERN.test(hostname)) {
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
