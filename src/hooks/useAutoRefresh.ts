import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useAutoRefresh = (keys: string[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up listeners for important data changes
    const refreshData = () => {
      keys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    };

    // Listen for specific events that should trigger a refresh
    window.addEventListener('app:dataChanged', refreshData);
    
    return () => {
      window.removeEventListener('app:dataChanged', refreshData);
    };
  }, [keys, queryClient]);
}; 