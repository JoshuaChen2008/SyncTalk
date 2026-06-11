import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { currentUserQueryKey } from '../../auth/api/auth-hooks';
import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  type Profile,
  type ProfileInput,
} from './profile-api';

export const myProfileQueryKey = ['profile', 'me'] as const;
export const publicProfileQueryKey = (userId: string) => ['profile', 'public', userId] as const;

type UseMyProfileQueryOptions = {
  enabled?: boolean;
};

export function useMyProfileQuery({ enabled = true }: UseMyProfileQueryOptions = {}) {
  return useQuery({
    queryKey: myProfileQueryKey,
    queryFn: getMyProfile,
    enabled,
  });
}

export function usePublicProfileQuery(userId: string) {
  return useQuery({
    queryKey: publicProfileQueryKey(userId),
    queryFn: () => getPublicProfile(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) => updateMyProfile(input),
    onSuccess(profile: Profile) {
      queryClient.setQueryData(myProfileQueryKey, profile);
      queryClient.setQueryData(currentUserQueryKey, {
        id: profile.id,
        username: profile.username,
        email: profile.email,
      });
    },
  });
}
