import { describe, expect, it, vi } from 'vitest';

import {
  acceptIncomingCall,
  declineIncomingCall,
  getIncomingRingingCall,
  getUnreadMessageNotificationInput,
} from '../realtime-notifications';

describe('realtime notification helpers', () => {
  it('creates an unread message notification input for a friend message outside the active chat', () => {
    const result = getUnreadMessageNotificationInput(
      {
        cid: 'messaging:user-1-user-2',
        message: {
          id: 'message-1',
          text: 'Hello from Stream',
          user: { id: 'user-2' },
        },
        type: 'message.new',
      },
      {
        activeChatFriendId: 'user-3',
        currentUserId: 'user-1',
      },
    );

    expect(result).toEqual({
      messageId: 'message-1',
      preview: 'Hello from Stream',
      senderId: 'user-2',
    });
  });

  it('ignores self messages and messages already visible in the active chat', () => {
    expect(
      getUnreadMessageNotificationInput(
        {
          message: {
            id: 'message-1',
            text: 'My own message',
            user: { id: 'user-1' },
          },
          type: 'message.new',
        },
        {
          activeChatFriendId: 'user-2',
          currentUserId: 'user-1',
        },
      ),
    ).toBeNull();

    expect(
      getUnreadMessageNotificationInput(
        {
          message: {
            id: 'message-2',
            text: 'Visible message',
            user: { id: 'user-2' },
          },
          type: 'message.new',
        },
        {
          activeChatFriendId: 'user-2',
          currentUserId: 'user-1',
        },
      ),
    ).toBeNull();
  });

  it('returns only the first incoming ringing call', () => {
    const outgoingCall = {
      isCreatedByMe: true,
      state: { callingState: 'ringing' },
    };
    const idleCall = {
      isCreatedByMe: false,
      state: { callingState: 'idle' },
    };
    const incomingCall = {
      cid: 'default:user-1-user-2',
      isCreatedByMe: false,
      state: { callingState: 'ringing' },
    };

    expect(
      getIncomingRingingCall([outgoingCall, idleCall, incomingCall], 'ringing'),
    ).toBe(incomingCall);
  });

  it('accepts and declines incoming calls through the Stream call object', async () => {
    const navigate = vi.fn();
    const call = {
      id: 'user-1-user-2',
      join: vi.fn(async () => undefined),
      leave: vi.fn(async () => undefined),
      state: {
        members: [{ user: { id: 'user-2' } }, { user: { id: 'user-1' } }],
      },
    };

    await acceptIncomingCall(call, 'user-1', navigate);
    await declineIncomingCall(call);

    expect(call.join).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/app/call/user-2');
    expect(call.leave).toHaveBeenCalledWith({ reject: true, reason: 'decline' });
  });
});
