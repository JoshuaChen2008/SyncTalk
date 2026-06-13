import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, notificationsService }) {
  const app = createApp({ authService, notificationsService });
  server = app.listen(0);

  await new Promise((resolve) => {
    server.once('listening', resolve);
  });

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

function createAuthService() {
  return {
    getCurrentUser: vi.fn(async () => ({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
    })),
  };
}

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

afterEach(async () => {
  vi.restoreAllMocks();

  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  server = undefined;
});

describe('notifications routes', () => {
  it('requires authentication for notifications', async () => {
    const notificationsService = {
      getNotifications: vi.fn(),
    };
    const baseUrl = await startTestServer({
      authService: { getCurrentUser: vi.fn() },
      notificationsService,
    });

    const response = await request(baseUrl, '/api/notifications');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(notificationsService.getNotifications).not.toHaveBeenCalled();
  });

  it('returns notifications and unread count', async () => {
    const authService = createAuthService();
    const notificationsService = {
      getNotifications: vi.fn(async () => ({
        notifications: [createNotification()],
        unreadCount: 1,
      })),
    };
    const baseUrl = await startTestServer({ authService, notificationsService });

    const response = await request(baseUrl, '/api/notifications', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      notifications: [createNotification()],
      unreadCount: 1,
    });
    expect(notificationsService.getNotifications).toHaveBeenCalledWith('user-1');
  });

  it('marks a notification as read', async () => {
    const authService = createAuthService();
    const notificationsService = {
      markNotificationAsRead: vi.fn(async () =>
        createNotification({ readAt: '2026-06-02T08:00:00.000Z' }),
      ),
    };
    const baseUrl = await startTestServer({ authService, notificationsService });

    const response = await request(baseUrl, '/api/notifications/notification-1/read', {
      method: 'PATCH',
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      notification: createNotification({ readAt: '2026-06-02T08:00:00.000Z' }),
    });
    expect(notificationsService.markNotificationAsRead).toHaveBeenCalledWith(
      'user-1',
      'notification-1',
    );
  });

  it('creates an unread message notification for the current user', async () => {
    const authService = createAuthService();
    const notificationsService = {
      createOrUpdateUnreadMessageNotification: vi.fn(async () =>
        createNotification({
          type: 'unread_message',
          title: 'New message from sam',
          content: 'Hi there',
          metadata: {
            href: '/app/chat/user-2',
            messageId: 'message-1',
            senderId: 'user-2',
          },
        }),
      ),
    };
    const baseUrl = await startTestServer({ authService, notificationsService });

    const response = await request(baseUrl, '/api/notifications/unread-message', {
      method: 'POST',
      headers: { Cookie: 'synctalk_session=valid-token' },
      body: JSON.stringify({
        messageId: 'message-1',
        preview: 'Hi there',
        senderId: 'user-2',
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      notification: createNotification({
        type: 'unread_message',
        title: 'New message from sam',
        content: 'Hi there',
        metadata: {
          href: '/app/chat/user-2',
          messageId: 'message-1',
          senderId: 'user-2',
        },
      }),
    });
    expect(notificationsService.createOrUpdateUnreadMessageNotification).toHaveBeenCalledWith({
      messageId: 'message-1',
      preview: 'Hi there',
      receiverId: 'user-1',
      senderId: 'user-2',
    });
  });
});
