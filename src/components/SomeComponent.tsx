import { useQuery } from '@tanstack/react-query';
import ConnectionError from '@/components/errors/ConnectionError';

export default function SomeComponent() {
  const { data, error, refetch } = useQuery(['key'], fetchData);

  if (error && !error.response) {
    return <ConnectionError onRetry={() => refetch()} />;
  }

  return (
    // Your component content
  );
} 