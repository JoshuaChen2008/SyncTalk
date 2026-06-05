import { StreamChat } from 'stream-chat';

import { env } from '../config/env.js';
import { createHttpError } from '../utils/http-error.js';
import { relationshipRepository as defaultRelationshipRepository } from './relationship-repository.js';
import { createUserRepository } from './user-repository.js';

function toId(value) {
  return String(value);
}

function getEntityId(entity) {
  return toId(entity.id ?? entity._id);
}

function getSortedChannelId(firstUserId, secondUserId) {
  return [toId(firstUserId), toId(secondUserId)].sort().join('-');
}

function serializeChatUser(user) {
  return {
    id: getEntityId(user),
    username: user.username,
    avatar: user.avatar ?? '',
  };
}

let defaultStreamChatClient;

function createDefaultStreamChatClient() {
  if (defaultStreamChatClient) {
    return defaultStreamChatClient;
  }

  if (!env.streamApiKey || !env.streamApiSecret) {
    throw createHttpError(500, 'Stream Chat is not configured');
  }

  defaultStreamChatClient = new StreamChat(env.streamApiKey, env.streamApiSecret, {
    disableCache: true,
  });

  return defaultStreamChatClient;
}

export function createChatService({
  userRepository = createUserRepository(),
  relationshipRepository = defaultRelationshipRepository,
  streamChatClient,
} = {}) {
  function getStreamChatClient() {
    return streamChatClient ?? createDefaultStreamChatClient();
  }

  return {
    createToken(user) {
      const chatUser = serializeChatUser(user);
      const token = getStreamChatClient().createToken(chatUser.id);

      return {
        token,
        user: chatUser,
      };
    },

    async getChannel(userId, friendId) {
      const normalizedFriendId = toId(friendId ?? '').trim();

      if (!normalizedFriendId) {
        throw createHttpError(400, 'Friend is required');
      }

      if (userId === normalizedFriendId) {
        throw createHttpError(400, 'You cannot chat with yourself');
      }

      const friend = await userRepository.findById(normalizedFriendId);

      if (!friend) {
        throw createHttpError(404, 'User not found');
      }

      const friendship = await relationshipRepository.findFriendshipBetween(userId, normalizedFriendId);

      if (!friendship) {
        throw createHttpError(403, 'Only friends can chat');
      }

      const friendUser = serializeChatUser(friend);
      const channelId = getSortedChannelId(userId, normalizedFriendId);
      const sortedMembers = [userId, normalizedFriendId].sort();
      const client = getStreamChatClient();

      await client.upsertUsers([
        { id: userId },
        { id: friendUser.id, name: friendUser.username, image: friendUser.avatar },
      ]);

      const channel = client.channel('messaging', channelId, {
        members: sortedMembers,
        created_by_id: userId,
      });
      await channel.create();

      return {
        channelId,
        friend: friendUser,
        members: [userId, normalizedFriendId],
      };
    },
  };
}

export const chatService = createChatService();
