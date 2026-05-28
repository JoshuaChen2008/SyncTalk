import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer(authService) {
  const app = createApp({ authService });
  server = app.listen(0);

  await new Promise((resolve) => {
    server.once('listening', resolve);
  });

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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

describe('auth routes', () => {
  it('registers a user and writes the JWT to an HttpOnly cookie', async () => {
    const authService = {
      register: vi.fn(async () => ({
        token: 'new-user-token',
        user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
      })),
    };
    const baseUrl = await startTestServer(authService);

    const response = await request(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'mei',
        email: 'mei@example.com',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
    });
    expect(response.headers.get('set-cookie')).toContain('synctalk_session=new-user-token');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('SameSite=Lax');
    expect(authService.register).toHaveBeenCalledWith({
      username: 'mei',
      email: 'mei@example.com',
      password: 'password123',
    });
  });

  it('rejects invalid login credentials with a clear error', async () => {
    const authService = {
      login: vi.fn(async () => {
        const error = new Error('Invalid email/username or password');
        error.status = 401;
        throw error;
      }),
    };
    const baseUrl = await startTestServer(authService);

    const response = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'mei@example.com',
        password: 'wrong-password',
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid email/username or password',
    });
  });

  it('returns the current user from a valid session cookie', async () => {
    const authService = {
      getCurrentUser: vi.fn(async () => ({
        id: 'user-1',
        username: 'mei',
        email: 'mei@example.com',
      })),
    };
    const baseUrl = await startTestServer(authService);

    const response = await request(baseUrl, '/api/auth/me', {
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
    });
    expect(authService.getCurrentUser).toHaveBeenCalledWith('valid-token');
  });

  it('returns 401 when the current user request has no session cookie', async () => {
    const authService = {
      getCurrentUser: vi.fn(),
    };
    const baseUrl = await startTestServer(authService);

    const response = await request(baseUrl, '/api/auth/me');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Authentication required',
    });
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('clears the session cookie on logout', async () => {
    const authService = {};
    const baseUrl = await startTestServer(authService);

    const response = await request(baseUrl, '/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'synctalk_session=valid-token',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get('set-cookie')).toContain('synctalk_session=');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
