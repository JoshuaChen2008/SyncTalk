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
import { useMyProfileQuery } from '../../../features/profile/api/profile-hooks';
import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';

type DiscoverMenu = 'language' | 'sort' | `skip-${string}`;
type DiscoverySortMode = 'best' | 'active' | 'timezone';
type SkippedDiscoveryFilters = {
  timezones: Set<string>;
  userIds: Set<string>;
};

const skippedUsersStorageKey = 'synctalk-discover-skipped-users';
const skippedTimezonesStorageKey = 'synctalk-discover-skipped-timezones';

function readStoredStringArray(key: string) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(key);
    const parsedValue: unknown = value ? JSON.parse(value) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function createEmptySkippedDiscoveryFilters(): SkippedDiscoveryFilters {
  return {
    timezones: new Set(),
    userIds: new Set(),
  };
}

function loadSkippedDiscoveryFilters(): SkippedDiscoveryFilters {
  return {
    timezones: new Set(readStoredStringArray(skippedTimezonesStorageKey)),
    userIds: new Set(readStoredStringArray(skippedUsersStorageKey)),
  };
}

function saveSkippedDiscoveryFilters(skipped: SkippedDiscoveryFilters) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(skippedUsersStorageKey, JSON.stringify(Array.from(skipped.userIds)));
  window.localStorage.setItem(
    skippedTimezonesStorageKey,
    JSON.stringify(Array.from(skipped.timezones)),
  );
}

function isDiscoveryUserOnline(user: DiscoveryUser) {
  const source = `${user.id}${user.username}`;
  const checksum = Array.from(source).reduce((total, letter) => total + letter.charCodeAt(0), 0);

  return checksum % 3 !== 1;
}

function applyDiscoveryFilters(
  users: DiscoveryUser[] | undefined,
  {
    currentTimezone,
    languageFilter,
    onlineOnly,
    skipped,
    sortMode,
  }: {
    currentTimezone: string;
    languageFilter: string;
    onlineOnly: boolean;
    skipped: SkippedDiscoveryFilters;
    sortMode: DiscoverySortMode;
  },
) {
  const sourceUsers = users ?? [];
  const unskippedUsers = sourceUsers.filter(
    (user) => !skipped.userIds.has(user.id) && !skipped.timezones.has(user.timezone),
  );
  const filteredUsers = unskippedUsers.filter(
    (user) =>
      (!languageFilter || user.targetLanguage === languageFilter) &&
      (!onlineOnly || isDiscoveryUserOnline(user)),
  );
  const indexedUsers = filteredUsers.map((user, index) => ({ index, user }));

  if (sortMode === 'active') {
    indexedUsers.sort((first, second) => {
      const onlineDifference =
        Number(isDiscoveryUserOnline(second.user)) - Number(isDiscoveryUserOnline(first.user));

      return onlineDifference || first.index - second.index;
    });
  }

  if (sortMode === 'timezone') {
    indexedUsers.sort((first, second) => {
      const timezoneDifference =
        Number(second.user.timezone === currentTimezone) -
        Number(first.user.timezone === currentTimezone);

      return timezoneDifference || first.index - second.index;
    });
  }

  return {
    activeFilterCount:
      Number(Boolean(languageFilter)) + Number(onlineOnly) + Number(sortMode !== 'best'),
    skippedCount: sourceUsers.length - unskippedUsers.length,
    users: indexedUsers.map(({ user }) => user),
  };
}

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
  onMenuChange,
  onSendRequest,
  onSkipRegion,
  onSkipUser,
  openMenu,
  user,
}: {
  isSending: boolean;
  onMenuChange: (menu: DiscoverMenu | null) => void;
  onSendRequest: (user: DiscoveryUser) => void;
  onSkipRegion: (user: DiscoveryUser) => void;
  onSkipUser: (user: DiscoveryUser) => void;
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
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex">
          <span className="duo-shadow-sm inline-flex items-center rounded-2xl border-2 border-cloud-gray px-4 py-1.5 text-xs font-black uppercase text-graphite">
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

        <div className="surface-muted custom-scrollbar mb-5 min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-cloud-gray p-4">
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
              <div className="duo-shadow absolute bottom-[130%] left-0 z-20 mb-2 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left">
                <button
                  className="text-error block w-full cursor-pointer px-3 py-3 text-left text-sm font-black hover:bg-red-500/10"
                  type="button"
                  onClick={() => onSkipUser(user)}
                >
                  {t('discover.skipPerson')}
                </button>
                <button
                  className="text-error block w-full cursor-pointer border-t-2 border-cloud-gray px-3 py-3 text-left text-sm font-black hover:bg-red-500/10"
                  type="button"
                  onClick={() => onSkipRegion(user)}
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
  onSkipRegion,
  onSkipUser,
  openMenu,
  sendingUserId,
  users,
}: {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  isSearch: boolean;
  onMenuChange: (menu: DiscoverMenu | null) => void;
  onSendRequest: (user: DiscoveryUser) => void;
  onSkipRegion: (user: DiscoveryUser) => void;
  onSkipUser: (user: DiscoveryUser) => void;
  openMenu: DiscoverMenu | null;
  sendingUserId: string;
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
        className="surface-error rounded-2xl border-2 p-6 text-center text-body font-bold shadow-[0_4px_0_rgb(254_202_202_/_0.75)]"
        role="alert"
      >
        {getDiscoveryApiErrorMessage(error)}
      </section>
    );
  }

  if (!users || users.length === 0) {
    return (
      <section className="card-duo flex flex-col items-center p-12 text-center">
        <div className="duo-shadow grid h-16 w-16 place-items-center rounded-2xl border-2 border-cloud-gray bg-sunshine-yellow text-almost-black">
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
          key={user.id}
          openMenu={openMenu}
          user={user}
          onMenuChange={onMenuChange}
          onSendRequest={onSendRequest}
          onSkipRegion={onSkipRegion}
          onSkipUser={onSkipUser}
        />
      ))}
    </section>
  );
}

