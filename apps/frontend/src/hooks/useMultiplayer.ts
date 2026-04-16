import { useState, useEffect, useRef } from 'react';
import PartySocket from 'partysocket';
import { Message } from '../components/Terminal';
import type { ClientMessage, ServerMessage } from '@claude-cope/shared/multiplayer-types';

interface ReviewPingTicket {
  id: string;
  title: string;
  sprintGoal: number;
  sprintProgress: number;
}

interface UseMultiplayerOptions {
  // The canonical user identity from game state (state.username). Used as the
  // PartyKit presence name so `/who`, `/ping`, `/profile`, and the leaderboard
  // all agree on who you are. Reconnects the socket when this changes.
  username: string;
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  applyOutageReward: () => void;
  applyOutagePenalty: () => void;
  // Credit the local player's TD balance with `amount`. Used when the target
  // claims a payout for accepting a review request, when the sender is
  // refunded (target ignored / disconnected), and when the server rejects a
  // ping that we already debited locally.
  creditTD: (amount: number) => void;
  // Debit the local player's TD balance with `amount`. The sender commits the
  // cost *immediately at command time* — before the websocket message even
  // goes out — so the visible balance always matches what is at risk. If the
  // server later rejects or times out the request, the hook refunds via
  // `creditTD` using either `ping_failed` or `review_ping_refunded`.
  debitTD: (amount: number) => void;
  // Apply a server-decided sprint-progress boost to the active ticket when
  // a coworker accepts our review request.
  applyReviewSprintBoost: (ticketId: string, boost: number) => void;
}

// Consider the user idle after 3 minutes with no mouse/keyboard activity.
// Idle users don't get outage alerts or penalties — they can't participate
// anyway, and waking up to 12 stacked "generator decommissioned" messages
// is a bad UX.
const IDLE_THRESHOLD_MS = 3 * 60 * 1000;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ── Pre-generated message pools ─────────────────────────────────────────
// Every automated message that the multiplayer layer emits pulls from one
// of these arrays so /ping, /accept, refunds, and failures never feel
// repetitive. Each template receives a context object and returns a string.

type SentCtx = { target: string; amount: number; seconds: number };
const SENT_MESSAGES: Array<(c: SentCtx) => string> = [
  ({ target, amount, seconds }) => `[📡] Review request fired off at **${target}** for **${amount} TD**. ${seconds}s until they /accept or this gets refunded.`,
  ({ target, amount, seconds }) => `[📡] Slacked **${target}** — "quick review?" — for **${amount} TD**. They have ${seconds}s to pretend they didn't see it.`,
  ({ target, amount, seconds }) => `[📡] Pinged **${target}** about your ticket. **${amount} TD** committed. Refund in ${seconds}s if they ghost you.`,
  ({ target, amount, seconds }) => `[📡] Review request queued with **${target}**. Holding **${amount} TD** in escrow for ${seconds}s.`,
  ({ target, amount, seconds }) => `[📡] **${target}** has been tagged in a review thread you opened. **${amount} TD** bounty. ${seconds}s timer running.`,
  ({ target, amount, seconds }) => `[📡] DM sent to **${target}**: "pls review, paying **${amount} TD**." Window closes in ${seconds}s.`,
  ({ target, amount, seconds }) => `[📡] **${target}**'s terminal just lit up. Offering **${amount} TD** for a review. ${seconds}s to respond.`,
  ({ target, amount, seconds }) => `[📡] Paged **${target}** like it's 2003. **${amount} TD** on the line. They have ${seconds}s.`,
];

type ReceivedCtx = { sender: string; amount: number; ticketId: string; ticketTitle: string; seconds: number };
const RECEIVED_MESSAGES: Array<(c: ReceivedCtx) => string> = [
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩 REVIEW REQUEST] **${sender}** is offering **${amount} TD** for a review of \`${ticketId}\` — *${ticketTitle}*. Type \`/accept\` within ${seconds}s to cash in.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩 INCOMING] **${sender}** needs eyes on \`${ticketId}\` — *${ticketTitle}*. Worth **${amount} TD** if you \`/accept\` in ${seconds}s.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩] **${sender}** is waving **${amount} TD** in your face for a review of \`${ticketId}\` (*${ticketTitle}*). \`/accept\` within ${seconds}s or they retract the offer.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩 REVIEW PENDING] **${sender}** tagged you on \`${ticketId}\` — *${ticketTitle}*. **${amount} TD** bounty, ${seconds}s to \`/accept\`.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩] Slack notification: **${sender}** says "mind taking a look at \`${ticketId}\`?" and attached **${amount} TD**. *${ticketTitle}*. \`/accept\` in ${seconds}s.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩 BOUNTY] **${amount} TD** for reviewing **${sender}**'s ticket \`${ticketId}\` (*${ticketTitle}*). \`/accept\` within ${seconds}s or watch them give up.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩] **${sender}** just dropped **${amount} TD** asking for a code review on \`${ticketId}\` — *${ticketTitle}*. ${seconds}s countdown to \`/accept\`.`,
  ({ sender, amount, ticketId, ticketTitle, seconds }) => `[📩 PING] **${sender}** wants a second opinion on \`${ticketId}\` — *${ticketTitle}* — and is paying **${amount} TD**. \`/accept\` within ${seconds}s.`,
];

