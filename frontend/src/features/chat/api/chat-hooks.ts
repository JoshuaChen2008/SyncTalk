import { useQuery } from '@tanstack/react-query';

import { getChatChannel, getChatToken } from './chat-api';

export const chatTokenQueryKey = ['chat', 'token'] as const;

export function chatChannelQueryKey(friendId: string) {
  return ['chat', 'channel', friendId] as const;
}

export function useChatTokenQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: chatTokenQueryKey,
    queryFn: getChatToken,
    enabled,
  });
}

export function useChatChannelQuery(friendId: string) {
  return useQuery({
    queryKey: chatChannelQueryKey(friendId),
    queryFn: () => getChatChannel(friendId),
    enabled: Boolean(friendId),
  });
}
