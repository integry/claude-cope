// ── Client → Server messages ──────────────────────────────────────────

/**
 * Send a paid review-request "ping" to another player.
 *
 * The sender is committing `amount` TD up front; the server holds that
 * commitment for 60 seconds and refunds the sender if the target ignores
 * the request, disconnects, or another error occurs. There is no debuff
 * for being away from the keyboard — this is an opt-in, AFK-safe interaction.
 */
export interface PingMessage {
  type: "ping";
  /** Optional username; if omitted the server picks a random online target. */
  target?: string;
  /** TD amount the sender is committing to pay on acceptance. */
  amount?: number;
  /** Ticket the sender is asking the target to review. */
  ticket?: {
    id: string;
    title: string;
    sprintGoal: number;
    sprintProgress: number;
  };
}

/** Target accepts the (single) pending review-request directed at them. */
export interface AcceptReviewPingMessage {
  type: "accept_review_ping";
}

export interface DamageOutageMessage {
  type: "damage_outage";
}

/** Discriminated union of every message a client can send to the server. */
export type ClientMessage = PingMessage | AcceptReviewPingMessage | DamageOutageMessage;

// ── Server → Client messages ─────────────────────────────────────────

export interface PresenceMessage {
  type: "presence";
  count: number;
  users: string[];
}

/** Server acknowledged a review-request and is holding it for `expiresInMs`. */
export interface ReviewPingSentMessage {
  type: "review_ping_sent";
  target: string;
  amount: number;
  expiresInMs: number;
}

/** Generic failure — rate limit, no target online, missing payload, etc. */
export interface PingFailedMessage {
  type: "ping_failed";
  reason: string;
}

/** Target was just selected for a review-request. They have `expiresInMs` to /accept. */
export interface ReviewPingReceivedMessage {
  type: "review_ping_received";
  sender: string;
  amount: number;
  expiresInMs: number;
  ticket: {
    id: string;
    title: string;
    sprintGoal: number;
    sprintProgress: number;
  };
}

/** Target accepted: tell the sender they got a sprint-progress boost. */
export interface ReviewPingAcceptedMessage {
  type: "review_ping_accepted";
  sender: string;
  target: string;
  amount: number;
  sprintProgressBoost: number;
  ticketId: string;
}

/** Target accepted: tell the target they earned the TD payout. */
export interface ReviewPingClaimedMessage {
  type: "review_ping_claimed";
  sender: string;
  amount: number;
  ticketId: string;
}

/** Target ignored / disconnected — refund the sender. */
export interface ReviewPingRefundedMessage {
  type: "review_ping_refunded";
  target: string;
  amount: number;
  reason: "expired" | "target_disconnected";
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
  | ReviewPingSentMessage
  | PingFailedMessage
  | ReviewPingReceivedMessage
  | ReviewPingAcceptedMessage
  | ReviewPingClaimedMessage
  | ReviewPingRefundedMessage
  | OutageStartMessage
  | OutageUpdateMessage
  | OutageClearedMessage
  | OutageFailedMessage;
