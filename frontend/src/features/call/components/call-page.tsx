import {
  CallControls,
  ParticipantView,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import type { Call } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { ArrowLeft, MessageCircle, Mic, MicOff, ShieldAlert, Video, VideoOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  AppStatePanel,
} from '../../friends/components/friends-page-chrome';
import { SessionWorkspace } from '../../friends/components/session-workspace';
import { useFriendsQuery } from '../../friends/api/friends-hooks';
import { useTranslation } from '../../../i18n/i18n-store';
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
    <AppStatePanel role={role}>
      {children}
    </AppStatePanel>
  );
}

function CallErrorPanel({
  friendId,
  message,
}: {
  friendId?: string;
  message: string;
}) {
  const { t } = useTranslation();
  const backTo = friendId ? `/app/chat/${friendId}` : '/app/friends';
  const backLabel = friendId ? t('call.backToChat') : t('call.backToFriends');

  return (
    <CallStatePanel role="alert">
      <div className="surface-error mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 shadow-[0_4px_0_rgb(254_202_202_/_0.75)]">
        <ShieldAlert aria-hidden="true" size={26} />
      </div>
      <h2 className="mt-5 text-heading-sm font-feather text-almost-black">{t('call.unavailable')}</h2>
      <p className="text-error mx-auto mt-3 max-w-md text-sm font-bold leading-6">{message}</p>
      <Link
        className="btn-3d-base btn-3d-sky mt-5 min-h-11 gap-2 px-5 text-sm"
        to={backTo}
      >
        <ArrowLeft aria-hidden="true" size={17} />
        {backLabel}
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
  const { t } = useTranslation();
  const { useRemoteParticipants } = useCallStateHooks();
  const remoteParticipantCount = useRemoteParticipants().filter(
    (participant) => participant.userId !== currentUserId,
  ).length;

  return (
    <p className="border-t border-white/10 bg-slate-950/90 px-4 py-3 text-sm font-black text-teal-100">
      {remoteParticipantCount > 0
        ? t('call.liveWith', {
            count: remoteParticipantCount,
            plural: remoteParticipantCount === 1 ? '' : 's',
          })
        : t('call.waitingFor', { name: friendName })}
    </p>
  );
}

function CallMediaControls() {
  const { t } = useTranslation();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute: isMicrophoneMuted } = useMicrophoneState();
  const { camera, isMute: isCameraMuted } = useCameraState();
  const mediaButtonClass =
    'grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-[0_2px_0_rgba(255,255,255,0.08)] transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 motion-reduce:transition-none';

  const microphoneLabel = isMicrophoneMuted ? t('call.turnOnMic') : t('call.turnOffMic');
  const cameraLabel = isCameraMuted ? t('call.turnOnCamera') : t('call.turnOffCamera');

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        aria-label={microphoneLabel}
        className={mediaButtonClass}
        onClick={() => {
          void microphone.toggle();
        }}
        title={microphoneLabel}
        type="button"
      >
        {isMicrophoneMuted ? (
          <MicOff aria-hidden="true" size={19} />
        ) : (
          <Mic aria-hidden="true" size={19} />
        )}
      </button>
      <button
        aria-label={cameraLabel}
        className={mediaButtonClass}
        onClick={() => {
          void camera.toggle();
        }}
        title={cameraLabel}
        type="button"
      >
        {isCameraMuted ? (
          <VideoOff aria-hidden="true" size={19} />
        ) : (
          <Video aria-hidden="true" size={19} />
        )}
      </button>
    </div>
  );
}

