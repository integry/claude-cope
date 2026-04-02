import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRecentEvents, GameEvent } from './useRecentEvents';

// This hook merges SWR polling (for initial load and fallback) with Supabase WebSockets.
// We use this hybrid approach so the app degrades gracefully if WebSockets fail.
export function useLiveTicker() {
  const { events: initialEvents } = useRecentEvents();
  const [liveEvents, setLiveEvents] = useState<GameEvent[]>([]);

  // Sync SWR data into local state initially to populate the ticker on load.
  useEffect(() => {
    if (initialEvents.length > 0 && liveEvents.length === 0) {
      setLiveEvents(initialEvents);
    }
  }, [initialEvents, liveEvents.length]);

  // Subscribe to the 'global_incidents' channel to listen for live events.
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel('global_incidents')
      .on('broadcast', { event: 'new_incident' }, (payload) => {
        // Prepend new events to the list and trim to keep the array small
        setLiveEvents((prev) => [
          { message: payload.payload.message, created_at: new Date().toISOString() },
          ...prev.slice(0, 9)
        ]);
      })
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  return liveEvents;
}
