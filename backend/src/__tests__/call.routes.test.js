import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, callService }) {
  const app = createApp({ authService, callService });
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

describe('call routes', () => {
  it('requires authentication for call token', async () => {
    const callService = {
      createToken: vi.fn(),
    };
    const baseUrl = await startTestServer({
      authService: { getCurrentUser: vi.fn() },
      callService,
    });

    const response = await request(baseUrl, '/api/call/token');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(callService.createToken).not.toHaveBeenCalled();
  });

  it('returns a Stream Video token for the current user', async () => {
    const authService = createAuthService();
    const callService = {
      createToken: vi.fn(() => ({
        token: 'video-token',
        user: { id: 'user-1', username: 'mei', avatar: '' },
      })),
    };
    const baseUrl = await startTestServer({ authService, callService });

    const response = await request(baseUrl, '/api/call/token', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      token: 'video-token',
      user: { id: 'user-1', username: 'mei', avatar: '' },
    });
    expect(callService.createToken).toHaveBeenCalledWith({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
      avatar: '',
    });
  });

  it('returns a stable call session for a friend', async () => {
    const authService = createAuthService();
    const callService = {
      getSession: vi.fn(async () => ({
        callId: 'user-1-user-2',
        callType: 'default',
        friend: { id: 'user-2', username: 'sam', avatar: '' },
        members: ['user-1', 'user-2'],
      })),
    };
    const baseUrl = await startTestServer({ authService, callService });

    const response = await request(baseUrl, '/api/call/session/user-2', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      callId: 'user-1-user-2',
      callType: 'default',
      friend: { id: 'user-2', username: 'sam', avatar: '' },
      members: ['user-1', 'user-2'],
    });
    expect(callService.getSession).toHaveBeenCalledWith('user-1', 'user-2');
  });

  it('starts a ringing call session for a friend', async () => {
    const authService = createAuthService();
    const callService = {
      getRingingSession: vi.fn(async () => ({
        callId: 'user-1-user-2',
        callType: 'default',
        friend: { id: 'user-2', username: 'sam', avatar: '' },
        members: ['user-1', 'user-2'],
      })),
    };
    const baseUrl = await startTestServer({ authService, callService });

    const response = await request(baseUrl, '/api/call/session/user-2/ring', {
      method: 'POST',
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      callId: 'user-1-user-2',
      callType: 'default',
      friend: { id: 'user-2', username: 'sam', avatar: '' },
      members: ['user-1', 'user-2'],
    });
    expect(callService.getRingingSession).toHaveBeenCalledWith('user-1', 'user-2');
  });
});
