import { apiClient } from '../../../lib/api-client';
import { t } from '../../../i18n/i18n-store';

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

export type CreateUnreadMessageNotificationInput = {
  messageId?: string;
  preview: string;
  senderId: string;
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

export async function createUnreadMessageNotification(
  input: CreateUnreadMessageNotificationInput,
) {
  const response = await apiClient.post<{ notification: AppNotification }>(
    '/notifications/unread-message',
    input,
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

  return t('notifications.error.fallback');
}
