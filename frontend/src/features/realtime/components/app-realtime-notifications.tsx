import {
  CallingState,
  StreamVideo,
  StreamVideoClient,
  useCalls,
} from '@stream-io/video-react-sdk';
import { MessageCircle, Phone, PhoneOff, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router';
import { StreamChat } from 'stream-chat';
import type { Event as StreamChatEvent } from 'stream-chat';
import { useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '../../auth/api/auth-api';
import { useCallTokenQuery } from '../../call/api/call-hooks';
import { useChatTokenQuery } from '../../chat/api/chat-hooks';
import {
  createUnreadMessageNotification,
  type CreateUnreadMessageNotificationInput,
} from '../../notifications/api/notifications-api';
import { notificationsQueryKey } from '../../notifications/api/notifications-hooks';
import { useTranslation } from '../../../i18n/i18n-store';
import {
  acceptIncomingCall,
  declineIncomingCall,
  getIncomingRingingCall,
  getUnreadMessageNotificationInput,
  type IncomingCallAction,
} from '../realtime-notifications';

function getStreamApiKey() {
  return import.meta.env.VITE_STREAM_API_KEY ?? '';
}

function RealtimeToast({
  content,
  href,
  onClose,
  title,
}: {
  content: string;
  href: string;
  onClose: () => void;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <aside
      className="fixed right-4 top-20 z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-2 border-cloud-gray bg-snow-white p-4 shadow-[0_6px_0_var(--color-cloud-gray)]"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-sky-blue bg-sky-blue/10 text-sky-blue">
          <MessageCircle aria-hidden="true" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-almost-black">{title}</p>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-graphite">{content}</p>
          <Link className="mt-3 inline-flex text-sm font-black text-sky-blue" to={href}>
            {t('notifications.open')}
          </Link>
        </div>
        <button
          aria-label={t('realtime.dismiss')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-graphite transition hover:bg-cloud-gray/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/20"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={17} />
        </button>
      </div>
    </aside>
  );
}

function ChatRealtimeNotifications({
  currentUser,
  streamApiKey,
}: {
  currentUser: AuthUser;
  streamApiKey: string;
}) {
  const activeChatMatch = useMatch('/app/chat/:friendId');
  const queryClient = useQueryClient();
  const tokenQuery = useChatTokenQuery({ enabled: Boolean(streamApiKey) });
  const [toast, setToast] = useState<{
    content: string;
    href: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!tokenQuery.data) {
      return undefined;
    }

    let isActive = true;
    const tokenData = tokenQuery.data;
    const client = new StreamChat(streamApiKey);

    async function connectAndWatch() {
      await client.connectUser(
        {
          id: tokenData.user.id,
          image: tokenData.user.avatar,
          name: tokenData.user.username,
        },
        tokenData.token,
      );

      const subscription = client.on((event: StreamChatEvent) => {
        const input = getUnreadMessageNotificationInput(event, {
          activeChatFriendId: activeChatMatch?.params.friendId,
          currentUserId: currentUser.id,
        });

        if (!input) {
          return;
        }

        void createUnreadMessageNotification(input as CreateUnreadMessageNotificationInput)
          .then((notification) => {
            if (!isActive) {
              return;
            }

            setToast({
              content: notification.content,
              href: notification.metadata.href ?? `/app/chat/${input.senderId}`,
              title: notification.title,
            });
            void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
          })
          .catch(() => undefined);
      });

      return subscription;
    }

    let subscription: { unsubscribe?: () => void } | undefined;
    void connectAndWatch()
      .then((nextSubscription) => {
        subscription = nextSubscription;
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
      subscription?.unsubscribe?.();
      void client.disconnectUser().catch(() => undefined);
    };
  }, [
    activeChatMatch?.params.friendId,
    currentUser.id,
    queryClient,
    streamApiKey,
    tokenQuery.data,
  ]);

  return toast ? (
    <RealtimeToast
      content={toast.content}
      href={toast.href}
      onClose={() => setToast(null)}
      title={toast.title}
    />
  ) : null;
}

function IncomingCallPanel({ currentUserId }: { currentUserId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const calls = useCalls();
  const incomingCall = getIncomingRingingCall(
    calls as IncomingCallAction[],
    CallingState.RINGING,
  );

  if (!incomingCall) {
    return null;
  }

  return (
    <aside
      className="fixed inset-x-4 bottom-24 z-[75] mx-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border-2 border-duo-green bg-snow-white p-4 shadow-[0_6px_0_var(--color-duo-green)] md:bottom-6"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-duo-green-light text-duo-green">
          <Phone aria-hidden="true" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-almost-black">{t('realtime.call.title')}</p>
          <p className="text-sm font-bold text-graphite">{t('realtime.call.description')}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          className="btn-3d-base btn-3d-green min-h-11 flex-1 gap-2 px-4 text-sm"
          onClick={() => {
            void acceptIncomingCall(incomingCall, currentUserId, (path) => {
              navigate(path, { state: { skipRing: true } });
            });
          }}
          type="button"
        >
          <Phone aria-hidden="true" size={17} />
          {t('realtime.call.accept')}
        </button>
        <button
          className="btn-3d-base min-h-11 flex-1 gap-2 border-2 border-[#fecaca] bg-[#fee2e2] px-4 text-sm font-black text-[#b91c1c] shadow-[0_4px_0_#fecaca]"
          onClick={() => {
            void declineIncomingCall(incomingCall);
          }}
          type="button"
        >
          <PhoneOff aria-hidden="true" size={17} />
          {t('realtime.call.decline')}
        </button>
      </div>
    </aside>
  );
}

function VideoRealtimeNotifications({
  currentUser,
  streamApiKey,
}: {
  currentUser: AuthUser;
  streamApiKey: string;
}) {
  const tokenQuery = useCallTokenQuery({ enabled: Boolean(streamApiKey) });
  const videoClient = useMemo(() => {
    if (!tokenQuery.data) {
      return null;
    }

    return new StreamVideoClient({
      apiKey: streamApiKey,
      tokenProvider: async () => tokenQuery.data.token,
      user: {
        id: tokenQuery.data.user.id,
        image: tokenQuery.data.user.avatar,
        name: tokenQuery.data.user.username,
      },
    });
  }, [streamApiKey, tokenQuery.data]);

  useEffect(() => {
    return () => {
      void videoClient?.disconnectUser().catch(() => undefined);
    };
  }, [videoClient]);

  if (!videoClient) {
    return null;
  }

  return (
    <StreamVideo client={videoClient}>
      <IncomingCallPanel currentUserId={currentUser.id} />
    </StreamVideo>
  );
}

export function AppRealtimeNotifications({ currentUser }: { currentUser?: AuthUser }) {
  const streamApiKey = getStreamApiKey();

  if (!currentUser || !streamApiKey) {
    return null;
  }

  return (
    <>
      <ChatRealtimeNotifications currentUser={currentUser} streamApiKey={streamApiKey} />
      <VideoRealtimeNotifications currentUser={currentUser} streamApiKey={streamApiKey} />
    </>
  );
}
