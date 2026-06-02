import { notificationsRepository as defaultNotificationsRepository } from './notifications-repository.js';
import { createUserRepository } from './user-repository.js';
import { createHttpError } from '../utils/http-error.js';

function toId(value) {
  return String(value);
}

function getEntityId(entity) {
  return toId(entity.id ?? entity._id);
}

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function serializeNotification(notification) {
  return {
    id: getEntityId(notification),
    userId: toId(notification.userId),
    type: notification.type,
    title: notification.title,
    content: notification.content,
    readAt: serializeDate(notification.readAt),
    metadata: notification.metadata ?? {},
    createdAt: serializeDate(notification.createdAt),
  };
}

async function getUsername(userRepository, userId) {
  const user = await userRepository.findById(userId);
  return user?.username ?? 'Someone';
}

export function createNotificationsService({
  notificationsRepository = defaultNotificationsRepository,
  userRepository = createUserRepository(),
} = {}) {
  return {
    async getNotifications(userId) {
      const [notifications, unreadCount] = await Promise.all([
        notificationsRepository.findForUser(userId),
        notificationsRepository.countUnreadForUser(userId),
      ]);

      return {
        notifications: notifications.map(serializeNotification),
        unreadCount,
      };
    },

    async markNotificationAsRead(userId, notificationId) {
      const notification = await notificationsRepository.markAsReadForUser(userId, notificationId);

      if (!notification) {
        throw createHttpError(404, 'Notification not found');
      }

      return serializeNotification(notification);
    },

    async createFriendRequestNotification({ senderId, receiverId }) {
      const senderName = await getUsername(userRepository, senderId);

      return notificationsRepository.create({
        userId: receiverId,
        type: 'friend_request',
        title: 'New friend request',
        content: `${senderName} sent you a friend request.`,
        metadata: { href: '/app/requests' },
      });
    },

    async createFriendAcceptedNotification({ accepterId, senderId }) {
      const accepterName = await getUsername(userRepository, accepterId);

      return notificationsRepository.create({
        userId: senderId,
        type: 'friend_accepted',
        title: 'Friend request accepted',
        content: `${accepterName} accepted your friend request.`,
        metadata: { href: '/app/friends' },
      });
    },
  };
}

export const notificationsService = createNotificationsService();
