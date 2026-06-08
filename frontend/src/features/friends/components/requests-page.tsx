import { Check, Clock, Inbox, MapPin, Search, Send, X } from 'lucide-react';

import {
  featureCardClass,
  pageContainerClass,
  pageShellClass,
  sectionTitleClass,
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
    <article className={`${featureCardClass} flex min-h-[17rem] flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {request.user.avatar ? (
            <img
              alt={`${request.user.username} avatar`}
              className="h-16 w-16 shrink-0 rounded-2xl border-2 border-cloud-gray object-cover shadow-[0_4px_0_#e5e5e5]"
              src={request.user.avatar}
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-cloud-gray bg-sunshine-yellow text-lg font-feather text-almost-black shadow-[0_4px_0_#e5e5e5]">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-heading-sm font-feather text-almost-black">{request.user.username}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-xl border-2 border-cloud-gray bg-sky-blue/10 px-2.5 py-1 text-xs font-bold text-sky-blue">
                {getLanguageCode(request.user.nativeLanguage)}
              </span>
              <span className="rounded-xl border-2 border-cloud-gray bg-duo-green-light px-2.5 py-1 text-xs font-bold text-duo-green">
                {getLanguageCode(request.user.targetLanguage)}
              </span>
            </div>
          </div>
        </div>
        <span
          className={
            mode === 'received'
              ? 'inline-flex min-h-9 shrink-0 items-center rounded-xl border-2 border-cloud-gray bg-sky-blue/10 px-3 text-xs font-bold text-sky-blue'
              : 'inline-flex min-h-9 shrink-0 items-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow/20 px-3 text-xs font-bold text-almost-black'
          }
        >
          {mode === 'received' ? t('requests.incoming') : t('requests.pending')}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-graphite">
        <p className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-2">
          <MapPin aria-hidden="true" size={16} />
          {request.user.timezone}
        </p>
        <p className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-2">
          <Clock aria-hidden="true" size={16} />
          {translateDisplayValue(locale, request.user.learningGoal)}
        </p>
        <p className="leading-6 text-charcoal">
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
            className="btn-3d-base btn-3d-green min-h-12 cursor-pointer gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'accept')}
          >
            <Check aria-hidden="true" size={17} />
            {t('requests.accept')}
          </button>
          <button
            aria-label={t('requests.rejectName', { name: request.user.username })}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 text-sm font-black text-[#b91c1c] shadow-[0_4px_0_#fecaca] transition-colors hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
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
    <section className={`${featureCardClass} p-6 text-sm font-bold text-graphite`} role={role}>
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
    <main className={pageShellClass}>
      <div className={pageContainerClass}>
        <header className="border-b-2 border-cloud-gray pb-6">
          <h1 className="text-heading font-feather leading-tight text-duo-green [text-shadow:2px_2px_0_#46a300] sm:text-heading-lg">
            {t('requests.title')}
          </h1>
        </header>

        <section className="relative z-30 grid gap-6 md:grid-cols-2" aria-label="Request tools">
          <label className="relative flex h-14 min-w-0 items-center md:h-[72px]" htmlFor="request-search">
            <span className="sr-only">{t('requests.searchLabel')}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 h-6 w-6 text-silver"
              strokeWidth={3}
            />
            <input
              aria-label={t('requests.searchLabel')}
              className="h-full w-full rounded-2xl border-2 border-cloud-gray bg-snow-white py-2 pl-[64px] pr-5 text-lg font-bold text-graphite shadow-[0_4px_0_#e5e5e5] transition-colors placeholder:text-silver focus:border-sky-blue focus:outline-none"
              id="request-search"
              placeholder={t('requests.searchLabel')}
              type="search"
            />
          </label>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="card-duo flex h-14 items-center justify-between gap-4 px-5 py-3 md:h-[72px]">
              <p className="shrink-0 text-sm font-black text-charcoal">
                {t('requests.received')}
              </p>
              <p className="shrink-0 text-heading-sm font-feather text-sky-blue">
                {requestsQuery.data?.receivedRequests.length ?? 0}
              </p>
            </div>

            <div className="card-duo flex h-14 items-center justify-between gap-4 px-5 py-3 md:h-[72px]">
              <p className="shrink-0 text-sm font-black text-charcoal">
                {t('requests.sent')}
              </p>
              <p className="shrink-0 text-heading-sm font-feather text-sunshine-yellow">
                {requestsQuery.data?.sentRequests.length ?? 0}
              </p>
            </div>
          </div>
        </section>

        {requestsQuery.isPending ? (
          <RequestsStatePanel role="status">{t('requests.loading')}</RequestsStatePanel>
        ) : null}

        {requestsQuery.isError ? (
          <RequestsStatePanel role="alert">
            {getFriendsApiErrorMessage(requestsQuery.error)}
          </RequestsStatePanel>
        ) : null}

        {respondMutation.isError ? (
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c]" role="alert">
            {getFriendsApiErrorMessage(respondMutation.error)}
          </p>
        ) : null}

        {requestsQuery.data ? (
          <>
            <section className="flex flex-col gap-4" aria-label={t('requests.receivedList')}>
              <div className={sectionTitleClass}>
                <Inbox aria-hidden="true" className="text-sky-blue" size={20} />
                <h2>
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
              <div className={sectionTitleClass}>
                <Send aria-hidden="true" className="text-sky-blue" size={20} />
                <h2>{t('requests.sentList')}</h2>
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
