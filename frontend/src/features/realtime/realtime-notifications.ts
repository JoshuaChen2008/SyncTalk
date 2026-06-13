export type StreamMessageEvent = {
  cid?: string;
  message?: {
    id?: string;
    text?: string;
    user?: {
      id?: string;
    } | null;
  };
  type?: string;
};

export type UnreadMessageNotificationInput = {
  messageId?: string;
  preview: string;
  senderId: string;
};

export type MessageNotificationContext = {
  activeChatFriendId?: string;
  currentUserId: string;
};

type RingingCallLike = {
  isCreatedByMe?: boolean | '';
  state?: {
    callingState?: unknown;
    members?: Array<{
      user?: {
        id?: string;
      };
      user_id?: string;
    }>;
  };
};

export type IncomingCallAction = RingingCallLike & {
  id?: string;
  join: () => Promise<unknown>;
  leave: (input?: { reason?: string; reject?: boolean }) => Promise<unknown>;
};

export function getUnreadMessageNotificationInput(
  event: StreamMessageEvent,
  { activeChatFriendId, currentUserId }: MessageNotificationContext,
): UnreadMessageNotificationInput | null {
  if (event.type !== 'message.new') {
    return null;
  }

  const senderId = event.message?.user?.id;

  if (!senderId || senderId === currentUserId || senderId === activeChatFriendId) {
    return null;
  }

  return {
    ...(event.message?.id ? { messageId: event.message.id } : {}),
    preview: event.message?.text?.trim() ?? '',
    senderId,
  };
}

export function getIncomingRingingCall<TCall extends RingingCallLike>(
  calls: TCall[],
  ringingState: unknown,
) {
  return calls.find(
    (call) => !call.isCreatedByMe && call.state?.callingState === ringingState,
  );
}

function getOtherMemberId(call: RingingCallLike & { id?: string }, currentUserId: string) {
  const memberId = call.state?.members
    ?.map((member) => member.user?.id ?? member.user_id ?? '')
    .find((userId) => userId && userId !== currentUserId);

  if (memberId) {
    return memberId;
  }

  return call.id
    ?.split('-')
    .find((userId) => userId && userId !== currentUserId) ?? '';
}

export async function acceptIncomingCall(
  call: IncomingCallAction,
  currentUserId: string,
  navigate: (path: string) => void,
) {
  const friendId = getOtherMemberId(call, currentUserId);

  await call.join();

  if (friendId) {
    navigate(`/app/call/${friendId}`);
  }
}

export async function declineIncomingCall(call: IncomingCallAction) {
  await call.leave({ reject: true, reason: 'decline' });
}
