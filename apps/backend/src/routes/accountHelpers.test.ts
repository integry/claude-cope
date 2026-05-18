/* eslint-disable max-lines */
import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchLicenseKeys, fetchNextCheckoutCreatedAt, pickAllLicenseKeys, validateActiveTicket, parseCheckoutCache, claimLicenseKeysForCheckout, getStoredClaimedKeys, storeClaimedKeys, fetchCheckoutCustomerId, syncExecutiveSupporterEntitlement, claimExecutiveSupporterForLicenseKey } from "./accountHelpers";
import type { PolarLicenseKeyItem } from "./accountHelpers";
import { parseCheckoutKeyClaimBindings } from "./account.test-utils";
import { hashKey } from "../utils/quota";

const CLAIM_SECRET = "polar-test-secret";

describe("pickAllLicenseKeys", () => {
  const key = (k: string, created_at: string): PolarLicenseKeyItem => ({ key: k, created_at, status: "granted" });

  it("returns empty array for empty input", () => {
    expect(pickAllLicenseKeys([], "2026-01-01T00:00:00Z")).toEqual([]);
  });

  it("returns all eligible keys for team-pack (multiple keys after checkout within window)", () => {
    const checkoutTime = "2026-01-02T00:00:00Z";
    const keys = [
      key("OLD", "2026-01-01T00:00:00Z"),
      key("K1", "2026-01-02T00:00:01Z"),
      key("K2", "2026-01-02T00:00:02Z"),
      key("K3", "2026-01-02T00:00:03Z"),
      key("K4", "2026-01-02T00:00:04Z"),
      key("K5", "2026-01-02T00:00:05Z"),
    ];
    const result = pickAllLicenseKeys(keys, checkoutTime);
    expect(result).toHaveLength(5);
    expect(result.map((k) => k.key)).toEqual(["K1", "K2", "K3", "K4", "K5"]);
  });

  it("returns keys ordered oldest-first", () => {
    const keys = [
      key("C", "2026-01-02T00:02:00Z"),
      key("A", "2026-01-02T00:00:01Z"),
      key("B", "2026-01-02T00:01:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result.map((k) => k.key)).toEqual(["A", "B", "C"]);
  });

  it("returns empty array for invalid checkoutCreatedAt", () => {
    const keys = [key("A", "2026-01-02T00:00:00Z"), key("B", "2026-01-01T00:00:00Z")];
    const result = pickAllLicenseKeys(keys, "not-a-date");
    expect(result).toHaveLength(0);
  });

  it("excludes keys created before checkout", () => {
    const keys = [
      key("BEFORE", "2026-01-01T00:00:00Z"),
      key("AFTER", "2026-01-02T00:01:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("AFTER");
  });

  it("excludes keys created more than 15 minutes after checkout (later purchase)", () => {
    const keys = [
      key("THIS_CHECKOUT", "2026-01-02T00:00:10Z"),
      key("LATER_PURCHASE", "2026-01-02T01:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("THIS_CHECKOUT");
  });

  it("includes keys within the 15-minute window", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:01Z"),
      key("K2", "2026-01-02T00:14:59Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(2);
  });

  it("includes keys between 5 and 15 minutes (widened window)", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:01Z"),
      key("K2", "2026-01-02T00:07:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(2);
  });

  it("falls back to post-checkout keys within 1 hour when none match the primary window", () => {
    const keys = [
      key("DELAYED", "2026-01-02T00:20:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("DELAYED");
  });

  it("does not fall back to keys created more than 1 hour after checkout", () => {
    const keys = [
      key("MUCH_LATER", "2026-01-02T02:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(0);
  });

  it("does not fall back to keys created before checkout", () => {
    const keys = [
      key("OLD", "2026-01-01T00:00:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const keys = [
      key("C", "2026-01-02T00:02:00Z"),
      key("A", "2026-01-02T00:00:01Z"),
      key("B", "2026-01-02T00:01:00Z"),
    ];
    const original = keys.map((k) => k.key);
    pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(keys.map((k) => k.key)).toEqual(original);
  });

  it("narrows window when nextCheckoutCreatedAt is provided", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:10Z"),
      key("K2", "2026-01-02T00:05:10Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", "2026-01-02T00:05:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("K1");
  });

  it("uses default window when nextCheckoutCreatedAt is undefined", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:10Z"),
      key("K2", "2026-01-02T00:05:10Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", undefined);
    expect(result).toHaveLength(2);
  });

  it("narrows fallback window with nextCheckoutCreatedAt", () => {
    const keys = [
      key("DELAYED", "2026-01-02T00:20:00Z"),
      key("NEXT_PURCHASE", "2026-01-02T00:35:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", "2026-01-02T00:30:00Z");
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe("DELAYED");
  });

  it("ignores invalid nextCheckoutCreatedAt", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:10Z"),
      key("K2", "2026-01-02T00:05:10Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", "not-a-date");
    expect(result).toHaveLength(2);
  });

  it("excludes a key minted exactly at the next checkout timestamp", () => {
    const keys = [
      key("K1", "2026-01-02T00:00:10Z"),
      key("NEXT", "2026-01-02T00:05:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", "2026-01-02T00:05:00Z");
    expect(result.map((k) => k.key)).toEqual(["K1"]);
  });

  it("excludes a delayed fallback key minted exactly at the next checkout timestamp", () => {
    const keys = [
      key("DELAYED", "2026-01-02T00:20:00Z"),
      key("NEXT", "2026-01-02T00:30:00Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z", "2026-01-02T00:30:00Z");
    expect(result.map((k) => k.key)).toEqual(["DELAYED"]);
  });

  it("fails closed on a second delayed mint cluster when no later checkout boundary is known", () => {
    const keys = [
      key("A1", "2026-01-02T00:20:00Z"),
      key("A2", "2026-01-02T00:20:30Z"),
      key("B1", "2026-01-02T00:35:00Z"),
      key("B2", "2026-01-02T00:35:20Z"),
    ];
    const result = pickAllLicenseKeys(keys, "2026-01-02T00:00:00Z");
    expect(result.map((k) => k.key)).toEqual(["A1", "A2"]);
  });
});

describe("fetchLicenseKeys", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("keeps paginating past three pages until it reaches the checkout window", async () => {
    const pageItems = new Map<number, PolarLicenseKeyItem[]>([
      [1, Array.from({ length: 100 }, (_, i) => ({ key: `NEW-${i}`, created_at: `2026-01-05T00:${String(i % 60).padStart(2, "0")}:00Z`, status: "granted" }))],
      [2, Array.from({ length: 100 }, (_, i) => ({ key: `MID-${i}`, created_at: `2026-01-04T00:${String(i % 60).padStart(2, "0")}:00Z`, status: "granted" }))],
      [3, Array.from({ length: 100 }, (_, i) => ({ key: `OLDER-${i}`, created_at: `2026-01-03T00:${String(i % 60).padStart(2, "0")}:00Z`, status: "granted" }))],
      [4, [
        { key: "TARGET-1", created_at: "2026-01-02T00:00:10Z", status: "granted" },
        { key: "TARGET-2", created_at: "2026-01-02T00:00:20Z", status: "granted" },
        { key: "TOO-OLD", created_at: "2026-01-01T23:59:59Z", status: "granted" },
      ]],
    ]);
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" ? input : input.toString());
      const page = Number(url.searchParams.get("page") ?? "1");
      return new Response(JSON.stringify({ items: pageItems.get(page) ?? [] }));
    }) as typeof fetch;

    const result = await fetchLicenseKeys("cust", "org", "tok", { createdAt: "2026-01-02T00:00:00Z" });
    expect("keys" in result && result.keys).toEqual(["TARGET-1", "TARGET-2"]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });
});

describe("fetchNextCheckoutCreatedAt", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("finds the next succeeded checkout even when the later purchase has not been claimed locally", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      items: [
        { id: "co_b", created_at: "2026-01-02T00:05:00Z", status: "succeeded" },
        { id: "co_a", created_at: "2026-01-02T00:00:00Z", status: "succeeded" },
      ],
    }))) as typeof fetch;

    const result = await fetchNextCheckoutCreatedAt("cust", "org", "tok", {
      checkoutId: "co_a",
      checkoutCreatedAt: "2026-01-02T00:00:00Z",
    });

    expect(result).toEqual({ createdAt: "2026-01-02T00:05:00Z" });
  });

  it("returns null when there is no later checkout", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      items: [
        { id: "co_a", created_at: "2026-01-02T00:00:00Z", status: "succeeded" },
        { id: "co_old", created_at: "2026-01-01T23:55:00Z", status: "succeeded" },
      ],
    }))) as typeof fetch;

    const result = await fetchNextCheckoutCreatedAt("cust", "org", "tok", {
      checkoutId: "co_a",
      checkoutCreatedAt: "2026-01-02T00:00:00Z",
    });

    expect(result).toEqual({ createdAt: null });
  });
});

