import { FriendRequest } from '../models/friend-request.js';
import { Friendship } from '../models/friendship.js';

function toId(value) {
  return String(value);
}

function getSortedFriendshipPair(firstUserId, secondUserId) {
  const [userAId, userBId] = [toId(firstUserId), toId(secondUserId)].sort();
  return { userAId, userBId };
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
    findPendingRequestBetween(userId, candidateId) {
      return friendRequestModel
        .findOne({
          status: 'pending',
          $or: [
            { senderId: userId, receiverId: candidateId },
            { senderId: candidateId, receiverId: userId },
          ],
        })
        .lean();
    },
    findFriendshipBetween(userId, candidateId) {
      return friendshipModel.findOne(getSortedFriendshipPair(userId, candidateId)).lean();
    },
    async createFriendRequest(request) {
      const createdRequest = await friendRequestModel.create(request);
      return createdRequest.toJSON();
    },
    findReceivedRequests(userId) {
      return friendRequestModel.find({ receiverId: userId, status: 'pending' }).sort({ createdAt: -1 }).lean();
    },
    findSentRequests(userId) {
      return friendRequestModel.find({ senderId: userId, status: 'pending' }).sort({ createdAt: -1 }).lean();
    },
    findRequestById(requestId) {
      return friendRequestModel.findById(requestId).lean();
    },
    updateRequestStatus(requestId, status) {
      return friendRequestModel.findByIdAndUpdate(requestId, { status }, { new: true }).lean();
    },
    async createFriendship(firstUserId, secondUserId) {
      const createdFriendship = await friendshipModel.create(
        getSortedFriendshipPair(firstUserId, secondUserId),
      );
      return createdFriendship.toJSON();
    },
    findFriendshipsForUser(userId) {
      return friendshipModel
        .find({
          $or: [{ userAId: userId }, { userBId: userId }],
        })
        .sort({ createdAt: -1 })
        .lean();
    },
    deleteFriendshipBetween(userId, friendId) {
      return friendshipModel.deleteOne(getSortedFriendshipPair(userId, friendId));
    },
  };
}

export const relationshipRepository = createRelationshipRepository();
