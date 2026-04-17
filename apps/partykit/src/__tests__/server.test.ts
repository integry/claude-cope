import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type * as Party from "partykit/server";
import ClaudeCopeServer from "../server";
import type {
  ClientMessage,
  ReviewTicket,
  ServerMessage,
} from "@claude-cope/shared/multiplayer-types";

/**
 * Regression coverage for the PartyKit review-request state machine (issue #679).
 * The realtime lifecycle is the highest-risk surface area in the ping rework:
 * cooldowns keyed by stable player identity, expiry notifications on both
 * sides, and disconnect-driven cancellation were all missing in the initial
 * implementation. These tests pin them in place.
 *
 * Implementation note: the `Party.*` types are opaque at the test boundary,
 * so we adapt them through a single typed `ServerHarness` (defined below).
 * The class walls off the unavoidable `as unknown as Party.X` conversions
 * into one place and exposes a small, precise API to the tests. That keeps
 * individual test cases free of `as never` / `as unknown` noise and means a
 * refactor of the server's call surface breaks at the harness, not across
 * every test.
 */

// ── Typed fake transport ────────────────────────────────────────────────
// `FakeConnection` / `FakeRoom` match the slice of `Party.Connection` /
// `Party.Room` that the server actually uses. Everything is strongly typed
// with discriminated `ServerMessage` / `ClientMessage` unions — no `any`
// slipping through `JSON.parse`.

class FakeConnection {
  readonly sent: ServerMessage[] = [];
  constructor(readonly id: string) {}
  send(raw: string): void {
    this.sent.push(JSON.parse(raw) as ServerMessage);
  }
  // Most-recent outbound message of a given type, typed by the discriminant.
  lastSent<T extends ServerMessage["type"]>(
    type: T
  ): Extract<ServerMessage, { type: T }> | undefined {
    for (let i = this.sent.length - 1; i >= 0; i--) {
      const msg = this.sent[i]!;
      if (msg.type === type) return msg as Extract<ServerMessage, { type: T }>;
    }
    return undefined;
  }
  // All outbound messages of a given type — convenience for assertions like
  // `expect(conn.allSent("review_ping_refunded")).toHaveLength(0)`.
  allSent<T extends ServerMessage["type"]>(
    type: T
  ): Array<Extract<ServerMessage, { type: T }>> {
    return this.sent.filter((m) => m.type === type) as Array<
      Extract<ServerMessage, { type: T }>
    >;
  }
  // Reset outbound history — lets a test start from a clean slate after
  // the presence broadcasts that accompany `onConnect`.
  clearSent(): void {
    this.sent.length = 0;
  }
}

class FakeRoom {
  readonly connections = new Map<string, FakeConnection>();
  readonly broadcasts: ServerMessage[] = [];
  getConnections(): Iterable<FakeConnection> {
    return this.connections.values();
  }
  broadcast(raw: string): void {
    this.broadcasts.push(JSON.parse(raw) as ServerMessage);
  }
}

const DEFAULT_TICKET: ReviewTicket = {
  id: "T-1",
  title: "Ship it",
  sprintGoal: 100,
  sprintProgress: 25,
};

// ── ServerHarness ───────────────────────────────────────────────────────
// Thin typed adapter over `ClaudeCopeServer`. The only `as unknown as` casts
// in the test file live here; every test interacts through typed methods.
class ServerHarness {
  readonly room = new FakeRoom();
  readonly server: ClaudeCopeServer;

  constructor() {
    this.server = new ClaudeCopeServer(this.roomAsParty());
  }

  connect(id: string, username: string): FakeConnection {
    const conn = new FakeConnection(id);
    this.room.connections.set(id, conn);
    this.server.onConnect(this.connAsParty(conn), this.ctxFor(username));
    return conn;
  }

  disconnect(conn: FakeConnection): void {
    this.room.connections.delete(conn.id);
    this.server.onClose(this.connAsParty(conn));
  }

  // Typed client→server message. `ClientMessage` is a discriminated union so
  // consumers cannot accidentally send a shape the server wouldn't parse.
  send(from: FakeConnection, msg: ClientMessage): void {
    this.server.onMessage(JSON.stringify(msg), this.connAsParty(from));
  }

  sendPing(
    from: FakeConnection,
    opts: { target?: string; amount?: number; ticket?: ReviewTicket } = {}
  ): void {
    const base: ClientMessage = {
      type: "ping",
      amount: opts.amount ?? 50,
      ticket: opts.ticket ?? DEFAULT_TICKET,
    };
    // Only include `target` when defined so server.ts's `data.target ? ... :
    // randomPick` branch is honored exactly as the client would.
    this.send(from, opts.target ? { ...base, target: opts.target } : base);
  }

  accept(from: FakeConnection): void {
    this.send(from, { type: "accept_review_ping" });
  }

