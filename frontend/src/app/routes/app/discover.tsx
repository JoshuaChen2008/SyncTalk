import {
  ChevronDown,
  Clock,
  Globe2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  UserRoundCheck,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

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
import { pageTitleClass } from '../../../features/friends/components/friends-page-chrome';
import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';

type DiscoverMenu = 'language' | 'sort' | `skip-${string}`;

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
    return 'border-duo-green bg-duo-green-light text-duo-green';
  }

  if (status === 'request_sent' || status === 'request_received') {
    return 'border-sunshine-yellow bg-sunshine-yellow/20 text-almost-black';
  }

  return 'border-cloud-gray bg-snow-white text-graphite';
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

  return [
    ...currentUsers,
    ...demoUsers.filter((user) => !currentIds.has(user.id)),
  ];
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function DiscoveryUserCard({
  isSending,
  isSkipped,
  onMenuChange,
  onSendRequest,
  onSkip,
  onUndoSkip,
  openMenu,
  user,
}: {
  isSending: boolean;
  isSkipped: boolean;
  onMenuChange: (menu: DiscoverMenu | null) => void;
  onSendRequest: (user: DiscoveryUser) => void;
  onSkip: (userId: string) => void;
  onUndoSkip: (userId: string) => void;
  openMenu: DiscoverMenu | null;
  user: DiscoveryUser;
}) {
  const { locale, t } = useTranslation();
  const canSendRequest = user.relationshipStatus === 'stranger';
  const relationshipLabel = getRelationshipLabel(user.relationshipStatus, t);
  const skipMenuId: DiscoverMenu = `skip-${user.id}`;
  const primaryMatchReason = user.matchReasons[0] ?? t('discover.matchFallback');

  return (
    <article className="card-duo group relative flex min-h-[420px] flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-2 motion-reduce:transform-none motion-reduce:transition-none">
      {isSkipped ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-graphite/45 p-6 backdrop-blur-sm">
          <button
            aria-label={t('discover.undoSkipName', { name: user.username })}
            className="btn-3d-base btn-3d-sky min-h-12 px-6 text-base"
            type="button"
            onClick={() => onUndoSkip(user.id)}
          >
            {t('discover.undoSkip')}
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex">
          <span className="inline-flex items-center rounded-2xl border-2 border-cloud-gray px-4 py-1.5 text-xs font-black uppercase text-graphite shadow-[0_2px_0_#e5e5e5]">
            {primaryMatchReason}
          </span>
        </div>

        <div className="mb-5 flex items-center gap-5">
          <Link
            aria-label={t('profile.viewProfile', { name: user.username })}
            className={`relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] bg-snow-white p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 ${
              user.relationshipStatus === 'stranger' ? 'border-duo-green' : 'border-cloud-gray'
            }`}
            to={`/app/profile/${user.id}`}
          >
            {user.avatar ? (
              <img
                alt=""
                className="h-full w-full rounded-full object-cover"
                src={user.avatar}
              />
            ) : (
              <span className="grid h-full w-full place-items-center rounded-full bg-sunshine-yellow text-xl font-feather text-almost-black">
                {getInitials(user.username)}
              </span>
            )}
            {user.relationshipStatus === 'stranger' ? (
              <span className="absolute bottom-0 right-1 h-5 w-5 rounded-full border-2 border-snow-white bg-sky-blue" />
            ) : null}
          </Link>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-black text-almost-black">{user.username}</h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-silver">
              <MapPin aria-hidden="true" size={16} strokeWidth={3} />
              {user.timezone}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-xl border-2 border-cloud-gray px-3 py-1.5 text-sm font-bold text-graphite">
            {t('discover.learning')}: {translateDisplayValue(locale, user.targetLanguage)}
            <span className="rounded border border-cloud-gray px-1 text-xs font-black text-silver">
              {user.languageLevel}
            </span>
          </span>
          <span className="inline-flex items-center rounded-xl border-2 border-cloud-gray px-3 py-1.5 text-sm font-bold text-graphite">
            {t('discover.native')}: {translateDisplayValue(locale, user.nativeLanguage)}
          </span>
        </div>

        <div className="custom-scrollbar mb-5 min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-bold leading-6 text-charcoal">
            {user.bio || t('friends.defaultBio')}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-bold ${relationshipTone(user.relationshipStatus)}`}>
            <UserRoundCheck aria-hidden="true" size={16} strokeWidth={3} />
            {relationshipLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray px-3 py-1.5 text-xs font-bold text-graphite">
            <Clock aria-hidden="true" size={16} strokeWidth={3} />
            {translateDisplayValue(locale, user.learningGoal)}
          </span>
        </div>

        <div className="relative mt-auto grid grid-cols-2 gap-4">
          <div className="relative h-14 min-w-0">
            <button
              aria-expanded={openMenu === skipMenuId}
              aria-label={t('discover.skipName', { name: user.username })}
              className="btn-3d-base btn-3d-muted h-full w-full text-base"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMenuChange(openMenu === skipMenuId ? null : skipMenuId);
              }}
            >
              {t('discover.skip')}
            </button>
            {openMenu === skipMenuId ? (
              <div className="absolute bottom-[130%] left-0 z-20 mb-2 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left shadow-[0_4px_0_#e5e5e5]">
                <button
                  className="block w-full cursor-pointer px-3 py-3 text-left text-sm font-black text-[#ef4444] hover:bg-[#fef2f2]"
                  type="button"
                  onClick={() => onSkip(user.id)}
                >
                  {t('discover.skipPerson')}
                </button>
                <button
                  className="block w-full cursor-pointer border-t-2 border-gray-100 px-3 py-3 text-left text-sm font-black text-[#ef4444] hover:bg-[#fef2f2]"
                  type="button"
                  onClick={() => onSkip(user.id)}
                >
                  {t('discover.skipRegion')}
                </button>
              </div>
            ) : null}
          </div>

          {user.relationshipStatus === 'request_received' ? (
            <Link
              aria-label={t('discover.reviewRequestFrom', { name: user.username })}
              className="btn-3d-base btn-3d-sky min-h-14 min-w-0 px-4 text-base"
              to="/app/requests"
            >
              <UserPlus aria-hidden="true" size={18} strokeWidth={3} />
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
              className="btn-3d-base btn-3d-sky min-h-14 min-w-0 gap-2 px-4 text-base"
              disabled={!canSendRequest || isSending}
              type="button"
              onClick={() => onSendRequest(user)}
            >
              <UserPlus aria-hidden="true" size={18} strokeWidth={3} />
              {isSending
                ? t('discover.sending')
                : canSendRequest
                  ? t('discover.sendRequest')
                  : t('discover.unavailable')}
            </button>
          )}
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
  onMenuChange,
  onSendRequest,
  onSkip,
  onUndoSkip,
  openMenu,
  sendingUserId,
  skippedUserIds,
  users,
}: {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  isSearch: boolean;
  onMenuChange: (menu: DiscoverMenu | null) => void;
  onSendRequest: (user: DiscoveryUser) => void;
  onSkip: (userId: string) => void;
  onUndoSkip: (userId: string) => void;
  openMenu: DiscoverMenu | null;
  sendingUserId: string;
  skippedUserIds: Set<string>;
  users: DiscoveryUser[] | undefined;
}) {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <section className="card-duo flex justify-center p-6 text-body font-bold text-graphite">
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" size={18} strokeWidth={3} />
          {t('discover.loading')}
        </span>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        className="rounded-2xl border-2 border-[#fecaca] bg-[#fef2f2] p-6 text-center text-body font-bold text-[#b91c1c] shadow-[0_4px_0_#fecaca]"
        role="alert"
      >
        {getDiscoveryApiErrorMessage(error)}
      </section>
    );
  }

  if (!users || users.length === 0) {
    return (
      <section className="card-duo flex flex-col items-center p-12 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-cloud-gray bg-sunshine-yellow text-almost-black shadow-[0_4px_0_#e5e5e5]">
          <Globe2 aria-hidden="true" size={28} strokeWidth={3} />
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
      aria-label={isSearch ? t('discover.results.search') : t('discover.results.recommended')}
      className="relative z-0 grid gap-6 md:grid-cols-2"
    >
      {users.map((user) => (
        <DiscoveryUserCard
          isSending={sendingUserId === user.id}
          isSkipped={skippedUserIds.has(user.id)}
          key={user.id}
          openMenu={openMenu}
          user={user}
          onMenuChange={onMenuChange}
          onSendRequest={onSendRequest}
          onSkip={onSkip}
          onUndoSkip={onUndoSkip}
        />
      ))}
    </section>
  );
}

export function DiscoverPage() {
  const { locale, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestFeedback, setRequestFeedback] = useState('');
  const [openMenu, setOpenMenu] = useState<DiscoverMenu | null>(null);
  const [languageFilter, setLanguageFilter] = useState('');
  const [skippedUserIds, setSkippedUserIds] = useState<Set<string>>(() => new Set());
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
  const languageOptions = useMemo(() => {
    const languages = new Set((visibleUsers ?? []).map((user) => user.targetLanguage));
    return Array.from(languages).slice(0, 4);
  }, [visibleUsers]);
  const selectedLanguage =
    languageFilter || languageOptions[0] || 'English';
  const selectedLanguageLabel = translateDisplayValue(locale, selectedLanguage);

  async function handleSendRequest(user: DiscoveryUser) {
    setRequestFeedback('');

    try {
      await sendFriendRequestMutation.mutateAsync(user.id);
      setRequestFeedback(t('discover.requestSentTo', { name: user.username }));
    } catch {
      // The mutation error is rendered below.
    }
  }

  function handleSkip(userId: string) {
    setSkippedUserIds((current) => new Set(current).add(userId));
    setOpenMenu(null);
  }

  function handleUndoSkip(userId: string) {
    setSkippedUserIds((current) => {
      const next = new Set(current);
      next.delete(userId);
      return next;
    });
  }

  return (
    <main
      className="custom-scrollbar min-h-screen overflow-y-auto bg-snow-white px-4 py-6 pb-24 text-almost-black md:px-12 md:py-10 lg:pb-12"
      onClick={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex min-h-[104px] items-end justify-between border-b-2 border-gray-100 pb-6">
          <div>
            <h1 className={`mb-4 ${pageTitleClass} text-sky-blue [text-shadow:2px_2px_0_#1899d6]`}>
              {t('discover.title')}
            </h1>
            <p className="text-base font-bold text-graphite md:text-lg">
              {t('discover.description')}
            </p>
          </div>
        </header>

        <section className="relative z-30 mb-8 flex min-h-[72px] flex-col items-stretch gap-6 md:flex-row">
          <label className="relative z-10 flex h-14 flex-1 items-center py-2 md:h-[72px]">
            <span className="sr-only">{t('discover.search.sr')}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 h-6 w-6 text-silver"
              strokeWidth={3}
            />
            <input
              ref={searchInputRef}
              className="h-full w-full rounded-2xl border-2 border-cloud-gray bg-snow-white py-2 pl-[64px] pr-[64px] text-lg font-bold text-graphite shadow-[0_4px_0_#e5e5e5] transition-colors focus:border-sky-blue focus:outline-none"
              placeholder={t('discover.search.placeholder')}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <button
                aria-expanded={openMenu === 'sort'}
                aria-label={t('discover.controls.sort')}
                className="flex cursor-pointer items-center justify-center p-2 text-sky-blue hover:text-[#1899d6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenu(openMenu === 'sort' ? null : 'sort');
                }}
              >
                <SlidersHorizontal aria-hidden="true" size={24} strokeWidth={3} />
              </button>
              {openMenu === 'sort' ? (
                <div className="absolute right-0 top-full z-40 mt-3 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left shadow-[0_4px_0_#e5e5e5]">
                  {[t('discover.controls.comprehensive'), t('discover.controls.recentlyActive'), t('discover.controls.nearest')].map((label) => (
                    <button
                      className="block w-full cursor-pointer border-b-2 border-gray-100 px-3 py-3 text-left text-sm font-bold text-graphite last:border-b-0 hover:bg-gray-100"
                      key={label}
                      type="button"
                      onClick={() => setOpenMenu(null)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <div className="grid h-14 flex-1 grid-cols-3 items-center gap-3 md:h-[72px]">
            <button
              aria-pressed={!isSearch}
              className="btn-3d-base btn-filter-active h-14 w-full min-w-0 overflow-hidden px-3 py-3.5 text-sm leading-none sm:px-4 sm:text-base"
              type="button"
              onClick={() => setSearchTerm('')}
            >
              <span className="truncate whitespace-nowrap">
                {t('discover.controls.bestMatch')}
              </span>
            </button>

            <div className="relative h-14 min-w-0">
              <button
                aria-expanded={openMenu === 'language'}
                className="btn-3d-base btn-filter h-full w-full min-w-0 gap-1 overflow-hidden px-3 py-3.5 text-sm leading-none sm:gap-2 sm:px-4 sm:text-base"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenu(openMenu === 'language' ? null : 'language');
                }}
              >
                <span className="min-w-0 truncate whitespace-nowrap">
                  {t('discover.controls.sharedLanguage', { language: selectedLanguageLabel })}
                </span>
                <ChevronDown aria-hidden="true" className="shrink-0" size={16} strokeWidth={3} />
              </button>
              {openMenu === 'language' ? (
                <div className="absolute left-0 top-full z-40 mt-3 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left shadow-[0_4px_0_#e5e5e5]">
                  {(languageOptions.length > 0 ? languageOptions : ['English', 'Japanese', 'Korean', 'French']).map((language) => (
                    <button
                      className="block w-full cursor-pointer border-b-2 border-gray-100 px-3 py-3 text-left text-sm font-bold text-graphite last:border-b-0 hover:bg-gray-50"
                      key={language}
                      type="button"
                      onClick={() => {
                        setLanguageFilter(language);
                        setOpenMenu(null);
                      }}
                    >
                      {t('discover.controls.sharedLanguage', {
                        language: translateDisplayValue(locale, language),
                      })}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              className="btn-3d-base btn-filter h-14 w-full min-w-0 overflow-hidden px-3 py-3.5 text-sm leading-none sm:px-4 sm:text-base"
              type="button"
              onClick={() => searchInputRef.current?.focus()}
            >
              <span className="truncate whitespace-nowrap">
                {t('discover.controls.currentlyOnline')}
              </span>
            </button>
          </div>
        </section>

        {requestFeedback ? (
          <p className="mb-6 rounded-2xl border-2 border-duo-green bg-duo-green-light p-4 text-sm font-bold text-duo-green shadow-[0_4px_0_#d7ffb8]" role="status">
            {requestFeedback}
          </p>
        ) : null}

        {sendFriendRequestMutation.isError ? (
          <p className="mb-6 rounded-2xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c] shadow-[0_4px_0_#fecaca]" role="alert">
            {getFriendsApiErrorMessage(sendFriendRequestMutation.error)}
          </p>
        ) : null}

        <ResultsState
          error={activeQuery.error}
          isError={activeQuery.isError}
          isPending={activeQuery.isPending}
          isSearch={isSearch}
          openMenu={openMenu}
          sendingUserId={
            sendFriendRequestMutation.isPending
              ? (sendFriendRequestMutation.variables as string | undefined) ?? ''
              : ''
          }
          skippedUserIds={skippedUserIds}
          users={visibleUsers}
          onMenuChange={setOpenMenu}
          onSendRequest={handleSendRequest}
          onSkip={handleSkip}
          onUndoSkip={handleUndoSkip}
        />
      </div>
    </main>
  );
}
