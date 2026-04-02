import { useState, useEffect, useRef } from 'react';
import PartySocket from 'partysocket';
import { Message } from '../components/Terminal';

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer(setHistory: React.Dispatch<React.SetStateAction<Message[]>>) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [pendingPing, setPendingPing] = useState(false);
  // Track the current outage health to render the global health bar
  const [outageHp, setOutageHp] = useState<number | null>(null);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    const socket = new PartySocket({
      host: import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999',
      room: 'global-terminal',
    });
    socketRef.current = socket;

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'presence') {
          setOnlineCount(data.count);
        } else if (data.type === 'incoming_ping') {
          // Trigger the defense window state when attacked
          setPendingPing(true);
          setHistory(prev => [...prev, { role: 'warning', content: `[INCOMING PACKET] ${data.attacker} assigned you 3 Jira tickets. Type /reject in 5 seconds to block!` }]);

          // Automatically apply the debuff if the user fails to type /reject within 5 seconds
          setTimeout(() => {
            setPendingPing(current => {
              if (current) {
                setHistory(p => [...p, { role: 'error', content: '[DEBUFF] Jira tickets accepted. Tech Debt generation halved for 60s.' }]);
                return false;
              }
              return false;
            });
          }, 5000);
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
          setHistory(prev => [...prev, { role: 'system', content: '[SUCCESS] AWS us-east-1 is back online. All players receive a TD boost.' }]);
        }
      } catch {
        console.error('Failed to parse multiplayer message');
      }
    });

    return () => socket.close();
  }, [setHistory]);

  // Expose methods to trigger attacks and defend against them
  const sendPing = () => socketRef.current?.send(JSON.stringify({ type: 'ping' }));
  const rejectPing = () => setPendingPing(false);
  // Expose a method to allow players to attack the outage
  const sendDamage = () => socketRef.current?.send(JSON.stringify({ type: 'damage_outage' }));

  return { onlineCount, sendPing, pendingPing, rejectPing, outageHp, sendDamage };
}
