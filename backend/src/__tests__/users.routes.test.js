import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, usersService }) {
  const app = createApp({ authService, usersService });
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

function createDiscoveryUser(overrides = {}) {
  return {
    id: 'user-2',
    username: 'sam',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Japanese',
    languageLevel: 'B1',
    learningGoal: 'Daily conversation',
    bio: 'Coffee chats welcome.',
    timezone: 'Asia/Tokyo',
    matchReasons: ['Language exchange match: English ↔ Japanese'],
    relationshipStatus: 'stranger',
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

describe('users routes', () => {
  it('requires authentication for recommendations', async () => {
    const authService = {
      getCurrentUser: vi.fn(),
    };
    const usersService = {
      getRecommendations: vi.fn(),
    };
    const baseUrl = await startTestServer({ authService, usersService });

    const response = await request(baseUrl, '/api/users/recommendations');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Authentication required',
    });
    expect(usersService.getRecommendations).not.toHaveBeenCalled();
  });

  it('returns recommendation users with match reasons and relationship status', async () => {
    const authService = createAuthService();
    const usersService = {
      getRecommendations: vi.fn(async () => [createDiscoveryUser()]),
    };
    const baseUrl = await startTestServer({ authService, usersService });

    const response = await request(baseUrl, '/api/users/recommendations', {
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      users: [createDiscoveryUser()],
    });
    expect(usersService.getRecommendations).toHaveBeenCalledWith('user-1');
  });

  it('returns search results for a non-empty query', async () => {
    const authService = createAuthService();
    const usersService = {
      searchUsers: vi.fn(async () => [createDiscoveryUser({ username: 'lina' })]),
    };
    const baseUrl = await startTestServer({ authService, usersService });

    const response = await request(baseUrl, '/api/users/search?query=English', {
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      users: [createDiscoveryUser({ username: 'lina' })],
    });
    expect(usersService.searchUsers).toHaveBeenCalledWith('user-1', 'English');
  });

  it('returns 400 for empty search queries', async () => {
    const authService = createAuthService();
    const usersService = {
      searchUsers: vi.fn(async () => {
        const error = new Error('Search query is required');
        error.status = 400;
        throw error;
      }),
    };
    const baseUrl = await startTestServer({ authService, usersService });

    const response = await request(baseUrl, '/api/users/search?query=   ', {
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Search query is required',
    });
    expect(usersService.searchUsers).toHaveBeenCalledWith('user-1', '');
  });
});
