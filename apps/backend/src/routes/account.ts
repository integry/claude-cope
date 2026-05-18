/* eslint-disable max-lines */
import { Hono } from "hono";
import type { Context } from "hono";
import { getQuotaLimits, getQuotaPercent } from "../utils/quota";
import { getProfile, getProfileRowByAccountId, rowToProfile, isLicenseActive } from "../utils/profile";
import { GENERATORS, UPGRADES, THEMES, ALIAS_CHANGES_PER_DAY, calcBulkCost, FREE_TIER_RANK_CAP, PROMOTE_ACCESS_DENIED_MESSAGE, SUPPORTER_VANITY_TITLES } from "../gameConstants";
import { resolveProfile, verifyOwnership, resolveThemePurchaseOwnership, resolveThemeSelectionOwnership, broadcastPurchase, validateSyncRequest, commitSyncSideEffects, validateActiveTicket, validateAlias, performAliasDbUpdate, ACTIVE_LICENSE_EXISTS_SQL, rollbackProfileMutation, accountKvKeys, fetchLicenseKeys, fetchCheckoutCustomerId, fetchNextCheckoutCreatedAt, parseCheckoutCache, claimCheckoutForSession, getStoredClaimedKeys, claimLicenseKeysForCheckout, resolveSessionProfileRow, SESSION_USERNAME_TTL_SECONDS, RENAME_REDIRECT_TTL_SECONDS, syncExecutiveSupporterEntitlement, claimExecutiveSupporterForLicenseKey } from "./accountHelpers";
import type { CheckoutCache } from "./accountHelpers";
import { ACHIEVEMENT_IDS } from "@claude-cope/shared/achievements";
import { BUDDY_TYPE_SET } from "@claude-cope/shared/buddies";
import { issueFreeAccountCookie } from "../utils/freeAccountIdentity";

type Env = {
  Bindings: {
    DB?: D1Database;
    QUOTA_KV?: KVNamespace;
    USAGE_KV?: KVNamespace;
    CHECKOUT_CLAIM_SECRET?: string;
    POLAR_ACCESS_TOKEN?: string;
    POLAR_ORGANIZATION_ID?: string;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
    FREE_ACCOUNT_COOKIE_SECRET?: string;
  };
  Variables: {
    sessionId: string;
    freeAccountId?: string;
  };
};
const SHILL_CREDIT = 5;

const account = new Hono<Env>();

async function lookupCheckoutCache(
  kv: KVNamespace,
  checkoutId: string,
  sessionId: string,
): Promise<{ keys: string[]; sessionMismatch?: boolean; requiresStoredClaim?: boolean } | null> {
  const cached = await kv.get(`checkout_used:${checkoutId}`);
  if (!cached) return null;
  const entry = parseCheckoutCache(cached);
  if (!entry) {
    await kv.delete(`checkout_used:${checkoutId}`).catch(() => undefined);
    return null;
  }
  if (!entry.sessionId) return { keys: entry.keys, requiresStoredClaim: true };
  return entry.sessionId !== sessionId ? { keys: entry.keys, sessionMismatch: true } : { keys: entry.keys };
}

async function validateCheckoutRequest(c: { req: { json: <T>() => Promise<T> }; get: (key: string) => string; env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response }) {
  let body: { checkoutId?: string };
  try {
    body = await c.req.json<{ checkoutId?: string }>();
  } catch {
    return { error: c.json({ error: "Invalid JSON body" }, 400) } as const;
  }
  if (!body.checkoutId) return { error: c.json({ error: "checkoutId is required" }, 400) } as const;
  if (!/^[\w-]{4,128}$/.test(body.checkoutId)) return { error: c.json({ error: "Invalid checkoutId format" }, 400) } as const;
  const sessionId = c.get("sessionId");
  if (!sessionId) return { error: c.json({ error: "Session required" }, 401) } as const;
  return { checkoutId: body.checkoutId, sessionId, kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV } as const;
}

function respondWithClaimedKeys(c: { json: (data: unknown, status?: number) => Response }, keys: string[]) {
  return c.json({ licenseKey: keys[0], allKeys: keys });
}

async function cacheClaimedKeys(kv: KVNamespace | undefined, checkoutId: string, sessionId: string, keys: string[]) {
  if (!kv) return;
  await kv.put(`checkout_used:${checkoutId}`, JSON.stringify({ keys, sessionId } satisfies CheckoutCache), { expirationTtl: 7 * 24 * 60 * 60 }).catch(() => undefined);
}

