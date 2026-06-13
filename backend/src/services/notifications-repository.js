import { Notification } from '../models/notification.js';

export function createNotificationsRepository({ notificationModel = Notification } = {}) {
  return {
    async create(notification) {
      const createdNotification = await notificationModel.create(notification);
      return createdNotification.toJSON();
    },
    findUnreadMessageForSender(userId, senderId) {
      return notificationModel
        .findOne({
          userId,
          type: 'unread_message',
          readAt: null,
          'metadata.senderId': senderId,
        })
        .lean();
    },
    findForUser(userId) {
      return notificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
    },
    countUnreadForUser(userId) {
      return notificationModel.countDocuments({ userId, readAt: null });
    },
    markAsReadForUser(userId, notificationId) {
      return notificationModel
        .findOneAndUpdate(
          { _id: notificationId, userId },
          { readAt: new Date() },
          { returnDocument: 'after' },
        )
        .lean();
    },
    updateUnreadMessageForSender(userId, senderId, notification) {
      return notificationModel
        .findOneAndUpdate(
          {
            userId,
            type: 'unread_message',
            readAt: null,
            'metadata.senderId': senderId,
          },
          notification,
          { returnDocument: 'after' },
        )
        .lean();
    },
  };
}

export const notificationsRepository = createNotificationsRepository();
