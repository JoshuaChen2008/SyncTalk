import { relationshipRepository as defaultRelationshipRepository } from './relationship-repository.js';
import { createUserRepository } from './user-repository.js';
import { createHttpError } from '../utils/http-error.js';

const requiredProfileFields = [
  'nativeLanguage',
  'targetLanguage',
  'languageLevel',
  'learningGoal',
  'timezone',
];
const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function normalizeText(value) {
  return String(value ?? '').trim();
}

function getUserId(user) {
  return String(user.id ?? user._id);
}

function isProfileComplete(user) {
  return requiredProfileFields.every((field) => Boolean(normalizeText(user[field])));
}

function ensureCompleteCurrentProfile(user) {
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (!isProfileComplete(user)) {
    throw createHttpError(400, 'Complete your profile before discovering partners');
  }
}

function getLevelDistance(currentLevel, candidateLevel) {
  const currentIndex = levelOrder.indexOf(currentLevel);
  const candidateIndex = levelOrder.indexOf(candidateLevel);

  if (currentIndex === -1 || candidateIndex === -1) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(currentIndex - candidateIndex);
}

function getMatchDetails(currentUser, candidate, { includeSearchReason = false } = {}) {
  const reasons = [];
  let score = 0;

  if (
    currentUser.nativeLanguage === candidate.targetLanguage &&
    currentUser.targetLanguage === candidate.nativeLanguage
  ) {
    reasons.push(
      `Language exchange match: ${candidate.nativeLanguage} ↔ ${candidate.targetLanguage}`,
    );
    score += 10;
  } else if (currentUser.targetLanguage === candidate.nativeLanguage) {
    reasons.push(`Native ${candidate.nativeLanguage} speaker for your ${currentUser.targetLanguage}`);
    score += 6;
  } else if (currentUser.targetLanguage === candidate.targetLanguage) {
    reasons.push(`Also learning ${currentUser.targetLanguage}`);
    score += 3;
  }

  const levelDistance = getLevelDistance(currentUser.languageLevel, candidate.languageLevel);

  if (levelDistance === 0) {
    reasons.push(`Same level: ${candidate.languageLevel}`);
    score += 2;
  } else if (levelDistance === 1) {
    reasons.push(`Nearby level: ${candidate.languageLevel}`);
    score += 1;
  }

  if (currentUser.learningGoal === candidate.learningGoal) {
    reasons.push(`Similar learning goal: ${candidate.learningGoal}`);
    score += 2;
  }

  if (currentUser.timezone === candidate.timezone) {
    reasons.push(`Shared timezone: ${candidate.timezone}`);
    score += 1;
  }

  if (includeSearchReason && !reasons.includes('Matches your search')) {
    reasons.unshift('Matches your search');
  }

  return { reasons, score };
}

function serializeDiscoveryUser(user, matchReasons, relationshipStatus) {
  return {
    id: getUserId(user),
    username: user.username,
    avatar: user.avatar ?? '',
    nativeLanguage: user.nativeLanguage ?? '',
    targetLanguage: user.targetLanguage ?? '',
    languageLevel: user.languageLevel ?? '',
    learningGoal: user.learningGoal ?? '',
    bio: user.bio ?? '',
    timezone: user.timezone ?? '',
    matchReasons,
    relationshipStatus,
  };
}

async function attachRelationshipStatuses(userId, users, relationshipRepository) {
  const candidateIds = users.map((user) => getUserId(user));
  const statuses = await relationshipRepository.getRelationshipStatuses(userId, candidateIds);

  return users.map((user) => ({
    ...user,
    relationshipStatus: statuses[getUserId(user)] ?? 'stranger',
  }));
}

export function createUsersService({
  userRepository = createUserRepository(),
  relationshipRepository = defaultRelationshipRepository,
} = {}) {
  return {
    async getRecommendations(userId) {
      const currentUser = await userRepository.findById(userId);
      ensureCompleteCurrentProfile(currentUser);

      const candidates = (await userRepository.findDiscoverableUsers(userId)).filter(isProfileComplete);
      const rankedCandidates = candidates
        .map((candidate) => {
          const matchDetails = getMatchDetails(currentUser, candidate);
          return {
            user: candidate,
            score: matchDetails.score,
            matchReasons: matchDetails.reasons,
          };
        })
        .filter((candidate) => candidate.score > 0)
        .sort((first, second) => {
          if (second.score !== first.score) {
            return second.score - first.score;
          }

          return first.user.username.localeCompare(second.user.username);
        });

      const withStatuses = await attachRelationshipStatuses(
        userId,
        rankedCandidates.map((candidate) => candidate.user),
        relationshipRepository,
      );

      return rankedCandidates.map((candidate, index) =>
        serializeDiscoveryUser(
          candidate.user,
          candidate.matchReasons,
          withStatuses[index].relationshipStatus,
        ),
      );
    },

    async searchUsers(userId, query) {
      const normalizedQuery = normalizeText(query);

      if (!normalizedQuery) {
        throw createHttpError(400, 'Search query is required');
      }

      const currentUser = await userRepository.findById(userId);
      ensureCompleteCurrentProfile(currentUser);

      const candidates = (await userRepository.searchDiscoverableUsers(userId, normalizedQuery)).filter(
        isProfileComplete,
      );
      const withStatuses = await attachRelationshipStatuses(userId, candidates, relationshipRepository);

      return candidates.map((candidate, index) => {
        const matchDetails = getMatchDetails(currentUser, candidate, { includeSearchReason: true });

        return serializeDiscoveryUser(
          candidate,
          matchDetails.reasons,
          withStatuses[index].relationshipStatus,
        );
      });
    },
  };
}

export const usersService = createUsersService();
