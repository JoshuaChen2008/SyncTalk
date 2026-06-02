import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getNotifications, markNotificationAsRead } from './notifications-api';

export const notificationsQueryKey = ['notifications'] as const;

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}
