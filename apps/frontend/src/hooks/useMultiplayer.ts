import { useState, useEffect, useRef } from 'react';
import PartySocket from 'partysocket';
import { Message } from '../components/Terminal';
import type { ClientMessage, ServerMessage } from '@claude-cope/shared/multiplayer-types';

interface UseMultiplayerOptions {
  // The canonical user identity from game state (state.username). Used as the
  // PartyKit presence name so `/who`, `/ping`, `/profile`, and the leaderboard
  // all agree on who you are. Reconnects the socket when this changes.
  username: string;
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  applyOutageReward: () => void;
  applyOutagePenalty: () => void;
  applyPvpDebuff: () => void;
}

// Consider the user idle after 3 minutes with no mouse/keyboard activity.
// Idle users don't get outage alerts or penalties — they can't participate
// anyway, and waking up to 12 stacked "generator decommissioned" messages
// is a bad UX.
const IDLE_THRESHOLD_MS = 3 * 60 * 1000;

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer({ username, setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff }: UseMultiplayerOptions) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pendingPing, setPendingPing] = useState(false);
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
        } else if (data.type === 'ping_sent') {
          setHistory(prev => [...prev, { role: 'system', content: `[📡] Ping delivered to ${data.target}. Jira tickets dispatched.` }]);
        } else if (data.type === 'ping_failed') {
          setHistory(prev => [...prev, { role: 'error', content: `[❌] Ping failed: ${data.reason}` }]);
        } else if (data.type === 'incoming_ping') {
          // Trigger the defense window state when attacked
          setPendingPing(true);
          setHistory(prev => [...prev, { role: 'warning', content: `[INCOMING PACKET] ${data.attacker} assigned you 3 Jira tickets. Type /reject in 5 seconds to block!` }]);
        } else if (data.type === 'ping_applied') {
          // Server confirmed the ping was not rejected in time — apply the debuff
          setPendingPing(false);
          setHistory(prev => [...prev, { role: 'error', content: '[DEBUFF] Jira tickets accepted. Tech Debt generation halved for 60s.' }]);
          applyPvpDebuff();
        } else if (data.type === 'ping_rejected') {
          // Server confirmed the ping was successfully rejected
          setPendingPing(false);
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
  }, [username, setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff]);

  const sendMessage = (msg: ClientMessage) => socketRef.current?.send(JSON.stringify(msg));

  // Expose methods to trigger attacks and defend against them
  const sendPing = (target?: string) => sendMessage({ type: 'ping', ...(target ? { target } : {}) });
  const rejectPing = () => {
    setPendingPing(false);
    sendMessage({ type: 'reject_ping' });
  };
  // Expose a method to allow players to attack the outage
  const sendDamage = () => sendMessage({ type: 'damage_outage' });

  return { onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, outageHp, sendDamage };
}
