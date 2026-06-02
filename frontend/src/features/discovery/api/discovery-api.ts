import { apiClient } from '../../../lib/api-client';

export type RelationshipStatus = 'stranger' | 'request_sent' | 'request_received' | 'friend';

export type DiscoveryUser = {
  id: string;
  username: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  languageLevel: string;
  learningGoal: string;
  bio: string;
  timezone: string;
  matchReasons: string[];
  relationshipStatus: RelationshipStatus;
};

type DiscoveryUsersResponse = {
  users: DiscoveryUser[];
};

export async function getRecommendations() {
  const response = await apiClient.get<DiscoveryUsersResponse>('/users/recommendations');
  return response.data.users;
}

export async function searchUsers(query: string) {
  const response = await apiClient.get<DiscoveryUsersResponse>('/users/search', {
    params: { query },
  });
  return response.data.users;
}

export function getDiscoveryApiErrorMessage(error: unknown) {
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

  return 'Could not load language partners. Please try again.';
}
