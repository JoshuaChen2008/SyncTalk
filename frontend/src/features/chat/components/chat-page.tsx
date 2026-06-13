import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import type { Channel as StreamChannel } from 'stream-chat';
import { Chat, Channel, MessageComposer, MessageList, Window, useCreateChatClient } from 'stream-chat-react';

import {
  AppStatePanel,
} from '../../friends/components/friends-page-chrome';
import { SessionWorkspace } from '../../friends/components/session-workspace';
import { useFriendsQuery } from '../../friends/api/friends-hooks';
import { useTranslation } from '../../../i18n/i18n-store';
import { getChatApiErrorMessage, type ChatChannel, type ChatToken } from '../api/chat-api';
import { useChatChannelQuery, useChatTokenQuery } from '../api/chat-hooks';

function getStreamApiKey() {
  return import.meta.env.VITE_STREAM_API_KEY ?? '';
}

function ChatStatePanel({
  children,
  role,
}: {
  children: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <AppStatePanel role={role}>
      {children}
    </AppStatePanel>
  );
}

function ChatErrorPanel({ message }: { message: string }) {
  const { t } = useTranslation();

  return (
    <ChatStatePanel role="alert">
      <div className="surface-error mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 shadow-[0_4px_0_rgb(254_202_202_/_0.75)]">
        <ShieldAlert aria-hidden="true" size={26} />
      </div>
      <h2 className="mt-5 text-heading-sm font-feather text-almost-black">{t('chat.unavailable')}</h2>
      <p className="text-error mx-auto mt-3 max-w-md text-sm font-bold leading-6">{message}</p>
      <Link
        className="btn-3d-base btn-3d-sky mt-5 min-h-11 gap-2 px-5 text-sm"
        to="/app/friends"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        {t('chat.backToFriends')}
      </Link>
    </ChatStatePanel>
  );
}

function StreamChatPanel({
  channelData,
  friendName,
  streamApiKey,
  tokenData,
}: {
  channelData: ChatChannel;
  friendName: string;
  streamApiKey: string;
  tokenData: ChatToken;
}) {
  const { t } = useTranslation();
  const [streamChannel, setStreamChannel] = useState<StreamChannel | null>(null);
  const [channelError, setChannelError] = useState('');
  const client = useCreateChatClient({
    apiKey: streamApiKey,
    tokenOrProvider: tokenData.token,
    userData: {
      id: tokenData.user.id,
      name: tokenData.user.username,
      image: tokenData.user.avatar,
    },
  });

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    let isActive = true;
    const activeClient = client;

    async function watchChannel() {
      try {
        setChannelError('');
        const nextChannel = activeClient.channel('messaging', channelData.channelId);
        await nextChannel.watch();

        if (isActive) {
          setStreamChannel(nextChannel);
        }
      } catch {
        if (isActive) {
          setChannelError(t('chat.channelError'));
        }
      }
    }

    void watchChannel();

    return () => {
      isActive = false;
      setStreamChannel(null);
    };
  }, [channelData.channelId, client, t]);

  if (channelError) {
    return <ChatErrorPanel message={channelError} />;
  }

  if (!client || !streamChannel) {
    return (
      <ChatStatePanel role="status">
        <p className="text-sm font-black text-slate-700">{t('chat.connecting')}</p>
      </ChatStatePanel>
    );
  }

  return (
    <section className="session-chat-shell duo-shadow flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cloud-gray bg-snow-white px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-sky-blue">
            {t('chat.channelLabel', { id: channelData.channelId })}
          </p>
          <p className="mt-1 text-sm font-bold text-graphite">
            {friendName}
          </p>
        </div>
        <span className="surface-info rounded-full border-2 border-sky-blue px-3 py-1 text-xs font-black text-sky-blue">
          {t('session.status.online')}
        </span>
      </div>
      <div className="surface-muted flex min-h-0 flex-1 p-2 md:p-3">
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border-2 border-cloud-gray bg-snow-white">
          <Chat client={client}>
            <Channel channel={streamChannel}>
              <Window>
                <MessageList />
                <MessageComposer focus />
              </Window>
            </Channel>
          </Chat>
        </div>
      </div>
    </section>
  );
}

export function ChatPage() {
  const { t } = useTranslation();
  const { friendId = '' } = useParams();
  const streamApiKey = getStreamApiKey();
  const friendsQuery = useFriendsQuery();
  const tokenQuery = useChatTokenQuery();
  const channelQuery = useChatChannelQuery(friendId);
  const isLoading = tokenQuery.isPending || channelQuery.isPending;
  const error = tokenQuery.error ?? channelQuery.error;
  const activeFriend = channelQuery.data
    ? {
      avatar: channelQuery.data.friend.avatar,
      id: channelQuery.data.friend.id,
      languageLevel: '',
      targetLanguage: '',
      username: channelQuery.data.friend.username,
    }
    : undefined;
  const title = channelQuery.data
    ? t('chat.hero.titleWithName', { name: channelQuery.data.friend.username })
    : t('chat.hero.title');

  return (
    <SessionWorkspace
      activeFriend={activeFriend}
      friends={friendsQuery.data ?? []}
      mode="chat"
      statusText={channelQuery.data ? t('session.status.online') : t('chat.badge')}
      title={title}
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-1 flex-col gap-4">
        {!streamApiKey ? <ChatErrorPanel message={t('chat.missingKey')} /> : null}

        {streamApiKey && isLoading ? (
          <ChatStatePanel role="status">
            <p className="text-sm font-black text-graphite">{t('chat.loading')}</p>
          </ChatStatePanel>
        ) : null}

        {streamApiKey && error ? <ChatErrorPanel message={getChatApiErrorMessage(error)} /> : null}

        {streamApiKey && tokenQuery.data && channelQuery.data && !error ? (
          <StreamChatPanel
            channelData={channelQuery.data}
            friendName={channelQuery.data.friend.username}
            streamApiKey={streamApiKey}
            tokenData={tokenQuery.data}
          />
        ) : null}
      </div>
    </SessionWorkspace>
  );
}
