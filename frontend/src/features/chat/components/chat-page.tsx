import { ArrowLeft, MessageCircle, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import type { Channel as StreamChannel } from 'stream-chat';
import { Chat, Channel, MessageComposer, MessageList, Window, useCreateChatClient } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

import {
  featureCardClass,
  FriendsFeatureBackground,
  HeroGlassPanel,
} from '../../friends/components/friends-page-chrome';
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
    <section className={`${featureCardClass} p-8 text-center`} role={role}>
      {children}
    </section>
  );
}

function ChatErrorPanel({ message }: { message: string }) {
  return (
    <ChatStatePanel role="alert">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-700">
        <ShieldAlert aria-hidden="true" size={26} />
      </div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">Chat unavailable</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-red-800">{message}</p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-[#4f46e5] transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 motion-reduce:transition-none"
        to="/app/friends"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to friends
      </Link>
    </ChatStatePanel>
  );
}

function StreamChatPanel({
  channelData,
  streamApiKey,
  tokenData,
}: {
  channelData: ChatChannel;
  streamApiKey: string;
  tokenData: ChatToken;
}) {
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
          setChannelError('Chat channel could not be loaded. Please try again.');
        }
      }
    }

    void watchChannel();

    return () => {
      isActive = false;
      setStreamChannel(null);
    };
  }, [channelData.channelId, client]);

  if (channelError) {
    return <ChatErrorPanel message={channelError} />;
  }

  if (!client || !streamChannel) {
    return (
      <ChatStatePanel role="status">
        <p className="text-sm font-black text-slate-700">Connecting chat...</p>
      </ChatStatePanel>
    );
  }

  return (
    <section className={`${featureCardClass} overflow-hidden`}>
      <div className="border-b border-indigo-100 bg-white/80 px-5 py-4">
        <p className="text-xs font-black uppercase tracking-normal text-[#4f46e5]">
          Channel {channelData.channelId}
        </p>
      </div>
      <div className="min-h-[34rem] bg-white">
        <Chat client={client}>
          <Channel channel={streamChannel}>
            <Window>
              <MessageList />
              <MessageComposer focus />
            </Window>
          </Channel>
        </Chat>
      </div>
    </section>
  );
}

export function ChatPage() {
  const { friendId = '' } = useParams();
  const streamApiKey = getStreamApiKey();
  const tokenQuery = useChatTokenQuery();
  const channelQuery = useChatChannelQuery(friendId);
  const isLoading = tokenQuery.isPending || channelQuery.isPending;
  const error = tokenQuery.error ?? channelQuery.error;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6ff] text-slate-950">
      <FriendsFeatureBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8">
        <HeroGlassPanel>
          <p className="inline-flex items-center gap-2 rounded-lg bg-white/74 px-3 py-1.5 text-sm font-black text-[#4f46e5] shadow-sm backdrop-blur-xl">
            <MessageCircle aria-hidden="true" size={16} />
            Chat
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
            {channelQuery.data ? `Chat with ${channelQuery.data.friend.username}` : 'Chat'}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">
            Practice one-on-one with your accepted language partner in a stable shared channel.
          </p>
        </HeroGlassPanel>

        {!streamApiKey ? <ChatErrorPanel message="Stream Chat key is missing." /> : null}

        {streamApiKey && isLoading ? (
          <ChatStatePanel role="status">
            <p className="text-sm font-black text-slate-700">Loading chat...</p>
          </ChatStatePanel>
        ) : null}

        {streamApiKey && error ? <ChatErrorPanel message={getChatApiErrorMessage(error)} /> : null}

        {streamApiKey && tokenQuery.data && channelQuery.data && !error ? (
          <StreamChatPanel
            channelData={channelQuery.data}
            streamApiKey={streamApiKey}
            tokenData={tokenQuery.data}
          />
        ) : null}
      </div>
    </main>
  );
}
