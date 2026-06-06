import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Globe2,
  Languages,
  MapPin,
  Search,
  Sparkles,
  UserPlus,
  UserRoundCheck,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';

import profileCollage1 from '../../../assets/synctalk/profile-collage-1.png';
import profileCollage3 from '../../../assets/synctalk/profile-collage-3.png';
import profileCollage6 from '../../../assets/synctalk/profile-collage-6.png';
import {
  getDiscoveryApiErrorMessage,
  type DiscoveryUser,
  type RelationshipStatus,
} from '../../../features/discovery/api/discovery-api';
import {
  useRecommendationsQuery,
  useSearchUsersQuery,
} from '../../../features/discovery/api/discovery-hooks';
import { discoveryDemoUsers } from '../../../features/discovery/demo/discovery-demo-users';
import { getFriendsApiErrorMessage } from '../../../features/friends/api/friends-api';
import { useSendFriendRequestMutation } from '../../../features/friends/api/friends-hooks';
import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';

const glassPanel = 'card-gamified';

function getRelationshipLabel(
  status: RelationshipStatus,
  t: ReturnType<typeof useTranslation>['t'],
) {
  const relationshipLabels: Record<RelationshipStatus, string> = {
    stranger: t('discover.relationship.available'),
    request_sent: t('discover.relationship.requestSent'),
    request_received: t('discover.relationship.replyPending'),
    friend: t('discover.relationship.alreadyFriends'),
  };

  return relationshipLabels[status];
}

function relationshipTone(status: RelationshipStatus) {
  if (status === 'friend') {
    return 'border-cloud-gray bg-duo-green-light text-duo-green';
  }

  if (status === 'request_sent' || status === 'request_received') {
    return 'border-cloud-gray bg-sunshine-yellow/20 text-almost-black';
  }

  return 'border-cloud-gray bg-snow-white text-almost-black';
}