async function respondWithStoredClaim(
  c: { json: (data: unknown, status?: number) => Response },
  claim: { kv: KVNamespace | undefined; checkoutId: string; sessionId: string; keys: string[] },
) {
  await cacheClaimedKeys(claim.kv, claim.checkoutId, claim.sessionId, claim.keys);
  return respondWithClaimedKeys(c, claim.keys);
}

type CheckoutClaimLookup =
  | { status: "miss" }
  | { status: "cached"; keys: string[]; sessionMismatch: boolean; requiresStoredClaim: boolean };

type CachedOrStoredClaimResolution = {
  response: Response | null;
  allowMissingReferenceBinding: boolean;
};

async function resolveCachedClaim(
  deps: { kv: KVNamespace | undefined; checkoutId: string; sessionId: string },
): Promise<CheckoutClaimLookup> {
  const { kv, checkoutId, sessionId } = deps;
  if (!kv) return { status: "miss" };
  const cacheResult = await lookupCheckoutCache(kv, checkoutId, sessionId);
  if (!cacheResult) return { status: "miss" };
  return {
    status: "cached",
    keys: cacheResult.keys,
    sessionMismatch: Boolean(cacheResult.sessionMismatch),
    requiresStoredClaim: Boolean(cacheResult.requiresStoredClaim),
  };
}

async function resolveCachedOrStoredClaim(
  c: { json: (data: unknown, status?: number) => Response },
  deps: { db?: D1Database; kv: KVNamespace | undefined; checkoutId: string; sessionId: string; claimSecret: string; cacheLookup?: CheckoutClaimLookup },
): Promise<CachedOrStoredClaimResolution> {
  const { db, kv, checkoutId, sessionId, claimSecret } = deps;
  const cachedClaim = deps.cacheLookup ?? await resolveCachedClaim({ kv, checkoutId, sessionId });
  if (!db) {
    if (cachedClaim.status === "cached" && cachedClaim.sessionMismatch) {
      return {
        response: c.json({ error: "This checkout was already redeemed by another session" }, 403),
        allowMissingReferenceBinding: false,
      };
    }
    if (cachedClaim.status === "cached" && !cachedClaim.requiresStoredClaim) {
      return { response: respondWithClaimedKeys(c, cachedClaim.keys), allowMissingReferenceBinding: false };
    }
    return { response: null, allowMissingReferenceBinding: false };
  }
  const storedClaim = await getStoredClaimedKeys(db, checkoutId, claimSecret);
  if (!storedClaim.ok) {
    return { response: c.json({ error: storedClaim.error }, 503), allowMissingReferenceBinding: false };
  }
  if (storedClaim.sessionId && storedClaim.sessionId !== sessionId) {
    return {
      response: c.json({ error: "This checkout was already redeemed by another session" }, 403),
      allowMissingReferenceBinding: false,
    };
  }
  if (storedClaim.keys?.length) {
    return {
      response: await respondWithStoredClaim(c, { kv, checkoutId, sessionId, keys: storedClaim.keys }),
      allowMissingReferenceBinding: false,
    };
  }
  if (cachedClaim.status === "cached" && !cachedClaim.requiresStoredClaim) {
    if (cachedClaim.sessionMismatch) {
      return {
        response: c.json({ error: "This checkout was already redeemed by another session" }, 403),
        allowMissingReferenceBinding: false,
      };
    }
    return { response: respondWithClaimedKeys(c, cachedClaim.keys), allowMissingReferenceBinding: false };
  }
  return {
    response: null,
    allowMissingReferenceBinding: Boolean(storedClaim.unreadable && storedClaim.sessionId === sessionId),
  };
}

function validateCheckoutOwnership(
  c: { json: (data: unknown, status?: number) => Response },
  opts: {
    referenceId: string | null;
    sessionId: string;
    allowMissingReferenceBinding?: boolean;
  },
) {
  const { referenceId, sessionId, allowMissingReferenceBinding } = opts;
  if (referenceId && referenceId !== sessionId) {
    return c.json({ error: "This checkout belongs to a different session" }, 403);
  }
  if (!referenceId && !allowMissingReferenceBinding) {
    return c.json({ error: "Checkout is missing session binding metadata — cannot verify license ownership" }, 500);
  }
  return null;
}

function mapClaimedKeysError(
  c: { json: (data: unknown, status?: number) => Response },
  error: string,
) {
  const isConflict = error.includes("already claimed") || error.includes("full license set");
  return c.json({ error }, isConflict ? 409 : 503);
}

async function resolveCheckoutRedemptionContext(
  c: { env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response },
  deps: { checkoutId: string; sessionId: string; allowMissingReferenceBinding?: boolean },
): Promise<
  | { customerId: string; checkoutCreatedAt: string; isExecutiveSupporter: boolean }
  | { response: Response }
