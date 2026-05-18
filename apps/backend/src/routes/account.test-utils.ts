import { vi } from "vitest";
import app from "../app";

export function parseCheckoutKeyClaimBindings(bindings: unknown[]) {
  const checkoutId = bindings.at(-1);
  const incomingClaims = bindings
    .slice(0, -2)
    .reduce<Array<{ licenseKeyHash: string; isExecutiveSupporter: number }>>((claims, value, index, values) => {
      if (index % 2 !== 0) return claims;
      const isExecutiveSupporter = values[index + 1];
      if (typeof value !== "string" || typeof isExecutiveSupporter !== "number") return claims;
      claims.push({ licenseKeyHash: value, isExecutiveSupporter });
      return claims;
    }, []);
  return {
    checkoutId: typeof checkoutId === "string" ? checkoutId : null,
    incomingClaims,
  };
}

export function createMockDB(opts: {
  firstResults?: Record<string, unknown>;
  firstBySQL?: Record<string, Record<string, unknown> | null>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const checkoutClaims = new Map<string, { sessionId?: string; encryptedKeys: string | null; isExecutiveSupporter: number }>();
  const keyOwners = new Map<string, { checkoutId: string; isExecutiveSupporter: number }>();
  const resolveFirst = (sql: string, bindings: unknown[]) => {
    if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims WHERE checkout_id = ?")) {
      const checkoutId = bindings[0] as string;
      if (!checkoutClaims.has(checkoutId)) return null;
      const claim = checkoutClaims.get(checkoutId)!;
      return { session_id: claim.sessionId ?? null, encrypted_keys: claim.encryptedKeys ?? null };
    }
    if (sql.includes("SELECT encrypted_keys FROM checkout_claims WHERE checkout_id = ?")) {
      const checkoutId = bindings[0] as string;
      if (!checkoutClaims.has(checkoutId)) return null;
      return { encrypted_keys: checkoutClaims.get(checkoutId)?.encryptedKeys ?? null };
    }
    if (sql.includes("SELECT ckc.checkout_id FROM checkout_key_claims ckc JOIN checkout_claims cc")) {
      const [licenseKeyHash, sessionId] = bindings as [string, string];
      const claim = keyOwners.get(licenseKeyHash);
      if (!claim) return null;
      const checkoutClaim = checkoutClaims.get(claim.checkoutId);
      if (!checkoutClaim || checkoutClaim.sessionId !== sessionId || checkoutClaim.isExecutiveSupporter !== 1) return null;
      return { checkout_id: claim.checkoutId };
    }
    if (sql.includes("SELECT license_key_hash FROM checkout_key_claims WHERE checkout_id = ? AND is_executive_supporter = 1")) {
      const checkoutId = bindings[0] as string;
      for (const [licenseKeyHash, owner] of keyOwners.entries()) {
        if (owner.checkoutId === checkoutId && owner.isExecutiveSupporter === 1) return { license_key_hash: licenseKeyHash };
      }
      return null;
    }
    if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims WHERE license_key_hash = ?")) {
      const licenseKeyHash = bindings[0] as string;
      const claim = keyOwners.get(licenseKeyHash);
      return claim ? { is_executive_supporter: claim.isExecutiveSupporter } : null;
    }
    if (opts.firstBySQL) {
      for (const [pattern, result] of Object.entries(opts.firstBySQL)) {
        if (sql.includes(pattern)) return result;
      }
    }
    return opts.firstResults ?? null;
  };
  const createStatement = (sql: string, bindings: unknown[]) => {
    const statement = {
      bind: vi.fn((...args: unknown[]) => {
        calls.push({ sql, bindings: args });
        return createStatement(sql, args);
      }),
      first: vi.fn().mockResolvedValue(resolveFirst(sql, bindings)),
      run: vi.fn().mockImplementation(async () => {
      if (sql.includes("INSERT INTO checkout_claims")) {
        const [checkoutId, sessionId, , isExecutiveSupporter] = bindings as [string, string, string | null, number];
        if (checkoutClaims.has(checkoutId)) return { meta: { changes: 0 } };
        checkoutClaims.set(checkoutId, { sessionId, encryptedKeys: null, isExecutiveSupporter: isExecutiveSupporter ?? 0 });
        return { meta: { changes: 1 } };
      }
      if (sql.includes("UPDATE checkout_claims SET is_executive_supporter = 1")) {
        const [checkoutId, sessionId] = bindings as [string, string];
        const claim = checkoutClaims.get(checkoutId);
        if (!claim || claim.sessionId !== sessionId) return { meta: { changes: 0 } };
        claim.isExecutiveSupporter = 1;
        return { meta: { changes: 1 } };
      }
      if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
        const [encryptedKeys, checkoutId] = bindings as [string, string];
        const claim = checkoutClaims.get(checkoutId);
        if (!claim) return { meta: { changes: 0 } };
        claim.encryptedKeys = encryptedKeys;
        return { meta: { changes: opts.runChanges ?? 1 } };
      }
      if (sql.includes("UPDATE checkout_key_claims SET is_executive_supporter = CASE WHEN license_key_hash = ? THEN 1 ELSE 0 END")) {
        const [licenseKeyHash, checkoutId] = bindings as [string, string];
        const hasExistingSupporter = Array.from(keyOwners.values()).some((owner) => owner.checkoutId === checkoutId && owner.isExecutiveSupporter === 1);
        if (hasExistingSupporter) return { meta: { changes: 0 } };
        let updated = 0;
        for (const [ownedLicenseKeyHash, owner] of keyOwners.entries()) {
          if (owner.checkoutId !== checkoutId) continue;
          owner.isExecutiveSupporter = ownedLicenseKeyHash === licenseKeyHash ? 1 : 0;
          updated += 1;
        }
        return { meta: { changes: updated } };
      }
      if (sql.includes("INSERT INTO checkout_key_claims")) {
        const { checkoutId, incomingClaims } = parseCheckoutKeyClaimBindings(bindings);
        if (!checkoutId) return { meta: { changes: 0 } };
        const hasConflict = incomingClaims.some(({ licenseKeyHash }) => keyOwners.has(licenseKeyHash) && keyOwners.get(licenseKeyHash)?.checkoutId !== checkoutId);
        if (hasConflict) return { meta: { changes: 0 } };
        let inserted = 0;
        for (const { licenseKeyHash, isExecutiveSupporter } of incomingClaims) {
          if (keyOwners.has(licenseKeyHash)) continue;
          keyOwners.set(licenseKeyHash, { checkoutId, isExecutiveSupporter });
          inserted += 1;
        }
        return { meta: { changes: inserted } };
      }
      return { meta: { changes: opts.runChanges ?? 0 } };
      }),
      all: vi.fn().mockImplementation(async () => {
      if (sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")) {
        return {
          results: (bindings as string[])
            .filter((licenseKeyHash) => keyOwners.has(licenseKeyHash))
            .map((licenseKeyHash) => ({ license_key_hash: licenseKeyHash, checkout_id: keyOwners.get(licenseKeyHash)!.checkoutId })),
        };
      }
      return { results: [] };
      }),
      raw: vi.fn().mockResolvedValue([]),
    };
    return statement;
  };
  return {
    db: {
      prepare: vi.fn((sql: string) => createStatement(sql, [])),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
      withSession: vi.fn(),
      dump: vi.fn(),
    },
    calls,
  };
}

