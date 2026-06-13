import { StreamClient } from '@stream-io/node-sdk';

import { env } from '../config/env.js';
import { createHttpError } from '../utils/http-error.js';
import { relationshipRepository as defaultRelationshipRepository } from './relationship-repository.js';
import { notificationsService as defaultNotificationsService } from './notifications-service.js';
import { createUserRepository } from './user-repository.js';

const TOKEN_VALIDITY_SECONDS = 60 * 60;

function toId(value) {
  return String(value);
}

function getEntityId(entity) {
  return toId(entity.id ?? entity._id);
}

function getSortedCallId(firstUserId, secondUserId) {
  return [toId(firstUserId), toId(secondUserId)].sort().join('-');
}

function serializeCallUser(user) {
  return {
    id: getEntityId(user),
    username: user.username,
    avatar: user.avatar ?? '',
  };
}

let defaultStreamVideoClient;

function createDefaultStreamVideoClient() {
  if (defaultStreamVideoClient) {
    return defaultStreamVideoClient;
  }

  if (!env.streamApiKey || !env.streamApiSecret) {
    throw createHttpError(500, 'Stream Video is not configured');
  }

  defaultStreamVideoClient = new StreamClient(env.streamApiKey, env.streamApiSecret);
  return defaultStreamVideoClient;
}

export function createCallService({
  notificationsService = defaultNotificationsService,
  userRepository = createUserRepository(),
  relationshipRepository = defaultRelationshipRepository,
  streamVideoClient,
} = {}) {
  function getStreamVideoClient() {
    return streamVideoClient ?? createDefaultStreamVideoClient();
  }

  return {
    createToken(user) {
      const callUser = serializeCallUser(user);
      const token = getStreamVideoClient().generateUserToken({
        user_id: callUser.id,
        validity_in_seconds: TOKEN_VALIDITY_SECONDS,
      });

      return {
        token,
        user: callUser,
      };
    },

    async getSession(userId, friendId) {
      const normalizedFriendId = toId(friendId ?? '').trim();

      if (!normalizedFriendId) {
        throw createHttpError(400, 'Friend is required');
      }

      if (userId === normalizedFriendId) {
        throw createHttpError(400, 'You cannot call yourself');
      }

      const friend = await userRepository.findById(normalizedFriendId);

      if (!friend) {
        throw createHttpError(404, 'User not found');
      }

      const friendship = await relationshipRepository.findFriendshipBetween(
        userId,
        normalizedFriendId,
      );

      if (!friendship) {
        throw createHttpError(403, 'Only friends can call');
      }

      const friendUser = serializeCallUser(friend);
      const callId = getSortedCallId(userId, normalizedFriendId);

      await getStreamVideoClient().upsertUsers([
        { id: userId },
        { id: friendUser.id, name: friendUser.username, image: friendUser.avatar },
      ]);

      return {
        callId,
        callType: 'default',
        friend: friendUser,
        members: [userId, normalizedFriendId],
      };
    },

    async getRingingSession(userId, friendId) {
      const session = await this.getSession(userId, friendId);

      await notificationsService.createIncomingCallNotification({
        callerId: userId,
        receiverId: session.friend.id,
      });

      return session;
    },
  };
}

export const callService = createCallService();