> {
  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID;
  if (!accessToken || !organizationId) {
    return { response: c.json({ error: "Polar integration is not configured" }, 500) };
  }

  const result = await fetchCheckoutCustomerId(deps.checkoutId, accessToken, organizationId, {
    allowMissingReferenceId: Boolean(deps.allowMissingReferenceBinding),
  });
  if ("error" in result) {
    return { response: c.json({ error: result.error }, result.status) };
  }

  const ownershipError = validateCheckoutOwnership(c, {
    referenceId: result.referenceId ?? null,
    sessionId: deps.sessionId,
    allowMissingReferenceBinding: deps.allowMissingReferenceBinding,
  });
  if (ownershipError) return { response: ownershipError };
  if (!result.createdAt) {
    return { response: c.json({ error: "Checkout is missing creation timestamp — cannot verify license ownership" }, 500) };
  }

  return {
    customerId: result.customerId,
    checkoutCreatedAt: result.createdAt,
    isExecutiveSupporter: result.isExecutiveSupporter,
  };
}

async function redeemCheckoutLicense(
  c: { env?: Env["Bindings"]; json: (data: unknown, status?: number) => Response },
  deps: { db: D1Database; kv: KVNamespace | undefined; checkoutId: string; sessionId: string; claimSecret: string; allowMissingReferenceBinding?: boolean },
) {
  const { db, kv, checkoutId, sessionId, claimSecret } = deps;
  const redemptionContext = await resolveCheckoutRedemptionContext(c, deps);
  if ("response" in redemptionContext) return redemptionContext.response;

  const accessToken = c.env?.POLAR_ACCESS_TOKEN as string;
  const organizationId = c.env?.POLAR_ORGANIZATION_ID as string;
  const { customerId, checkoutCreatedAt, isExecutiveSupporter } = redemptionContext;
  const claim = await claimCheckoutForSession(db, checkoutId, sessionId, {
    checkoutCreatedAt,
    isExecutiveSupporter,
  });
  if (!claim.ok) return c.json({ error: claim.error }, claim.retriable ? 503 : 403);
  const postClaimResolution = await resolveCachedOrStoredClaim(c, {
    db, kv, checkoutId, sessionId, claimSecret, cacheLookup: { status: "cached", keys: [], sessionMismatch: false, requiresStoredClaim: true },
  });
  if (postClaimResolution.response) return postClaimResolution.response;
  const nextCheckout = await fetchNextCheckoutCreatedAt(customerId, organizationId, accessToken, { checkoutId, checkoutCreatedAt });
  if ("error" in nextCheckout) return c.json({ error: nextCheckout.error }, nextCheckout.status);
  const lkResult = await fetchLicenseKeys(customerId, organizationId, accessToken, { createdAt: checkoutCreatedAt, nextCheckoutCreatedAt: nextCheckout.createdAt ?? undefined });
  if ("error" in lkResult) return c.json({ error: lkResult.error }, lkResult.status);
  const claimedKeys = await claimLicenseKeysForCheckout(db, {
    checkoutId,
    keys: lkResult.keys,
    secret: claimSecret,
  });
  if (!claimedKeys.ok) return mapClaimedKeysError(c, claimedKeys.error);
  return respondWithStoredClaim(c, { kv, checkoutId, sessionId, keys: claimedKeys.keys });
}


function normalizeFreeTierRank(row: unknown, isPro: boolean) {
  if (!row || isPro) return row;

  const typedRow = row as {
    corporate_rank: string;
    display_rank?: string | null;
    is_executive_supporter?: number;
  };
  const nextCorporateRank = typedRow.corporate_rank === FREE_TIER_RANK_CAP
    ? typedRow.corporate_rank
    : FREE_TIER_RANK_CAP;
  const nextDisplayRank = null;
  const nextExecutiveSupporter = 0;

  if (
    typedRow.corporate_rank === nextCorporateRank &&
    typedRow.display_rank === nextDisplayRank &&
    typedRow.is_executive_supporter === nextExecutiveSupporter
  ) {
    return row;
  }

  return {
    ...(row as Record<string, unknown>),
    corporate_rank: nextCorporateRank,
    display_rank: nextDisplayRank,
    is_executive_supporter: nextExecutiveSupporter,
  };
}

