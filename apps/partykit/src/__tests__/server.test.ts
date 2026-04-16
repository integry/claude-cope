import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ClaudeCopeServer from "../server";
import type { ServerMessage } from "@claude-cope/shared/multiplayer-types";

/**
 * Regression coverage for the PartyKit review-request state machine (issue #679).
 * The realtime lifecycle is the highest-risk surface area in the ping rework:
 * cooldowns keyed by stable player identity, expiry notifications on both
 * sides, and disconnect-driven cancellation were all missing in the initial
 * implementation. These tests pin them in place.
 */

// ── Lightweight PartyKit mocks ──────────────────────────────────────────
// The real Party.Connection / Party.Room types are opaque from the server's
// perspective; we only use `.id`, `.send()`, `.getConnections()`,
// `.broadcast()`, and the URL query string. Matching that narrow surface is
// enough for the server class to run.

interface FakeConnection {
  id: string;
  sent: ServerMessage[];
  send: (raw: string) => void;
}

interface FakeRoom {
  connections: Map<string, FakeConnection>;
  getConnections: () => Iterable<FakeConnection>;
  broadcast: (raw: string) => void;
  broadcasts: ServerMessage[];
}

function makeConnection(id: string): FakeConnection {
  const conn: FakeConnection = {
    id,
    sent: [],
    send(raw: string) {
      conn.sent.push(JSON.parse(raw) as ServerMessage);
    },
  };
  return conn;
}

function makeRoom(): FakeRoom {
  const connections = new Map<string, FakeConnection>();
  const broadcasts: ServerMessage[] = [];
  return {
    connections,
    broadcasts,
    getConnections: () => connections.values(),
    broadcast(raw: string) {
      broadcasts.push(JSON.parse(raw) as ServerMessage);
    },
  };
}

function makeCtx(username: string) {
  return {
    request: new Request(`http://example.test/?username=${encodeURIComponent(username)}`),
  } as unknown as Parameters<ClaudeCopeServer["onConnect"]>[1];
}

function connect(server: ClaudeCopeServer, room: FakeRoom, id: string, username: string) {
  const conn = makeConnection(id);
  room.connections.set(id, conn);
  server.onConnect(conn as never, makeCtx(username));
  return conn;
}

function sendPing(
  server: ClaudeCopeServer,
  from: FakeConnection,
  target: string | undefined,
  opts?: { amount?: number; ticket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } }
) {
  const amount = opts?.amount ?? 50;
  const ticket = opts?.ticket ?? { id: "T-1", title: "Ship it", sprintGoal: 100, sprintProgress: 25 };
  server.onMessage(JSON.stringify({ type: "ping", amount, ticket, ...(target ? { target } : {}) }), from as never);
}

function lastSentOfType<T extends ServerMessage["type"]>(
  conn: FakeConnection,
  type: T
): Extract<ServerMessage, { type: T }> | undefined {
  for (let i = conn.sent.length - 1; i >= 0; i--) {
    const msg = conn.sent[i]!;
    if (msg.type === type) return msg as Extract<ServerMessage, { type: T }>;
  }
  return undefined;
}

function sentOfType<T extends ServerMessage["type"]>(
  conn: FakeConnection,
  type: T
): Array<Extract<ServerMessage, { type: T }>> {
  return conn.sent.filter((m) => m.type === type) as Array<Extract<ServerMessage, { type: T }>>;
}

