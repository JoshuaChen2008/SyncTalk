import { describe, expect, it, vi } from 'vitest';

import { createAuthService } from '../services/auth-service.js';

function createService(overrides = {}) {
  const userRepository = {
    createUser: vi.fn(async (user) => ({
      id: 'user-1',
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
    })),
    findByEmailOrUsername: vi.fn(),
    findById: vi.fn(),
    ...overrides.userRepository,
  };
  const passwordHasher = {
    hash: vi.fn(async (password) => `hashed:${password}`),
    compare: vi.fn(async (password, hash) => hash === `hashed:${password}`),
    ...overrides.passwordHasher,
  };
  const tokenService = {
    sign: vi.fn((userId) => `token:${userId}`),
    verify: vi.fn((token) => ({ userId: token.replace('token:', '') })),
    ...overrides.tokenService,
  };

  return {
    service: createAuthService({ userRepository, passwordHasher, tokenService }),
    userRepository,
    passwordHasher,
    tokenService,
  };
}

describe('auth service', () => {
  it('registers a normalized user with a hashed password', async () => {
    const { service, userRepository, passwordHasher } = createService();

    const result = await service.register({
      username: '  Mei  ',
      email: 'MEI@Example.com ',
      password: 'password123',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.createUser).toHaveBeenCalledWith({
      username: 'Mei',
      email: 'mei@example.com',
      passwordHash: 'hashed:password123',
    });
    expect(result).toEqual({
      token: 'token:user-1',
      user: { id: 'user-1', username: 'Mei', email: 'mei@example.com' },
    });
  });

  it('rejects short passwords during registration', async () => {
    const { service, userRepository } = createService();

    await expect(
      service.register({
        username: 'mei',
        email: 'mei@example.com',
        password: 'short',
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Password must be at least 8 characters',
    });
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it('maps duplicate email or username errors to 409', async () => {
    const { service } = createService({
      userRepository: {
        createUser: vi.fn(async () => {
          const error = new Error('duplicate key');
          error.code = 11000;
          error.keyPattern = { email: 1 };
          throw error;
        }),
      },
    });

    await expect(
      service.register({
        username: 'mei',
        email: 'mei@example.com',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: 'Email is already registered',
    });
  });

  it('logs in with either email or username and returns a session token', async () => {
    const { service, userRepository } = createService({
      userRepository: {
        findByEmailOrUsername: vi.fn(async () => ({
          id: 'user-1',
          username: 'mei',
          email: 'mei@example.com',
          passwordHash: 'hashed:password123',
        })),
      },
    });

    const result = await service.login({
      identifier: 'MEI@example.com',
      password: 'password123',
    });

    expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith('mei@example.com');
    expect(result).toEqual({
      token: 'token:user-1',
      user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
    });
  });

  it('preserves username casing when logging in by username', async () => {
    const { service, userRepository } = createService({
      userRepository: {
        findByEmailOrUsername: vi.fn(async () => ({
          id: 'user-1',
          username: 'Mei',
          email: 'mei@example.com',
          passwordHash: 'hashed:password123',
        })),
      },
    });

    await service.login({
      identifier: 'Mei',
      password: 'password123',
    });

    expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith('Mei');
  });

  it('rejects login when the password does not match', async () => {
    const { service } = createService({
      userRepository: {
        findByEmailOrUsername: vi.fn(async () => ({
          id: 'user-1',
          username: 'mei',
          email: 'mei@example.com',
          passwordHash: 'hashed:password123',
        })),
      },
    });

    await expect(
      service.login({
        identifier: 'mei',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email/username or password',
    });
  });

  it('loads the current user from a valid token', async () => {
    const { service, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async () => ({
          id: 'user-1',
          username: 'mei',
          email: 'mei@example.com',
        })),
      },
    });

    await expect(service.getCurrentUser('token:user-1')).resolves.toEqual({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });
});