type AcceptedCtx = { target: string; amount: number; boost: number };
const ACCEPTED_MESSAGES: Array<(c: AcceptedCtx) => string> = [
  ({ target, amount, boost }) => `[✅] **${target}** rubber-stamped your code. **+${boost} sprint progress** applied. Cost you ${amount} TD, bought you a coworker's goodwill.`,
  ({ target, amount, boost }) => `[✅] **${target}** reviewed your ticket — left two nitpicks and an LGTM. **+${boost} sprint progress**. ${amount} TD transferred.`,
  ({ target, amount, boost }) => `[✅] **${target}** said "ship it" after reading one line. **+${boost} sprint progress**. ${amount} TD well spent.`,
  ({ target, amount, boost }) => `[✅] Review merged. **${target}** is **${amount} TD** richer and your ticket is **+${boost} sprint progress** closer to done.`,
  ({ target, amount, boost }) => `[✅] **${target}** approved your PR. Unclear if they actually read it. **+${boost} sprint progress** applied. -${amount} TD.`,
  ({ target, amount, boost }) => `[✅] **${target}** accepted the review, cashed your ${amount} TD, and bumped your ticket **+${boost} sprint progress**. Corporate synergy achieved.`,
  ({ target, amount, boost }) => `[✅] **${target}** signed off on your ticket. **+${boost} sprint progress** — ${amount} TD fewer in your pocket.`,
  ({ target, amount, boost }) => `[✅] Review stamped by **${target}**. **+${boost} sprint progress**. You paid ${amount} TD. They paid zero attention. Worth it.`,
];

type ClaimedCtx = { sender: string; amount: number; ticketId: string };
const CLAIMED_MESSAGES: Array<(c: ClaimedCtx) => string> = [
  ({ sender, amount, ticketId }) => `[💰] You pocketed **${amount} TD** for "reviewing" **${sender}**'s ticket \`${ticketId}\`. The diff barely loaded.`,
  ({ sender, amount, ticketId }) => `[💰] **${amount} TD** deposited. You clicked "Approve" on **${sender}**'s \`${ticketId}\` — nobody has to know you didn't read it.`,
  ({ sender, amount, ticketId }) => `[💰] Payout received: **${amount} TD** from **${sender}** for reviewing \`${ticketId}\`. Rubber-stamping is a legitimate business model.`,
  ({ sender, amount, ticketId }) => `[💰] You just earned **${amount} TD** by saying "LGTM" to **${sender}** on \`${ticketId}\`. The economy is fine.`,
  ({ sender, amount, ticketId }) => `[💰] **+${amount} TD** credited for reviewing **${sender}**'s \`${ticketId}\`. Your approval ratio is now suspicious.`,
  ({ sender, amount, ticketId }) => `[💰] **${amount} TD** collected. **${sender}** thinks you reviewed \`${ticketId}\`. Let's keep it that way.`,
  ({ sender, amount, ticketId }) => `[💰] Review fee claimed: **${amount} TD** from **${sender}** on \`${ticketId}\`. Frictionless. Ethics-free.`,
  ({ sender, amount, ticketId }) => `[💰] **${sender}** paid you **${amount} TD** for eyeballing \`${ticketId}\`. You looked at it. Sort of.`,
];

