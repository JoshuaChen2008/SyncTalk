import { describe, expect, it, vi } from 'vitest';

import { createCallService } from '../services/call-service.js';

function createUser(overrides = {}) {
  return {
    id: 'user-2',
    username: 'sam',
    avatar: '',
    ...overrides,
  };
}

function createService({
  userRepository: userRepositoryOverrides = {},
  relationshipRepository: relationshipRepositoryOverrides = {},
  streamVideoClient: streamVideoClientOverrides = {},
} = {}) {
  const userRepository = {
    findById: vi.fn(async () => createUser()),
    ...userRepositoryOverrides,
  };
  const relationshipRepository = {
    findFriendshipBetween: vi.fn(async () => ({ id: 'friendship-1' })),
    ...relationshipRepositoryOverrides,
  };
  const streamVideoClient = {
    generateUserToken: vi.fn(({ user_id }) => `video-token-for-${user_id}`),
    upsertUsers: vi.fn(async () => undefined),
    ...streamVideoClientOverrides,
  };

  return {
    relationshipRepository,
    service: createCallService({ userRepository, relationshipRepository, streamVideoClient }),
    streamVideoClient,
    userRepository,
  };
}

describe('call service', () => {
  it('creates a Stream Video token for the current user', () => {
    const { service, streamVideoClient } = createService();

    const result = service.createToken({
      id: 'user-1',
      username: 'mei',
      avatar: 'https://example.com/mei.png',
    });

    expect(streamVideoClient.generateUserToken).toHaveBeenCalledWith({
      user_id: 'user-1',
      validity_in_seconds: 60 * 60,
    });
    expect(result).toEqual({
      token: 'video-token-for-user-1',
      user: {
        id: 'user-1',
        username: 'mei',
        avatar: 'https://example.com/mei.png',
      },
    });
  });

  it('returns a stable video call session for friends', async () => {
    const { relationshipRepository, service, streamVideoClient, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async () => createUser({ id: 'user-a', username: 'lina' })),
      },
    });

    const result = await service.getSession('user-z', 'user-a');

    expect(userRepository.findById).toHaveBeenCalledWith('user-a');
    expect(relationshipRepository.findFriendshipBetween).toHaveBeenCalledWith('user-z', 'user-a');
    expect(streamVideoClient.upsertUsers).toHaveBeenCalledWith([
      { id: 'user-z' },
      { id: 'user-a', name: 'lina', image: '' },
    ]);
    expect(result).toEqual({
      callId: 'user-a-user-z',
      callType: 'default',
      friend: {
        id: 'user-a',
        username: 'lina',
        avatar: '',
      },
      members: ['user-z', 'user-a'],
    });
  });

  it('rejects non-friends before returning a call session', async () => {
    const { service, streamVideoClient } = createService({
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => null),
      },
    });

    await expect(service.getSession('user-1', 'user-2')).rejects.toMatchObject({
      status: 403,
      message: 'Only friends can call',
    });
    expect(streamVideoClient.upsertUsers).not.toHaveBeenCalled();
  });

  it('rejects unknown friends', async () => {
    const { relationshipRepository, service } = createService({
      userRepository: {
        findById: vi.fn(async () => null),
      },
    });

    await expect(service.getSession('user-1', 'missing-user')).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    });
    expect(relationshipRepository.findFriendshipBetween).not.toHaveBeenCalled();
  });
});
