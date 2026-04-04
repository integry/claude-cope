import { useState, useEffect, useRef } from 'react';
import PartySocket from 'partysocket';
import { Message } from '../components/Terminal';
import type { ClientMessage, ServerMessage } from '@claude-cope/shared/multiplayer-types';

interface UseMultiplayerOptions {
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  applyOutageReward: () => void;
  applyOutagePenalty: () => void;
  applyPvpDebuff: () => void;
}

// Generate a persistent random username for this browser session
function getLocalUsername(): string {
  const key = 'claude-cope-username';
  let name = localStorage.getItem(key);
  if (!name) {
    const adjectives = ['Agile', 'Scrum', 'Legacy', 'Senior', 'Junior', 'Stealth', 'Rogue', 'Toxic', 'Based', 'Cracked'];
    const nouns = ['Dev', 'Intern', 'Architect', 'SRE', 'Manager', 'Contractor', 'Gopher', 'Rustacean', 'Pythonista', 'Hacker'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]!;
    const noun = nouns[Math.floor(Math.random() * nouns.length)]!;
    const num = Math.floor(Math.random() * 999);
    name = `${adj}${noun}${num}`;
    localStorage.setItem(key, name);
  }
  return name;
}

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer({ setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff }: UseMultiplayerOptions) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pendingPing, setPendingPing] = useState(false);
  // Track the current outage health to render the global health bar
  const [outageHp, setOutageHp] = useState<number | null>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const localUsername = useRef(getLocalUsername()).current;

  useEffect(() => {
    const socket = new PartySocket({
      host: import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999',
      room: 'global-terminal',
      query: { username: localUsername },
    });
    socketRef.current = socket;

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
          // Show critical alert and initialize the health bar
          setOutageHp(data.hp);
          setHistory(prev => [...prev, { role: 'error', content: '[CRITICAL ALERT: AWS us-east-1 IS DOWN]' }]);
        } else if (data.type === 'outage_update') {
          // Sync the local health bar with the server
          setOutageHp(data.hp);
        } else if (data.type === 'outage_cleared') {
          // Remove the health bar and reward players
          setOutageHp(null);
          applyOutageReward();
          setHistory(prev => [...prev, { role: 'system', content: '[SUCCESS] AWS us-east-1 is back online. All players receive a TD boost.' }]);
        } else if (data.type === 'outage_failed') {
          // Remove the health bar and penalize players
          setOutageHp(null);
          applyOutagePenalty();
          setHistory(prev => [...prev, { role: 'error', content: '[FAILURE] AWS us-east-1 outage was not resolved in time. Your most expensive generator has been decommissioned.' }]);
        }
      } catch {
        console.error('Failed to parse multiplayer message');
      }
    });

    return () => socket.close();
  }, [localUsername, setHistory, applyOutageReward, applyOutagePenalty, applyPvpDebuff]);

  const sendMessage = (msg: ClientMessage) => socketRef.current?.send(JSON.stringify(msg));

  // Expose methods to trigger attacks and defend against them
  const sendPing = (target?: string) => sendMessage({ type: 'ping', ...(target ? { target } : {}) });
  const rejectPing = () => {
    setPendingPing(false);
    sendMessage({ type: 'reject_ping' });
  };
  // Expose a method to allow players to attack the outage
  const sendDamage = () => sendMessage({ type: 'damage_outage' });

  return { onlineCount, onlineUsers, sendPing, pendingPing, rejectPing, outageHp, sendDamage, localUsername };
}
