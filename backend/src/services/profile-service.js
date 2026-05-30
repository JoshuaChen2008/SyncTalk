import { createUserRepository } from './user-repository.js';
import { createHttpError } from '../utils/http-error.js';

const requiredFields = [
  ['nativeLanguage', 'Native language is required'],
  ['targetLanguage', 'Target language is required'],
  ['languageLevel', 'Language level is required'],
  ['learningGoal', 'Learning goal is required'],
  ['timezone', 'Timezone is required'],
];

function normalizeText(value) {
  return String(value ?? '').trim();
}

function isProfileComplete(profile) {
  return requiredFields.every(([field]) => Boolean(normalizeText(profile[field])));
}

function serializeProfile(user) {
  return {
    id: String(user.id ?? user._id),
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? '',
    nativeLanguage: user.nativeLanguage ?? '',
    targetLanguage: user.targetLanguage ?? '',
    languageLevel: user.languageLevel ?? '',
    learningGoal: user.learningGoal ?? '',
    bio: user.bio ?? '',
    timezone: user.timezone ?? '',
    isProfileComplete: isProfileComplete(user),
  };
}

function normalizeProfileInput(input) {
  return {
    nativeLanguage: normalizeText(input.nativeLanguage),
    targetLanguage: normalizeText(input.targetLanguage),
    languageLevel: normalizeText(input.languageLevel),
    learningGoal: normalizeText(input.learningGoal),
    bio: normalizeText(input.bio),
    timezone: normalizeText(input.timezone),
  };
}

function validateProfile(profile) {
  for (const [field, message] of requiredFields) {
    if (!profile[field]) {
      throw createHttpError(400, message);
    }
  }
}

function userNotFoundError() {
  return createHttpError(404, 'User not found');
}

export function createProfileService({ userRepository = createUserRepository() } = {}) {
  return {
    async getMyProfile(userId) {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw userNotFoundError();
      }

      return serializeProfile(user);
    },

    async updateMyProfile(userId, input) {
      const profile = normalizeProfileInput(input);
      validateProfile(profile);

      const user = await userRepository.updateProfile(userId, profile);

      if (!user) {
        throw userNotFoundError();
      }

      return serializeProfile(user);
    },
  };
}

export const profileService = createProfileService();
