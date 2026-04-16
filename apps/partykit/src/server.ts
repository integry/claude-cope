import type * as Party from "partykit/server";
import type { ClientMessage, ServerMessage } from "@claude-cope/shared/multiplayer-types";

// The core PartyKit server class. We manage real-time, low-latency events here
// because Cloudflare Workers WebSockets are faster than standard database polling.
//
// Trust boundary: PartyKit is authoritative for the *transient* review-request
// lifecycle (timers, per-connection cooldowns, per-target exclusivity, refunds
// on disconnect/expiry). It is NOT authoritative for total game economy — TD
// balances are still computed and stored client-side, and the server only
// confirms that an in-flight review-request was accepted before its timeout.
export default class ClaudeCopeServer implements Party.Server {
  // 10s per-connection rate limit on outbound pings.
  private static readonly PING_RATE_LIMIT_MS = 10_000;
  // 1h cooldown between the same sender→target pair to prevent alt-account farming.
  private static readonly PING_TARGET_COOLDOWN_MS = 60 * 60 * 1000;
  // Pending review-requests live for 60s on the server before refunding.
  private static readonly REVIEW_REQUEST_TTL_MS = 60_000;
  // Sprint progress boost the sender receives on acceptance, expressed as a
  // fraction of the remaining sprint goal (so reviews stay meaningful late in
  // a ticket without fully completing it).
  private static readonly REVIEW_PROGRESS_FRACTION = 0.25;

  constructor(readonly room: Party.Room) {
    // Schedule automated outage events every 2–3 hours (random jitter)
    this.scheduleNextOutage();
  }

  // Maintain the authoritative health bar state for the co-op event
  private outageHp = 0;
  private isOutageActive = false;
  private outageTimer: ReturnType<typeof setTimeout> | null = null;
  private outageSchedule: ReturnType<typeof setTimeout> | null = null;

  // Track connected usernames by connection ID
  private usernames = new Map<string, string>();

  // PartyKit owns the short-lived review-request workflow because timers,
  // connection presence, and per-target exclusivity are all realtime concerns.
  // Keyed by a generated requestId so we can support multiple in-flight
  // requests across the room (but only one *per target* at any time).
  private pendingReviewRequests = new Map<string, {
    senderConnId: string;
    targetConnId: string;
    senderName: string;
    targetName: string;
    amount: number;
    ticket: {
      id: string;
      title: string;
      sprintGoal: number;
      sprintProgress: number;
    };
    timeout: ReturnType<typeof setTimeout>;
  }>();
  // Per-connection 10s rate limit (last outbound ping timestamp).
  private lastPingAt = new Map<string, number>();
  // Per (sender, target) 1h cooldown timestamp, keyed by `${senderId}:${targetId}`.
  private lastPingToTarget = new Map<string, number>();