type RefundedCtx = { target: string; amount: number; reason: 'expired' | 'target_disconnected' };
const REFUNDED_MESSAGES: Array<(c: RefundedCtx) => string> = [
  ({ target, amount, reason }) => `[↩️] **${target}** ${reason === 'expired' ? 'ignored your request' : 'went offline'}. **${amount} TD** refunded.`,
  ({ target, amount, reason }) => `[↩️] **${amount} TD** back in your pocket. **${target}** ${reason === 'expired' ? "didn't even open the DM" : 'rage-quit the session'}.`,
  ({ target, amount, reason }) => `[↩️] Refund processed: **${amount} TD**. **${target}** ${reason === 'expired' ? "let the timer run out" : 'dropped off the network'}.`,
  ({ target, amount, reason }) => `[↩️] **${target}** ${reason === 'expired' ? 'left you on read' : 'got disconnected mid-review'}. **${amount} TD** restored.`,
  ({ target, amount, reason }) => `[↩️] **${target}** ${reason === 'expired' ? 'did not respond in time' : "hasn't reconnected"}. Escrow released — **+${amount} TD**.`,
  ({ target, amount, reason }) => `[↩️] No review from **${target}**. They ${reason === 'expired' ? 'timed out' : 'vanished'}. **${amount} TD** refunded.`,
  ({ target, amount, reason }) => `[↩️] **${amount} TD** returned. **${target}** ${reason === 'expired' ? 'was too busy for you' : 'lost connection'}. Classic.`,
  ({ target, amount, reason }) => `[↩️] Ghosted by **${target}** (${reason === 'expired' ? 'ignored request' : 'disconnected'}). **+${amount} TD** refunded.`,
];

const FAILED_MESSAGES: Array<(reason: string) => string> = [
  (reason) => `[❌] Ping failed: ${reason}`,
  (reason) => `[❌] Review request bounced: ${reason}`,
  (reason) => `[❌] Slack ratelimit the old-fashioned way — your request was dropped: ${reason}`,
  (reason) => `[❌] Server rejected the ping: ${reason}`,
  (reason) => `[❌] Ping denied: ${reason}`,
  (reason) => `[❌] Something went sideways with your ping: ${reason}`,
  (reason) => `[❌] Request didn't go through: ${reason}`,
  (reason) => `[❌] Review ping refused: ${reason}`,
];

