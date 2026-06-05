import { describe, expect, it, vi } from 'vitest';

import { createChatService } from '../services/chat-service.js';

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
  streamChatClient: streamChatClientOverrides = {},
} = {}) {
  const userRepository = {
    findById: vi.fn(async () => createUser()),
    ...userRepositoryOverrides,
  };
  const relationshipRepository = {
    findFriendshipBetween: vi.fn(async () => ({
      id: 'friendship-1',
      userAId: 'user-1',
      userBId: 'user-2',
    })),
    ...relationshipRepositoryOverrides,
  };
  const channel = {
    create: vi.fn(async () => undefined),
  };
  const streamChatClient = {
    createToken: vi.fn((userId) => `token-for-${userId}`),
    upsertUsers: vi.fn(async () => undefined),
    channel: vi.fn(() => channel),
    ...streamChatClientOverrides,
  };

  return {
    channel,
    relationshipRepository,
    service: createChatService({ userRepository, relationshipRepository, streamChatClient }),
    streamChatClient,
    userRepository,
  };
}

describe('chat service', () => {
  it('creates a Stream token for the current user', () => {
    const { service, streamChatClient } = createService();

    const result = service.createToken({
      id: 'user-1',
      username: 'mei',
      avatar: 'https://example.com/mei.png',
    });

    expect(streamChatClient.createToken).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      token: 'token-for-user-1',
      user: {
        id: 'user-1',
        username: 'mei',
        avatar: 'https://example.com/mei.png',
      },
    });
  });

  it('returns a stable messaging channel for friends', async () => {
    const { channel, relationshipRepository, service, streamChatClient, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async () => createUser({ id: 'user-a', username: 'lina' })),
      },
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => ({
          id: 'friendship-1',
          userAId: 'user-a',
          userBId: 'user-z',
        })),
      },
    });

    const result = await service.getChannel('user-z', 'user-a');

    expect(userRepository.findById).toHaveBeenCalledWith('user-a');
    expect(relationshipRepository.findFriendshipBetween).toHaveBeenCalledWith('user-z', 'user-a');
    expect(streamChatClient.upsertUsers).toHaveBeenCalledWith([
      { id: 'user-z' },
      { id: 'user-a', name: 'lina', image: '' },
    ]);
    expect(streamChatClient.channel).toHaveBeenCalledWith('messaging', 'user-a-user-z', {
      members: ['user-a', 'user-z'],
      created_by_id: 'user-z',
    });
    expect(channel.create).toHaveBeenCalledWith();
    expect(result).toEqual({
      channelId: 'user-a-user-z',
      friend: {
        id: 'user-a',
        username: 'lina',
        avatar: '',
      },
      members: ['user-z', 'user-a'],
    });
  });

  it('rejects non-friends before creating a Stream channel', async () => {
    const { service, streamChatClient } = createService({
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => null),
      },
    });

    await expect(service.getChannel('user-1', 'user-2')).rejects.toMatchObject({
      status: 403,
      message: 'Only friends can chat',
    });
    expect(streamChatClient.channel).not.toHaveBeenCalled();
  });

  it('rejects unknown friends', async () => {
    const { service, relationshipRepository } = createService({
      userRepository: {
        findById: vi.fn(async () => null),
      },
    });

    await expect(service.getChannel('user-1', 'missing-user')).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    });
    expect(relationshipRepository.findFriendshipBetween).not.toHaveBeenCalled();
  });
});
