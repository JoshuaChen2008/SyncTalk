import { Check, Clock, Inbox, MapPin, Search, Send, SlidersHorizontal, X } from 'lucide-react';

import {
  featureCardClass,
  pageContainerClass,
  pageShellClass,
  pageTitleClass,
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
    <article className={`${featureCardClass} flex flex-col gap-4 p-4 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="flex min-w-0 items-center gap-4">
          {request.user.avatar ? (
            <img
              alt={`${request.user.username} avatar`}
              className="h-14 w-14 shrink-0 rounded-xl border-2 border-cloud-gray object-cover"
              src={request.user.avatar}
            />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow text-base font-feather text-almost-black">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-almost-black">{request.user.username}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-xl bg-sky-blue/10 px-2 py-0.5 text-[10px] font-bold text-sky-blue">
                {getLanguageCode(request.user.nativeLanguage)}
              </span>
              <span className="rounded-xl bg-duo-green-light px-2 py-0.5 text-[10px] font-bold text-duo-green">
                {getLanguageCode(request.user.targetLanguage)}
              </span>
            </div>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-graphite">
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" size={14} />
                {request.user.timezone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden="true" size={14} />
                {translateDisplayValue(locale, request.user.learningGoal)}
              </span>
            </p>
            <p className="sr-only">
              {t('requests.nativeLearning', {
                nativeLanguage: translateDisplayValue(locale, request.user.nativeLanguage),
                targetLanguage: translateDisplayValue(locale, request.user.targetLanguage),
              })}
            </p>
          </div>
      </div>

      {mode === 'received' ? (
        <div className="flex h-10 shrink-0 gap-2">
          <button
            aria-label={t('requests.acceptName', { name: request.user.username })}
            className="btn-3d-base btn-3d-green mb-0 min-h-10 cursor-pointer gap-1 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'accept')}
          >
            <Check aria-hidden="true" size={17} />
            {t('requests.accept')}
          </button>
          <button
            aria-label={t('requests.rejectName', { name: request.user.username })}
            className="btn-3d-base btn-3d-muted mb-0 min-h-10 cursor-pointer gap-1 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'reject')}
          >
            <X aria-hidden="true" size={17} />
            {t('requests.reject')}
          </button>
        </div>
      ) : (
        <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow/20 px-4 text-sm font-black text-almost-black">
          {t('requests.pending')}
        </span>
      )}
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
        <header className="mb-2 flex min-h-[104px] items-end justify-between border-b-2 border-gray-100 pb-6">
          <div>
            <h1 className={`mb-4 ${pageTitleClass} text-duo-green [text-shadow:2px_2px_0_#46a300]`}>
              {t('requests.title')}
            </h1>
            <p className="max-w-3xl text-base font-bold text-graphite md:text-lg">
              {t('requests.description')}
            </p>
          </div>
          <div className="hidden shrink-0 rounded-2xl border-2 border-sky-blue/10 bg-sky-blue/10 px-4 py-2 font-black text-sky-blue md:block">
            {t('requests.incoming')} {requestsQuery.data?.receivedRequests.length ?? 0}
          </div>
        </header>

        <section className="relative z-30 grid min-h-[72px] gap-6 xl:grid-cols-2" aria-label="Request tools">
          <label className="relative flex h-14 min-w-0 items-center md:h-[72px] md:py-2" htmlFor="request-search">
            <span className="sr-only">{t('requests.searchLabel')}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 h-6 w-6 text-silver"
              strokeWidth={3}
            />
            <input
              aria-label={t('requests.searchLabel')}
              className="h-full w-full rounded-2xl border-2 border-cloud-gray bg-snow-white py-2 pl-[64px] pr-[64px] text-lg font-bold text-graphite shadow-[0_4px_0_#e5e5e5] transition-colors placeholder:text-silver focus:border-sky-blue focus:outline-none"
              id="request-search"
              placeholder={t('requests.searchLabel')}
              type="search"
            />
            <SlidersHorizontal
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 text-sky-blue"
              strokeWidth={3}
            />
          </label>

          <div className="grid h-14 min-w-0 grid-cols-2 gap-4 md:h-[72px] md:py-2">
            <div className="card-duo flex h-full items-center justify-between gap-4 px-5 py-3">
              <p className="shrink-0 text-sm font-black text-charcoal">
                {t('requests.received')}
              </p>
              <p className="shrink-0 text-heading-sm font-feather text-sky-blue">
                {requestsQuery.data?.receivedRequests.length ?? 0}
              </p>
            </div>

            <div className="card-duo flex h-full items-center justify-between gap-4 px-5 py-3">
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
                <div className="grid gap-6 xl:grid-cols-2">
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
                <div className="grid gap-6 xl:grid-cols-2">
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
