import { useState, useEffect } from 'react';
import PartySocket from 'partysocket';

export function useMultiplayer() {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const socket = new PartySocket({
      host: import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999',
      room: 'global-terminal',
    });

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'presence') {
          setOnlineCount(data.count);
        }
      } catch {
        console.error('Failed to parse multiplayer message');
      }
    });

    return () => socket.close();
  }, []);

  return { onlineCount };
}
