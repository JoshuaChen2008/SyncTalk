import { useMutation, useQuery } from '@tanstack/react-query';

import { getCallSession, getCallToken, ringCallSession } from './call-api';

export const callTokenQueryKey = ['call', 'token'] as const;

export function callSessionQueryKey(friendId: string) {
  return ['call', 'session', friendId] as const;
}

export function useCallTokenQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: callTokenQueryKey,
    queryFn: getCallToken,
    enabled,
  });
}

export function useCallSessionQuery(
  friendId: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: callSessionQueryKey(friendId),
    queryFn: () => getCallSession(friendId),
    enabled: Boolean(friendId) && enabled,
  });
}

export function useRingCallSessionMutation() {
  return useMutation({
    mutationFn: (friendId: string) => ringCallSession(friendId),
  });
}
