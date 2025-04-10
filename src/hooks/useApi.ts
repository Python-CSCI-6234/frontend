import { useSession } from 'next-auth/react';
import { ApiClient } from '@/services/api';
import { useMemo } from 'react';

export function useApi() {
  const { data: session, status } = useSession();
  
  return useMemo(() => {
    if (status === 'loading') {
      return null;
    }
    if (!session?.accessToken) {
      return null;
    }
    return new ApiClient(session.accessToken);
  }, [session?.accessToken, status]);
} 