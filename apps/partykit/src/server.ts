import type * as Party from "partykit/server";

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

  // When a user connects, we broadcast the new total user count to everyone.
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.broadcastPresence();
  }

  // When a user disconnects, we update the count so the /who command remains accurate.
  onClose(conn: Party.Connection) {
    this.broadcastPresence();
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      if (data.type === "ping") {
        // We randomly select another active connection to serve as the target.
        // This simulates targeted sabotage without requiring a complex authentication system.
        const conns = Array.from(this.room.getConnections());
        const targets = conns.filter(c => c.id !== sender.id);
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          target.send(JSON.stringify({ type: "incoming_ping", attacker: "A Coworker" }));
        } else {
          sender.send(JSON.stringify({ type: "ping_failed", reason: "No one else is online." }));
        }
      } else if (data.type === "damage_outage" && this.isOutageActive) {
        // Process damage from clients and broadcast the new health total to everyone
        this.outageHp = Math.max(0, this.outageHp - 10);
        this.room.broadcast(JSON.stringify({ type: "outage_update", hp: this.outageHp }));

        // End the event if the community successfully depletes the health bar
        if (this.outageHp <= 0) {
          this.isOutageActive = false;
          if (this.outageTimer) {
            clearTimeout(this.outageTimer);
            this.outageTimer = null;
          }
          this.room.broadcast(JSON.stringify({ type: "outage_cleared" }));
        }
      }
    } catch (e) {
      console.error("Invalid message format");
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

    this.room.broadcast(
      JSON.stringify({ type: "outage_start", hp: this.outageHp })
    );

    // If players don't deplete the HP within 2 minutes, the outage fails
    this.outageTimer = setTimeout(() => {
      if (this.isOutageActive) {
        this.isOutageActive = false;
        this.outageHp = 0;
        this.room.broadcast(JSON.stringify({ type: "outage_failed" }));
      }
    }, 2 * 60 * 1000);
  }

  // Utility function to broadcast the current connection count to all clients in the room.
  private broadcastPresence() {
    const connections = Array.from(this.room.getConnections());
    this.room.broadcast(
      JSON.stringify({
        type: "presence",
        count: connections.length,
      })
    );
  }
}
