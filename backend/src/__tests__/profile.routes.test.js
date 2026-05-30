import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, profileService }) {
  const app = createApp({ authService, profileService });
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

describe('profile routes', () => {
  it('requires authentication for the current profile', async () => {
    const authService = {
      getCurrentUser: vi.fn(),
    };
    const profileService = {
      getMyProfile: vi.fn(),
    };
    const baseUrl = await startTestServer({ authService, profileService });

    const response = await request(baseUrl, '/api/profile/me');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Authentication required',
    });
    expect(profileService.getMyProfile).not.toHaveBeenCalled();
  });

  it('returns the current user profile', async () => {
    const authService = {
      getCurrentUser: vi.fn(async () => ({
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
      })),
    };
    const profileService = {
      getMyProfile: vi.fn(async () => ({
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
        avatar: '',
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        bio: '',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      })),
    };
    const baseUrl = await startTestServer({ authService, profileService });

    const response = await request(baseUrl, '/api/profile/me', {
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      profile: {
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
        avatar: '',
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        bio: '',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      },
    });
    expect(profileService.getMyProfile).toHaveBeenCalledWith('user-1');
  });

  it('updates the current user profile', async () => {
    const authService = {
      getCurrentUser: vi.fn(async () => ({
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
      })),
    };
    const profileService = {
      updateMyProfile: vi.fn(async () => ({
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
        avatar: '',
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        bio: 'Coffee chats welcome.',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      })),
    };
    const baseUrl = await startTestServer({ authService, profileService });
    const input = {
      nativeLanguage: 'Japanese',
      targetLanguage: 'English',
      languageLevel: 'B1',
      learningGoal: 'Daily conversation',
      bio: 'Coffee chats welcome.',
      timezone: 'Asia/Tokyo',
    };

    const response = await request(baseUrl, '/api/profile/me', {
      method: 'PATCH',
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      profile: {
        id: 'user-1',
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        isProfileComplete: true,
      },
    });
    expect(profileService.updateMyProfile).toHaveBeenCalledWith('user-1', input);
  });
});