function OneOnOneCallLayout({
  currentUserId,
  friendName,
}: {
  currentUserId: string;
  friendName: string;
}) {
  const { t } = useTranslation();
  const { useLocalParticipant, useParticipants, useRemoteParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipantFromState = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = localParticipantFromState ?? participants.find(
    (participant) => participant.isLocalParticipant || participant.userId === currentUserId,
  );
  const remoteParticipant = remoteParticipants.find(
    (participant) => participant.userId !== currentUserId,
  ) ?? participants.find(
    (participant) => !participant.isLocalParticipant && participant.userId !== currentUserId,
  );
  const mainParticipant = remoteParticipant ?? localParticipant;

  return (
    <div className="session-call-stage" data-testid="call-stage">
      <div className="session-call-main" data-testid="call-main-participant">
        {mainParticipant ? (
          <ParticipantView participant={mainParticipant} />
        ) : (
          <p className="px-4 text-center text-sm font-black text-teal-100">
            {t('call.waitingFor', { name: friendName })}
          </p>
        )}
      </div>
      {localParticipant && remoteParticipant ? (
        <div className="session-call-self-preview" data-testid="call-self-preview">
          <ParticipantView participant={localParticipant} muteAudio />
        </div>
      ) : null}
    </div>
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
  const { t } = useTranslation();
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
            t('call.joinError'),
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
  }, [sessionData.callId, sessionData.callType, streamApiKey, t, tokenData]);

  async function handleLeave() {
    try {
      await activeCall?.leave();
      await videoClient?.disconnectUser();
    } finally {
      navigate('/app/friends');
    }
  }

  if (connectionError) {
    return <CallErrorPanel friendId={sessionData.friend.id} message={connectionError} />;
  }

  if (!videoClient || !activeCall || isJoining || !isJoined) {
    return (
      <CallStatePanel role="status">
        <p className="text-sm font-black text-slate-700">{t('call.joining')}</p>
      </CallStatePanel>
    );
  }

  return (
    <section className="session-call-shell duo-shadow flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cloud-gray bg-snow-white px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-duo-green">
            {t('call.callLabel', { id: sessionData.callId })}
          </p>
          <p className="mt-1 text-sm font-bold text-graphite">
            {t('call.practiceWith', { name: sessionData.friend.username })}
          </p>
        </div>
        <Link
          className="btn-3d-base btn-3d-sky min-h-10 gap-2 px-4 text-sm"
          to={`/app/chat/${sessionData.friend.id}`}
        >
          <MessageCircle aria-hidden="true" size={16} />
          {t('call.backToChat')}
        </Link>
      </div>
      <div className="surface-muted min-h-0 flex-1 p-2 md:p-3">
        <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 text-white">
          <StreamVideo client={videoClient}>
            <StreamCall call={activeCall}>
              <StreamTheme className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1 bg-slate-950">
                  <OneOnOneCallLayout
                    currentUserId={tokenData.user.id}
                    friendName={sessionData.friend.username}
                  />
                </div>
                <CallPresenceStatus
                  currentUserId={tokenData.user.id}
                  friendName={sessionData.friend.username}
                />
                <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-slate-900/90 px-4 py-4">
                  <CallMediaControls />
                  <CallControls onLeave={handleLeave} />
                </div>
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        </div>
      </div>
    </section>
  );
}

export function CallPage() {
  const { t } = useTranslation();
  const { friendId = '' } = useParams();
  const streamApiKey = getStreamApiKey();
  const friendsQuery = useFriendsQuery();
  const tokenQuery = useCallTokenQuery();
  const sessionQuery = useCallSessionQuery(friendId);
  const isLoading = tokenQuery.isPending || sessionQuery.isPending;
  const error = tokenQuery.error ?? sessionQuery.error;
  const activeFriend = sessionQuery.data
    ? {
        avatar: sessionQuery.data.friend.avatar,
        id: sessionQuery.data.friend.id,
        languageLevel: '',
        targetLanguage: '',
        username: sessionQuery.data.friend.username,
      }
    : undefined;
  const title = sessionQuery.data
    ? t('call.hero.titleWithName', { name: sessionQuery.data.friend.username })
    : t('call.hero.title');

  return (
    <SessionWorkspace
      activeFriend={activeFriend}
      friends={friendsQuery.data ?? []}
      mode="call"
      statusText={sessionQuery.data ? t('session.status.livePractice') : t('call.badge')}
      title={title}
    >
      <div className="mx-auto flex h-full w-full max-w-[1040px] flex-col gap-4">
        {!streamApiKey ? <CallErrorPanel friendId={friendId} message={t('call.missingKey')} /> : null}

        {streamApiKey && isLoading ? (
          <CallStatePanel role="status">
            <div className="duo-shadow mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-cloud-gray bg-duo-green-light text-duo-green">
              <Video aria-hidden="true" size={26} />
            </div>
            <p className="mt-5 text-sm font-black text-graphite">{t('call.loading')}</p>
          </CallStatePanel>
        ) : null}

        {streamApiKey && error ? (
          <CallErrorPanel friendId={friendId} message={getCallApiErrorMessage(error)} />
        ) : null}

        {streamApiKey && tokenQuery.data && sessionQuery.data && !error ? (
          <StreamCallPanel
            sessionData={sessionQuery.data}
            streamApiKey={streamApiKey}
            tokenData={tokenQuery.data}
          />
        ) : null}
      </div>
    </SessionWorkspace>
  );
}