  // When a user connects, extract their username and broadcast updated presence.
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const username = url.searchParams.get("username") || `anon-${conn.id.slice(0, 6)}`;
    this.usernames.set(conn.id, username);
    this.broadcastPresence();
  }

  // When a user disconnects, refund any pending review-request they were the
  // target of, drop their presence row, and broadcast the new presence.
  onClose(conn: Party.Connection) {
    this.clearPendingRequestsForConnection(conn.id);
    this.usernames.delete(conn.id);
    this.lastPingAt.delete(conn.id);
    this.broadcastPresence();
  }

  private send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  private broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data: ClientMessage = JSON.parse(message);
      if (data.type === "ping") {
        this.handleReviewPing(sender, data);
      } else if (data.type === "accept_review_ping") {
        this.handleAcceptReviewPing(sender);
      } else if (data.type === "damage_outage" && this.isOutageActive) {
        // Process damage from clients and broadcast the new health total to everyone
        this.outageHp = Math.max(0, this.outageHp - 10);
        this.broadcast({ type: "outage_update", hp: this.outageHp });

        // End the event if the community successfully depletes the health bar
        if (this.outageHp <= 0) {
          this.isOutageActive = false;
          if (this.outageTimer) {
            clearTimeout(this.outageTimer);
            this.outageTimer = null;
          }
          this.broadcast({ type: "outage_cleared" });
        }
      }
    } catch {
      console.error("Invalid message format");
    }
  }

  // Validate and register a new review-request from `sender`.
  // The server is authoritative on cooldowns, target presence, and per-target
  // exclusivity. The client is trusted only for the ticket payload and amount;
  // we treat them as opaque metadata that the target needs to make a decision.
  private handleReviewPing(sender: Party.Connection, data: Extract<ClientMessage, { type: "ping" }>) {
    const now = Date.now();

    // 10s per-connection rate limit (spam cap).
    const lastPing = this.lastPingAt.get(sender.id) ?? 0;
    const remainingCooldown = ClaudeCopeServer.PING_RATE_LIMIT_MS - (now - lastPing);
    if (remainingCooldown > 0) {
      this.send(sender, {
        type: "ping_failed",
        reason: `Slack rate-limit: wait ${Math.ceil(remainingCooldown / 1000)}s before pinging again.`,
      });
      return;
    }

    // Required payload: a ticket and a TD amount. The economy lives client-side,
    // so we cannot validate that the sender actually owns/can afford `amount`,
    // but we still require the field to be present so the target sees a price tag.
    if (!data.ticket || typeof data.amount !== "number" || data.amount <= 0) {
      this.send(sender, { type: "ping_failed", reason: "A live ticket and payment amount are required." });
      return;
    }

    const senderName = this.usernames.get(sender.id) || "A Coworker";
    const targets = Array.from(this.room.getConnections()).filter((conn) => conn.id !== sender.id);
    const targetConn = data.target
      ? targets.find((conn) => this.usernames.get(conn.id) === data.target)
      : targets[Math.floor(Math.random() * targets.length)];

    if (!targetConn) {
      this.send(sender, {
        type: "ping_failed",
        reason: data.target ? `User "${data.target}" is not online.` : "No one else is online.",
      });
      return;
    }

    const targetName = this.usernames.get(targetConn.id) || "someone";

    // 1h per (sender, target) cooldown — limits alt-account farming.
    const targetKey = `${sender.id}:${targetConn.id}`;
    const lastTargetPing = this.lastPingToTarget.get(targetKey) ?? 0;
    const remainingTargetCooldown = ClaudeCopeServer.PING_TARGET_COOLDOWN_MS - (now - lastTargetPing);
    if (remainingTargetCooldown > 0) {
      this.send(sender, {
        type: "ping_failed",
        reason: `You cannot request another review from ${targetName} for ${Math.ceil(remainingTargetCooldown / 60000)} more minutes.`,
      });
      return;
    }

    // Only one in-flight request per target — keeps `/accept` unambiguous.
    if (this.findPendingRequestByTarget(targetConn.id)) {
      this.send(sender, {
        type: "ping_failed",
        reason: `${targetName} already has a pending review request.`,
      });
      return;
    }

    this.lastPingAt.set(sender.id, now);
    this.lastPingToTarget.set(targetKey, now);

    const requestId = crypto.randomUUID();
    const timeout = setTimeout(() => {
      const pending = this.pendingReviewRequests.get(requestId);
      if (!pending) return;
      this.pendingReviewRequests.delete(requestId);
      const senderConn = this.getConnection(pending.senderConnId);
      if (senderConn) {
        this.send(senderConn, {
          type: "review_ping_refunded",
          target: pending.targetName,
          amount: pending.amount,
          reason: "expired",
        });
      }
    }, ClaudeCopeServer.REVIEW_REQUEST_TTL_MS);

    this.pendingReviewRequests.set(requestId, {
      senderConnId: sender.id,
      targetConnId: targetConn.id,
      senderName,
      targetName,
      amount: data.amount,
      ticket: data.ticket,
      timeout,
    });

    this.send(targetConn, {
      type: "review_ping_received",
      sender: senderName,
      amount: data.amount,
      expiresInMs: ClaudeCopeServer.REVIEW_REQUEST_TTL_MS,
      ticket: data.ticket,
    });
    this.send(sender, {
      type: "review_ping_sent",
      target: targetName,
      amount: data.amount,
      expiresInMs: ClaudeCopeServer.REVIEW_REQUEST_TTL_MS,
    });
  }

  // The accepting connection resolves the (only) pending request directed at it.
  private handleAcceptReviewPing(target: Party.Connection) {
    const requestEntry = this.findPendingRequestByTarget(target.id);
    if (!requestEntry) {
      this.send(target, { type: "ping_failed", reason: "No pending review request to accept." });
      return;
    }

    const [requestId, pending] = requestEntry;
    clearTimeout(pending.timeout);
    this.pendingReviewRequests.delete(requestId);

    // Sprint boost = 25% of remaining work (rounded up, min 1) — gives the
    // sender something tangible without trivializing the ticket completion.
    const remaining = Math.max(0, pending.ticket.sprintGoal - pending.ticket.sprintProgress);
    const sprintProgressBoost = Math.max(1, Math.ceil(remaining * ClaudeCopeServer.REVIEW_PROGRESS_FRACTION));

    const senderConn = this.getConnection(pending.senderConnId);
    if (senderConn) {
      this.send(senderConn, {
        type: "review_ping_accepted",
        sender: pending.senderName,
        target: pending.targetName,
        amount: pending.amount,
        sprintProgressBoost,
        ticketId: pending.ticket.id,
      });
    }

    this.send(target, {
      type: "review_ping_claimed",
      sender: pending.senderName,
      amount: pending.amount,
      ticketId: pending.ticket.id,
    });
  }

  private findPendingRequestByTarget(targetConnId: string) {
    for (const entry of this.pendingReviewRequests.entries()) {
      if (entry[1].targetConnId === targetConnId) return entry;
    }
    return undefined;
  }

  // PartyKit's connection lookup helper — older types do not expose
  // `getConnection`, so iterate to find by id and return undefined if gone.
  private getConnection(connId: string): Party.Connection | undefined {
    for (const conn of this.room.getConnections()) {
      if (conn.id === connId) return conn;
    }
    return undefined;
  }

  // When a connection closes, refund any pending request that involved it.
  // We refund only when the *target* disappears; if the sender disappears, the
  // held client-side TD is simply lost from their local state, which is fine
  // because the server is not authoritative for balances.
  private clearPendingRequestsForConnection(connId: string) {
    for (const [requestId, pending] of this.pendingReviewRequests.entries()) {
      if (pending.targetConnId !== connId && pending.senderConnId !== connId) continue;
      clearTimeout(pending.timeout);
      this.pendingReviewRequests.delete(requestId);

      if (pending.targetConnId === connId) {
        const senderConn = this.getConnection(pending.senderConnId);
        if (senderConn) {
          this.send(senderConn, {
            type: "review_ping_refunded",
            target: pending.targetName,
            amount: pending.amount,
            reason: "target_disconnected",
          });
        }
      }
    }
  }

  // Schedule the next automated outage after a random delay between 2 and 3 hours
  private scheduleNextOutage() {
    const minDelay = 2 * 60 * 60 * 1000; // 2 hours
    const maxDelay = 3 * 60 * 60 * 1000; // 3 hours
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    this.outageSchedule = setTimeout(() => {
      this.startOutage();
      this.scheduleNextOutage();
    }, delay);
  }

  // Start an outage event and set a 2-minute failure timer
  private startOutage() {
    if (this.isOutageActive) return;

    this.isOutageActive = true;
    this.outageHp = 100;

    this.broadcast({ type: "outage_start", hp: this.outageHp });

    // If players don't deplete the HP within 2 minutes, the outage fails
    this.outageTimer = setTimeout(() => {
      if (this.isOutageActive) {
        this.isOutageActive = false;
        this.outageHp = 0;
        this.broadcast({ type: "outage_failed" });
      }
    }, 2 * 60 * 1000);
  }

  // Broadcast the current connection count and list of online usernames to all clients.
  private broadcastPresence() {
    const connections = Array.from(this.room.getConnections());
    const users = connections.map(c => this.usernames.get(c.id) || `anon-${c.id.slice(0, 6)}`);
    this.broadcast({
      type: "presence",
      count: connections.length,
      users,
    });
  }
}