async function buildMePayload(opts: {
  row: unknown;
  db: D1Database | undefined;
  kv: KVNamespace;
  env: Env["Bindings"];
  sessionId: string;
}) {
  const { row, db, kv, env, sessionId } = opts;
  const rawLicenseHash = row ? (row as unknown as { license_hash: string | null }).license_hash : null;
  const licenseActive = rawLicenseHash && db ? await isLicenseActive(db, rawLicenseHash) : false;
  const isPro = Boolean(rawLicenseHash && licenseActive);
  const normalizedRow = normalizeFreeTierRank(row, isPro);
  const limits = getQuotaLimits(env);
  const quotaPercent = isPro
    ? await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: rawLicenseHash!, limits })
    : await getQuotaPercent(kv, { tier: "free", sessionId, limits });
  const profile = normalizedRow
    ? { ...rowToProfile(normalizedRow as Parameters<typeof rowToProfile>[0]), quota_percent: quotaPercent }
    : null;
  const revoked = Boolean(rawLicenseHash && !licenseActive);
  return { isPro, quotaPercent, profile, revoked };
}

async function respondWithMeProfile(
  c: Pick<Context<Env>, "env" | "json" | "header">,
  opts: {
    db: D1Database | undefined;
    kv: KVNamespace;
    row: unknown;
    sessionId: string;
    username: string;
  },
) {
  const { isPro, quotaPercent, profile, revoked } = await buildMePayload({
    row: opts.row,
    db: opts.db,
    kv: opts.kv,
    env: c.env,
    sessionId: opts.sessionId,
  });
  if (!isPro) {
    await issueFreeAccountCookie(c, c.env.FREE_ACCOUNT_COOKIE_SECRET, (opts.row as { account_id?: string | null }).account_id ?? null);
  }

  return c.json({
    found: true,
    username: opts.username,
    profile,
    quotaPercent,
    isPro,
    ...(revoked ? { revoked: true } : {}),
  });
}