export function mockKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
}

export function postJSON(path: string, body: unknown, env: Record<string, unknown>) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

export function postRaw(path: string, body: string, env: Record<string, unknown>, sid = "test-session") {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `cope_session_id=${sid}` },
    body,
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

export function postWithSession(path: string, body: unknown, env: Record<string, unknown>, sid = "test-session") {
  return app.request(path, { method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `cope_session_id=${sid}` },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

export function getWithSession(path: string, env: Record<string, unknown>) {
  return app.request(path, { headers: { Cookie: "cope_session_id=test-session" } },
    { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

export const BASE_PROFILE = { username: "alice", license_hash: "hash", total_td: 1000, current_td: 1000,
  corporate_rank: "CTO", display_rank: null, inventory: "{}", upgrades: "[]", achievements: "[]", is_executive_supporter: 0, buddy_type: null,
  buddy_is_shiny: 0, unlocked_themes: '["default"]', active_theme: "default", active_ticket: null,
  td_multiplier: 1 };

export function profileWithHash(hash: string) {
  return { ...BASE_PROFILE, license_hash: hash };
}

export function ownedMockDB(opts: { runChanges?: number } = {}) {
  return createMockDB({
    firstBySQL: {
      "SELECT username": BASE_PROFILE,
      "SELECT status": { status: "active" },
    },
    runChanges: opts.runChanges ?? 1,
  });
}

export const GEN_BODY = { username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash" };
