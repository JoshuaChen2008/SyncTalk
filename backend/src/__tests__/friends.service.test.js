import { describe, expect, it, vi } from 'vitest';

import { createFriendsService } from '../services/friends-service.js';

function createUser(overrides = {}) {
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
    ...overrides,
  };
}

function createRequest(overrides = {}) {
  return {
    id: 'request-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    status: 'pending',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function createService({
  userRepository: userRepositoryOverrides = {},
  relationshipRepository: relationshipRepositoryOverrides = {},
  notificationsService: notificationsServiceOverrides = {},
} = {}) {
  const userRepository = {
    findById: vi.fn(async () => createUser()),
    findByIds: vi.fn(async (userIds) => userIds.map((id) => createUser({ id, username: id }))),
    ...userRepositoryOverrides,
  };
  const relationshipRepository = {
    findPendingRequestBetween: vi.fn(async () => null),
    findFriendshipBetween: vi.fn(async () => null),
    createFriendRequest: vi.fn(async (request) => createRequest(request)),
    findReceivedRequests: vi.fn(async () => []),
    findSentRequests: vi.fn(async () => []),
    findRequestById: vi.fn(async () => createRequest({ receiverId: 'user-1', senderId: 'user-2' })),
    updateRequestStatus: vi.fn(async (requestId, status) =>
      createRequest({ id: requestId, receiverId: 'user-1', senderId: 'user-2', status }),
    ),
    createFriendship: vi.fn(async (userAId, userBId) => ({
      id: 'friendship-1',
      userAId,
      userBId,
      createdAt: '2026-06-01T00:00:00.000Z',
    })),
    findFriendshipsForUser: vi.fn(async () => []),
    deleteFriendshipBetween: vi.fn(async () => ({ deletedCount: 1 })),
    ...relationshipRepositoryOverrides,
  };
  const notificationsService = {
    createFriendRequestNotification: vi.fn(async () => undefined),
    createFriendAcceptedNotification: vi.fn(async () => undefined),
    ...notificationsServiceOverrides,
  };

  return {
    service: createFriendsService({ userRepository, relationshipRepository, notificationsService }),
    userRepository,
    relationshipRepository,
    notificationsService,
  };
}

describe('friends service', () => {
  it('sends a pending friend request to an existing stranger', async () => {
    const { service, userRepository, relationshipRepository, notificationsService } = createService();

    const result = await service.sendFriendRequest('user-1', 'user-2');

    expect(userRepository.findById).toHaveBeenCalledWith('user-2');
    expect(relationshipRepository.findPendingRequestBetween).toHaveBeenCalledWith('user-1', 'user-2');
    expect(relationshipRepository.findFriendshipBetween).toHaveBeenCalledWith('user-1', 'user-2');
    expect(relationshipRepository.createFriendRequest).toHaveBeenCalledWith({
      senderId: 'user-1',
      receiverId: 'user-2',
    });
    expect(notificationsService.createFriendRequestNotification).toHaveBeenCalledWith({
      senderId: 'user-1',
      receiverId: 'user-2',
    });
    expect(result).toMatchObject({
      id: 'request-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      status: 'pending',
    });
  });

  it('rejects attempts to send a friend request to yourself', async () => {
    const { service, relationshipRepository } = createService();

    await expect(service.sendFriendRequest('user-1', 'user-1')).rejects.toMatchObject({
      status: 400,
      message: 'You cannot add yourself as a friend',
    });
    expect(relationshipRepository.createFriendRequest).not.toHaveBeenCalled();
  });

  it('rejects duplicate pending friend requests', async () => {
    const { service, relationshipRepository } = createService({
      relationshipRepository: {
        findPendingRequestBetween: vi.fn(async () => createRequest()),
      },
    });

    await expect(service.sendFriendRequest('user-1', 'user-2')).rejects.toMatchObject({
      status: 409,
      message: 'A pending friend request already exists',
    });
    expect(relationshipRepository.createFriendRequest).not.toHaveBeenCalled();
  });

  it('rejects friend requests for existing friendships', async () => {
    const { service, relationshipRepository } = createService({
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => ({ id: 'friendship-1' })),
      },
    });

    await expect(service.sendFriendRequest('user-1', 'user-2')).rejects.toMatchObject({
      status: 409,
      message: 'You are already friends',
    });
    expect(relationshipRepository.createFriendRequest).not.toHaveBeenCalled();
  });

  it('accepts a received request and creates a sorted friendship', async () => {
    const { service, relationshipRepository, notificationsService } = createService({
      relationshipRepository: {
        findRequestById: vi.fn(async () =>
          createRequest({ id: 'request-1', senderId: 'user-z', receiverId: 'user-a' }),
        ),
      },
    });

    const result = await service.respondToFriendRequest('user-a', 'request-1', 'accept');

    expect(relationshipRepository.updateRequestStatus).toHaveBeenCalledWith('request-1', 'accepted');
    expect(relationshipRepository.createFriendship).toHaveBeenCalledWith('user-a', 'user-z');
    expect(notificationsService.createFriendAcceptedNotification).toHaveBeenCalledWith({
      accepterId: 'user-a',
      senderId: 'user-z',
    });
    expect(result.request).toMatchObject({ id: 'request-1', status: 'accepted' });
    expect(result.friendship).toMatchObject({ userAId: 'user-a', userBId: 'user-z' });
  });

  it('rejects a received request without creating a friendship', async () => {
    const { service, relationshipRepository, notificationsService } = createService();

    const result = await service.respondToFriendRequest('user-1', 'request-1', 'reject');

    expect(relationshipRepository.updateRequestStatus).toHaveBeenCalledWith('request-1', 'rejected');
    expect(relationshipRepository.createFriendship).not.toHaveBeenCalled();
    expect(notificationsService.createFriendAcceptedNotification).not.toHaveBeenCalled();
    expect(result.request).toMatchObject({ id: 'request-1', status: 'rejected' });
  });

  it('removes an existing friendship for both users', async () => {
    const { service, relationshipRepository } = createService();

    const result = await service.removeFriend('user-1', 'user-2');

    expect(relationshipRepository.deleteFriendshipBetween).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result).toEqual({ removed: true });
  });
});