describe("parseCheckoutCache", () => {
  it("parses session-bound cache format", () => {
    const raw = JSON.stringify({ keys: ["K1", "K2"], sessionId: "sess-abc" });
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["K1", "K2"], sessionId: "sess-abc" });
  });

  it("parses legacy JSON array format (no session binding)", () => {
    const raw = JSON.stringify(["COPE-OLD1", "COPE-OLD2"]);
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["COPE-OLD1", "COPE-OLD2"], sessionId: "" });
  });

  it("parses legacy plain string format", () => {
    const result = parseCheckoutCache("COPE-LEGACY");
    expect(result).toEqual({ keys: ["COPE-LEGACY"], sessionId: "" });
  });

  it("returns null for invalid JSON object without keys field", () => {
    const raw = JSON.stringify({ something: "else" });
    expect(parseCheckoutCache(raw)).toBeNull();
  });

  it("treats missing sessionId in object format as empty string", () => {
    const raw = JSON.stringify({ keys: ["K1"] });
    const result = parseCheckoutCache(raw);
    expect(result).toEqual({ keys: ["K1"], sessionId: "" });
  });

  it("returns null for empty keys array", () => {
    expect(parseCheckoutCache(JSON.stringify({ keys: [] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify([]))).toBeNull();
  });

  it("returns null when keys contain non-string or empty values", () => {
    expect(parseCheckoutCache(JSON.stringify({ keys: [123, "K1"] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify({ keys: ["", "K1"] }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify([null, "K1"]))).toBeNull();
  });

  it("returns null when sessionId is not a string", () => {
    expect(parseCheckoutCache(JSON.stringify({ keys: ["K1"], sessionId: {} }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify({ keys: ["K1"], sessionId: 123 }))).toBeNull();
    expect(parseCheckoutCache(JSON.stringify({ keys: ["K1"], sessionId: [] }))).toBeNull();
  });

  it("returns null for empty string input", () => {
    expect(parseCheckoutCache("")).toBeNull();
  });

  it("returns null for corrupted JSON-like strings", () => {
    expect(parseCheckoutCache("{")).toBeNull();
    expect(parseCheckoutCache('{"')).toBeNull();
    expect(parseCheckoutCache("[broken")).toBeNull();
    expect(parseCheckoutCache("not a key!")).toBeNull();
    expect(parseCheckoutCache("has spaces")).toBeNull();
  });

  it("accepts legacy plain key strings with valid characters", () => {
    expect(parseCheckoutCache("COPE-ABC-123")).toEqual({ keys: ["COPE-ABC-123"], sessionId: "" });
    expect(parseCheckoutCache("key_with_underscores")).toEqual({ keys: ["key_with_underscores"], sessionId: "" });
  });
});

describe("checkout key claims", () => {
  it("fails closed when another checkout already owns part of the expected license set", async () => {
    const keyOwners = new Map<string, string>([[await hashKey("COPE-TAKEN"), "other-checkout"]]);
    let storedClaimedKeys: string | null = null;
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            if (sql.includes("INSERT INTO checkout_key_claims")) {
              const { checkoutId, incomingClaims } = parseCheckoutKeyClaimBindings(args);
              const licenseKeyHashes = incomingClaims.map((claim) => claim.licenseKeyHash);
              if (!checkoutId) return { meta: { changes: 0 } };
              const hasConflict = licenseKeyHashes.some((licenseKeyHash) => keyOwners.has(licenseKeyHash) && keyOwners.get(licenseKeyHash) !== checkoutId);
              if (hasConflict) return { meta: { changes: 0 } };
              for (const licenseKeyHash of licenseKeyHashes) {
                if (!keyOwners.has(licenseKeyHash)) keyOwners.set(licenseKeyHash, checkoutId);
              }
              return { meta: { changes: licenseKeyHashes.length } };
            }
            if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
              storedClaimedKeys = args[0] as string;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }),
          first: vi.fn().mockImplementation(async () => {
            if (sql.includes("SELECT encrypted_keys FROM checkout_claims")) return { encrypted_keys: storedClaimedKeys };
            return null;
          }),
          all: vi.fn().mockImplementation(async () => ({
            results: sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")
              ? (args as string[]).map((licenseKeyHash) => keyOwners.has(licenseKeyHash)
                ? { license_key_hash: licenseKeyHash, checkout_id: keyOwners.get(licenseKeyHash)! }
                : null).filter(Boolean)
              : [],
          })),
        })),
      })),
    } as unknown as D1Database;

    const result = await claimLicenseKeysForCheckout(db, {
      checkoutId: "checkout-a",
      keys: ["COPE-1", "COPE-TAKEN", "COPE-2"],
      secret: CLAIM_SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("full license set");
    expect(storedClaimedKeys).toBeNull();
    expect(keyOwners.get(await hashKey("COPE-1"))).toBeUndefined();
    expect(keyOwners.get(await hashKey("COPE-2"))).toBeUndefined();
  });

  it("returns a conflict when every requested key is already claimed elsewhere", async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          first: vi.fn().mockResolvedValue({ encrypted_keys: null }),
          all: vi.fn().mockResolvedValue({
            results: sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")
              ? (args as string[]).map((licenseKeyHash) => ({ license_key_hash: licenseKeyHash, checkout_id: "other-checkout" }))
              : [],
          }),
        })),
      })),
    } as unknown as D1Database;

    const result = await claimLicenseKeysForCheckout(db, {
      checkoutId: "checkout-a",
      keys: ["COPE-X"],
      secret: CLAIM_SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("already claimed");
  });

  it("treats an identical claimed_keys payload as a successful no-op", async () => {
    let encryptedKeys: string | null = null;
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          first: vi.fn().mockResolvedValue(sql.includes("SELECT encrypted_keys FROM checkout_claims")
            ? { encrypted_keys: encryptedKeys }
            : null),
          run: vi.fn().mockImplementation(async () => {
            if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
              encryptedKeys = args[0] as string;
            }
            return { meta: { changes: 0 } };
          }),
        })),
      })),
    } as unknown as D1Database;

    await storeClaimedKeys(db, "checkout-a", ["COPE-1"], CLAIM_SECRET);
    await expect(storeClaimedKeys(db, "checkout-a", ["COPE-1"], CLAIM_SECRET)).resolves.toEqual({ ok: true });
  });

  it("assigns executive supporter only to the designated checkout key", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          first: vi.fn().mockResolvedValue(sql.includes("SELECT encrypted_keys FROM checkout_claims") ? { encrypted_keys: null } : null),
          run: vi.fn().mockImplementation(async () => {
            calls.push({ sql, bindings: args });
            return { meta: { changes: 1 } };
          }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
      })),
    } as unknown as D1Database;

    await claimLicenseKeysForCheckout(db, {
      checkoutId: "checkout-a",
      keys: ["COPE-1", "COPE-2"],
      secret: CLAIM_SECRET,
      executiveSupporterLicenseKey: "COPE-1",
    });

    const claimBindings = calls.find((call) => call.sql.includes("INSERT INTO checkout_key_claims"))?.bindings;
    expect(claimBindings).toBeDefined();
    expect(claimBindings?.slice(0, 4)).toEqual([
      expect.any(String),
      1,
      expect.any(String),
      0,
    ]);
  });

  it("claims executive supporter for an explicitly selected license key", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    let supporterHash: string | null = null;
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          first: vi.fn().mockImplementation(async () => {
            if (sql.includes("FROM checkout_key_claims ckc") && sql.includes("JOIN checkout_claims cc")) {
              return { checkout_id: "checkout-a" };
            }
            if (sql.includes("SELECT license_key_hash FROM checkout_key_claims WHERE checkout_id = ? AND is_executive_supporter = 1")) {
              return supporterHash ? { license_key_hash: supporterHash } : null;
            }
            return null;
          }),
          run: vi.fn().mockImplementation(async () => {
            calls.push({ sql, bindings: args });
            if (sql.includes("UPDATE checkout_key_claims") && sql.includes("SET is_executive_supporter = CASE WHEN license_key_hash = ? THEN 1 ELSE 0 END")) {
              supporterHash = args[0] as string;
            }
            return { meta: { changes: 1 } };
          }),
        })),
      })),
    } as unknown as D1Database;

    const licenseKeyHash = await hashKey("COPE-1");
    await expect(claimExecutiveSupporterForLicenseKey(db, {
      licenseKeyHash,
      sessionId: "session-a",
    })).resolves.toBe(true);

    const updateCall = calls.find((call) => call.sql.includes("UPDATE checkout_key_claims") && call.sql.includes("SET is_executive_supporter = CASE WHEN license_key_hash = ? THEN 1 ELSE 0 END"));
    expect(updateCall?.bindings).toEqual([licenseKeyHash, "checkout-a", "checkout-a"]);
  });

  it("does not claim executive supporter for a different already-assigned checkout key", async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM checkout_key_claims ckc") && sql.includes("JOIN checkout_claims cc")
              ? { checkout_id: "checkout-a" }
              : sql.includes("SELECT license_key_hash FROM checkout_key_claims WHERE checkout_id = ? AND is_executive_supporter = 1")
                ? { license_key_hash: "other-hash" }
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    } as unknown as D1Database;

    await expect(claimExecutiveSupporterForLicenseKey(db, {
      licenseKeyHash: "hash-1",
      sessionId: "session-a",
    })).resolves.toBe(false);
  });

  it("requires the checkout claimant session before assigning executive supporter", async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM checkout_key_claims ckc") && sql.includes("JOIN checkout_claims cc")
              ? null
              : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    } as unknown as D1Database;

    await expect(claimExecutiveSupporterForLicenseKey(db, {
      licenseKeyHash: "hash-1",
      sessionId: "wrong-session",
    })).resolves.toBe(false);
  });

  it("returns stored keys for a previously completed checkout claim", async () => {
    let encryptedKeys: string | null = null;
    const recordingDb = {
      prepare: vi.fn(() => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
        })),
      })),
    } as unknown as D1Database;
    await storeClaimedKeys(recordingDb, "checkout-a", ["COPE-1", "COPE-2"], CLAIM_SECRET);
    const db = {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue({ session_id: "sess-1", encrypted_keys: encryptedKeys }),
        })),
      })),
    } as unknown as D1Database;

    await expect(getStoredClaimedKeys(db, "checkout-a", CLAIM_SECRET)).resolves.toEqual({ ok: true, sessionId: "sess-1", keys: ["COPE-1", "COPE-2"] });
  });

  it("accepts arbitrary claim secret lengths by deriving a fixed AES key", async () => {
    let encryptedKeys: string | null = null;
    const recordingDb = {
      prepare: vi.fn(() => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
          first: vi.fn().mockResolvedValue({ session_id: "sess-1", encrypted_keys: encryptedKeys }),
        })),
      })),
    } as unknown as D1Database;

    await expect(storeClaimedKeys(recordingDb, "checkout-a", ["COPE-1"], "tok")).resolves.toEqual({ ok: true });
    await expect(getStoredClaimedKeys(recordingDb, "checkout-a", "tok")).resolves.toEqual({ ok: true, sessionId: "sess-1", keys: ["COPE-1"] });
  });

  it("supports a rotation window by decrypting with fallback secrets", async () => {
    let encryptedKeys: string | null = null;
    const recordingDb = {
      prepare: vi.fn(() => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
          first: vi.fn().mockResolvedValue({ session_id: "sess-1", encrypted_keys: encryptedKeys }),
        })),
      })),
    } as unknown as D1Database;

    await storeClaimedKeys(recordingDb, "checkout-a", ["COPE-1"], "old-secret");
    await expect(getStoredClaimedKeys(recordingDb, "checkout-a", "new-secret, old-secret")).resolves.toEqual({ ok: true, sessionId: "sess-1", keys: ["COPE-1"] });
  });

  it("marks stored claims unreadable instead of failing hard when the secret no longer matches", async () => {
    let encryptedKeys: string | null = null;
    const recordingDb = {
      prepare: vi.fn(() => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
          first: vi.fn().mockResolvedValue({ session_id: "sess-1", encrypted_keys: encryptedKeys }),
        })),
      })),
    } as unknown as D1Database;

    await storeClaimedKeys(recordingDb, "checkout-a", ["COPE-1"], "old-secret");
    await expect(getStoredClaimedKeys(recordingDb, "checkout-a", "new-secret")).resolves.toEqual({ ok: true, sessionId: "sess-1", keys: null, unreadable: true });
  });

  it("surfaces malformed stored claims instead of treating them like secret rotation", async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue({ session_id: "sess-1", encrypted_keys: "{broken" }),
        })),
      })),
    } as unknown as D1Database;

    await expect(getStoredClaimedKeys(db, "checkout-a", CLAIM_SECRET)).resolves.toEqual({
      ok: false,
      error: "Stored checkout claim is corrupted — please try again later",
    });
  });
});

