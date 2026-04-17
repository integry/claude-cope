import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  applyServerMessage,
  type ServerMessageHandlers,
} from "../useMultiplayer";
import type { Message } from "../../components/Terminal";
import type { ServerMessage } from "@claude-cope/shared/multiplayer-types";

/**
 * Regression coverage for the multiplayer follow-up logic that lives in
 * `useMultiplayer.ts`. The pain points flagged in review were:
 *
 *  - ping_failed is a *shared* error channel. A prior version of this hook
 *    tracked pending amounts in a local queue and `.shift()`ed on every
 *    ping_failed, which could refund the wrong amount if an unrelated
 *    failure (e.g. `/accept`) arrived while a pinged request was in flight.
 *    The new contract debits on `review_ping_sent` only, and refunds use
 *    the server-echoed amount — no client-side correlation required.
 *  - `review_ping_cancelled` must clear the target's local pending state
 *    so `/accept` falls through cleanly after a 60s expiry / sender
 *    disconnect. A missing clear left the UI showing a bounty that was
 *    already gone on the server.
 *  - Outage messages still always clear the HP bar on cleared/failed, but
 *    skip the reward/penalty and announcement when the tab is idle.
 *
 * We exercise the pure dispatcher (`applyServerMessage`) directly so we can
 * assert on the exact side effects without rendering React or spinning up
 * a PartyKit socket.
 */

// ── Typed mock state helpers ────────────────────────────────────────────
// React setters accept either a value or an updater function. We support
// both so the tests can assert on the *accumulated* message-history array
// the way the real component state would.

function createMockState<T>(initial: T) {
  let value = initial;
  const setter = vi.fn((next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
  }) as unknown as React.Dispatch<React.SetStateAction<T>>;
  return {
    setter,
    get value() {
      return value;
    },
  };
}

interface HarnessState {
  history: ReturnType<typeof createMockState<Message[]>>;
  pendingReviewPing: ReturnType<
    typeof createMockState<{ sender: string; amount: number } | null>
  >;
  onlineCount: ReturnType<typeof createMockState<number>>;
  onlineUsers: ReturnType<typeof createMockState<string[]>>;
  outageHp: ReturnType<typeof createMockState<number | null>>;
}

interface Harness {
  handlers: ServerMessageHandlers;
  state: HarnessState;
  creditTD: ReturnType<typeof vi.fn>;
  debitTD: ReturnType<typeof vi.fn>;
  applyReviewSprintBoost: ReturnType<typeof vi.fn>;
  applyOutageReward: ReturnType<typeof vi.fn>;
  applyOutagePenalty: ReturnType<typeof vi.fn>;
  setIdle(idle: boolean): void;
}

function makeHarness(): Harness {
  let idle = false;
  const state: HarnessState = {
    history: createMockState<Message[]>([]),
    pendingReviewPing: createMockState<
      { sender: string; amount: number } | null
    >(null),
    onlineCount: createMockState<number>(1),
    onlineUsers: createMockState<string[]>([]),
    outageHp: createMockState<number | null>(null),
  };
  const creditTD = vi.fn();
  const debitTD = vi.fn();
  const applyReviewSprintBoost = vi.fn();
  const applyOutageReward = vi.fn();
  const applyOutagePenalty = vi.fn();
  return {
    state,
    creditTD,
    debitTD,
    applyReviewSprintBoost,
    applyOutageReward,
    applyOutagePenalty,
    setIdle(v: boolean) {
      idle = v;
    },
    handlers: {
      setHistory: state.history.setter,
      setPendingReviewPing: state.pendingReviewPing.setter,
      setOnlineCount: state.onlineCount.setter,
      setOnlineUsers: state.onlineUsers.setter,
      setOutageHp: state.outageHp.setter,
      creditTD,
      debitTD,
      applyReviewSprintBoost,
      applyOutageReward,
      applyOutagePenalty,
      isUserIdle: () => idle,
    },
  };
}

