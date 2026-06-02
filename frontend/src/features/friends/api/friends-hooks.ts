import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  getFriendRequests,
  getFriends,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from './friends-api';

export const friendsListQueryKey = ['friends', 'list'] as const;
export const friendRequestsQueryKey = ['friends', 'requests'] as const;

function invalidateFriendState(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['friends'] }),
    queryClient.invalidateQueries({ queryKey: ['users'] }),
  ]);
}

export function useFriendsQuery() {
  return useQuery({
    queryKey: friendsListQueryKey,
    queryFn: getFriends,
  });
}

export function useFriendRequestsQuery() {
  return useQuery({
    queryKey: friendRequestsQueryKey,
    queryFn: getFriendRequests,
  });
}

export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
    onSuccess: () => invalidateFriendState(queryClient),
  });
}

export function useRespondToFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToFriendRequest,
    onSuccess: () => invalidateFriendState(queryClient),
  });
}

export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => invalidateFriendState(queryClient),
  });
}
