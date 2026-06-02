import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, friendsService }) {
  const app = createApp({ authService, friendsService });
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

function createFriendRequest(overrides = {}) {
  return {
    id: 'request-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    status: 'pending',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function createFriend(overrides = {}) {
  return {
    friendshipId: 'friendship-1',
    id: 'user-2',
    username: 'sam',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Japanese',
    languageLevel: 'B1',
    learningGoal: 'Daily conversation',
    bio: 'Coffee chats welcome.',
    timezone: 'Asia/Tokyo',
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

describe('friends routes', () => {
  it('requires authentication for friend requests', async () => {
    const friendsService = {
      sendFriendRequest: vi.fn(),
    };
    const baseUrl = await startTestServer({
      authService: { getCurrentUser: vi.fn() },
      friendsService,
    });

    const response = await request(baseUrl, '/api/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ receiverId: 'user-2' }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(friendsService.sendFriendRequest).not.toHaveBeenCalled();
  });

  it('sends a friend request', async () => {
    const authService = createAuthService();
    const friendsService = {
      sendFriendRequest: vi.fn(async () => createFriendRequest()),
    };
    const baseUrl = await startTestServer({ authService, friendsService });

    const response = await request(baseUrl, '/api/friends/requests', {
      method: 'POST',
      headers: { Cookie: 'synctalk_session=valid-token' },
      body: JSON.stringify({ receiverId: 'user-2' }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ request: createFriendRequest() });
    expect(friendsService.sendFriendRequest).toHaveBeenCalledWith('user-1', 'user-2');
  });

  it('returns received and sent requests', async () => {
    const authService = createAuthService();
    const friendsService = {
      getFriendRequests: vi.fn(async () => ({
        receivedRequests: [createFriendRequest({ senderId: 'user-2', receiverId: 'user-1' })],
        sentRequests: [createFriendRequest()],
      })),
    };
    const baseUrl = await startTestServer({ authService, friendsService });

    const response = await request(baseUrl, '/api/friends/requests', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      receivedRequests: [createFriendRequest({ senderId: 'user-2', receiverId: 'user-1' })],
      sentRequests: [createFriendRequest()],
    });
    expect(friendsService.getFriendRequests).toHaveBeenCalledWith('user-1');
  });

  it('accepts or rejects a friend request', async () => {
    const authService = createAuthService();
    const friendsService = {
      respondToFriendRequest: vi.fn(async () => ({
        request: createFriendRequest({ status: 'accepted' }),
        friendship: { id: 'friendship-1', userAId: 'user-1', userBId: 'user-2' },
      })),
    };
    const baseUrl = await startTestServer({ authService, friendsService });

    const response = await request(baseUrl, '/api/friends/requests/request-1', {
      method: 'PATCH',
      headers: { Cookie: 'synctalk_session=valid-token' },
      body: JSON.stringify({ action: 'accept' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      request: createFriendRequest({ status: 'accepted' }),
      friendship: { id: 'friendship-1', userAId: 'user-1', userBId: 'user-2' },
    });
    expect(friendsService.respondToFriendRequest).toHaveBeenCalledWith(
      'user-1',
      'request-1',
      'accept',
    );
  });

  it('returns and removes friends', async () => {
    const authService = createAuthService();
    const friendsService = {
      getFriends: vi.fn(async () => [createFriend()]),
      removeFriend: vi.fn(async () => ({ removed: true })),
    };
    const baseUrl = await startTestServer({ authService, friendsService });

    const listResponse = await request(baseUrl, '/api/friends', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });
    const removeResponse = await request(baseUrl, '/api/friends/user-2', {
      method: 'DELETE',
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual({ friends: [createFriend()] });
    expect(removeResponse.status).toBe(200);
    await expect(removeResponse.json()).resolves.toEqual({ removed: true });
    expect(friendsService.getFriends).toHaveBeenCalledWith('user-1');
    expect(friendsService.removeFriend).toHaveBeenCalledWith('user-1', 'user-2');
  });
});
