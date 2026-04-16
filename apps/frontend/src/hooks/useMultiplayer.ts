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
  // Credit the local player's TD balance with `amount`. Used both when the
  // sender is refunded (target ignored / disconnected) and when the target
  // claims a payout for accepting a review request.
  creditTD: (amount: number) => void;
  // Debit the local player's TD balance with `amount`. Called only after the
  // server has acknowledged a review-ping with `review_ping_sent`, so we never
  // charge the user for a request that never made it past validation.
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

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer({ username, setHistory, applyOutageReward, applyOutagePenalty, creditTD, debitTD, applyReviewSprintBoost }: UseMultiplayerOptions) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  // The most recent unhandled review-request directed at this player. Cleared
  // when the player runs `/accept` or when the server stops tracking it.
  const [pendingReviewPing, setPendingReviewPing] = useState<{ sender: string; amount: number } | null>(null);
  // Track the current outage health to render the global health bar
  const [outageHp, setOutageHp] = useState<number | null>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const lastActivityAt = useRef<number>(Date.now());

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
          // Server has accepted the request and is holding it; debit the
          // sender now so the displayed balance matches what's at risk.
          debitTD(data.amount);
          setHistory(prev => [...prev, { role: 'system', content: `[📡] Review request sent to **${data.target}** for **${data.amount} TD**. Awaiting their /accept (${Math.round(data.expiresInMs / 1000)}s).` }]);
        } else if (data.type === 'ping_failed') {
          setHistory(prev => [...prev, { role: 'error', content: `[❌] Ping failed: ${data.reason}` }]);
        } else if (data.type === 'review_ping_received') {
          // No penalty for ignoring this — the sender is paying us if we /accept.
          setPendingReviewPing({ sender: data.sender, amount: data.amount });
          setHistory(prev => [...prev, { role: 'warning', content: `[📩 REVIEW REQUEST] **${data.sender}** is offering **${data.amount} TD** for a review of \`${data.ticket.id}\` — *${data.ticket.title}*. Type \`/accept\` within ${Math.round(data.expiresInMs / 1000)}s to claim it.` }]);
        } else if (data.type === 'review_ping_accepted') {
          // Sender side: their target accepted; apply the sprint boost on the ticket.
          applyReviewSprintBoost(data.ticketId, data.sprintProgressBoost);
          setHistory(prev => [...prev, { role: 'system', content: `[✅] **${data.target}** reviewed your ticket. **+${data.sprintProgressBoost} sprint progress** applied. Cost: ${data.amount} TD.` }]);
        } else if (data.type === 'review_ping_claimed') {
          // Target side: payout confirmed.
          setPendingReviewPing(null);
          creditTD(data.amount);
          setHistory(prev => [...prev, { role: 'system', content: `[💰] You earned **${data.amount} TD** for reviewing **${data.sender}**'s ticket \`${data.ticketId}\`.` }]);
        } else if (data.type === 'review_ping_refunded') {
          // Sender side: target ignored or disconnected — refund.
          creditTD(data.amount);
          const why = data.reason === 'expired' ? 'ignored your request' : 'went offline';
          setHistory(prev => [...prev, { role: 'system', content: `[↩️] **${data.target}** ${why}. Refunded **${data.amount} TD**.` }]);
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

  // Send a paid review-request. The caller is responsible for debiting the
  // sender's local TD up front; the hook will credit it back via
  // `creditTD` if the server emits a refund event.
  const sendPing = (ticket: ReviewPingTicket, amount: number, target?: string) =>
    sendMessage({ type: 'ping', amount, ticket, ...(target ? { target } : {}) });
  // Accept the (only) pending review-request directed at this connection.
  const acceptReviewPing = () => {
    setPendingReviewPing(null);
    sendMessage({ type: 'accept_review_ping' });
  };
  // Expose a method to allow players to attack the outage
  const sendDamage = () => sendMessage({ type: 'damage_outage' });

  return { onlineCount, onlineUsers, sendPing, pendingReviewPing, acceptReviewPing, outageHp, sendDamage };
}
