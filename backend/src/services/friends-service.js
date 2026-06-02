import { relationshipRepository as defaultRelationshipRepository } from './relationship-repository.js';
import { createUserRepository } from './user-repository.js';
import { createHttpError } from '../utils/http-error.js';

function toId(value) {
  return String(value);
}

function getEntityId(entity) {
  return toId(entity.id ?? entity._id);
}

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function serializeRequest(request) {
  return {
    id: getEntityId(request),
    senderId: toId(request.senderId),
    receiverId: toId(request.receiverId),
    status: request.status,
    createdAt: serializeDate(request.createdAt),
  };
}

function serializeUser(user) {
  return {
    id: getEntityId(user),
    username: user.username,
    avatar: user.avatar ?? '',
    nativeLanguage: user.nativeLanguage ?? '',
    targetLanguage: user.targetLanguage ?? '',
    languageLevel: user.languageLevel ?? '',
    learningGoal: user.learningGoal ?? '',
    bio: user.bio ?? '',
    timezone: user.timezone ?? '',
  };
}

function serializeFriendship(friendship, userId, user) {
  return {
    friendshipId: getEntityId(friendship),
    ...serializeUser(user),
    id: getEntityId(user),
    createdAt: serializeDate(friendship.createdAt),
  };
}

function attachUsersToRequests(requests, userById, getUserId) {
  return requests.map((request) => ({
    ...serializeRequest(request),
    user: serializeUser(userById.get(toId(getUserId(request)))),
  }));
}

function getOtherFriendId(friendship, userId) {
  const userAId = toId(friendship.userAId);
  const userBId = toId(friendship.userBId);
  return userAId === userId ? userBId : userAId;
}

function getSortedUserIds(firstUserId, secondUserId) {
  return [toId(firstUserId), toId(secondUserId)].sort();
}

export function createFriendsService({
  userRepository = createUserRepository(),
  relationshipRepository = defaultRelationshipRepository,
} = {}) {
  return {
    async sendFriendRequest(userId, receiverId) {
      const normalizedReceiverId = toId(receiverId ?? '').trim();

      if (!normalizedReceiverId) {
        throw createHttpError(400, 'Receiver is required');
      }

      if (userId === normalizedReceiverId) {
        throw createHttpError(400, 'You cannot add yourself as a friend');
      }

      const receiver = await userRepository.findById(normalizedReceiverId);

      if (!receiver) {
        throw createHttpError(404, 'User not found');
      }

      const pendingRequest = await relationshipRepository.findPendingRequestBetween(
        userId,
        normalizedReceiverId,
      );

      if (pendingRequest) {
        throw createHttpError(409, 'A pending friend request already exists');
      }

      const friendship = await relationshipRepository.findFriendshipBetween(userId, normalizedReceiverId);

      if (friendship) {
        throw createHttpError(409, 'You are already friends');
      }

      const request = await relationshipRepository.createFriendRequest({
        senderId: userId,
        receiverId: normalizedReceiverId,
      });

      return serializeRequest(request);
    },

    async getFriendRequests(userId) {
      const [receivedRequests, sentRequests] = await Promise.all([
        relationshipRepository.findReceivedRequests(userId),
        relationshipRepository.findSentRequests(userId),
      ]);
      const userIds = [
        ...new Set([
          ...receivedRequests.map((request) => toId(request.senderId)),
          ...sentRequests.map((request) => toId(request.receiverId)),
        ]),
      ];
      const users = await userRepository.findByIds(userIds);
      const userById = new Map(users.map((user) => [getEntityId(user), user]));

      return {
        receivedRequests: attachUsersToRequests(receivedRequests, userById, (request) => request.senderId),
        sentRequests: attachUsersToRequests(sentRequests, userById, (request) => request.receiverId),
      };
    },

    async respondToFriendRequest(userId, requestId, action) {
      if (action !== 'accept' && action !== 'reject') {
        throw createHttpError(400, 'Action must be accept or reject');
      }

      const request = await relationshipRepository.findRequestById(requestId);

      if (!request) {
        throw createHttpError(404, 'Friend request not found');
      }

      if (request.status !== 'pending') {
        throw createHttpError(409, 'Friend request has already been handled');
      }

      if (toId(request.receiverId) !== userId) {
        throw createHttpError(403, 'You can only respond to received friend requests');
      }

      const status = action === 'accept' ? 'accepted' : 'rejected';
      const updatedRequest = await relationshipRepository.updateRequestStatus(requestId, status);
      const result = { request: serializeRequest(updatedRequest) };

      if (action === 'accept') {
        const existingFriendship = await relationshipRepository.findFriendshipBetween(
          request.senderId,
          request.receiverId,
        );
        const [userAId, userBId] = getSortedUserIds(request.senderId, request.receiverId);
        result.friendship =
          existingFriendship ??
          (await relationshipRepository.createFriendship(userAId, userBId));
      }

      return result;
    },

    async getFriends(userId) {
      const friendships = await relationshipRepository.findFriendshipsForUser(userId);
      const friendIds = friendships.map((friendship) => getOtherFriendId(friendship, userId));
      const users = await userRepository.findByIds(friendIds);
      const userById = new Map(users.map((user) => [getEntityId(user), user]));

      return friendships
        .filter((friendship) => userById.has(getOtherFriendId(friendship, userId)))
        .map((friendship) =>
          serializeFriendship(friendship, userId, userById.get(getOtherFriendId(friendship, userId))),
        );
    },

    async removeFriend(userId, friendId) {
      const result = await relationshipRepository.deleteFriendshipBetween(userId, friendId);

      if (result.deletedCount === 0) {
        throw createHttpError(404, 'Friendship not found');
      }

      return { removed: true };
    },
  };
}

export const friendsService = createFriendsService();
