import { useQuery } from '@tanstack/react-query';

import { getRecommendations, searchUsers } from './discovery-api';

export const recommendationsQueryKey = ['users', 'recommendations'] as const;

export function searchUsersQueryKey(query: string) {
  return ['users', 'search', query] as const;
}

export function useRecommendationsQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: recommendationsQueryKey,
    queryFn: getRecommendations,
    enabled,
  });
}

export function useSearchUsersQuery(query: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: searchUsersQueryKey(query),
    queryFn: () => searchUsers(query),
    enabled,
  });
}