export function DiscoverPage() {
  const { locale, t } = useTranslation();
  const profileQuery = useMyProfileQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestFeedback, setRequestFeedback] = useState('');
  const [openMenu, setOpenMenu] = useState<DiscoverMenu | null>(null);
  const [languageFilter, setLanguageFilter] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortMode, setSortMode] = useState<DiscoverySortMode>('best');
  const [skipFeedback, setSkipFeedback] = useState<
    | { id: string; label: string; type: 'user'; username: string }
    | { label: string; timezone: string; type: 'timezone'; username: string }
    | null
  >(null);
  const [skippedFilters, setSkippedFilters] = useState<SkippedDiscoveryFilters>(
    loadSkippedDiscoveryFilters,
  );
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
    const languages = new Set(
      (visibleUsers ?? [])
        .filter(
          (user) =>
            !skippedFilters.userIds.has(user.id) && !skippedFilters.timezones.has(user.timezone),
        )
        .map((user) => user.targetLanguage),
    );
    return Array.from(languages).slice(0, 4);
  }, [skippedFilters.timezones, skippedFilters.userIds, visibleUsers]);
  const selectedLanguageLabel = translateDisplayValue(locale, languageFilter || languageOptions[0] || 'English');
  const filteredDiscovery = useMemo(
    () =>
      applyDiscoveryFilters(visibleUsers, {
        currentTimezone: profileQuery.data?.timezone ?? '',
        languageFilter,
        onlineOnly,
        skipped: skippedFilters,
        sortMode,
      }),
    [languageFilter, onlineOnly, profileQuery.data?.timezone, skippedFilters, sortMode, visibleUsers],
  );
  const hasActiveFilters = filteredDiscovery.activeFilterCount > 0;
  const hasSkippedFilters =
    skippedFilters.userIds.size > 0 || skippedFilters.timezones.size > 0;
  const sortOptions: { label: string; mode: DiscoverySortMode }[] = [
    { label: t('discover.controls.comprehensive'), mode: 'best' },
    { label: t('discover.controls.recentlyActive'), mode: 'active' },
    { label: t('discover.controls.nearest'), mode: 'timezone' },
  ];

  async function handleSendRequest(user: DiscoveryUser) {
    setRequestFeedback('');

    try {
      await sendFriendRequestMutation.mutateAsync(user.id);
      setRequestFeedback(t('discover.requestSentTo', { name: user.username }));
    } catch {
      // The mutation error is rendered below.
    }
  }

  function updateSkippedFilters(
    updater: (current: SkippedDiscoveryFilters) => SkippedDiscoveryFilters,
  ) {
    setSkippedFilters((current) => {
      const next = updater(current);
      saveSkippedDiscoveryFilters(next);
      return next;
    });
  }

  function handleSkipUser(user: DiscoveryUser) {
    updateSkippedFilters((current) => {
      const next = {
        timezones: new Set(current.timezones),
        userIds: new Set(current.userIds),
      };
      next.userIds.add(user.id);
      return next;
    });
    setSkipFeedback({
      id: user.id,
      label: t('discover.hiddenUser', { name: user.username }),
      type: 'user',
      username: user.username,
    });
    setOpenMenu(null);
  }

  function handleSkipRegion(user: DiscoveryUser) {
    updateSkippedFilters((current) => {
      const next = {
        timezones: new Set(current.timezones),
        userIds: new Set(current.userIds),
      };
      next.timezones.add(user.timezone);
      return next;
    });
    setSkipFeedback({
      label: t('discover.hiddenRegion', { name: user.username, timezone: user.timezone }),
      timezone: user.timezone,
      type: 'timezone',
      username: user.username,
    });
    setOpenMenu(null);
  }

  function handleUndoSkip() {
    if (!skipFeedback) {
      return;
    }

    updateSkippedFilters((current) => {
      const next = {
        timezones: new Set(current.timezones),
        userIds: new Set(current.userIds),
      };

      if (skipFeedback.type === 'user') {
        next.userIds.delete(skipFeedback.id);
      } else {
        next.timezones.delete(skipFeedback.timezone);
      }

      return next;
    });
    setSkipFeedback(null);
  }

  function handleClearFilters() {
    setLanguageFilter('');
    setOnlineOnly(false);
    setSortMode('best');
  }

  function handleClearSkipped() {
    const emptyFilters = createEmptySkippedDiscoveryFilters();
    saveSkippedDiscoveryFilters(emptyFilters);
    setSkippedFilters(emptyFilters);
    setSkipFeedback(null);
  }

  return (
    <main
      className="custom-scrollbar min-h-screen overflow-y-auto bg-snow-white px-4 py-6 pb-24 text-almost-black md:px-12 md:py-10 lg:pb-12"
      onClick={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex min-h-[104px] items-end justify-between border-b-2 border-cloud-gray pb-6">
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
              className="duo-shadow h-full w-full rounded-2xl border-2 border-cloud-gray bg-snow-white py-2 pl-[64px] pr-[64px] text-lg font-bold text-graphite transition-colors focus:border-sky-blue focus:outline-none"
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
                <div className="duo-shadow absolute right-0 top-full z-40 mt-3 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left">
                  {sortOptions.map((option) => (
                    <button
                      className="surface-hover block w-full cursor-pointer border-b-2 border-cloud-gray px-3 py-3 text-left text-sm font-bold text-graphite last:border-b-0"
                      key={option.mode}
                      type="button"
                      onClick={() => {
                        setSortMode(option.mode);
                        setOpenMenu(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <div className="grid h-14 flex-1 grid-cols-3 items-center gap-3 md:h-[72px]">
            <button
              aria-pressed={sortMode === 'best'}
              className={`btn-3d-base h-14 w-full min-w-0 overflow-hidden px-3 py-3.5 text-sm leading-none sm:px-4 sm:text-base ${
                sortMode === 'best' ? 'btn-filter-active' : 'btn-filter'
              }`}
              type="button"
              onClick={() => setSortMode('best')}
            >
              <span className="truncate whitespace-nowrap">
                {t('discover.controls.bestMatch')}
              </span>
            </button>

            <div className="relative h-14 min-w-0">
              <button
                aria-expanded={openMenu === 'language'}
                className={`btn-3d-base h-full w-full min-w-0 gap-1 overflow-hidden px-3 py-3.5 text-sm leading-none sm:gap-2 sm:px-4 sm:text-base ${
                  languageFilter ? 'btn-filter-active' : 'btn-filter'
                }`}
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
                <div className="duo-shadow absolute left-0 top-full z-40 mt-3 w-44 overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white text-left">
                  <button
                    className="surface-hover block w-full cursor-pointer border-b-2 border-cloud-gray px-3 py-3 text-left text-sm font-bold text-graphite"
                    type="button"
                    onClick={() => {
                      setLanguageFilter('');
                      setOpenMenu(null);
                    }}
                  >
                    {t('discover.controls.allLanguages')}
                  </button>
                  {(languageOptions.length > 0 ? languageOptions : ['English', 'Japanese', 'Korean', 'French']).map((language) => (
                    <button
                      className="surface-hover block w-full cursor-pointer border-b-2 border-cloud-gray px-3 py-3 text-left text-sm font-bold text-graphite last:border-b-0"
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
              aria-pressed={onlineOnly}
              className={`btn-3d-base h-14 w-full min-w-0 overflow-hidden px-3 py-3.5 text-sm leading-none sm:px-4 sm:text-base ${
                onlineOnly ? 'btn-filter-active' : 'btn-filter'
              }`}
              type="button"
              onClick={() => setOnlineOnly((current) => !current)}
            >
              <span className="truncate whitespace-nowrap">
                {t('discover.controls.currentlyOnline')}
              </span>
            </button>
          </div>
        </section>

        {hasActiveFilters || hasSkippedFilters ? (
          <section className="card-duo mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {hasActiveFilters ? (
                <p className="text-sm font-black text-sky-blue">
                  {filteredDiscovery.activeFilterCount === 1
                    ? t('discover.filters.active.one', {
                        count: filteredDiscovery.activeFilterCount,
                      })
                    : t('discover.filters.active.other', {
                        count: filteredDiscovery.activeFilterCount,
                      })}
                </p>
              ) : null}
              {hasSkippedFilters ? (
                <p className="mt-1 text-sm font-bold text-graphite">
                  {t('discover.filters.hidden', { count: filteredDiscovery.skippedCount })}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {hasActiveFilters ? (
                <button
                  className="btn-3d-base btn-3d-muted min-h-11 px-4 text-sm"
                  type="button"
                  onClick={handleClearFilters}
                >
                  {t('discover.filters.clear')}
                </button>
              ) : null}
              {hasSkippedFilters ? (
                <button
                  className="btn-3d-base btn-3d-sky min-h-11 px-4 text-sm"
                  type="button"
                  onClick={handleClearSkipped}
                >
                  {t('discover.filters.clearSkipped')}
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {skipFeedback ? (
          <p className="duo-shadow mb-6 flex flex-col gap-3 rounded-2xl border-2 border-sky-blue bg-sky-blue/10 p-4 text-sm font-bold text-sky-blue sm:flex-row sm:items-center sm:justify-between" role="status">
            <span>{skipFeedback.label}</span>
            <button
              aria-label={t('discover.undoSkipName', { name: skipFeedback.username })}
              className="btn-3d-base btn-3d-sky min-h-11 px-4 text-sm"
              type="button"
              onClick={handleUndoSkip}
            >
              {t('discover.undoSkip')}
            </button>
          </p>
        ) : null}

        {requestFeedback ? (
          <p className="duo-shadow mb-6 rounded-2xl border-2 border-duo-green bg-duo-green-light p-4 text-sm font-bold text-duo-green" role="status">
            {requestFeedback}
          </p>
        ) : null}

        {sendFriendRequestMutation.isError ? (
          <p className="surface-error mb-6 rounded-2xl border-2 p-4 text-sm font-bold shadow-[0_4px_0_rgb(254_202_202_/_0.75)]" role="alert">
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
          users={filteredDiscovery.users}
          onMenuChange={setOpenMenu}
          onSendRequest={handleSendRequest}
          onSkipRegion={handleSkipRegion}
          onSkipUser={handleSkipUser}
        />
      </div>
    </main>
  );
}