describe("PartyKit review-request lifecycle", () => {
  let room: FakeRoom;
  let server: ClaudeCopeServer;

  beforeEach(() => {
    // Fake timers let us advance through the 60s TTL without waiting, and
    // keep the 2–3h scheduled outage timer from leaking into other tests.
    vi.useFakeTimers();
    room = makeRoom();
    server = new ClaudeCopeServer(room as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("routes a valid ping to the target and acknowledges the sender", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    const bob = connect(server, room, "conn-b", "Bob");

    // Reset tracking from the presence broadcasts during onConnect.
    alice.sent = [];
    bob.sent = [];

    sendPing(server, alice, "Bob", { amount: 50 });

    const received = lastSentOfType(bob, "review_ping_received");
    expect(received).toBeDefined();
    expect(received!.sender).toBe("Alice");
    expect(received!.amount).toBe(50);
    expect(received!.ticket.id).toBe("T-1");

    const sent = lastSentOfType(alice, "review_ping_sent");
    expect(sent).toBeDefined();
    expect(sent!.target).toBe("Bob");
    expect(sent!.amount).toBe(50);
  });

  it("rejects pings that omit the required amount or ticket", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    connect(server, room, "conn-b", "Bob");
    alice.sent = [];

    // Missing amount
    server.onMessage(
      JSON.stringify({ type: "ping", target: "Bob", ticket: { id: "T-1", title: "x", sprintGoal: 10, sprintProgress: 1 } }),
      alice as never
    );
    const fail1 = lastSentOfType(alice, "ping_failed");
    expect(fail1?.reason).toMatch(/ticket and payment amount/i);

    // Missing ticket
    alice.sent = [];
    server.onMessage(JSON.stringify({ type: "ping", target: "Bob", amount: 50 }), alice as never);
    const fail2 = lastSentOfType(alice, "ping_failed");
    expect(fail2?.reason).toMatch(/ticket and payment amount/i);
  });

  it("keys the 1h sender→target cooldown by username, not connection id — reconnects cannot bypass it", () => {
    const alice = connect(server, room, "conn-a1", "Alice");
    const bob = connect(server, room, "conn-b1", "Bob");
    alice.sent = [];

    // First ping succeeds and stamps the cooldown against (Alice, Bob).
    sendPing(server, alice, "Bob");
    expect(lastSentOfType(alice, "review_ping_sent")).toBeDefined();

    // Bob accepts so the per-target exclusivity lock is released — this
    // isolates the test to the *sender→target cooldown* specifically.
    server.onMessage(JSON.stringify({ type: "accept_review_ping" }), bob as never);

    // Simulate both players fully reconnecting with brand-new connection ids.
    // The connection-id-keyed implementation would reset the cooldown here;
    // the username-keyed implementation must not.
    server.onClose(alice as never);
    server.onClose(bob as never);
    const alice2 = connect(server, room, "conn-a2", "Alice");
    connect(server, room, "conn-b2", "Bob");
    alice2.sent = [];

    // Wait out the 10s per-player rate limit so the failure can only be the
    // 1h cooldown, not the spam cap.
    vi.advanceTimersByTime(11_000);

    sendPing(server, alice2, "Bob");
    const failed = lastSentOfType(alice2, "ping_failed");
    expect(failed).toBeDefined();
    expect(failed!.reason).toMatch(/another review from Bob/i);
    // And no new request should have been registered for the reconnected pair.
    expect(lastSentOfType(alice2, "review_ping_sent")).toBeUndefined();
  });

  it("enforces the per-player 10s rate limit across reconnects (same username, new conn id)", () => {
    const alice = connect(server, room, "conn-a1", "Alice");
    connect(server, room, "conn-b", "Bob");
    connect(server, room, "conn-c", "Carol");
    alice.sent = [];

    sendPing(server, alice, "Bob");
    expect(lastSentOfType(alice, "review_ping_sent")).toBeDefined();

    // Reconnect Alice with a new connection id; the username is the same.
    server.onClose(alice as never);
    const alice2 = connect(server, room, "conn-a2", "Alice");
    alice2.sent = [];

    // Pinging a *different* target (Carol) so the 1h cooldown is not the gate.
    sendPing(server, alice2, "Carol");
    const failed = lastSentOfType(alice2, "ping_failed");
    expect(failed?.reason).toMatch(/rate-limit/i);
  });

  it("on natural expiry: refunds the sender AND cancels the target's pending state", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    const bob = connect(server, room, "conn-b", "Bob");
    alice.sent = [];
    bob.sent = [];

    sendPing(server, alice, "Bob", { amount: 75 });
    // Precondition: Bob has a received bounty, Alice has a sent ack.
    expect(lastSentOfType(bob, "review_ping_received")).toBeDefined();
    expect(lastSentOfType(alice, "review_ping_sent")).toBeDefined();

    // Let the 60s TTL lapse.
    vi.advanceTimersByTime(60_001);

    // Sender gets refunded with the expired reason.
    const refund = lastSentOfType(alice, "review_ping_refunded");
    expect(refund).toBeDefined();
    expect(refund!.amount).toBe(75);
    expect(refund!.reason).toBe("expired");

    // Target gets a cancellation so the client can clear pendingReviewPing.
    const cancelled = lastSentOfType(bob, "review_ping_cancelled");
    expect(cancelled).toBeDefined();
    expect(cancelled!.sender).toBe("Alice");
    expect(cancelled!.reason).toBe("expired");
  });

  it("on target disconnect: refunds the sender and does not send a cancel (nobody to tell)", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    const bob = connect(server, room, "conn-b", "Bob");
    alice.sent = [];

    sendPing(server, alice, "Bob", { amount: 30 });
    alice.sent = [];

    room.connections.delete(bob.id);
    server.onClose(bob as never);

    const refund = lastSentOfType(alice, "review_ping_refunded");
    expect(refund).toBeDefined();
    expect(refund!.reason).toBe("target_disconnected");
    expect(refund!.amount).toBe(30);
  });

  it("on sender disconnect: notifies the target with a cancelled message so /accept stays reliable", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    const bob = connect(server, room, "conn-b", "Bob");

    sendPing(server, alice, "Bob", { amount: 40 });
    bob.sent = [];

    room.connections.delete(alice.id);
    server.onClose(alice as never);

    const cancelled = lastSentOfType(bob, "review_ping_cancelled");
    expect(cancelled).toBeDefined();
    expect(cancelled!.sender).toBe("Alice");
    expect(cancelled!.reason).toBe("sender_disconnected");
  });

  it("/accept pays the target, boosts the sender's ticket, and prevents a double-accept", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    const bob = connect(server, room, "conn-b", "Bob");

    sendPing(server, alice, "Bob", {
      amount: 100,
      ticket: { id: "T-9", title: "Refactor", sprintGoal: 40, sprintProgress: 0 },
    });
    alice.sent = [];
    bob.sent = [];

    server.onMessage(JSON.stringify({ type: "accept_review_ping" }), bob as never);

    const accepted = lastSentOfType(alice, "review_ping_accepted");
    expect(accepted).toBeDefined();
    expect(accepted!.amount).toBe(100);
    expect(accepted!.ticketId).toBe("T-9");
    // Boost = ceil((40 - 0) * 0.25) = 10.
    expect(accepted!.sprintProgressBoost).toBe(10);

    const claimed = lastSentOfType(bob, "review_ping_claimed");
    expect(claimed).toBeDefined();
    expect(claimed!.amount).toBe(100);

    // A second /accept should not resurrect the cleared request.
    bob.sent = [];
    server.onMessage(JSON.stringify({ type: "accept_review_ping" }), bob as never);
    expect(lastSentOfType(bob, "review_ping_claimed")).toBeUndefined();
    expect(lastSentOfType(bob, "ping_failed")?.reason).toMatch(/no pending review/i);
  });

  it("rejects a second in-flight ping to the same target until the first resolves", () => {
    const alice = connect(server, room, "conn-a", "Alice");
    connect(server, room, "conn-b", "Bob");
    const carol = connect(server, room, "conn-c", "Carol");

    sendPing(server, alice, "Bob");
    alice.sent = [];

    // Carol tries to ping Bob while Alice's request is still open.
    // (No rate limit collision — different sender.)
    sendPing(server, carol, "Bob");
    const failed = lastSentOfType(carol, "ping_failed");
    expect(failed?.reason).toMatch(/already has a pending/i);
  });

  it("emits ping_failed when /accept runs with nothing pending (and does not refund anything)", () => {
    const bob = connect(server, room, "conn-b", "Bob");
    bob.sent = [];

    server.onMessage(JSON.stringify({ type: "accept_review_ping" }), bob as never);

    const failed = lastSentOfType(bob, "ping_failed");
    expect(failed?.reason).toMatch(/no pending/i);
    expect(sentOfType(bob, "review_ping_refunded")).toHaveLength(0);
    expect(sentOfType(bob, "review_ping_cancelled")).toHaveLength(0);
  });
});
