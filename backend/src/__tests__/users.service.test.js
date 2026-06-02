import { describe, expect, it, vi } from 'vitest';

import { createUsersService } from '../services/users-service.js';

function createUser(overrides = {}) {
  return {
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
    ...overrides,
  };
}

function createService({
  currentUser = createUser(),
  candidates = [],
  statuses = {},
  userRepository: repositoryOverrides = {},
} = {}) {
  const userRepository = {
    findById: vi.fn(async () => currentUser),
    findDiscoverableUsers: vi.fn(async () => candidates),
    searchDiscoverableUsers: vi.fn(async () => candidates),
    ...repositoryOverrides,
  };
  const relationshipRepository = {
    getRelationshipStatuses: vi.fn(async () => statuses),
  };

  return {
    service: createUsersService({ userRepository, relationshipRepository }),
    userRepository,
    relationshipRepository,
  };
}

describe('users service', () => {
  it('recommends complete language partners and excludes incomplete profiles', async () => {
    const currentUser = createUser({
      id: 'current-user',
      nativeLanguage: 'Japanese',
      targetLanguage: 'English',
      languageLevel: 'B1',
      learningGoal: 'Daily conversation',
      timezone: 'Asia/Tokyo',
    });
    const candidates = [
      createUser({
        id: 'weak-match',
        username: 'alex',
        nativeLanguage: 'French',
        targetLanguage: 'English',
        languageLevel: 'C2',
        learningGoal: 'Travel practice',
        timezone: 'Europe/Berlin',
      }),
      createUser({
        id: 'best-match',
        username: 'sam',
        nativeLanguage: 'English',
        targetLanguage: 'Japanese',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        timezone: 'Asia/Tokyo',
      }),
      createUser({
        id: 'incomplete-match',
        username: 'blank',
        nativeLanguage: 'English',
        targetLanguage: '',
      }),
    ];
    const { service, userRepository, relationshipRepository } = createService({
      currentUser,
      candidates,
      statuses: {
        'best-match': 'stranger',
        'weak-match': 'request_sent',
      },
    });

    const result = await service.getRecommendations('current-user');

    expect(userRepository.findDiscoverableUsers).toHaveBeenCalledWith('current-user');
    expect(relationshipRepository.getRelationshipStatuses).toHaveBeenCalledWith('current-user', [
      'best-match',
      'weak-match',
    ]);
    expect(result.map((user) => user.id)).toEqual(['best-match', 'weak-match']);
    expect(result[0]).toMatchObject({
      id: 'best-match',
      username: 'sam',
      relationshipStatus: 'stranger',
      matchReasons: expect.arrayContaining([
        'Language exchange match: English ↔ Japanese',
        'Similar learning goal: Daily conversation',
      ]),
    });
    expect(result[1].relationshipStatus).toBe('request_sent');
  });

  it('searches complete users by username, language, and bio', async () => {
    const candidates = [
      createUser({
        id: 'user-2',
        username: 'lina',
        nativeLanguage: 'Mandarin',
        targetLanguage: 'English',
        bio: 'UX designer learning through product chats.',
      }),
    ];
    const { service, userRepository } = createService({ candidates });

    const result = await service.searchUsers('user-1', ' product ');

    expect(userRepository.searchDiscoverableUsers).toHaveBeenCalledWith('user-1', 'product');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'user-2',
        username: 'lina',
        relationshipStatus: 'stranger',
        matchReasons: expect.arrayContaining(['Matches your search']),
      }),
    ]);
  });

  it('rejects discovery when the current profile is incomplete', async () => {
    const { service, userRepository } = createService({
      currentUser: createUser({ targetLanguage: '' }),
    });

    await expect(service.getRecommendations('user-1')).rejects.toMatchObject({
      status: 400,
      message: 'Complete your profile before discovering partners',
    });
    expect(userRepository.findDiscoverableUsers).not.toHaveBeenCalled();
  });

  it('rejects empty search queries', async () => {
    const { service, userRepository } = createService();

    await expect(service.searchUsers('user-1', '   ')).rejects.toMatchObject({
      status: 400,
      message: 'Search query is required',
    });
    expect(userRepository.searchDiscoverableUsers).not.toHaveBeenCalled();
  });

  it('returns relationship statuses for sent, received, friend, and stranger users', async () => {
    const candidates = [
      createUser({ id: 'sent-user', username: 'sent' }),
      createUser({ id: 'received-user', username: 'received' }),
      createUser({ id: 'friend-user', username: 'friend' }),
      createUser({ id: 'stranger-user', username: 'stranger' }),
    ];
    const { service } = createService({
      candidates,
      statuses: {
        'sent-user': 'request_sent',
        'received-user': 'request_received',
        'friend-user': 'friend',
      },
    });

    const result = await service.getRecommendations('user-1');

    expect(result.map((user) => [user.id, user.relationshipStatus])).toEqual([
      ['friend-user', 'friend'],
      ['received-user', 'request_received'],
      ['sent-user', 'request_sent'],
      ['stranger-user', 'stranger'],
    ]);
  });
});