function matchesDemoSearch(user: DiscoveryUser, query: string) {
  const normalizedQuery = query.toLowerCase();

  return [
    user.username,
    user.nativeLanguage,
    user.targetLanguage,
    user.languageLevel,
    user.learningGoal,
    user.bio,
    user.timezone,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function withDevelopmentDemoUsers(
  users: DiscoveryUser[] | undefined,
  { isSearch, searchTerm }: { isSearch: boolean; searchTerm: string },
) {
  if (!import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return users;
  }

  const currentUsers = users ?? [];
  const demoUsers = isSearch
    ? discoveryDemoUsers.filter((user) => matchesDemoSearch(user, searchTerm))
    : discoveryDemoUsers;
  const currentIds = new Set(currentUsers.map((user) => user.id));
  const mergedUsers = [
    ...currentUsers,
    ...demoUsers.filter((user) => !currentIds.has(user.id)),
  ];

  return mergedUsers;
}

function DiscoveryUserCard({
  isSending,
  onSendRequest,
  user,
}: {
  isSending: boolean;
  onSendRequest: (user: DiscoveryUser) => void;
  user: DiscoveryUser;
}) {
  const { locale, t } = useTranslation();
  const canSendRequest = user.relationshipStatus === 'stranger';
  const relationshipLabel = getRelationshipLabel(user.relationshipStatus, t);

  return (
    <article
      className={`group card-gamified p-0 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#e5e5e5] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <div className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow text-xl font-feather text-almost-black shadow-[0_4px_0_#e5e5e5]">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-heading-sm font-feather text-almost-black">{user.username}</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-graphite">
                  <MapPin aria-hidden="true" size={16} strokeWidth={2.5} />
                  {user.timezone}
                </p>
              </div>
            </div>

            {user.bio ? <p className="mt-5 text-sm font-bold leading-6 text-charcoal">{user.bio}</p> : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            <span
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-bold ${relationshipTone(
                user.relationshipStatus,
              )}`}
            >
              <UserRoundCheck aria-hidden="true" size={18} strokeWidth={2.5} />
              {relationshipLabel}
            </span>
            {user.relationshipStatus === 'request_received' ? (
              <Link
                aria-label={t('discover.reviewRequestFrom', { name: user.username })}
                className="btn-primary"
                to="/app/requests"
              >
                <UserPlus aria-hidden="true" size={18} strokeWidth={2.5} />
                {t('discover.reviewRequest')}
              </Link>
            ) : (
              <button
                aria-label={
                  canSendRequest
                    ? t('discover.sendRequestTo', { name: user.username })
                    : t('discover.relationshipWith', {
                        name: user.username,
                        status: relationshipLabel,
                      })
                }
                className="btn-primary"
                disabled={!canSendRequest || isSending}
                type="button"
                onClick={() => onSendRequest(user)}
              >
                <UserPlus aria-hidden="true" size={18} strokeWidth={2.5} />
                {isSending
                  ? t('discover.sending')
                  : canSendRequest
                    ? t('discover.sendRequest')
                    : t('discover.unavailable')}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-cloud-gray bg-snow-white p-3">
            <p className="text-xs font-bold uppercase text-graphite">{t('discover.native')}</p>
            <p className="mt-1 font-bold text-almost-black">
              {translateDisplayValue(locale, user.nativeLanguage)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-cloud-gray bg-snow-white p-3">
            <p className="text-xs font-bold uppercase text-graphite">
              {t('discover.learning')}
            </p>
            <p className="mt-1 font-bold text-almost-black">
              {translateDisplayValue(locale, user.targetLanguage)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-cloud-gray bg-snow-white p-3">
            <p className="text-xs font-bold uppercase text-graphite">{t('discover.level')}</p>
            <p className="mt-1 font-bold text-almost-black">{user.languageLevel}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {user.matchReasons.map((reason) => (
            <span
              className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-sky-blue/10 px-3 py-1.5 text-xs font-bold text-sky-blue"
              key={reason}
            >
              <Languages aria-hidden="true" size={16} strokeWidth={2.5} />
              {reason}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-bold text-graphite">
            <Clock aria-hidden="true" size={16} strokeWidth={2.5} />
            {translateDisplayValue(locale, user.learningGoal)}
          </span>
        </div>
      </div>
    </article>
  );
}

function ResultsState({
  error,
  isError,
  isPending,
  isSearch,
  onSendRequest,
  sendingUserId,
  users,
}: {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  isSearch: boolean;
  onSendRequest: (user: DiscoveryUser) => void;
  sendingUserId: string;
  users: DiscoveryUser[] | undefined;
}) {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <section className="card-gamified p-6 text-body font-bold text-graphite flex justify-center">
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" size={18} strokeWidth={2.5} />
          {t('discover.loading')}
        </span>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-6 text-body font-bold text-[#b91c1c] text-center"
        role="alert"
      >
        {getDiscoveryApiErrorMessage(error)}
      </section>
    );
  }

  if (!users || users.length === 0) {
    return (
      <section className="card-gamified p-12 text-center flex flex-col items-center">
        <div className="grid h-16 w-16 place-items-center rounded-xl border-2 border-cloud-gray bg-sunshine-yellow text-almost-black shadow-[0_4px_0_#e5e5e5]">
          <Globe2 aria-hidden="true" size={28} strokeWidth={2.5} />
        </div>
        <h2 className="mt-6 text-heading-sm font-feather text-almost-black">
          {isSearch ? t('discover.noSearchTitle') : t('discover.noPartnersTitle')}
        </h2>
        <p className="mt-2 max-w-md text-sm font-bold leading-6 text-graphite">
          {isSearch
            ? t('discover.noSearchDescription')
            : t('discover.noPartnersDescription')}
        </p>
      </section>
    );
  }

  return (
    <section
      className="grid gap-5 lg:grid-cols-2"
      aria-label={isSearch ? t('discover.results.search') : t('discover.results.recommended')}
    >
      {users.map((user) => (
        <DiscoveryUserCard
          isSending={sendingUserId === user.id}
          key={user.id}
          user={user}
          onSendRequest={onSendRequest}
        />
      ))}
    </section>
  );
}

export function DiscoverPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestFeedback, setRequestFeedback] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedSearchTerm = searchTerm.trim();
  const isSearch = normalizedSearchTerm.length > 0;
  const recommendationsQuery = useRecommendationsQuery({ enabled: !isSearch });
  const searchQuery = useSearchUsersQuery(normalizedSearchTerm, { enabled: isSearch });
  const activeQuery = isSearch ? searchQuery : recommendationsQuery;
  const sendFriendRequestMutation = useSendFriendRequestMutation();
  const visibleUsers = withDevelopmentDemoUsers(activeQuery.data, {
    isSearch,
    searchTerm: normalizedSearchTerm,
  });

  async function handleSendRequest(user: DiscoveryUser) {
    setRequestFeedback('');

    try {
      await sendFriendRequestMutation.mutateAsync(user.id);
      setRequestFeedback(t('discover.requestSentTo', { name: user.username }));
    } catch {
      // The mutation error is rendered below.
    }
  }

  return (
    <main className="min-h-screen bg-snow-white px-4 py-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="grid overflow-hidden rounded-xl border-2 border-cloud-gray bg-duo-green lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 p-6 text-snow-white sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-snow-white text-duo-green">
                <Languages aria-hidden="true" size={24} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-snow-white">SyncTalk</span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-xl border-2 border-snow-white/40 bg-snow-white/20 px-3 py-1.5 text-sm font-bold">
                <Sparkles aria-hidden="true" size={16} />
                {t('discover.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl font-feather text-heading-lg sm:text-display">
                {t('discover.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-body font-bold text-snow-white/90">
                {t('discover.description')}
              </p>
            </div>

            <label className="relative block w-full max-w-xl text-almost-black">
              <span className="sr-only">{t('discover.search.sr')}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-graphite"
                size={20}
                strokeWidth={3}
              />
              <input
                ref={searchInputRef}
                className="input-gamified pl-12 shadow-[0_4px_0_#e5e5e5]"
                placeholder={t('discover.search.placeholder')}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div
              aria-label={t('discover.view.label')}
              className="inline-flex w-full max-w-sm rounded-xl border-2 border-snow-white/40 bg-snow-white/10 p-1"
              role="group"
            >
              <button
                aria-pressed={!isSearch}
                className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors ${
                  !isSearch
                    ? 'bg-snow-white text-duo-green'
                    : 'text-snow-white hover:bg-snow-white/20'
                }`}
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <Sparkles aria-hidden="true" size={16} strokeWidth={2.5} />
                {t('discover.view.recommended')}
              </button>
              <button
                aria-pressed={isSearch}
                className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors ${
                  isSearch
                    ? 'bg-snow-white text-duo-green'
                    : 'text-snow-white hover:bg-snow-white/20'
                }`}
                type="button"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search aria-hidden="true" size={16} strokeWidth={2.5} />
                {t('discover.view.search')}
              </button>
            </div>
          </section>

          <section className="relative hidden min-h-[21rem] bg-sunshine-yellow border-l-2 border-cloud-gray p-5 lg:block">
            <img
              alt=""
              className="absolute left-8 top-10 h-40 w-64 rotate-[-5deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
              src={profileCollage1}
            />
            <img
              alt=""
              className="absolute bottom-10 right-8 h-44 w-72 rotate-[4deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
              src={profileCollage3}
            />
            <img
              alt=""
              className="absolute bottom-8 left-14 h-28 w-48 rotate-[-2deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
              src={profileCollage6}
            />
            <div className="absolute left-8 bottom-44 flex items-center gap-2 rounded-xl border-2 border-almost-black bg-snow-white px-4 py-3 text-sm font-bold text-almost-black shadow-[0_4px_0_#3c3c3c]">
              <BadgeCheck aria-hidden="true" size={20} strokeWidth={2.5} className="text-duo-green" />
              {t('discover.visual.status')}
            </div>
            <div className="absolute right-10 top-24 grid h-16 w-16 place-items-center rounded-xl border-2 border-almost-black bg-bubblegum-pink text-snow-white shadow-[0_4px_0_#3c3c3c]">
              <ArrowUpRight aria-hidden="true" size={32} strokeWidth={3} />
            </div>
          </section>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="card-gamified p-5">
            <p className="text-xs font-bold uppercase text-graphite">
              {t('discover.stat.logicLabel')}
            </p>
            <p className="mt-1 text-heading-sm font-feather text-duo-green">{t('discover.stat.logicValue')}</p>
          </div>
          <div className="card-gamified p-5">
            <p className="text-xs font-bold uppercase text-graphite">
              {t('discover.stat.stateLabel')}
            </p>
            <p className="mt-1 text-heading-sm font-feather text-sky-blue">{t('discover.stat.stateValue')}</p>
          </div>
          <div className="card-gamified p-5">
            <p className="text-xs font-bold uppercase text-graphite">
              {t('discover.stat.searchLabel')}
            </p>
            <p className="mt-1 text-heading-sm font-feather text-bubblegum-pink">{t('discover.stat.searchValue')}</p>
          </div>
        </section>

        {requestFeedback ? (
          <p className="rounded-xl border-2 border-duo-green bg-duo-green-light p-4 text-sm font-bold text-duo-green" role="status">
            {requestFeedback}
          </p>
        ) : null}

        {sendFriendRequestMutation.isError ? (
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c]" role="alert">
            {getFriendsApiErrorMessage(sendFriendRequestMutation.error)}
          </p>
        ) : null}

        <ResultsState
          error={activeQuery.error}
          isError={activeQuery.isError}
          isPending={activeQuery.isPending}
          isSearch={isSearch}
          onSendRequest={handleSendRequest}
          sendingUserId={
            sendFriendRequestMutation.isPending
              ? (sendFriendRequestMutation.variables as string | undefined) ?? ''
              : ''
          }
          users={visibleUsers}
        />
      </div>
    </main>
  );
}
