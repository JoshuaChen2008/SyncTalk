import { describe, expect, it, vi } from 'vitest';

import { createProfileService } from '../services/profile-service.js';

function createUser(overrides = {}) {
  return {
    id: 'user-1',
    username: 'mei',
    email: 'mei@example.com',
    avatar: '',
    nativeLanguage: '',
    targetLanguage: '',
    languageLevel: '',
    learningGoal: '',
    bio: '',
    timezone: '',
    ...overrides,
  };
}

function createService(overrides = {}) {
  const userRepository = {
    findById: vi.fn(async () => createUser()),
    updateProfile: vi.fn(async (_userId, profile) => createUser(profile)),
    ...overrides.userRepository,
  };
  const relationshipRepository = {
    getRelationshipStatuses: vi.fn(async () => ({ 'user-2': 'friend' })),
    ...overrides.relationshipRepository,
  };

  return {
    service: createProfileService({ userRepository, relationshipRepository }),
    relationshipRepository,
    userRepository,
  };
}

describe('profile service', () => {
  it('reads the current user language profile', async () => {
    const { service, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async () =>
          createUser({
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
          }),
        ),
      },
    });

    await expect(service.getMyProfile('user-1')).resolves.toEqual({
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
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('trims and saves a complete language profile', async () => {
    const { service, userRepository } = createService();

    const result = await service.updateMyProfile('user-1', {
      nativeLanguage: ' Japanese ',
      targetLanguage: ' English ',
      languageLevel: ' B1 ',
      learningGoal: ' Daily conversation ',
      bio: ' Coffee chats welcome. ',
      timezone: ' Asia/Tokyo ',
    });

    expect(userRepository.updateProfile).toHaveBeenCalledWith('user-1', {
      nativeLanguage: 'Japanese',
      targetLanguage: 'English',
      languageLevel: 'B1',
      learningGoal: 'Daily conversation',
      bio: 'Coffee chats welcome.',
      timezone: 'Asia/Tokyo',
    });
    expect(result.isProfileComplete).toBe(true);
  });

  it('rejects missing required profile fields', async () => {
    const { service, userRepository } = createService();

    await expect(
      service.updateMyProfile('user-1', {
        nativeLanguage: 'Japanese',
        targetLanguage: '',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        timezone: 'Asia/Tokyo',
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Target language is required',
    });
    expect(userRepository.updateProfile).not.toHaveBeenCalled();
  });

  it('returns 404 when the user cannot be found', async () => {
    const { service } = createService({
      userRepository: {
        findById: vi.fn(async () => null),
      },
    });

    await expect(service.getMyProfile('missing-user')).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    });
  });

  it('reads another user public profile without private email', async () => {
    const { service, relationshipRepository, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async (userId) =>
          userId === 'user-2'
            ? createUser({
                id: 'user-2',
                username: 'sam',
                email: 'sam@example.com',
                nativeLanguage: 'English',
                targetLanguage: 'Japanese',
                languageLevel: 'B1',
                learningGoal: 'Daily conversation',
                bio: 'Coffee chats welcome.',
                timezone: 'Asia/Tokyo',
              })
            : createUser(),
        ),
      },
      relationshipRepository: {
        getRelationshipStatuses: vi.fn(async () => ({ 'user-2': 'friend' })),
      },
    });

    await expect(service.getPublicProfile('user-1', 'user-2')).resolves.toEqual({
      id: 'user-2',
      username: 'sam',
      avatar: '',
      nativeLanguage: 'English',
      targetLanguage: 'Japanese',
      languageLevel: 'B1',
      learningGoal: 'Daily conversation',
      bio: 'Coffee chats welcome.',
      timezone: 'Asia/Tokyo',
      isProfileComplete: true,
      relationshipStatus: 'friend',
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-2');
    expect(relationshipRepository.getRelationshipStatuses).toHaveBeenCalledWith('user-1', [
      'user-2',
    ]);
  });
});
