import { describe, expect, it, vi } from 'vitest';

import { createNotificationsService } from '../services/notifications-service.js';

function createNotification(overrides = {}) {
  return {
    id: 'notification-1',
    userId: 'user-1',
    type: 'friend_request',
    title: 'New friend request',
    content: 'sam sent you a friend request.',
    readAt: null,
    metadata: { href: '/app/requests' },
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function createService({
  notificationsRepository: notificationsRepositoryOverrides = {},
  userRepository: userRepositoryOverrides = {},
} = {}) {
  const notificationsRepository = {
    create: vi.fn(async (notification) => createNotification(notification)),
    findForUser: vi.fn(async () => [
      createNotification({ id: 'notification-2', createdAt: '2026-06-02T00:00:00.000Z' }),
      createNotification({ id: 'notification-1', createdAt: '2026-06-01T00:00:00.000Z' }),
    ]),
    countUnreadForUser: vi.fn(async () => 1),
    markAsReadForUser: vi.fn(async () =>
      createNotification({ readAt: '2026-06-02T08:00:00.000Z' }),
    ),
    ...notificationsRepositoryOverrides,
  };
  const userRepository = {
    findById: vi.fn(async (userId) => ({
      id: userId,
      username: userId === 'user-2' ? 'sam' : 'mei',
    })),
    ...userRepositoryOverrides,
  };

  return {
    service: createNotificationsService({ notificationsRepository, userRepository }),
    notificationsRepository,
    userRepository,
  };
}

describe('notifications service', () => {
  it('returns notifications with unread count for a user', async () => {
    const { service, notificationsRepository } = createService();

    const result = await service.getNotifications('user-1');

    expect(notificationsRepository.findForUser).toHaveBeenCalledWith('user-1');
    expect(notificationsRepository.countUnreadForUser).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      notifications: [
        createNotification({ id: 'notification-2', createdAt: '2026-06-02T00:00:00.000Z' }),
        createNotification({ id: 'notification-1', createdAt: '2026-06-01T00:00:00.000Z' }),
      ],
      unreadCount: 1,
    });
  });

  it('marks only the current user notification as read', async () => {
    const { service, notificationsRepository } = createService();

    const notification = await service.markNotificationAsRead('user-1', 'notification-1');

    expect(notificationsRepository.markAsReadForUser).toHaveBeenCalledWith('user-1', 'notification-1');
    expect(notification).toMatchObject({
      id: 'notification-1',
      readAt: '2026-06-02T08:00:00.000Z',
    });
  });

  it('rejects marking a missing or foreign notification as read', async () => {
    const { service } = createService({
      notificationsRepository: {
        markAsReadForUser: vi.fn(async () => null),
      },
    });

    await expect(service.markNotificationAsRead('user-1', 'notification-2')).rejects.toMatchObject({
      status: 404,
      message: 'Notification not found',
    });
  });

  it('creates a friend request notification for the receiver', async () => {
    const { service, notificationsRepository } = createService();

    await service.createFriendRequestNotification({ senderId: 'user-2', receiverId: 'user-1' });

    expect(notificationsRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'friend_request',
      title: 'New friend request',
      content: 'sam sent you a friend request.',
      metadata: { href: '/app/requests' },
    });
  });

  it('creates a friend accepted notification for the original sender', async () => {
    const { service, notificationsRepository } = createService();

    await service.createFriendAcceptedNotification({ accepterId: 'user-2', senderId: 'user-1' });

    expect(notificationsRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'friend_accepted',
      title: 'Friend request accepted',
      content: 'sam accepted your friend request.',
      metadata: { href: '/app/friends' },
    });
  });
});
