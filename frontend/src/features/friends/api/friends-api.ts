import { apiClient } from '../../../lib/api-client';
import { t } from '../../../i18n/i18n-store';

export type FriendUser = {
  id: string;
  username: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  languageLevel: string;
  learningGoal: string;
  bio: string;
  timezone: string;
};

export type Friend = FriendUser & {
  friendshipId: string;
  createdAt: string;
};

export type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user: FriendUser;
};

export type FriendRequests = {
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
};

type FriendRequestResponse = {
  request: Omit<FriendRequest, 'user'>;
};

type FriendRequestsResponse = FriendRequests;

type FriendsResponse = {
  friends: Friend[];
};

type RemoveFriendResponse = {
  removed: boolean;
};

export async function sendFriendRequest(receiverId: string) {
  const response = await apiClient.post<FriendRequestResponse>('/friends/requests', { receiverId });
  return response.data.request;
}

export async function getFriendRequests() {
  const response = await apiClient.get<FriendRequestsResponse>('/friends/requests');
  return response.data;
}

export async function respondToFriendRequest({
  requestId,
  action,
}: {
  requestId: string;
  action: 'accept' | 'reject';
}) {
  const response = await apiClient.patch<FriendRequestResponse>(`/friends/requests/${requestId}`, {
    action,
  });
  return response.data.request;
}

export async function getFriends() {
  const response = await apiClient.get<FriendsResponse>('/friends');
  return response.data.friends;
}

export async function removeFriend(friendId: string) {
  const response = await apiClient.delete<RemoveFriendResponse>(`/friends/${friendId}`);
  return response.data;
}

export function getFriendsApiErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  return t('friends.error.fallback');
}
