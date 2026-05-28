import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getCurrentUser,
  login,
  logout,
  register,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from './auth-api';

export const currentUserQueryKey = ['auth', 'me'] as const;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess(user: AuthUser) {
      queryClient.setQueryData(currentUserQueryKey, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess(user: AuthUser) {
      queryClient.setQueryData(currentUserQueryKey, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess() {
      queryClient.setQueryData(currentUserQueryKey, null);
    },
  });
}
