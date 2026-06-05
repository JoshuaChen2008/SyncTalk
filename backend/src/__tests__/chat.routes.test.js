import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, chatService }) {
  const app = createApp({ authService, chatService });
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
      avatar: '',
    })),
  };
}

function createFriend(overrides = {}) {
  return {
    id: 'user-2',
    username: 'sam',
    avatar: '',
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

describe('chat routes', () => {
  it('requires authentication for chat token', async () => {
    const chatService = {
      createToken: vi.fn(),
    };
    const baseUrl = await startTestServer({
      authService: { getCurrentUser: vi.fn() },
      chatService,
    });

    const response = await request(baseUrl, '/api/chat/token');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(chatService.createToken).not.toHaveBeenCalled();
  });

  it('returns a Stream Chat token for the current user', async () => {
    const authService = createAuthService();
    const chatService = {
      createToken: vi.fn(() => ({
        token: 'stream-token',
        user: { id: 'user-1', username: 'mei', avatar: '' },
      })),
    };
    const baseUrl = await startTestServer({ authService, chatService });

    const response = await request(baseUrl, '/api/chat/token', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      token: 'stream-token',
      user: { id: 'user-1', username: 'mei', avatar: '' },
    });
    expect(chatService.createToken).toHaveBeenCalledWith({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
      avatar: '',
    });
  });

  it('returns a stable channel for a friend', async () => {
    const authService = createAuthService();
    const chatService = {
      getChannel: vi.fn(async () => ({
        channelId: 'user-1-user-2',
        friend: createFriend(),
        members: ['user-1', 'user-2'],
      })),
    };
    const baseUrl = await startTestServer({ authService, chatService });

    const response = await request(baseUrl, '/api/chat/channel/user-2', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      channelId: 'user-1-user-2',
      friend: createFriend(),
      members: ['user-1', 'user-2'],
    });
    expect(chatService.getChannel).toHaveBeenCalledWith('user-1', 'user-2');
  });
});
