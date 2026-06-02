import { apiClient } from '../../../lib/api-client';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'unread_message'
  | 'incoming_call';

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  readAt: string | null;
  metadata: {
    href?: string;
  };
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

export async function getNotifications() {
  const response = await apiClient.get<NotificationsResponse>('/notifications');
  return response.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await apiClient.patch<{ notification: AppNotification }>(
    `/notifications/${notificationId}/read`,
  );
  return response.data.notification;
}

export function getNotificationsApiErrorMessage(error: unknown) {
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

  return 'Could not load notifications. Please try again.';
}