describe("applyServerMessage", () => {
  let h: Harness;

  beforeEach(() => {
    h = makeHarness();
  });

  // ── presence ─────────────────────────────────────────────────────────
  it("presence: updates online count and users", () => {
    applyServerMessage(
      { type: "presence", count: 3, users: ["Alice", "Bob", "Carol"] },
      h.handlers
    );
    expect(h.state.onlineCount.value).toBe(3);
    expect(h.state.onlineUsers.value).toEqual(["Alice", "Bob", "Carol"]);
  });

  // ── review lifecycle — follow-up logic ──────────────────────────────

  it("review_ping_sent: debits the server-echoed amount and appends a system message", () => {
    applyServerMessage(
      {
        type: "review_ping_sent",
        target: "Bob",
        amount: 50,
        expiresInMs: 60_000,
      },
      h.handlers
    );
    expect(h.debitTD).toHaveBeenCalledTimes(1);
    expect(h.debitTD).toHaveBeenCalledWith(50);
    expect(h.state.history.value).toHaveLength(1);
    expect(h.state.history.value[0]!.role).toBe("system");
    // The timer seconds are rendered from `expiresInMs` rounded to a
    // whole second — make sure we didn't regress the copy formatter.
    expect(h.state.history.value[0]!.content).toContain("60s");
  });

  it("ping_failed: appends an error message AND does NOT credit/debit TD", () => {
    // This is the key follow-up invariant: ping_failed is a shared error
    // channel, so it must never touch the balance. Credits/debits come only
    // from review_ping_sent / review_ping_refunded / review_ping_claimed.
    applyServerMessage(
      { type: "ping_failed", reason: "Slack rate-limit: wait 3s." },
      h.handlers
    );
    expect(h.state.history.value).toHaveLength(1);
    expect(h.state.history.value[0]!.role).toBe("error");
    expect(h.creditTD).not.toHaveBeenCalled();
    expect(h.debitTD).not.toHaveBeenCalled();
  });

  it("review_ping_sent followed by an unrelated ping_failed does not refund", () => {
    // Simulates the scenario flagged in review: a locally debited ping is in
    // flight, then an unrelated `/accept` triggers a `ping_failed`. The old
    // queue-based code would shift and refund the wrong amount. The new code
    // only refunds on an explicit review_ping_refunded.
    applyServerMessage(
      {
        type: "review_ping_sent",
        target: "Bob",
        amount: 50,
        expiresInMs: 60_000,
      },
      h.handlers
    );
    applyServerMessage(
      { type: "ping_failed", reason: "No pending review request to accept." },
      h.handlers
    );
    expect(h.debitTD).toHaveBeenCalledTimes(1);
    expect(h.creditTD).not.toHaveBeenCalled();
  });

  it("review_ping_received: sets pendingReviewPing and appends a warning", () => {
    applyServerMessage(
      {
        type: "review_ping_received",
        sender: "Alice",
        amount: 75,
        expiresInMs: 60_000,
        ticket: { id: "T-7", title: "Ship it", sprintGoal: 40, sprintProgress: 10 },
      },
      h.handlers
    );
    expect(h.state.pendingReviewPing.value).toEqual({
      sender: "Alice",
      amount: 75,
    });
    expect(h.state.history.value[0]!.role).toBe("warning");
    expect(h.state.history.value[0]!.content).toContain("T-7");
  });

  it("review_ping_cancelled (expired): clears pendingReviewPing so /accept falls through", () => {
    // Seed a pending request first.
    applyServerMessage(
      {
        type: "review_ping_received",
        sender: "Alice",
        amount: 75,
        expiresInMs: 60_000,
        ticket: { id: "T-7", title: "Ship it", sprintGoal: 40, sprintProgress: 10 },
      },
      h.handlers
    );
    expect(h.state.pendingReviewPing.value).not.toBeNull();

    applyServerMessage(
      { type: "review_ping_cancelled", sender: "Alice", reason: "expired" },
      h.handlers
    );
    expect(h.state.pendingReviewPing.value).toBeNull();
    // Two messages total: the received warning, then the cancellation note.
    expect(h.state.history.value).toHaveLength(2);
    expect(h.state.history.value[1]!.role).toBe("system");
    expect(h.state.history.value[1]!.content).toContain("timed out");
  });

  it("review_ping_cancelled (sender_disconnected): uses the disconnect copy", () => {
    applyServerMessage(
      {
        type: "review_ping_cancelled",
        sender: "Alice",
        reason: "sender_disconnected",
      },
      h.handlers
    );
    expect(h.state.history.value[0]!.content).toContain("disconnected");
    expect(h.state.pendingReviewPing.value).toBeNull();
  });

  it("review_ping_accepted (sender side): applies the sprint boost to the sender's ticket", () => {
    applyServerMessage(
      {
        type: "review_ping_accepted",
        sender: "Alice",
        target: "Bob",
        amount: 50,
        sprintProgressBoost: 10,
        ticketId: "T-9",
      },
      h.handlers
    );
    expect(h.applyReviewSprintBoost).toHaveBeenCalledTimes(1);
    expect(h.applyReviewSprintBoost).toHaveBeenCalledWith("T-9", 10);
    // Sender should NOT be refunded here — they paid for a review.
    expect(h.creditTD).not.toHaveBeenCalled();
  });

  it("review_ping_claimed (target side): credits TD and clears pendingReviewPing", () => {
    // Seed a pending request first so we can assert it gets cleared.
    h.handlers.setPendingReviewPing({ sender: "Alice", amount: 50 });
    applyServerMessage(
      {
        type: "review_ping_claimed",
        sender: "Alice",
        amount: 50,
        ticketId: "T-9",
      },
      h.handlers
    );
    expect(h.creditTD).toHaveBeenCalledWith(50);
    expect(h.state.pendingReviewPing.value).toBeNull();
  });

  it("review_ping_refunded (expired): credits the server-echoed amount (not a local queue)", () => {
    // The key follow-up: the amount comes from `data.amount`, not from a
    // client-side queue that could get out of sync on mixed-channel errors.
    applyServerMessage(
      {
        type: "review_ping_refunded",
        target: "Bob",
        amount: 75,
        reason: "expired",
      },
      h.handlers
    );
    expect(h.creditTD).toHaveBeenCalledTimes(1);
    expect(h.creditTD).toHaveBeenCalledWith(75);
    expect(h.state.history.value[0]!.content).toContain("75");
  });

  it("review_ping_refunded (target_disconnected): still uses data.amount", () => {
    applyServerMessage(
      {
        type: "review_ping_refunded",
        target: "Bob",
        amount: 30,
        reason: "target_disconnected",
      },
      h.handlers
    );
    expect(h.creditTD).toHaveBeenCalledWith(30);
  });

  it("mixed sequence: refund always uses the amount attached to that specific refund", () => {
    // Two different pings, two different refund amounts — verifies there is
    // no implicit ordering dependency between debits and refunds.
    applyServerMessage(
      { type: "review_ping_sent", target: "Bob", amount: 50, expiresInMs: 60_000 },
      h.handlers
    );
    applyServerMessage(
      { type: "review_ping_sent", target: "Carol", amount: 80, expiresInMs: 60_000 },
      h.handlers
    );
    applyServerMessage(
      { type: "review_ping_refunded", target: "Carol", amount: 80, reason: "expired" },
      h.handlers
    );
    applyServerMessage(
      { type: "review_ping_refunded", target: "Bob", amount: 50, reason: "expired" },
      h.handlers
    );
    // Debits in order sent, refunds in arbitrary order — each refund credits
    // exactly what it advertised, regardless of the send order.
    expect(h.debitTD.mock.calls.map((c) => c[0])).toEqual([50, 80]);
    expect(h.creditTD.mock.calls.map((c) => c[0])).toEqual([80, 50]);
  });

  // ── outage — idle-guard invariants ──────────────────────────────────

  it("outage_start (active): sets HP and pushes the critical alert", () => {
    applyServerMessage({ type: "outage_start", hp: 100 }, h.handlers);
    expect(h.state.outageHp.value).toBe(100);
    expect(h.state.history.value[0]!.role).toBe("error");
  });

  it("outage_start (idle): does not set HP or push the alert", () => {
    h.setIdle(true);
    applyServerMessage({ type: "outage_start", hp: 100 }, h.handlers);
    expect(h.state.outageHp.value).toBeNull();
    expect(h.state.history.value).toHaveLength(0);
  });

  it("outage_update (idle): ignored", () => {
    h.setIdle(true);
    applyServerMessage({ type: "outage_update", hp: 42 }, h.handlers);
    expect(h.state.outageHp.value).toBeNull();
  });

  it("outage_cleared: always clears HP, only rewards/announces when not idle", () => {
    // Engaged path: reward + announce.
    h.state.outageHp.setter(50);
    applyServerMessage({ type: "outage_cleared" }, h.handlers);
    expect(h.state.outageHp.value).toBeNull();
    expect(h.applyOutageReward).toHaveBeenCalledTimes(1);
    expect(h.state.history.value[0]!.content).toContain("back online");

    // Idle path: bar clears, no reward, no announcement.
    const h2 = makeHarness();
    h2.setIdle(true);
    h2.state.outageHp.setter(50);
    applyServerMessage({ type: "outage_cleared" }, h2.handlers);
    expect(h2.state.outageHp.value).toBeNull();
    expect(h2.applyOutageReward).not.toHaveBeenCalled();
    expect(h2.state.history.value).toHaveLength(0);
  });

  it("outage_failed: always clears HP, only penalizes/announces when not idle", () => {
    h.state.outageHp.setter(50);
    applyServerMessage({ type: "outage_failed" }, h.handlers);
    expect(h.state.outageHp.value).toBeNull();
    expect(h.applyOutagePenalty).toHaveBeenCalledTimes(1);

    const h2 = makeHarness();
    h2.setIdle(true);
    h2.state.outageHp.setter(50);
    applyServerMessage({ type: "outage_failed" }, h2.handlers);
    expect(h2.state.outageHp.value).toBeNull();
    expect(h2.applyOutagePenalty).not.toHaveBeenCalled();
  });

  // ── unknown messages — defensive ────────────────────────────────────

  it("ignores messages that are not part of the current contract", () => {
    // Exhaustiveness of the `if` chain is the reason we split handlers in
    // two: a future `type` that does not match any branch must be a no-op
    // (forward-compat with server rollouts).
    const unknown = { type: "not_a_real_type_v2" } as unknown as ServerMessage;
    applyServerMessage(unknown, h.handlers);
    expect(h.state.history.value).toHaveLength(0);
    expect(h.creditTD).not.toHaveBeenCalled();
    expect(h.debitTD).not.toHaveBeenCalled();
  });
});
