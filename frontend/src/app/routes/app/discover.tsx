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

const glassPanel =
  'border border-white/65 bg-white/36 shadow-[0_24px_70px_rgb(49_46_129_/_16%)] backdrop-blur-2xl';

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
    return 'border-emerald-200/80 bg-emerald-100/58 text-emerald-950';
  }

  if (status === 'request_sent' || status === 'request_received') {
    return 'border-amber-200/80 bg-amber-100/58 text-amber-950';
  }

  return 'border-emerald-200/80 bg-[#22c55e]/45 text-emerald-950';
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
      className={`group overflow-hidden rounded-lg ${glassPanel} transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <div className="h-2 bg-[linear-gradient(90deg,rgba(79,70,229,.95),rgba(34,197,94,.85),rgba(251,191,36,.85),rgba(251,113,133,.85))]" />
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/70 bg-[#fbbf24]/90 text-base font-black text-slate-950 shadow-[0_12px_24px_rgb(251_191_36_/_30%)] backdrop-blur-xl">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black text-slate-950">{user.username}</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600">
                  <MapPin aria-hidden="true" size={15} />
                  {user.timezone}
                </p>
              </div>
            </div>

            {user.bio ? <p className="mt-4 text-sm leading-6 text-slate-700">{user.bio}</p> : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            <span
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black backdrop-blur-xl ${relationshipTone(
                user.relationshipStatus,
              )}`}
            >
              <UserRoundCheck aria-hidden="true" size={17} />
              {relationshipLabel}
            </span>
            {user.relationshipStatus === 'request_received' ? (
              <Link
                aria-label={t('discover.reviewRequestFrom', { name: user.username })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgb(79_70_229_/_22%)] transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
                to="/app/requests"
              >
                <UserPlus aria-hidden="true" size={17} />
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
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgb(79_70_229_/_22%)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none motion-reduce:transition-none"
                disabled={!canSendRequest || isSending}
                type="button"
                onClick={() => onSendRequest(user)}
              >
                <UserPlus aria-hidden="true" size={17} />
                {isSending
                  ? t('discover.sending')
                  : canSendRequest
                    ? t('discover.sendRequest')
                    : t('discover.unavailable')}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/60 bg-indigo-50/70 p-3 backdrop-blur-xl">
            <p className="text-xs font-black uppercase text-indigo-900">{t('discover.native')}</p>
            <p className="mt-1 font-black text-slate-950">
              {translateDisplayValue(locale, user.nativeLanguage)}
            </p>
          </div>
          <div className="rounded-lg border border-white/60 bg-emerald-50/70 p-3 backdrop-blur-xl">
            <p className="text-xs font-black uppercase text-emerald-900">
              {t('discover.learning')}
            </p>
            <p className="mt-1 font-black text-slate-950">
              {translateDisplayValue(locale, user.targetLanguage)}
            </p>
          </div>
          <div className="rounded-lg border border-white/60 bg-orange-50/70 p-3 backdrop-blur-xl">
            <p className="text-xs font-black uppercase text-orange-900">{t('discover.level')}</p>
            <p className="mt-1 font-black text-slate-950">{user.languageLevel}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {user.matchReasons.map((reason) => (
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-indigo-50/72 px-3 py-1.5 text-xs font-black text-indigo-950 backdrop-blur-xl"
              key={reason}
            >
              <Languages aria-hidden="true" size={14} />
              {reason}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/64 px-3 py-1.5 text-xs font-black text-slate-700 backdrop-blur-xl">
            <Clock aria-hidden="true" size={14} />
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
      <section className={`rounded-lg p-6 text-sm font-black text-slate-700 ${glassPanel}`}>
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" size={16} />
          {t('discover.loading')}
        </span>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        className={`rounded-lg p-6 text-sm font-black text-red-950 ${glassPanel}`}
        role="alert"
      >
        {getDiscoveryApiErrorMessage(error)}
      </section>
    );
  }

  if (!users || users.length === 0) {
    return (
      <section className={`rounded-lg p-8 text-center ${glassPanel}`}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-white/70 bg-[#fbbf24]/72 shadow-[0_16px_34px_rgb(251_191_36_/_30%)] backdrop-blur-xl">
          <Globe2 aria-hidden="true" size={24} />
        </div>
        <h2 className="mt-5 text-xl font-black text-slate-950">
          {isSearch ? t('discover.noSearchTitle') : t('discover.noPartnersTitle')}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-slate-600">
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
    <main className="min-h-screen overflow-hidden bg-[#eef2ff] px-4 py-5 text-slate-950 sm:px-8">
      <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:linear-gradient(#c7d2fe_1px,transparent_1px),linear-gradient(90deg,#c7d2fe_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className={`grid overflow-hidden rounded-lg ${glassPanel} lg:grid-cols-[1.1fr_0.9fr]`}>
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 bg-[#4f46e5]/70 p-6 text-white backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/70 bg-[#22c55e]/72 text-slate-950 shadow-[0_14px_28px_rgb(34_197_94_/_28%)] backdrop-blur-xl">
                <Languages aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-black uppercase tracking-normal">SyncTalk</span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/55 bg-white/18 px-3 py-1.5 text-sm font-black backdrop-blur-xl">
                <Sparkles aria-hidden="true" size={16} />
                {t('discover.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl">
                {t('discover.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-indigo-50">
                {t('discover.description')}
              </p>
            </div>

            <label className="relative block w-full max-w-xl">
              <span className="sr-only">{t('discover.search.sr')}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                ref={searchInputRef}
                className="min-h-14 w-full rounded-lg border border-white/75 bg-white/74 py-3 pl-12 pr-4 text-base font-black text-slate-950 outline-none shadow-[0_18px_50px_rgb(15_23_42_/_22%)] backdrop-blur-2xl transition focus:border-white focus:ring-4 focus:ring-white/35"
                placeholder={t('discover.search.placeholder')}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div
              aria-label={t('discover.view.label')}
              className="inline-flex w-full max-w-sm rounded-lg border border-white/60 bg-white/20 p-1 shadow-[0_14px_34px_rgb(15_23_42_/_18%)] backdrop-blur-2xl"
              role="group"
            >
              <button
                aria-pressed={!isSearch}
                className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35 motion-reduce:transition-none ${
                  !isSearch
                    ? 'bg-white/78 text-slate-950 shadow-[0_10px_24px_rgb(15_23_42_/_16%)]'
                    : 'text-white hover:bg-white/16'
                }`}
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <Sparkles aria-hidden="true" size={16} />
                {t('discover.view.recommended')}
              </button>
              <button
                aria-pressed={isSearch}
                className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35 motion-reduce:transition-none ${
                  isSearch
                    ? 'bg-white/78 text-slate-950 shadow-[0_10px_24px_rgb(15_23_42_/_16%)]'
                    : 'text-white hover:bg-white/16'
                }`}
                type="button"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search aria-hidden="true" size={16} />
                {t('discover.view.search')}
              </button>
            </div>
          </section>

          <section className="relative hidden min-h-[21rem] bg-[#fbbf24]/48 p-5 backdrop-blur-2xl lg:block">
            <img
              alt=""
              className="absolute left-8 top-10 h-40 w-64 rotate-[-5deg] rounded-lg border border-white/70 object-cover shadow-[0_20px_48px_rgb(15_23_42_/_24%)]"
              src={profileCollage1}
            />
            <img
              alt=""
              className="absolute bottom-10 right-8 h-44 w-72 rotate-[4deg] rounded-lg border border-white/70 object-cover shadow-[0_20px_48px_rgb(15_23_42_/_24%)]"
              src={profileCollage3}
            />
            <img
              alt=""
              className="absolute bottom-8 left-14 h-28 w-48 rotate-[-2deg] rounded-lg border border-white/70 object-cover shadow-[0_18px_42px_rgb(15_23_42_/_22%)]"
              src={profileCollage6}
            />
            <div className="absolute left-8 bottom-44 flex items-center gap-2 rounded-lg border border-white/70 bg-[#22c55e]/62 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_16px_34px_rgb(34_197_94_/_24%)] backdrop-blur-2xl">
              <BadgeCheck aria-hidden="true" size={18} />
              {t('discover.visual.status')}
            </div>
            <div className="absolute right-10 top-24 grid h-16 w-16 place-items-center rounded-lg border border-white/70 bg-[#fb7185]/66 text-slate-950 shadow-[0_16px_34px_rgb(251_113_133_/_26%)] backdrop-blur-2xl">
              <ArrowUpRight aria-hidden="true" size={28} />
            </div>
          </section>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-lg p-4 ${glassPanel}`}>
            <p className="text-xs font-black uppercase text-slate-500">
              {t('discover.stat.logicLabel')}
            </p>
            <p className="mt-1 text-lg font-black">{t('discover.stat.logicValue')}</p>
          </div>
          <div className={`rounded-lg p-4 ${glassPanel}`}>
            <p className="text-xs font-black uppercase text-slate-500">
              {t('discover.stat.stateLabel')}
            </p>
            <p className="mt-1 text-lg font-black">{t('discover.stat.stateValue')}</p>
          </div>
          <div className={`rounded-lg p-4 ${glassPanel}`}>
            <p className="text-xs font-black uppercase text-slate-500">
              {t('discover.stat.searchLabel')}
            </p>
            <p className="mt-1 text-lg font-black">{t('discover.stat.searchValue')}</p>
          </div>
        </section>

        {requestFeedback ? (
          <p className={`rounded-lg p-4 text-sm font-black text-emerald-950 ${glassPanel}`} role="status">
            {requestFeedback}
          </p>
        ) : null}

        {sendFriendRequestMutation.isError ? (
          <p className={`rounded-lg p-4 text-sm font-black text-red-950 ${glassPanel}`} role="alert">
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