describe("syncExecutiveSupporterEntitlement", () => {
  it("copies the supporter flag from checkout key claims onto the synced user row and records the activation transition once", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => {
        return {
          sql,
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              sql,
              bindings: args,
              first: vi.fn().mockResolvedValue(sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")
                ? { is_executive_supporter: 1 }
                  : sql.includes("SELECT username, is_executive_supporter FROM user_scores")
                    ? { username: "alice", is_executive_supporter: 0 }
                  : null),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            };
          }),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        };
      }),
      batch: vi.fn().mockResolvedValue([]),
    } as unknown as D1Database;

    await expect(syncExecutiveSupporterEntitlement(db, "hash-123")).resolves.toEqual({
      isExecutiveSupporter: true,
      activatedNow: true,
    });
    const insertCall = calls.find((call) => call.sql.includes("INSERT INTO recent_events"));
    expect(insertCall?.bindings).toEqual([
      "[LIVE] 👑 alice just expensed the Executive Supporter Pack. Respect the grift.",
    ]);
    const updateCall = calls.find((call) => call.sql.includes("UPDATE user_scores"));
    expect(updateCall?.bindings).toEqual(["hash-123"]);
  });

  it("preserves existing supporter state when no supporter claim row is present", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            sql,
            bindings: args,
            first: vi.fn().mockResolvedValue(
              sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")
                ? null
                : sql.includes("SELECT is_executive_supporter FROM user_scores")
                  ? { is_executive_supporter: 1 }
                  : null,
            ),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          };
        }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    } as unknown as D1Database;

    await expect(syncExecutiveSupporterEntitlement(db, "hash-123")).resolves.toEqual({
      isExecutiveSupporter: true,
      activatedNow: false,
    });
    const updateCall = calls.find((call) => call.sql.includes("UPDATE user_scores"));
    expect(updateCall).toBeUndefined();
    expect(calls.some((call) => call.sql.includes("INSERT INTO recent_events"))).toBe(false);
  });

  it("does not record a new activation when the supporter row already existed", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            sql,
            bindings: args,
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")) {
                return { is_executive_supporter: 1 };
              }
              if (sql.includes("SELECT username, is_executive_supporter FROM user_scores")) {
                return { username: "alice", is_executive_supporter: 1 };
              }
              return null;
            }),
            run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          };
        }),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    } as unknown as D1Database;

    await expect(syncExecutiveSupporterEntitlement(db, "hash-123")).resolves.toEqual({
      isExecutiveSupporter: true,
      activatedNow: false,
    });
    expect(calls.some((call) => call.sql.includes("INSERT INTO recent_events"))).toBe(false);
  });

  it("does not emit an activation event for a non-supporter entitlement", async () => {
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            sql,
            bindings: args,
            first: vi.fn().mockResolvedValue(sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")
              ? { is_executive_supporter: 0 }
              : sql.includes("SELECT username, is_executive_supporter FROM user_scores")
                ? { username: "alice", is_executive_supporter: 0 }
                : null),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          };
        }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    } as unknown as D1Database;

    await expect(syncExecutiveSupporterEntitlement(db, "hash-123")).resolves.toEqual({
      isExecutiveSupporter: false,
      activatedNow: false,
    });
    expect(calls.some((call) => call.sql.includes("INSERT INTO recent_events"))).toBe(false);
  });
});

