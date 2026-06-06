import { Check, Clock, Inbox, MapPin, Send, X } from 'lucide-react';

import {
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  featureCardClass,
  heroContentClass,
  heroDescriptionClass,
  heroEyebrowClass,
  heroHeaderClass,
  heroIconClass,
  heroStatCardClass,
  heroTitleClass,
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
    <article className={`${featureCardClass} flex min-h-[17rem] flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {request.user.avatar ? (
            <img
              alt={`${request.user.username} avatar`}
              className="h-16 w-16 shrink-0 rounded-xl border-2 border-cloud-gray object-cover"
              src={request.user.avatar}
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow/25 text-lg font-feather text-almost-black shadow-[0_4px_0_#e5e5e5]">
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
            className="btn-primary min-h-12 cursor-pointer gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isMutating}
            type="button"
            onClick={() => onRespond(request.id, 'accept')}
          >
            <Check aria-hidden="true" size={17} />
            {t('requests.accept')}
          </button>
          <button
            aria-label={t('requests.rejectName', { name: request.user.username })}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 text-sm font-bold text-[#b91c1c] transition-colors hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
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
      <DiscoverStyleBackground />

      <div className={`relative ${pageContainerClass}`}>
        <header className={heroHeaderClass}>
          <section className={heroContentClass}>
            <div className="flex items-center gap-3">
              <span className={heroIconClass}>
                <Inbox aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-bold uppercase text-graphite">
                {t('app.nav.requests')}
              </span>
            </div>

            <div>
              <p className={heroEyebrowClass}>
                <Send aria-hidden="true" size={16} />
                {t('requests.badge')}
              </p>
              <h1 className={heroTitleClass}>
                {t('requests.title')}
              </h1>
              <p className={heroDescriptionClass}>
                {t('requests.description')}
              </p>
            </div>

            {requestsQuery.data ? (
              <div className="grid max-w-xl gap-3 text-sm font-bold text-charcoal sm:grid-cols-2">
                <p className={heroStatCardClass}>
                  <span className="block text-heading-sm font-feather text-sky-blue">{requestsQuery.data.receivedRequests.length}</span>
                  {t('requests.received')}
                </p>
                <p className={heroStatCardClass}>
                  <span className="block text-heading-sm font-feather text-sunshine-yellow">{requestsQuery.data.sentRequests.length}</span>
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
