import { apiClient } from '../../../lib/api-client';
import { t } from '../../../i18n/i18n-store';

export type PublicProfileRelationshipStatus =
  | 'stranger'
  | 'request_sent'
  | 'request_received'
  | 'friend';

export type Profile = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  languageLevel: string;
  learningGoal: string;
  bio: string;
  timezone: string;
  isProfileComplete: boolean;
};

export type ProfileInput = {
  nativeLanguage: string;
  targetLanguage: string;
  languageLevel: string;
  learningGoal: string;
  bio: string;
  timezone: string;
};

export type PublicProfile = Omit<Profile, 'email'> & {
  relationshipStatus: PublicProfileRelationshipStatus;
};

type ProfileResponse = {
  profile: Profile;
};

type PublicProfileResponse = {
  profile: PublicProfile;
};

export async function getMyProfile() {
  const response = await apiClient.get<ProfileResponse>('/profile/me');
  return response.data.profile;
}

export async function updateMyProfile(input: ProfileInput) {
  const response = await apiClient.patch<ProfileResponse>('/profile/me', input);
  return response.data.profile;
}

export async function getPublicProfile(userId: string) {
  const response = await apiClient.get<PublicProfileResponse>(`/profile/${userId}`);
  return response.data.profile;
}

export function getProfileApiErrorMessage(error: unknown) {
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

  return t('auth.error.fallback');
}
