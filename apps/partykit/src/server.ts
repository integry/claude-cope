import type * as Party from "partykit/server";

// The core PartyKit server class. We manage real-time, low-latency events here
// because Cloudflare Workers WebSockets are faster than standard database polling.
export default class ClaudeCopeServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

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
      // Future handlers for ping and outage will go here
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
