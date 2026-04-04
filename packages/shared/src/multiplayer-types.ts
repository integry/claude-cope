// ── Client → Server messages ──────────────────────────────────────────

export interface PingMessage {
  type: "ping";
  target?: string;
}

export interface RejectPingMessage {
  type: "reject_ping";
}

export interface DamageOutageMessage {
  type: "damage_outage";
}

/** Discriminated union of every message a client can send to the server. */
export type ClientMessage = PingMessage | RejectPingMessage | DamageOutageMessage;

// ── Server → Client messages ─────────────────────────────────────────

export interface PresenceMessage {
  type: "presence";
  count: number;
  users: string[];
}

export interface PingSentMessage {
  type: "ping_sent";
  target: string;
}

export interface PingFailedMessage {
  type: "ping_failed";
  reason: string;
}

export interface IncomingPingMessage {
  type: "incoming_ping";
  attacker: string;
}

export interface PingAppliedMessage {
  type: "ping_applied";
  attacker: string;
  victim: string;
}

export interface PingRejectedMessage {
  type: "ping_rejected";
  victim: string;
}

export interface OutageStartMessage {
  type: "outage_start";
  hp: number;
}

export interface OutageUpdateMessage {
  type: "outage_update";
  hp: number;
}

export interface OutageClearedMessage {
  type: "outage_cleared";
}

export interface OutageFailedMessage {
  type: "outage_failed";
}

/** Discriminated union of every message the server can send to a client. */
export type ServerMessage =
  | PresenceMessage
  | PingSentMessage
  | PingFailedMessage
  | IncomingPingMessage
  | PingAppliedMessage
  | PingRejectedMessage
  | OutageStartMessage
  | OutageUpdateMessage
  | OutageClearedMessage
  | OutageFailedMessage;