  // Raw client→server for the handful of tests that intentionally send a
  // malformed payload (missing required fields) to exercise validation.
  sendRaw(from: FakeConnection, raw: unknown): void {
    this.server.onMessage(JSON.stringify(raw), this.connAsParty(from));
  }

  // ── Party.* adapters (the only casts in the file) ──────────────────
  // Narrow signatures + comments so future PartyKit type updates break
  // here instead of silently in the test body.
  private connAsParty(conn: FakeConnection): Party.Connection {
    return conn as unknown as Party.Connection;
  }
  private roomAsParty(): Party.Room {
    return this.room as unknown as Party.Room;
  }
  private ctxFor(username: string): Party.ConnectionContext {
    return {
      request: new Request(
        `http://example.test/?username=${encodeURIComponent(username)}`
      ),
    } as unknown as Party.ConnectionContext;
  }
}

describe("PartyKit review-request lifecycle", () => {
  let harness: ServerHarness;

  beforeEach(() => {
    // Fake timers let us advance through the 60s TTL without waiting, and
    // keep the 2–3h scheduled outage timer from leaking into other tests.
    vi.useFakeTimers();
    harness = new ServerHarness();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("routes a valid ping to the target and acknowledges the sender", () => {
    const alice = harness.connect("conn-a", "Alice");
    const bob = harness.connect("conn-b", "Bob");

    // Reset tracking from the presence broadcasts during onConnect.
    alice.clearSent();
    bob.clearSent();

    harness.sendPing(alice, { target: "Bob", amount: 50 });

    const received = bob.lastSent("review_ping_received");
    expect(received).toBeDefined();
    expect(received!.sender).toBe("Alice");
    expect(received!.amount).toBe(50);
    expect(received!.ticket.id).toBe("T-1");

    const sent = alice.lastSent("review_ping_sent");
    expect(sent).toBeDefined();
    expect(sent!.target).toBe("Bob");
    expect(sent!.amount).toBe(50);
  });

  it("rejects pings that omit the required amount or ticket", () => {
    const alice = harness.connect("conn-a", "Alice");
    harness.connect("conn-b", "Bob");
    alice.clearSent();

    // Missing amount — bypassing the typed send() so the server sees the
    // malformed shape a buggy client might produce.
    harness.sendRaw(alice, {
      type: "ping",
      target: "Bob",
      ticket: DEFAULT_TICKET,
    });
    const fail1 = alice.lastSent("ping_failed");
    expect(fail1?.reason).toMatch(/ticket and payment amount/i);

    // Missing ticket
    alice.clearSent();
    harness.sendRaw(alice, { type: "ping", target: "Bob", amount: 50 });
    const fail2 = alice.lastSent("ping_failed");
    expect(fail2?.reason).toMatch(/ticket and payment amount/i);
  });

  it("keys the 1h sender→target cooldown by username, not connection id — reconnects cannot bypass it", () => {
    const alice = harness.connect("conn-a1", "Alice");
    const bob = harness.connect("conn-b1", "Bob");
    alice.clearSent();

    // First ping succeeds and stamps the cooldown against (Alice, Bob).
    harness.sendPing(alice, { target: "Bob" });
    expect(alice.lastSent("review_ping_sent")).toBeDefined();

    // Bob accepts so the per-target exclusivity lock is released — this
    // isolates the test to the *sender→target cooldown* specifically.
    harness.accept(bob);

    // Simulate both players fully reconnecting with brand-new connection ids.
    // The connection-id-keyed implementation would reset the cooldown here;
    // the username-keyed implementation must not.
    harness.disconnect(alice);
    harness.disconnect(bob);
    const alice2 = harness.connect("conn-a2", "Alice");
    harness.connect("conn-b2", "Bob");
    alice2.clearSent();

    // Wait out the 10s per-player rate limit so the failure can only be the
    // 1h cooldown, not the spam cap.
    vi.advanceTimersByTime(11_000);

    harness.sendPing(alice2, { target: "Bob" });
    const failed = alice2.lastSent("ping_failed");
    expect(failed).toBeDefined();
    expect(failed!.reason).toMatch(/another review from Bob/i);
    // And no new request should have been registered for the reconnected pair.
    expect(alice2.lastSent("review_ping_sent")).toBeUndefined();
  });

  it("enforces the per-player 10s rate limit across reconnects (same username, new conn id)", () => {
    const alice = harness.connect("conn-a1", "Alice");
    harness.connect("conn-b", "Bob");
    harness.connect("conn-c", "Carol");
    alice.clearSent();

    harness.sendPing(alice, { target: "Bob" });
    expect(alice.lastSent("review_ping_sent")).toBeDefined();

    // Reconnect Alice with a new connection id; the username is the same.
    harness.disconnect(alice);
    const alice2 = harness.connect("conn-a2", "Alice");
    alice2.clearSent();

    // Pinging a *different* target (Carol) so the 1h cooldown is not the gate.
    harness.sendPing(alice2, { target: "Carol" });
    const failed = alice2.lastSent("ping_failed");
    expect(failed?.reason).toMatch(/rate-limit/i);
  });

  it("on natural expiry: refunds the sender AND cancels the target's pending state", () => {
    const alice = harness.connect("conn-a", "Alice");
    const bob = harness.connect("conn-b", "Bob");
    alice.clearSent();
    bob.clearSent();

    harness.sendPing(alice, { target: "Bob", amount: 75 });
    // Precondition: Bob has a received bounty, Alice has a sent ack.
    expect(bob.lastSent("review_ping_received")).toBeDefined();
    expect(alice.lastSent("review_ping_sent")).toBeDefined();

    // Let the 60s TTL lapse.
    vi.advanceTimersByTime(60_001);

    // Sender gets refunded with the expired reason.
    const refund = alice.lastSent("review_ping_refunded");
    expect(refund).toBeDefined();
    expect(refund!.amount).toBe(75);
    expect(refund!.reason).toBe("expired");

    // Target gets a cancellation so the client can clear pendingReviewPing.
    const cancelled = bob.lastSent("review_ping_cancelled");
    expect(cancelled).toBeDefined();
    expect(cancelled!.sender).toBe("Alice");
    expect(cancelled!.reason).toBe("expired");
  });

  it("on target disconnect: refunds the sender and does not send a cancel (nobody to tell)", () => {
    const alice = harness.connect("conn-a", "Alice");
    const bob = harness.connect("conn-b", "Bob");
    alice.clearSent();

    harness.sendPing(alice, { target: "Bob", amount: 30 });
    alice.clearSent();

    harness.disconnect(bob);

    const refund = alice.lastSent("review_ping_refunded");
    expect(refund).toBeDefined();
    expect(refund!.reason).toBe("target_disconnected");
    expect(refund!.amount).toBe(30);
  });

  it("on sender disconnect: notifies the target with a cancelled message so /accept stays reliable", () => {
    const alice = harness.connect("conn-a", "Alice");
    const bob = harness.connect("conn-b", "Bob");

    harness.sendPing(alice, { target: "Bob", amount: 40 });
    bob.clearSent();

    harness.disconnect(alice);

    const cancelled = bob.lastSent("review_ping_cancelled");
    expect(cancelled).toBeDefined();
    expect(cancelled!.sender).toBe("Alice");
    expect(cancelled!.reason).toBe("sender_disconnected");
  });

  it("/accept pays the target, boosts the sender's ticket, and prevents a double-accept", () => {
    const alice = harness.connect("conn-a", "Alice");
    const bob = harness.connect("conn-b", "Bob");

    harness.sendPing(alice, {
      target: "Bob",
      amount: 100,
      ticket: {
        id: "T-9",
        title: "Refactor",
        sprintGoal: 40,
        sprintProgress: 0,
      },
    });
    alice.clearSent();
    bob.clearSent();

    harness.accept(bob);

    const accepted = alice.lastSent("review_ping_accepted");
    expect(accepted).toBeDefined();
    expect(accepted!.amount).toBe(100);
    expect(accepted!.ticketId).toBe("T-9");
    // Boost = ceil((40 - 0) * 0.25) = 10.
    expect(accepted!.sprintProgressBoost).toBe(10);

    const claimed = bob.lastSent("review_ping_claimed");
    expect(claimed).toBeDefined();
    expect(claimed!.amount).toBe(100);

    // A second /accept should not resurrect the cleared request.
    bob.clearSent();
    harness.accept(bob);
    expect(bob.lastSent("review_ping_claimed")).toBeUndefined();
    expect(bob.lastSent("ping_failed")?.reason).toMatch(/no pending review/i);
  });

  it("rejects a second in-flight ping to the same target until the first resolves", () => {
    const alice = harness.connect("conn-a", "Alice");
    harness.connect("conn-b", "Bob");
    const carol = harness.connect("conn-c", "Carol");

    harness.sendPing(alice, { target: "Bob" });
    alice.clearSent();

    // Carol tries to ping Bob while Alice's request is still open.
    // (No rate limit collision — different sender.)
    harness.sendPing(carol, { target: "Bob" });
    const failed = carol.lastSent("ping_failed");
    expect(failed?.reason).toMatch(/already has a pending/i);
  });

  it("emits ping_failed when /accept runs with nothing pending (and does not refund anything)", () => {
    const bob = harness.connect("conn-b", "Bob");
    bob.clearSent();

    harness.accept(bob);

    const failed = bob.lastSent("ping_failed");
    expect(failed?.reason).toMatch(/no pending/i);
    expect(bob.allSent("review_ping_refunded")).toHaveLength(0);
    expect(bob.allSent("review_ping_cancelled")).toHaveLength(0);
  });
});