describe("fetchCheckoutCustomerId", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("fails closed when Polar checkout metadata is missing reference_id", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      organization_id: "org",
      status: "succeeded",
      customer_id: "cust-1",
      created_at: "2026-01-02T00:00:00Z",
      metadata: {},
    }))) as typeof fetch;

    await expect(fetchCheckoutCustomerId("co_123", "tok", "org")).resolves.toEqual({
      error: "Checkout is missing session binding metadata — cannot verify license ownership",
      status: 500,
    });
  });

  it("detects executive supporter checkouts from Polar metadata", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      organization_id: "org",
      status: "succeeded",
      customer_id: "cust-1",
      created_at: "2026-01-02T00:00:00Z",
      metadata: { reference_id: "sess-1", product_slug: "executive-supporter" },
    }))) as typeof fetch;

    await expect(fetchCheckoutCustomerId("co_123", "tok", "org")).resolves.toEqual({
      customerId: "cust-1",
      createdAt: "2026-01-02T00:00:00Z",
      referenceId: "sess-1",
      isExecutiveSupporter: true,
    });
  });

  it("detects executive supporter checkouts from richer product labels", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      organization_id: "org",
      status: "succeeded",
      customer_id: "cust-1",
      created_at: "2026-01-02T00:00:00Z",
      metadata: { reference_id: "sess-1", product_name: "Executive Supporter - 5 Licenses" },
    }))) as typeof fetch;

    await expect(fetchCheckoutCustomerId("co_123", "tok", "org")).resolves.toEqual({
      customerId: "cust-1",
      createdAt: "2026-01-02T00:00:00Z",
      referenceId: "sess-1",
      isExecutiveSupporter: true,
    });
  });

  it("does not infer executive supporter from unrelated suffixed labels", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      organization_id: "org",
      status: "succeeded",
      customer_id: "cust-1",
      created_at: "2026-01-02T00:00:00Z",
      metadata: { reference_id: "sess-1", product_name: "Non Executive Supporter Bundle" },
    }))) as typeof fetch;

    await expect(fetchCheckoutCustomerId("co_123", "tok", "org")).resolves.toEqual({
      customerId: "cust-1",
      createdAt: "2026-01-02T00:00:00Z",
      referenceId: "sess-1",
      isExecutiveSupporter: false,
    });
  });

  it("detects executive supporter checkouts from an explicit metadata flag", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      organization_id: "org",
      status: "succeeded",
      customer_id: "cust-1",
      created_at: "2026-01-02T00:00:00Z",
      metadata: { reference_id: "sess-1", is_executive_supporter: true },
    }))) as typeof fetch;

    await expect(fetchCheckoutCustomerId("co_123", "tok", "org")).resolves.toEqual({
      customerId: "cust-1",
      createdAt: "2026-01-02T00:00:00Z",
      referenceId: "sess-1",
      isExecutiveSupporter: true,
    });
  });
});

describe("validateActiveTicket", () => {
  it("returns null for null input", () => {
    expect(validateActiveTicket(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(validateActiveTicket(undefined)).toBeNull();
  });

  it("returns error for non-object", () => {
    expect(validateActiveTicket("string")).toContain("must be an object");
  });

  it("returns null for valid ticket", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix bug", sprintProgress: 3, sprintGoal: 10 })).toBeNull();
  });

  it("rejects sprintProgress exceeding sprintGoal", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: 11, sprintGoal: 10 })).toContain("cannot exceed");
  });

  it("rejects negative sprintProgress", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: -1, sprintGoal: 10 })).toContain("sprintProgress");
  });

  it("rejects zero sprintGoal", () => {
    expect(validateActiveTicket({ id: "t1", title: "Fix", sprintProgress: 0, sprintGoal: 0 })).toContain("sprintGoal");
  });
});
