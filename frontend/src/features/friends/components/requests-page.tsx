import { Check, Clock, Inbox, MapPin, Send, X } from 'lucide-react';

import {
  discoverGlassPanel,
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  featureCardClass,
} from './friends-page-chrome';
import { getFriendsApiErrorMessage, type FriendRequest } from '../api/friends-api';
import {
  useFriendRequestsQuery,
  useRespondToFriendRequestMutation,
} from '../api/friends-hooks';
import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';

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
  const { locale, t } = useTranslation();
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
          {mode === 'received' ? t('requests.incoming') : t('requests.pending')}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-slate-600">
        <p className="inline-flex items-center gap-2">
          <MapPin aria-hidden="true" size={16} />
          {request.user.timezone}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock aria-hidden="true" size={16} />
          {translateDisplayValue(locale, request.user.learningGoal)}
        </p>
        <p className="leading-6 text-slate-700">
          {t('requests.nativeLearning', {
            nativeLanguage: translateDisplayValue(locale, request.user.nativeLanguage),
            targetLanguage: translateDisplayValue(locale, request.user.targetLanguage),
          })}
        </p>
      </div>

      {mode === 'received' ? (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
          <button
            aria-label={t('requests.acceptName', { name: request.user.username })}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-black text-slate-950 shadow-[0_12px_22px_rgb(34_197_94_/_18%)] transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'accept')}
          >
            <Check aria-hidden="true" size={17} />
            {t('requests.accept')}
          </button>
          <button
            aria-label={t('requests.rejectName', { name: request.user.username })}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'reject')}
          >
            <X aria-hidden="true" size={17} />
            {t('requests.reject')}
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
  const { t } = useTranslation();
  const requestsQuery = useFriendRequestsQuery();
  const respondMutation = useRespondToFriendRequestMutation();

  function handleRespond(requestId: string, action: 'accept' | 'reject') {
    respondMutation.mutate({ requestId, action });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef2ff] px-4 py-5 text-slate-950 sm:px-8">
      <DiscoverStyleBackground />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className={`grid overflow-hidden rounded-lg ${discoverGlassPanel} lg:grid-cols-[1.1fr_0.9fr]`}>
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 bg-[#4f46e5]/70 p-6 text-white backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/70 bg-[#22c55e]/72 text-slate-950 shadow-[0_14px_28px_rgb(34_197_94_/_28%)] backdrop-blur-xl">
                <Inbox aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-black uppercase tracking-normal">
                {t('app.nav.requests')}
              </span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/55 bg-white/18 px-3 py-1.5 text-sm font-black backdrop-blur-xl">
                <Send aria-hidden="true" size={16} />
                {t('requests.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl">
                {t('requests.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-indigo-50">
                {t('requests.description')}
              </p>
            </div>

            {requestsQuery.data ? (
              <div className="grid max-w-xl gap-3 text-sm font-black text-slate-950 sm:grid-cols-2">
                <p className="rounded-lg border border-white/60 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgb(15_23_42_/_12%)] backdrop-blur-xl">
                  <span className="block text-2xl">{requestsQuery.data.receivedRequests.length}</span>
                  {t('requests.received')}
                </p>
                <p className="rounded-lg border border-white/60 bg-white/24 px-4 py-3 text-white backdrop-blur-xl">
                  <span className="block text-2xl">{requestsQuery.data.sentRequests.length}</span>
                  {t('requests.sent')}
                </p>
              </div>
            ) : null}
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        {requestsQuery.isPending ? (
          <RequestsStatePanel role="status">{t('requests.loading')}</RequestsStatePanel>
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
            <section className="flex flex-col gap-4" aria-label={t('requests.receivedList')}>
              <div className="flex items-center gap-2">
                <Inbox aria-hidden="true" className="text-[#4f46e5]" size={20} />
                <h2 className="text-2xl font-black text-slate-950">
                  {t('requests.receivedList')}
                </h2>
              </div>
              {requestsQuery.data.receivedRequests.length === 0 ? (
                <RequestsStatePanel>{t('requests.noReceived')}</RequestsStatePanel>
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

            <section className="flex flex-col gap-4" aria-label={t('requests.sentList')}>
              <div className="flex items-center gap-2">
                <Send aria-hidden="true" className="text-[#4f46e5]" size={20} />
                <h2 className="text-2xl font-black text-slate-950">{t('requests.sentList')}</h2>
              </div>
              {requestsQuery.data.sentRequests.length === 0 ? (
                <RequestsStatePanel>{t('requests.noSent')}</RequestsStatePanel>
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
