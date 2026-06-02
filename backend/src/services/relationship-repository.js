import { FriendRequest } from '../models/friend-request.js';
import { Friendship } from '../models/friendship.js';

function toId(value) {
  return String(value);
}

export function createRelationshipRepository({
  friendRequestModel = FriendRequest,
  friendshipModel = Friendship,
} = {}) {
  return {
    async getRelationshipStatuses(userId, candidateIds) {
      const statuses = Object.fromEntries(candidateIds.map((candidateId) => [candidateId, 'stranger']));

      if (candidateIds.length === 0) {
        return statuses;
      }

      const [pendingRequests, friendships] = await Promise.all([
        friendRequestModel
          .find({
            status: 'pending',
            $or: [
              { senderId: userId, receiverId: { $in: candidateIds } },
              { senderId: { $in: candidateIds }, receiverId: userId },
            ],
          })
          .lean(),
        friendshipModel
          .find({
            $or: [
              { userAId: userId, userBId: { $in: candidateIds } },
              { userAId: { $in: candidateIds }, userBId: userId },
            ],
          })
          .lean(),
      ]);

      for (const request of pendingRequests) {
        const senderId = toId(request.senderId);
        const receiverId = toId(request.receiverId);

        if (senderId === userId && receiverId in statuses) {
          statuses[receiverId] = 'request_sent';
        } else if (receiverId === userId && senderId in statuses) {
          statuses[senderId] = 'request_received';
        }
      }

      for (const friendship of friendships) {
        const userAId = toId(friendship.userAId);
        const userBId = toId(friendship.userBId);
        const friendId = userAId === userId ? userBId : userAId;

        if (friendId in statuses) {
          statuses[friendId] = 'friend';
        }
      }

      return statuses;
    },
  };
}

export const relationshipRepository = createRelationshipRepository();