// Target-side cancellation copy. Split out so the message handler stays
// below the lint complexity ceiling — having the ternary inline tipped it over.
function cancelledCopy(sender: string, reason: 'expired' | 'sender_disconnected'): string {
  if (reason === 'sender_disconnected') {
    return `[⌛] **${sender}** disconnected before you could review their ticket. Bounty withdrawn.`;
  }
  return `[⌛] **${sender}**'s review request timed out. Nothing to \`/accept\` anymore.`;
}

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer({ username, setHistory, applyOutageReward, applyOutagePenalty, creditTD, debitTD, applyReviewSprintBoost }: UseMultiplayerOptions) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  // The most recent unhandled review-request directed at this player. Cleared
  // when the player runs `/accept`, when the server emits `review_ping_claimed`,
  // or when it emits `review_ping_cancelled` because the sender bailed / timed out.
  const [pendingReviewPing, setPendingReviewPing] = useState<{ sender: string; amount: number } | null>(null);
  // Track the current outage health to render the global health bar
  const [outageHp, setOutageHp] = useState<number | null>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const lastActivityAt = useRef<number>(Date.now());
  // Queue of in-flight ping amounts we debited locally before sending. Each
  // ping pushes an entry here; the next server verdict — `review_ping_sent`
  // (commit) or `ping_failed` (refund) — consumes the oldest entry. This lets
  // us distinguish a ping-rejection (needs refund) from an accept-rejection
  // (no refund, because no TD was committed for the accept path).
  const pendingSendAmounts = useRef<number[]>([]);

  // Track user activity so we can skip outage alerts when the tab is idle
  useEffect(() => {
    const markActive = () => { lastActivityAt.current = Date.now(); };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'focus'];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, markActive));
  }, []);

  useEffect(() => {
    const socket = new PartySocket({
      host: import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999',
      room: 'global-terminal',
      query: { username },
    });
    socketRef.current = socket;

    const isUserIdle = () => {
      if (document.hidden) return true;
      return Date.now() - lastActivityAt.current > IDLE_THRESHOLD_MS;
    };

    socket.addEventListener('message', (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        if (data.type === 'presence') {
          setOnlineCount(data.count);
          setOnlineUsers(data.users ?? []);
        } else if (data.type === 'review_ping_sent') {
          // Server has committed the request; the TD was already debited
          // locally at /ping time, so consume the queued amount without
          // touching the balance again.
          pendingSendAmounts.current.shift();
          const seconds = Math.round(data.expiresInMs / 1000);
          const content = pickRandom(SENT_MESSAGES)({ target: data.target, amount: data.amount, seconds });
          setHistory(prev => [...prev, { role: 'system', content }]);
        } else if (data.type === 'ping_failed') {
          // The server rejected a client message. If the failure corresponds
          // to a ping we pre-debited, refund it; otherwise it was an
          // /accept failure (no TD was ever committed for accept).
          const refundAmount = pendingSendAmounts.current.shift();
          if (refundAmount !== undefined) creditTD(refundAmount);
          const content = pickRandom(FAILED_MESSAGES)(data.reason);
          setHistory(prev => [...prev, { role: 'error', content }]);
        } else if (data.type === 'review_ping_received') {
          // No penalty for ignoring this — the sender is paying us if we /accept.
          setPendingReviewPing({ sender: data.sender, amount: data.amount });
          const seconds = Math.round(data.expiresInMs / 1000);
          const content = pickRandom(RECEIVED_MESSAGES)({
            sender: data.sender,
            amount: data.amount,
            ticketId: data.ticket.id,
            ticketTitle: data.ticket.title,
            seconds,
          });
          setHistory(prev => [...prev, { role: 'warning', content }]);
        } else if (data.type === 'review_ping_cancelled') {
          // Sender bailed or the 60s window lapsed. Clear local pending
          // state so /accept falls through correctly, and let the player
          // know the bounty is gone.
          setPendingReviewPing(null);
          setHistory(prev => [...prev, { role: 'system', content: cancelledCopy(data.sender, data.reason) }]);
        } else if (data.type === 'review_ping_accepted') {
          // Sender side: their target accepted; apply the sprint boost on the ticket.
          applyReviewSprintBoost(data.ticketId, data.sprintProgressBoost);
          const content = pickRandom(ACCEPTED_MESSAGES)({
            target: data.target,
            amount: data.amount,
            boost: data.sprintProgressBoost,
          });
          setHistory(prev => [...prev, { role: 'system', content }]);
        } else if (data.type === 'review_ping_claimed') {
          // Target side: payout confirmed.
          setPendingReviewPing(null);
          creditTD(data.amount);
          const content = pickRandom(CLAIMED_MESSAGES)({
            sender: data.sender,
            amount: data.amount,
            ticketId: data.ticketId,
          });
          setHistory(prev => [...prev, { role: 'system', content }]);
        } else if (data.type === 'review_ping_refunded') {
          // Sender side: target ignored or disconnected — refund.
          creditTD(data.amount);
          const content = pickRandom(REFUNDED_MESSAGES)({
            target: data.target,
            amount: data.amount,
            reason: data.reason,
          });
          setHistory(prev => [...prev, { role: 'system', content }]);
        } else if (data.type === 'outage_start') {
          // Skip the alert and health bar entirely when the user is idle —
          // they can't participate and we don't want to stack up alerts.
          if (isUserIdle()) return;
          setOutageHp(data.hp);
          setHistory(prev => [...prev, { role: 'error', content: '[CRITICAL ALERT: AWS us-east-1 IS DOWN]' }]);
        } else if (data.type === 'outage_update') {
          // Only sync the bar if the user is already engaged with this outage
          if (isUserIdle()) return;
          setOutageHp(data.hp);
        } else if (data.type === 'outage_cleared') {
          // Always clear the bar state; only reward+announce if not idle
          setOutageHp(null);
          if (isUserIdle()) return;
          applyOutageReward();
          setHistory(prev => [...prev, { role: 'system', content: '[SUCCESS] AWS us-east-1 is back online. All players receive a TD boost.' }]);
        } else if (data.type === 'outage_failed') {
          // Always clear the bar state; only penalize+announce if not idle
          setOutageHp(null);
          if (isUserIdle()) return;
          applyOutagePenalty();
          setHistory(prev => [...prev, { role: 'error', content: '[FAILURE] AWS us-east-1 outage was not resolved in time. Your most expensive generator has been decommissioned.' }]);
        }
      } catch {
        console.error('Failed to parse multiplayer message');
      }
    });

    return () => socket.close();
  }, [username, setHistory, applyOutageReward, applyOutagePenalty, creditTD, debitTD, applyReviewSprintBoost]);

  const sendMessage = (msg: ClientMessage) => socketRef.current?.send(JSON.stringify(msg));

  // Send a paid review-request. The sender's TD is debited *immediately*
  // (client-authoritative, per the issue spec) so the UI never shows a
  // balance higher than what is actually at risk. The in-flight amount is
  // queued so we can refund deterministically on `ping_failed` and know
  // that `review_ping_sent` should not double-debit. Later refunds from
  // expiry / disconnect arrive as `review_ping_refunded`.
  const sendPing = (ticket: ReviewPingTicket, amount: number, target?: string) => {
    debitTD(amount);
    pendingSendAmounts.current.push(amount);
    sendMessage({ type: 'ping', amount, ticket, ...(target ? { target } : {}) });
  };
  // Accept the (only) pending review-request directed at this connection.
  const acceptReviewPing = () => {
    setPendingReviewPing(null);
    sendMessage({ type: 'accept_review_ping' });
  };
  // Expose a method to allow players to attack the outage
  const sendDamage = () => sendMessage({ type: 'damage_outage' });

  return { onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, outageHp, sendDamage };
}
