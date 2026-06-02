import { describe, expect, it, vi } from 'vitest';

import { createRelationshipRepository } from '../services/relationship-repository.js';

function createModel(results) {
  return {
    find: vi.fn(() => ({
      lean: vi.fn(async () => results),
    })),
  };
}

describe('relationship repository', () => {
  it('maps pending requests and friendships to relationship statuses', async () => {
    const friendRequestModel = createModel([
      {
        senderId: 'user-1',
        receiverId: 'sent-user',
      },
      {
        senderId: 'received-user',
        receiverId: 'user-1',
      },
    ]);
    const friendshipModel = createModel([
      {
        userAId: 'friend-user',
        userBId: 'user-1',
      },
    ]);
    const repository = createRelationshipRepository({ friendRequestModel, friendshipModel });

    const result = await repository.getRelationshipStatuses('user-1', [
      'sent-user',
      'received-user',
      'friend-user',
      'stranger-user',
    ]);

    expect(result).toEqual({
      'sent-user': 'request_sent',
      'received-user': 'request_received',
      'friend-user': 'friend',
      'stranger-user': 'stranger',
    });
    expect(friendRequestModel.find).toHaveBeenCalledWith({
      status: 'pending',
      $or: [
        {
          senderId: 'user-1',
          receiverId: { $in: ['sent-user', 'received-user', 'friend-user', 'stranger-user'] },
        },
        {
          senderId: { $in: ['sent-user', 'received-user', 'friend-user', 'stranger-user'] },
          receiverId: 'user-1',
        },
      ],
    });
    expect(friendshipModel.find).toHaveBeenCalledWith({
      $or: [
        {
          userAId: 'user-1',
          userBId: { $in: ['sent-user', 'received-user', 'friend-user', 'stranger-user'] },
        },
        {
          userAId: { $in: ['sent-user', 'received-user', 'friend-user', 'stranger-user'] },
          userBId: 'user-1',
        },
      ],
    });
  });
});
