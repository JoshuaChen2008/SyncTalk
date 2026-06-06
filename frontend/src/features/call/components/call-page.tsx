import {
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import type { Call } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { ArrowLeft, MessageCircle, Phone, ShieldAlert, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  featureCardClass,
  FriendsFeatureBackground,
  HeroGlassPanel,
} from '../../friends/components/friends-page-chrome';
import { getCallApiErrorMessage, type CallSession, type CallToken } from '../api/call-api';
import { useCallSessionQuery, useCallTokenQuery } from '../api/call-hooks';

function getStreamApiKey() {
  return import.meta.env.VITE_STREAM_API_KEY ?? '';
}

function CallStatePanel({
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

function CallErrorPanel({ message }: { message: string }) {
  return (
    <CallStatePanel role="alert">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-700">
        <ShieldAlert aria-hidden="true" size={26} />
      </div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">Call unavailable</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-red-800">{message}</p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-[#4f46e5] transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 motion-reduce:transition-none"
        to="/app/friends"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to friends
      </Link>
    </CallStatePanel>
  );
}

function CallPresenceStatus({
  friendName,
  currentUserId,
}: {
  friendName: string;
  currentUserId: string;
}) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const remoteParticipantCount = participants.filter(
    (participant) => participant.userId !== currentUserId,
  ).length;

  return (
    <p className="border-t border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-black text-teal-100">
      {remoteParticipantCount > 0
        ? `Live with ${remoteParticipantCount} partner${remoteParticipantCount === 1 ? '' : 's'}`
        : `Waiting for ${friendName} to join or rejoin`}
    </p>
  );
}

function StreamCallPanel({
  sessionData,
  streamApiKey,
  tokenData,
}: {
  sessionData: CallSession;
  streamApiKey: string;
  tokenData: CallToken;
}) {
  const navigate = useNavigate();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    let isActive = true;
    const nextClient = new StreamVideoClient({
      apiKey: streamApiKey,
      user: {
        id: tokenData.user.id,
        name: tokenData.user.username,
        image: tokenData.user.avatar,
      },
      tokenProvider: async () => tokenData.token,
    });
    const nextCall = nextClient.call(sessionData.callType, sessionData.callId);

    setVideoClient(nextClient);
    setActiveCall(nextCall);
    setIsJoining(true);
    setIsJoined(false);
    setConnectionError('');

    async function joinCall() {
      try {
        await nextCall.join({ create: true });

        if (isActive) {
          setIsJoined(true);
        }
      } catch {
        if (isActive) {
          setConnectionError(
            'Video call could not be joined. Please check camera and microphone permissions, then try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsJoining(false);
        }
      }
    }

    void joinCall();

    return () => {
      isActive = false;
      void nextCall.leave().catch(() => undefined);
      void nextClient.disconnectUser().catch(() => undefined);
    };
  }, [sessionData.callId, sessionData.callType, streamApiKey, tokenData]);

  async function handleLeave() {
    try {
      await activeCall?.leave();
      await videoClient?.disconnectUser();
    } finally {
      navigate('/app/friends');
    }
  }

  if (connectionError) {
    return <CallErrorPanel message={connectionError} />;
  }

  if (!videoClient || !activeCall || isJoining || !isJoined) {
    return (
      <CallStatePanel role="status">
        <p className="text-sm font-black text-slate-700">Joining call...</p>
      </CallStatePanel>
    );
  }

  return (
    <section className={`${featureCardClass} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-white/80 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-teal-700">
            Call {sessionData.callId}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-600">
            Practice live with {sessionData.friend.username}
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-sm font-black text-[#4f46e5] transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 motion-reduce:transition-none"
          to={`/app/chat/${sessionData.friend.id}`}
        >
          <MessageCircle aria-hidden="true" size={16} />
          Back to chat
        </Link>
      </div>
      <div className="min-h-[34rem] bg-slate-950 text-white">
        <StreamVideo client={videoClient}>
          <StreamCall call={activeCall}>
            <StreamTheme>
              <div className="min-h-[30rem]">
                <SpeakerLayout participantsBarPosition="bottom" />
              </div>
              <CallPresenceStatus
                currentUserId={tokenData.user.id}
                friendName={sessionData.friend.username}
              />
              <div className="border-t border-white/10 bg-slate-900/90 px-4 py-4">
                <CallControls onLeave={handleLeave} />
              </div>
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </div>
    </section>
  );
}

export function CallPage() {
  const { friendId = '' } = useParams();
  const streamApiKey = getStreamApiKey();
  const tokenQuery = useCallTokenQuery();
  const sessionQuery = useCallSessionQuery(friendId);
  const isLoading = tokenQuery.isPending || sessionQuery.isPending;
  const error = tokenQuery.error ?? sessionQuery.error;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] text-slate-950">
      <FriendsFeatureBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8">
        <HeroGlassPanel>
          <p className="inline-flex items-center gap-2 rounded-lg bg-white/74 px-3 py-1.5 text-sm font-black text-teal-700 shadow-sm backdrop-blur-xl">
            <Phone aria-hidden="true" size={16} />
            Call
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
            {sessionQuery.data ? `Call with ${sessionQuery.data.friend.username}` : 'Call'}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">
            Meet one-on-one with your accepted language partner in a stable shared video room.
          </p>
        </HeroGlassPanel>

        {!streamApiKey ? <CallErrorPanel message="Stream Video key is missing." /> : null}

        {streamApiKey && isLoading ? (
          <CallStatePanel role="status">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-700">
              <Video aria-hidden="true" size={26} />
            </div>
            <p className="mt-5 text-sm font-black text-slate-700">Loading call...</p>
          </CallStatePanel>
        ) : null}

        {streamApiKey && error ? <CallErrorPanel message={getCallApiErrorMessage(error)} /> : null}

        {streamApiKey && tokenQuery.data && sessionQuery.data && !error ? (
          <StreamCallPanel
            sessionData={sessionQuery.data}
            streamApiKey={streamApiKey}
            tokenData={tokenQuery.data}
          />
        ) : null}
      </div>
    </main>
  );
}
