import type * as Party from "partykit/server";

// The core PartyKit server class. We manage real-time, low-latency events here
// because Cloudflare Workers WebSockets are faster than standard database polling.
export default class ClaudeCopeServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Maintain the authoritative health bar state for the co-op event
  private outageHp = 0;
  private isOutageActive = false;

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
          this.room.broadcast(JSON.stringify({ type: "outage_cleared" }));
        }
      }
    } catch (e) {
      console.error("Invalid message format");
    }
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
