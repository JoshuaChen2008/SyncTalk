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
  relationshipRepository: relationshipRepositoryOverrides = {},
  userRepository: userRepositoryOverrides = {},
} = {}) {
  const notificationsRepository = {
    create: vi.fn(async (notification) => createNotification(notification)),
    findUnreadMessageForSender: vi.fn(async () => null),
    findForUser: vi.fn(async () => [
      createNotification({ id: 'notification-2', createdAt: '2026-06-02T00:00:00.000Z' }),
      createNotification({ id: 'notification-1', createdAt: '2026-06-01T00:00:00.000Z' }),
    ]),
    countUnreadForUser: vi.fn(async () => 1),
    markAsReadForUser: vi.fn(async () =>
      createNotification({ readAt: '2026-06-02T08:00:00.000Z' }),
    ),
    updateUnreadMessageForSender: vi.fn(async (userId, senderId, notification) =>
      createNotification({
        ...notification,
        id: 'notification-3',
        metadata: { senderId, ...notification.metadata },
        type: 'unread_message',
        userId,
      }),
    ),
    ...notificationsRepositoryOverrides,
  };
  const relationshipRepository = {
    findFriendshipBetween: vi.fn(async () => ({ id: 'friendship-1' })),
    ...relationshipRepositoryOverrides,
  };
  const userRepository = {
    findById: vi.fn(async (userId) => ({
      id: userId,
      username: userId === 'user-2' ? 'sam' : 'mei',
    })),
    ...userRepositoryOverrides,
  };

  return {
    relationshipRepository,
    service: createNotificationsService({
      notificationsRepository,
      relationshipRepository,
      userRepository,
    }),
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

  it('creates an unread message notification for a friend', async () => {
    const { relationshipRepository, service, notificationsRepository } = createService();

    await service.createOrUpdateUnreadMessageNotification({
      messageId: 'message-1',
      preview: 'Hello from Stream',
      receiverId: 'user-1',
      senderId: 'user-2',
    });

    expect(relationshipRepository.findFriendshipBetween).toHaveBeenCalledWith('user-1', 'user-2');
    expect(notificationsRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'unread_message',
      title: 'New message from sam',
      content: 'Hello from Stream',
      metadata: {
        href: '/app/chat/user-2',
        messageId: 'message-1',
        senderId: 'user-2',
      },
    });
  });

  it('updates an existing unread message notification for the same sender', async () => {
    const { service, notificationsRepository } = createService({
      notificationsRepository: {
        findUnreadMessageForSender: vi.fn(async () =>
          createNotification({
            id: 'notification-3',
            metadata: { href: '/app/chat/user-2', senderId: 'user-2' },
            type: 'unread_message',
          }),
        ),
      },
    });

    await service.createOrUpdateUnreadMessageNotification({
      preview: '',
      receiverId: 'user-1',
      senderId: 'user-2',
    });

    expect(notificationsRepository.updateUnreadMessageForSender).toHaveBeenCalledWith(
      'user-1',
      'user-2',
      {
        title: 'New message from sam',
        content: 'sam sent you a message.',
        metadata: {
          href: '/app/chat/user-2',
          senderId: 'user-2',
        },
      },
    );
    expect(notificationsRepository.create).not.toHaveBeenCalled();
  });

  it('rejects unread message notifications from non-friends', async () => {
    const { service, notificationsRepository } = createService({
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => null),
      },
    });

    await expect(
      service.createOrUpdateUnreadMessageNotification({
        receiverId: 'user-1',
        senderId: 'user-2',
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: 'Only friends can create message notifications',
    });
    expect(notificationsRepository.create).not.toHaveBeenCalled();
  });
});