async function restoreMeFromFreeAccount(
  c: Pick<Context<Env>, "get" | "json" | "env" | "header">,
  opts: {
    db: D1Database | undefined;
    kv: KVNamespace;
    sessionId: string;
  },
) {
  const freeAccountId = c.get("freeAccountId");
  if (!opts.db || !freeAccountId) return null;

  const row = await getProfileRowByAccountId(opts.db, freeAccountId);
  if (!row) return null;
  if (row.license_hash) return null;

  const username = row.username;
  try {
    await opts.kv.put(accountKvKeys.sessionUser(opts.sessionId), username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
  } catch (err: unknown) {
    console.warn(
      `[account/me] failed to restore session binding for ${opts.sessionId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return respondWithMeProfile(c, {
    db: opts.db,
    kv: opts.kv,
    row,
    sessionId: opts.sessionId,
    username,
  });
}

async function resolveUpdateThemeOwnership(
  db: D1Database,
  c: Context<Env>,
  body: { username: string; themeId: string; licenseKeyHash?: string },
) {
  const ownershipOptions = {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "theme updates",
    logPrefix: "[account/update-theme]",
  };
  return body.themeId === "default"
    ? resolveThemeSelectionOwnership(db, ownershipOptions)
    : resolveThemePurchaseOwnership(db, ownershipOptions);
}

async function persistActiveTheme(
  db: D1Database,
  username: string,
  themeId: string,
  licenseKeyHash: string,
) {
  return db.prepare(
    `UPDATE user_scores SET
      active_theme = ?,
      updated_at = datetime('now')
    WHERE username = ?
      AND ? IN (SELECT value FROM json_each(COALESCE(unlocked_themes, '["default"]')))
      AND license_hash = ?
      AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
  ).bind(themeId, username, themeId, licenseKeyHash).run();
}

async function ensureDisplayRankSupporterAccess(
  db: D1Database,
  opts: { displayRank: string | null; licenseKeyHash: string; profile: { is_executive_supporter: boolean }; sessionId: string },
) {
  if (opts.displayRank === null) {
    return true;
  }

  if (opts.profile.is_executive_supporter) {
    return opts.profile.is_executive_supporter;
  }

  const claimed = await claimExecutiveSupporterForLicenseKey(db, {
    licenseKeyHash: opts.licenseKeyHash,
    sessionId: opts.sessionId,
  });
  if (!claimed) return false;

  opts.profile.is_executive_supporter = await syncExecutiveSupporterEntitlement(db, opts.licenseKeyHash);
  return opts.profile.is_executive_supporter;
}

const SUPPORTER_VANITY_TITLE_SET = new Set(SUPPORTER_VANITY_TITLES.map((title) => title.title));

account.post("/checkout-license", async (c) => {
  const validated = await validateCheckoutRequest(c);
  if ("error" in validated) return validated.error;
  const { checkoutId, sessionId, kv } = validated;
  const claimSecret = c.env?.CHECKOUT_CLAIM_SECRET;
  if (!claimSecret) return c.json({ error: "Checkout claim secret is not configured" }, 500);
  const db = c.env?.DB;
  const cacheLookup = await resolveCachedClaim({ kv, checkoutId, sessionId });
  const resolvedClaim = await resolveCachedOrStoredClaim(c, { db, kv, checkoutId, sessionId, claimSecret, cacheLookup });
  if (resolvedClaim.response) return resolvedClaim.response;
  if (!db) return c.json({ error: "Database not configured" }, 500);
  return redeemCheckoutLicense(c, {
    db,
    kv,
    checkoutId,
    sessionId,
    claimSecret,
    allowMissingReferenceBinding: resolvedClaim.allowMissingReferenceBinding,
  });
});

account.post("/sync", async (c) => {
  const validated = await validateSyncRequest(c);
  if ("error" in validated) return validated.error;
  const { body, validation, kv, db, hash } = validated;

  const sessionId = c.get("sessionId");
  const limits = getQuotaLimits(c.env);

  // Resolve the profile FIRST — if this fails (username taken, concurrent
  // claim, etc.) we must NOT leave behind an activated license row or KV
  // quota for a sync that never completed.
  const result = await resolveProfile(db, hash, body, sessionId && kv ? { sessionId, kv } : undefined);
  if (result.profile === null) {
    const isConflict =
      result.error.includes("already taken") ||
      result.error.includes("just claimed") ||
      result.error.includes("being activated");
    return c.json({ error: result.error }, isConflict ? 409 : 403);
  }

  // Profile claim succeeded — now provision the licenses row and KV quota.
  // This ordering ensures that failed syncs never produce orphaned active
  // licenses or quota entries.
  try {
    const isExecutiveSupporter = await syncExecutiveSupporterEntitlement(db, hash);
    await commitSyncSideEffects(
      { db, kv, hash },
      { validationId: validation.id, proInitialQuota: limits.proInitialQuota },
    );
    result.profile = {
      ...result.profile,
      is_executive_supporter: isExecutiveSupporter,
      display_rank: isExecutiveSupporter ? result.profile.display_rank : null,
    };
  } catch (err: unknown) {
    try {
      await rollbackProfileMutation(db, hash, result.mutation);
    } catch (rollbackErr: unknown) {
      console.warn(
        `[account/sync] failed to rollback profile mutation for ${hash.slice(0, 8)}:`,
        rollbackErr instanceof Error ? rollbackErr.message : rollbackErr,
      );
    }
    throw err;
  }

  // Bind the session to the resolved username so /me can look it up.
  if (sessionId && result.profile?.username) {
    try {
      await kv.put(accountKvKeys.sessionUser(sessionId), result.profile.username, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
    } catch (err: unknown) {
      console.warn(
        `[account/sync] failed to bind session for ${result.profile.username}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const quotaPercent = await getQuotaPercent(kv, { tier: "pro", sessionId: "", licenseKeyHash: hash, limits });
  const profile = { ...result.profile, quota_percent: quotaPercent };

  return c.json({ success: true, hash, restored: result.restored, profile });
});

account.get("/me", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  const sessionId = c.get("sessionId");
  if (!kv || !sessionId) return c.json({ found: false });

  const db = c.env?.DB;
  let username = await kv.get(accountKvKeys.sessionUser(sessionId));
  if (!username) {
    const restored = await restoreMeFromFreeAccount(c, { db, kv, sessionId });
    return restored ?? c.json({ found: false });
  }

  const resolved = await resolveSessionProfileRow({ db, kv, sessionId, username });
  username = resolved.username;
  const row = resolved.row;
  if (!row) {
    if (resolved.redirected) {
      try {
        await kv.delete(accountKvKeys.sessionUser(sessionId));
      } catch (err: unknown) {
        console.warn(
          `[account/me] failed to clear stale renamed session for ${sessionId}:`,
          err instanceof Error ? err.message : err,
        );
      }
      return c.json({ found: false });
    }
    const quotaPercent = await getQuotaPercent(kv, { tier: "free", sessionId, limits: getQuotaLimits(c.env) });
    return c.json({
      found: true,
      username,
      profile: null,
      quotaPercent,
      isPro: false,
    });
  }

  return respondWithMeProfile(c, { db, kv, row, sessionId, username });
});

account.post("/buy-generator", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; generatorId: string; amount: number; licenseKeyHash?: string }>();
  if (!body.username || !body.generatorId || !body.amount || body.amount < 1 || !Number.isInteger(body.amount) || body.amount > 1000) {
    return c.json({ error: "username, generatorId, and amount (positive integer, max 1000) are required" }, 400);
  }

  const generator = GENERATORS.find((g) => g.id === body.generatorId);
  if (!generator) return c.json({ error: "Unknown generator" }, 400);

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "generator purchases",
    logPrefix: "[account/generator]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  const owned = profile.inventory[body.generatorId] ?? 0;
  const cost = calcBulkCost(generator.baseCost, owned, body.amount);

  if (profile.current_td < cost) {
    return c.json({ error: "Insufficient TD", required: cost, available: profile.current_td }, 400);
  }

  // Atomic update: use SQL-level TD guard and JSON functions to prevent
  // concurrent requests from overwriting each other or producing negative balances.
  // The COALESCE(..., 0) = ? guard ensures the inventory count hasn't changed
  // since we computed the price — two concurrent requests pricing against the
  // same ownership level will cause one to fail with a 409.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        inventory = json_set(COALESCE(inventory, '{}'), '$."' || ? || '"', COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) + ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ? AND license_hash = ?
        AND COALESCE(json_extract(inventory, '$."' || ? || '"'), 0) = ?
        AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(cost, body.generatorId, body.generatorId, body.amount, profile.username, cost, licenseKeyHash, body.generatorId, owned)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD (concurrent update)", required: cost }, 409);
  }

  const updated = await getProfile(db, profile.username);

  if (cost > 1_000_000) {
    const purchaseMessage = `💰 ${body.username} bought ${body.amount}x ${generator.name} for ${cost.toLocaleString()} TD!`;
    broadcastPurchase(purchaseMessage, db, c.executionCtx);
  }

  return c.json({ success: true, profile: updated });
});

account.post("/buy-upgrade", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; upgradeId: string; licenseKeyHash?: string }>();
  if (!body.username || !body.upgradeId) {
    return c.json({ error: "username and upgradeId are required" }, 400);
  }

  const upgrade = UPGRADES.find((u) => u.id === body.upgradeId);
  if (!upgrade) return c.json({ error: "Unknown upgrade" }, 400);

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "upgrade purchases",
    logPrefix: "[account/upgrade]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  if (profile.upgrades.includes(body.upgradeId)) {
    return c.json({ error: "Upgrade already owned" }, 400);
  }
  if ((profile.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) {
    return c.json({ error: "Required generator not owned" }, 400);
  }
  if (profile.current_td < upgrade.cost) {
    return c.json({ error: "Insufficient TD", required: upgrade.cost, available: profile.current_td }, 400);
  }

  // Atomic update: SQL-level TD guard + JSON append + dedupe guard.
  // The NOT IN subquery prevents concurrent requests that both pass the
  // JS-level "already owned" check from both appending the same upgrade.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        current_td = current_td - ?,
        upgrades = json_insert(COALESCE(upgrades, '[]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ? AND current_td >= ? AND license_hash = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(upgrades, '[]')))
        AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(upgrade.cost, body.upgradeId, profile.username, upgrade.cost, licenseKeyHash, body.upgradeId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD or upgrade already owned (concurrent update)", required: upgrade.cost }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/buy-theme", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; themeId: string; licenseKeyHash?: string }>();
  if (!body.username || !body.themeId) {
    return c.json({ error: "username and themeId are required" }, 400);
  }

  const theme = THEMES.find((t) => t.id === body.themeId);
  if (!theme) return c.json({ error: "Unknown theme" }, 400);

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "theme purchases",
    logPrefix: "[account/buy-theme]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  if (profile.unlocked_themes.includes(body.themeId)) {
    return c.json({ error: "Theme already unlocked" }, 400);
  }
  if (profile.current_td < theme.cost) {
    return c.json({ error: "Insufficient TD", required: theme.cost, available: profile.current_td }, 400);
  }

  // Atomic update: SQL-level TD guard + JSON append + dedupe guard.
  // The NOT IN subquery prevents concurrent requests that both pass the
  // JS-level "already unlocked" check from both appending the same theme.
  const result = await db.prepare(
    `UPDATE user_scores SET
      current_td = current_td - ?,
      unlocked_themes = json_insert(COALESCE(unlocked_themes, '["default"]'), '$[#]', ?),
      updated_at = datetime('now')
    WHERE username = ? AND current_td >= ? AND license_hash = ?
      AND ? NOT IN (SELECT value FROM json_each(COALESCE(unlocked_themes, '["default"]')))
      AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
  ).bind(
    theme.cost,
    body.themeId,
    profile.username,
    theme.cost,
    ownership.licenseKeyHash,
    body.themeId,
  ).run();

  if (!result.meta.changes) {
    return c.json({ error: "Insufficient TD or theme already unlocked (concurrent update)", required: theme.cost }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-theme", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; themeId: string; licenseKeyHash?: string }>();
  if (!body.username || !body.themeId) {
    return c.json({ error: "username and themeId are required" }, 400);
  }

  const theme = THEMES.find((t) => t.id === body.themeId);
  if (!theme) return c.json({ error: "Unknown theme" }, 400);

  const ownership = await resolveUpdateThemeOwnership(db, c, body);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile } = ownership;

  if (!profile.unlocked_themes.includes(body.themeId)) {
    return c.json({ error: "Theme is not unlocked" }, 400);
  }
  if (profile.active_theme === body.themeId) {
    return c.json({ success: true, profile });
  }

  const result = await persistActiveTheme(db, profile.username, body.themeId, ownership.licenseKeyHash);

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, theme not unlocked, or license revoked" }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/unlock-achievement", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; achievementId: string; licenseKeyHash?: string }>();
  if (!body.username || !body.achievementId) {
    return c.json({ error: "username and achievementId are required" }, 400);
  }
  if (!ACHIEVEMENT_IDS.has(body.achievementId)) {
    return c.json({ error: "Unknown achievementId" }, 400);
  }

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "achievement unlocks",
    logPrefix: "[account/achievement]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  if (profile.achievements.includes(body.achievementId)) {
    return c.json({ success: true, profile });
  }

  // Atomic update: SQL-level JSON append + dedupe guard prevents concurrent
  // requests from overwriting each other's achievements.
  const result = await db
    .prepare(
      `UPDATE user_scores SET
        achievements = json_insert(COALESCE(achievements, '[]'), '$[#]', ?),
        updated_at = datetime('now')
      WHERE username = ? AND license_hash = ?
        AND ? NOT IN (SELECT value FROM json_each(COALESCE(achievements, '[]')))
        AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(body.achievementId, profile.username, licenseKeyHash, body.achievementId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-buddy", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; buddyType: string | null; isShiny: boolean; licenseKeyHash?: string }>();
  if (!body.username) {
    return c.json({ error: "username is required" }, 400);
  }
  if (typeof body.isShiny !== "boolean") {
    return c.json({ error: "isShiny must be a boolean" }, 400);
  }
  if (body.buddyType !== null && body.buddyType !== undefined && !BUDDY_TYPE_SET.has(body.buddyType)) {
    return c.json({ error: "Unknown buddyType" }, 400);
  }

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "buddy updates",
    logPrefix: "[account/buddy]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  // Atomic: include license_hash + active-license subquery in WHERE to
  // prevent TOCTOU between verifyOwnership and the actual update.
  const result = await db
    .prepare(
      `UPDATE user_scores SET buddy_type = ?, buddy_is_shiny = ?, updated_at = datetime('now')
       WHERE username = ? AND license_hash = ?
         AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(body.buddyType ?? null, body.isShiny ? 1 : 0, profile.username, licenseKeyHash)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-ticket", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    username: string;
    activeTicket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null;
    licenseKeyHash?: string;
  }>();
  if (!body.username) {
    return c.json({ error: "username is required" }, 400);
  }
  const ticketError = validateActiveTicket(body.activeTicket);
  if (ticketError) {
    return c.json({ error: ticketError }, 400);
  }

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "ticket updates",
    logPrefix: "[account/ticket]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  // Atomic: include license_hash + active-license subquery in WHERE to
  // prevent TOCTOU between verifyOwnership and the actual update.
  const result = await db
    .prepare(
      `UPDATE user_scores SET active_ticket = ?, updated_at = datetime('now')
       WHERE username = ? AND license_hash = ?
         AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(body.activeTicket ? JSON.stringify(body.activeTicket) : null, profile.username, licenseKeyHash)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, license mismatch, or license revoked" }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

account.post("/update-display-rank", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username?: string; displayRank?: string | null; licenseKeyHash?: string }>();
  const displayRank =
    body.displayRank === null
      ? null
      : typeof body.displayRank === "string"
        ? body.displayRank.trim()
        : undefined;
  if (!body.username || displayRank === undefined) {
    return c.json({ error: "username and displayRank are required" }, 400);
  }
  if (displayRank !== null && !SUPPORTER_VANITY_TITLE_SET.has(displayRank)) {
    return c.json({ error: "Unknown displayRank" }, 400);
  }

  const ownership = await resolveThemePurchaseOwnership(db, {
    username: body.username,
    licenseKeyHash: body.licenseKeyHash,
    kv: c.env?.QUOTA_KV ?? c.env?.USAGE_KV,
    sessionId: c.get("sessionId"),
    actionLabel: "display rank updates",
    logPrefix: "[account/display-rank]",
  });
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error, ...(ownership.errorCode ? { errorCode: ownership.errorCode } : {}) }, ownership.status === "not_found" ? 404 : 403);
  }
  const { profile, licenseKeyHash } = ownership;

  if (!(await ensureDisplayRankSupporterAccess(db, {
    displayRank,
    licenseKeyHash,
    profile,
    sessionId: c.get("sessionId"),
  }))) {
    return c.json({ error: PROMOTE_ACCESS_DENIED_MESSAGE }, 403);
  }

  const supporterClause = displayRank === null ? "" : " AND is_executive_supporter = 1";
  const result = await db
    .prepare(
      `UPDATE user_scores SET display_rank = ?, updated_at = datetime('now')
       WHERE username = ? AND license_hash = ?${supporterClause}
         AND ${ACTIVE_LICENSE_EXISTS_SQL}`,
    )
    .bind(displayRank, profile.username, licenseKeyHash)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Update failed — profile not found, supporter entitlement missing, or license revoked" }, 409);
  }

  const updated = await getProfile(db, profile.username);
  return c.json({ success: true, profile: updated });
});

// eslint-disable-next-line complexity
account.post("/update-alias", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{ username: string; newAlias: string; licenseKeyHash: string }>();
  if (!body.username || !body.newAlias) {
    return c.json({ error: "username and newAlias are required" }, 400);
  }
  if (!body.licenseKeyHash) {
    return c.json({ error: "Alias changes require an active Max license" }, 403);
  }

  const v = validateAlias(body.newAlias);
  if (v.error) return c.json({ error: v.error }, 400);
  const alias = v.alias!;

  if (alias.toLowerCase() === body.username.toLowerCase()) {
    return c.json({ error: "New alias is the same as the current username" }, 400);
  }

  const ownership = await verifyOwnership(db, body.username, body.licenseKeyHash);
  if (ownership.status !== "ok") {
    return c.json({ error: ownership.error }, ownership.status === "not_found" ? 404 : 403);
  }

  const dbResult = await performAliasDbUpdate(db, {
    oldUsername: body.username,
    newAlias: alias,
    licenseKeyHash: body.licenseKeyHash,
    dailyLimit: ALIAS_CHANGES_PER_DAY,
  });
  if (!dbResult.success) {
    if (dbResult.status === 429) {
      return c.json({ error: `Alias change limit reached (max ${ALIAS_CHANGES_PER_DAY} per day)` }, 429);
    }
    return c.json({ error: dbResult.error }, dbResult.status);
  }

  const sessionId = c.get("sessionId");
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  let updated: Awaited<ReturnType<typeof getProfile>> = null;
  if (kv && sessionId) {
    try {
      await kv.put(accountKvKeys.sessionUser(sessionId), alias, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      await kv.put(accountKvKeys.usernameSession(alias), sessionId, { expirationTtl: SESSION_USERNAME_TTL_SECONDS });
      await kv.delete(accountKvKeys.usernameSession(body.username));
      // Store a redirect so other active sessions following the old username
      // can discover the rename via /me and repair their own session mapping.
      // This still relies on username redirects rather than immutable account IDs,
      // so keep the TTL long enough to cover dormant-but-still-valid sessions.
      await kv.put(accountKvKeys.renamed(body.username), alias, { expirationTtl: RENAME_REDIRECT_TTL_SECONDS });
    } catch (err: unknown) {
      // TODO: Once accounts have immutable IDs, make this repair path durable
      // instead of relying on best-effort username redirects.
      console.warn(
        `[account/update-alias] KV session repair failed for ${body.username} -> ${alias}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  try {
    updated = await getProfile(db, alias);
  } catch (err: unknown) {
    console.warn(
      `[account/update-alias] profile fetch failed after renaming ${body.username} -> ${alias}:`,
      err instanceof Error ? err.message : err,
    );
  }
  return c.json({ success: true, profile: updated });
});

account.post("/shill", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) return c.json({ error: "KV storage is not configured" }, 500);

  const sessionId = c.get("sessionId");
  const shillKey = accountKvKeys.shill(sessionId);

  const alreadyShilled = await kv.get(shillKey);
  if (alreadyShilled) {
    return c.json({ error: "Shill credit already claimed" }, 409);
  }

  const usageKey = `free:${sessionId}`;
  const raw = await kv.get(usageKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  const updated = Math.max(0, current - SHILL_CREDIT);

  await kv.put(usageKey, String(updated));
  await kv.put(shillKey, "1");

  return c.json({ success: true, creditsGranted: SHILL_CREDIT });
});

export default account;
