import { useQuery } from '@tanstack/react-query';

import { getCallSession, getCallToken } from './call-api';

export const callTokenQueryKey = ['call', 'token'] as const;

export function callSessionQueryKey(friendId: string) {
  return ['call', 'session', friendId] as const;
}

export function useCallTokenQuery() {
  return useQuery({
    queryKey: callTokenQueryKey,
    queryFn: getCallToken,
  });
}

export function useCallSessionQuery(friendId: string) {
  return useQuery({
    queryKey: callSessionQueryKey(friendId),
    queryFn: () => getCallSession(friendId),
    enabled: Boolean(friendId),
  });
}
