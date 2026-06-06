import { Notification } from '../models/notification.js';

export function createNotificationsRepository({ notificationModel = Notification } = {}) {
  return {
    async create(notification) {
      const createdNotification = await notificationModel.create(notification);
      return createdNotification.toJSON();
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
  };
}

export const notificationsRepository = createNotificationsRepository();
