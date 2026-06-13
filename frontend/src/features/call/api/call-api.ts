import { apiClient } from '../../../lib/api-client';
import { t } from '../../../i18n/i18n-store';

export type CallUser = {
  id: string;
  username: string;
  avatar: string;
};

export type CallToken = {
  token: string;
  user: CallUser;
};

export type CallSession = {
  callId: string;
  callType: string;
  friend: CallUser;
  members: string[];
};

export async function getCallToken() {
  const response = await apiClient.get<CallToken>('/call/token');
  return response.data;
}

export async function getCallSession(friendId: string) {
  const response = await apiClient.get<CallSession>(`/call/session/${friendId}`);
  return response.data;
}

export async function ringCallSession(friendId: string) {
  const response = await apiClient.post<CallSession>(`/call/session/${friendId}/ring`);
  return response.data;
}

export function getCallApiErrorMessage(error: unknown) {
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

  return t('call.error.fallback');
}
