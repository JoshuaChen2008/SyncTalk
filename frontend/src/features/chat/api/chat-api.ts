import { apiClient } from '../../../lib/api-client';

export type ChatUser = {
  id: string;
  username: string;
  avatar: string;
};

export type ChatToken = {
  token: string;
  user: ChatUser;
};

export type ChatChannel = {
  channelId: string;
  friend: ChatUser;
  members: string[];
};

export async function getChatToken() {
  const response = await apiClient.get<ChatToken>('/chat/token');
  return response.data;
}

export async function getChatChannel(friendId: string) {
  const response = await apiClient.get<ChatChannel>(`/chat/channel/${friendId}`);
  return response.data;
}

export function getChatApiErrorMessage(error: unknown) {
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

  return 'Could not load chat. Please try again.';
}
