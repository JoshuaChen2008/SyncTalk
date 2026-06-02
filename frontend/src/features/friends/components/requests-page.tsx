import { Check, Clock, Inbox, MapPin, Send, X } from 'lucide-react';

import {
  featureCardClass,
  FriendsFeatureBackground,
  FriendsFeatureTopNav,
  HeroGlassPanel,
} from './friends-page-chrome';
import { getFriendsApiErrorMessage, type FriendRequest } from '../api/friends-api';
import {
  useFriendRequestsQuery,
  useRespondToFriendRequestMutation,
} from '../api/friends-hooks';

function getLanguageCode(language: string) {
  return language.slice(0, 2).toUpperCase();
}

function RequestCard({
  request,
  mode,
  isMutating,
  onRespond,
}: {
  request: FriendRequest;
  mode: 'received' | 'sent';
  isMutating: boolean;
  onRespond: (requestId: string, action: 'accept' | 'reject') => void;
}) {
  const initials = request.user.username.slice(0, 2).toUpperCase();

  return (
    <article className={`${featureCardClass} flex min-h-[17rem] flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {request.user.avatar ? (
            <img
              alt={`${request.user.username} avatar`}
              className="h-16 w-16 shrink-0 rounded-full border border-white object-cover shadow-[0_12px_24px_rgb(79_70_229_/_16%)]"
              src={request.user.avatar}
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white bg-[#fbbf24]/84 text-lg font-black text-slate-950 shadow-[0_12px_24px_rgb(251_191_36_/_18%)]">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black text-slate-950">{request.user.username}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-black text-[#4f46e5]">
                {getLanguageCode(request.user.nativeLanguage)}
              </span>
              <span className="rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-800">
                {getLanguageCode(request.user.targetLanguage)}
              </span>
            </div>
          </div>
        </div>
        <span
          className={
            mode === 'received'
              ? 'inline-flex min-h-9 shrink-0 items-center rounded-lg bg-indigo-100 px-3 text-xs font-black text-[#4f46e5]'
              : 'inline-flex min-h-9 shrink-0 items-center rounded-lg bg-amber-100 px-3 text-xs font-black text-amber-800'
          }
        >
          {mode === 'received' ? 'Incoming' : 'Pending'}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-slate-600">
        <p className="inline-flex items-center gap-2">
          <MapPin aria-hidden="true" size={16} />
          {request.user.timezone}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock aria-hidden="true" size={16} />
          {request.user.learningGoal}
        </p>
        <p className="leading-6 text-slate-700">
          {request.user.nativeLanguage} native, learning {request.user.targetLanguage}
        </p>
      </div>

      {mode === 'received' ? (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
          <button
            aria-label={`Accept ${request.user.username}`}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-black text-slate-950 shadow-[0_12px_22px_rgb(34_197_94_/_18%)] transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'accept')}
          >
            <Check aria-hidden="true" size={17} />
            Accept
          </button>
          <button
            aria-label={`Reject ${request.user.username}`}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'reject')}
          >
            <X aria-hidden="true" size={17} />
            Reject
          </button>
        </div>
      ) : null}
    </article>
  );
}

function RequestsStatePanel({
  children,
  role,
}: {
  children: string;
  role?: 'alert' | 'status';
}) {
  return (
    <section className={`${featureCardClass} p-6 text-sm font-black text-slate-700`} role={role}>
      {children}
    </section>
  );
}

export function RequestsPage() {
  const requestsQuery = useFriendRequestsQuery();
  const respondMutation = useRespondToFriendRequestMutation();

  function handleRespond(requestId: string, action: 'accept' | 'reject') {
    respondMutation.mutate({ requestId, action });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6ff] text-slate-950">
      <FriendsFeatureTopNav />
      <FriendsFeatureBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
        <HeroGlassPanel>
          <p className="inline-flex items-center gap-2 rounded-lg bg-white/74 px-3 py-1.5 text-sm font-black text-[#4f46e5] shadow-sm backdrop-blur-xl">
            <Inbox aria-hidden="true" size={16} />
            Requests
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
            Friend Requests
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">
            Review incoming language partner requests and track the invitations you have already sent.
          </p>
        </HeroGlassPanel>

        {requestsQuery.isPending ? (
          <RequestsStatePanel role="status">Loading friend requests...</RequestsStatePanel>
        ) : null}

        {requestsQuery.isError ? (
          <RequestsStatePanel role="alert">
            {getFriendsApiErrorMessage(requestsQuery.error)}
          </RequestsStatePanel>
        ) : null}

        {respondMutation.isError ? (
          <p className={`${featureCardClass} p-4 text-sm font-black text-red-950`} role="alert">
            {getFriendsApiErrorMessage(respondMutation.error)}
          </p>
        ) : null}

        {requestsQuery.data ? (
          <>
            <section className="flex flex-col gap-4" aria-label="Received requests">
              <div className="flex items-center gap-2">
                <Inbox aria-hidden="true" className="text-[#4f46e5]" size={20} />
                <h2 className="text-2xl font-black text-slate-950">Received requests</h2>
              </div>
              {requestsQuery.data.receivedRequests.length === 0 ? (
                <RequestsStatePanel>No received requests yet</RequestsStatePanel>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {requestsQuery.data.receivedRequests.map((request) => (
                    <RequestCard
                      isMutating={respondMutation.isPending}
                      key={request.id}
                      mode="received"
                      request={request}
                      onRespond={handleRespond}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4" aria-label="Sent requests">
              <div className="flex items-center gap-2">
                <Send aria-hidden="true" className="text-[#4f46e5]" size={20} />
                <h2 className="text-2xl font-black text-slate-950">Sent requests</h2>
              </div>
              {requestsQuery.data.sentRequests.length === 0 ? (
                <RequestsStatePanel>No sent requests yet</RequestsStatePanel>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {requestsQuery.data.sentRequests.map((request) => (
                    <RequestCard
                      isMutating={respondMutation.isPending}
                      key={request.id}
                      mode="sent"
                      request={request}
                      onRespond={handleRespond}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
