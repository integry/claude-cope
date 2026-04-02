import { useState, useEffect, useRef } from 'react';
import PartySocket from 'partysocket';
import { Message } from '../components/Terminal';

// We pass setHistory to allow the hook to write messages directly to the terminal when an attack occurs.
export function useMultiplayer(setHistory: React.Dispatch<React.SetStateAction<Message[]>>) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [pendingPing, setPendingPing] = useState(false);
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

  return { onlineCount, sendPing, pendingPing, rejectPing };
}
