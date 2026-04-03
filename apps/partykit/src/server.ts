import type * as Party from "partykit/server";
import type { ClientMessage, ServerMessage } from "@claude-cope/shared/multiplayer-types";

// The core PartyKit server class. We manage real-time, low-latency events here
// because Cloudflare Workers WebSockets are faster than standard database polling.
export default class ClaudeCopeServer implements Party.Server {
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

  // Track pending PvP ping attacks awaiting rejection (keyed by victim connection ID)
  private pendingPings = new Map<string, ReturnType<typeof setTimeout>>();

  // When a user connects, extract their username and broadcast updated presence.
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const username = url.searchParams.get("username") || `anon-${conn.id.slice(0, 6)}`;
    this.usernames.set(conn.id, username);
    this.broadcastPresence();
  }

  // When a user disconnects, remove their username, clean up pending pings, and update presence.
  onClose(conn: Party.Connection) {
    const pending = this.pendingPings.get(conn.id);
    if (pending) {
      clearTimeout(pending);
      this.pendingPings.delete(conn.id);
    }
    this.usernames.delete(conn.id);
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
        const attackerName = this.usernames.get(sender.id) || "A Coworker";
        const conns = Array.from(this.room.getConnections());
        const targets = conns.filter(c => c.id !== sender.id);

        if (data.target) {
          // Targeted ping: find a specific user by username
          const targetConn = targets.find(c => this.usernames.get(c.id) === data.target);
          if (targetConn) {
            this.send(targetConn, { type: "incoming_ping", attacker: attackerName });
            this.send(sender, { type: "ping_sent", target: data.target });
            this.startPingTimer(targetConn.id, attackerName);
          } else {
            this.send(sender, { type: "ping_failed", reason: `User "${data.target}" is not online.` });
          }
        } else if (targets.length > 0) {
          // Random ping: select a random target
          const target = targets[Math.floor(Math.random() * targets.length)];
          const targetName = this.usernames.get(target.id) || "someone";
          this.send(target, { type: "incoming_ping", attacker: attackerName });
          this.send(sender, { type: "ping_sent", target: targetName });
          this.startPingTimer(target.id, attackerName);
        } else {
          this.send(sender, { type: "ping_failed", reason: "No one else is online." });
        }
      } else if (data.type === "reject_ping") {
        // Victim is rejecting/blocking the incoming attack
        const pending = this.pendingPings.get(sender.id);
        if (pending) {
          clearTimeout(pending);
          this.pendingPings.delete(sender.id);
          const victimName = this.usernames.get(sender.id) || "someone";
          this.broadcast({ type: "ping_rejected", victim: victimName });
        }
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

  // Start a 5-second server-authoritative timer for a pending ping attack.
  // If the victim doesn't reject in time, the debuff is applied automatically.
  private startPingTimer(victimConnId: string, attackerName: string) {
    // Clear any existing pending ping for this victim
    const existing = this.pendingPings.get(victimConnId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.pendingPings.delete(victimConnId);
      const victimName = this.usernames.get(victimConnId) || "someone";
      this.broadcast({ type: "ping_applied", attacker: attackerName, victim: victimName });
    }, 5000);

    this.pendingPings.set(victimConnId, timer);
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
