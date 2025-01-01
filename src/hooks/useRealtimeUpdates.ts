import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update relevant queries based on the received data
      if (data.type === 'DATA_UPDATE') {
        queryClient.invalidateQueries({ queryKey: [data.entity] });
      }
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);
}; 