import {
  Clock,
  Languages,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  formatFriendCount,
  formatResultSummary,
  translateDisplayValue,
} from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import { getFriendsApiErrorMessage, type Friend } from '../api/friends-api';
import { useFriendsQuery, useRemoveFriendMutation } from '../api/friends-hooks';
import { pageTitleClass } from './friends-page-chrome';

const friendFilterOptions = [
  ['added', 'friends.filterByAdded'],
  ['language', 'friends.filterByLanguage'],
  ['online', 'friends.filterOnlineFirst'],
] as const;

function isFriendOnline(friend: Friend) {
  const source = `${friend.id}${friend.username}`;
  const checksum = Array.from(source).reduce((total, letter) => total + letter.charCodeAt(0), 0);

  return checksum % 3 !== 1;
}

function matchesFriendSearch(friend: Friend, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    friend.username,
    friend.nativeLanguage,
    friend.targetLanguage,
    friend.languageLevel,
    friend.learningGoal,
    friend.bio,
    friend.timezone,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function FriendCard({
  friend,
  isMenuOpen,
  isOnline,
  isRemoving,
  onMenuChange,
  onRemove,
}: {
  friend: Friend;
  isMenuOpen: boolean;
  isOnline: boolean;
  isRemoving: boolean;
  onMenuChange: (friendId: string | null) => void;
  onRemove: (friend: Friend) => void;
}) {
  const { locale, t } = useTranslation();
  const initials = friend.username.slice(0, 2).toUpperCase();
  const statusLabel = isOnline ? t('friends.online') : t('friends.offline');

  return (
    <article className="card-duo group relative flex h-[376px] min-w-0 flex-col overflow-visible p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#e5e5e5] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate rounded-full border-2 border-cloud-gray bg-snow-white px-4 py-1.5 text-xs font-black uppercase text-graphite">
          {t('friends.status.friend')}
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-black ${
            isOnline
              ? 'border-duo-green bg-duo-green-light text-duo-green'
              : 'border-cloud-gray bg-snow-white text-silver'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-duo-green' : 'bg-silver'}`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="mt-5 flex min-w-0 items-center gap-4">
        <div
          className={`relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-[3px] bg-sunshine-yellow text-xl font-feather text-almost-black shadow-[0_4px_0_#e5e5e5] ${
            isOnline ? 'border-duo-green' : 'border-cloud-gray'
          }`}
        >
          {friend.avatar ? (
            <img
              alt={`${friend.username} avatar`}
              className="h-full w-full rounded-full object-cover"
              src={friend.avatar}
            />
          ) : (
            initials
          )}
          <span
            aria-hidden="true"
            className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-snow-white ${
              isOnline ? 'bg-duo-green' : 'bg-silver'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-heading-sm font-feather text-almost-black">
            {friend.username}
          </h2>
        </div>
      </div>

      <div className="mt-5 flex min-w-0 flex-wrap gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-black text-charcoal">
          <Languages aria-hidden="true" size={15} />
          <span className="truncate">{translateDisplayValue(locale, friend.nativeLanguage)}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-black text-charcoal">
          <span className="truncate">{translateDisplayValue(locale, friend.targetLanguage)}</span>
          <span className="shrink-0 rounded-md bg-cloud-gray px-1.5 text-xs text-graphite">
            {friend.languageLevel}
          </span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-black text-charcoal">
          <Clock aria-hidden="true" size={15} />
          <span className="truncate">{translateDisplayValue(locale, friend.learningGoal)}</span>
        </span>
      </div>

      <p className="mt-4 min-h-[58px] overflow-hidden rounded-2xl border-2 border-cloud-gray bg-[#f7f7f7] px-4 py-3 text-sm font-bold leading-6 text-charcoal [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {friend.bio || t('friends.defaultBio')}
      </p>

      <div className="relative mt-auto grid h-[92px] grid-cols-3 gap-2 border-t-2 border-cloud-gray pb-5 pt-4">
        <Link
          aria-label={t('friends.chatWith', { name: friend.username })}
          className="btn-3d-base btn-3d-green h-14 min-w-0 gap-1.5 px-3 text-base"
          to={`/app/chat/${friend.id}`}
        >
          <MessageCircle aria-hidden="true" className="shrink-0" size={17} />
          <span className="truncate">{t('friends.chat')}</span>
        </Link>
        <Link
          aria-label={t('friends.callName', { name: friend.username })}
          className="btn-3d-base btn-3d-purple h-14 min-w-0 gap-1.5 px-3 text-base"
          to={`/app/call/${friend.id}`}
        >
          <Phone aria-hidden="true" className="shrink-0" size={17} />
          <span className="truncate">{t('friends.call')}</span>
        </Link>
        <button
          aria-expanded={isMenuOpen}
          aria-label={t('friends.manageName', { name: friend.username })}
          className="btn-3d-base btn-3d-yellow h-14 min-w-0 gap-1.5 px-3 text-base"
          type="button"
          onClick={() => onMenuChange(isMenuOpen ? null : friend.id)}
        >
          <MoreHorizontal aria-hidden="true" className="shrink-0" size={18} />
          <span className="truncate">{t('friends.manage')}</span>
        </button>

        {isMenuOpen ? (
          <div className="absolute bottom-[calc(100%+0.75rem)] right-0 z-40 w-56 rounded-2xl border-2 border-cloud-gray bg-snow-white p-2 shadow-[0_8px_0_#e5e5e5]">
            <button
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-black text-charcoal hover:bg-cloud-gray/40"
              type="button"
              onClick={() => onMenuChange(null)}
            >
              <UserRound aria-hidden="true" size={17} />
              {t('friends.details')}
            </button>
            <button
              aria-label={t('friends.removeName', { name: friend.username })}
              className="mt-1 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-black text-[#b91c1c] hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRemoving}
              type="button"
              onClick={() => onRemove(friend)}
            >
              <Trash2 aria-hidden="true" size={17} />
              {isRemoving ? t('friends.removing') : t('friends.remove')}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function FriendsStatePanel({ children, role }: { children: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <section className="card-duo p-8 text-center" role={role}>
      {children}
    </section>
  );
}

function FriendsResults({
  friends,
  isRemoving,
  isSearching,
  openMenuFriendId,
  onMenuChange,
  onRemove,
}: {
  friends: Friend[];
  isRemoving: boolean;
  isSearching: boolean;
  openMenuFriendId: string | null;
  onMenuChange: (friendId: string | null) => void;
  onRemove: (friend: Friend) => void;
}) {
  const { t } = useTranslation();

  if (friends.length === 0) {
    return (
      <FriendsStatePanel>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-cloud-gray bg-duo-green-light text-duo-green shadow-[0_4px_0_#e5e5e5]">
          <UsersRound aria-hidden="true" size={26} />
        </div>
        <h2 className="mt-5 text-heading-sm font-feather text-almost-black">
          {isSearching ? t('friends.emptySearchTitle') : t('friends.emptyTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-graphite">
          {isSearching ? t('friends.emptySearchDescription') : t('friends.emptyDescription')}
        </p>
      </FriendsStatePanel>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3" aria-label={t('friends.list')}>
      {friends.map((friend) => (
        <FriendCard
          friend={friend}
          isMenuOpen={openMenuFriendId === friend.id}
          isOnline={isFriendOnline(friend)}
          isRemoving={isRemoving}
          key={friend.id}
          onMenuChange={onMenuChange}
          onRemove={onRemove}
        />
      ))}
    </section>
  );
}

function FriendsCta() {
  const { t } = useTranslation();

  return (
    <section className="card-duo flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-heading-sm font-feather leading-tight text-almost-black">
          {t('friends.cta.title')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-graphite">
          {t('friends.cta.description')}
        </p>
      </div>
      <Link className="btn-3d-base btn-3d-sky min-h-14 shrink-0 px-6 text-base" to="/app/discover">
        {t('friends.cta.action')}
      </Link>
    </section>
  );
}

export function FriendsPage() {
  const { locale, t } = useTranslation();
  const friendsQuery = useFriendsQuery();
  const removeFriendMutation = useRemoveFriendMutation();
  const [removedFriendName, setRemovedFriendName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [openMenuFriendId, setOpenMenuFriendId] = useState<string | null>(null);
  const [sortLabel, setSortLabel] = useState<'added' | 'language' | 'online'>('added');
  const filteredFriends = useMemo(() => {
    const matches = friendsQuery.data?.filter((friend) => matchesFriendSearch(friend, searchTerm)) ?? [];

    if (sortLabel === 'language') {
      return [...matches].sort((a, b) => a.targetLanguage.localeCompare(b.targetLanguage));
    }

    if (sortLabel === 'online') {
      return [...matches].sort(compareOnlineFirst);
    }

    return matches;
  }, [friendsQuery.data, searchTerm, sortLabel]);
  const isSearching = searchTerm.trim().length > 0;
  const totalFriends = friendsQuery.data?.length ?? 0;
  const onlineFriends = friendsQuery.data?.filter(isFriendOnline).length ?? 0;
  const resultSummary = formatResultSummary(locale, filteredFriends.length, totalFriends);
  const filterLabel =
    sortLabel === 'language'
      ? t('friends.filterByLanguage')
      : sortLabel === 'online'
        ? t('friends.filterOnlineFirst')
        : t('friends.filterByAdded');

  async function handleRemove(friend: Friend) {
    setRemovedFriendName('');

    try {
      await removeFriendMutation.mutateAsync(friend.id);
      setRemovedFriendName(friend.username);
      setOpenMenuFriendId(null);
    } catch {
      // The mutation error is rendered below.
    }
  }

  return (
    <main className="custom-scrollbar min-h-screen overflow-y-auto bg-[#f9fafb] px-4 py-6 pb-24 text-almost-black sm:px-8 md:px-12 md:py-10 lg:pb-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="border-b-2 border-cloud-gray pb-6">
          <h1 className={`${pageTitleClass} text-duo-green [text-shadow:2px_2px_0_#46a300]`}>
            {t('friends.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-body font-black leading-7 text-graphite">
            {t('friends.description')}
          </p>
        </header>

        <section className="relative z-30 grid min-h-[72px] gap-6 xl:grid-cols-2">
          <div className="relative min-w-0">
            <label className="relative flex h-14 items-center md:h-[72px] md:py-2">
              <span className="sr-only">{t('friends.search.sr')}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 h-6 w-6 text-silver"
                strokeWidth={3}
              />
              <input
                aria-label={t('friends.search.sr')}
                className="h-full w-full rounded-2xl border-2 border-cloud-gray bg-snow-white py-2 pl-[64px] pr-[64px] text-lg font-bold text-graphite shadow-[0_4px_0_#e5e5e5] transition-colors focus:border-sky-blue focus:outline-none"
                placeholder={t('friends.search.placeholder')}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button
                aria-expanded={isFilterMenuOpen}
                aria-label={t('friends.filterMenu')}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center p-2 text-sky-blue hover:text-[#1899d6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30"
                type="button"
                onClick={() => setIsFilterMenuOpen((isOpen) => !isOpen)}
              >
                <SlidersHorizontal aria-hidden="true" size={24} strokeWidth={3} />
              </button>
            </label>
            {isFilterMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-64 rounded-2xl border-2 border-cloud-gray bg-snow-white p-2 shadow-[0_8px_0_#e5e5e5]">
                {friendFilterOptions.map(([value, labelKey]) => (
                  <button
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-sm font-black ${
                      sortLabel === value ? 'bg-[#ddf4ff] text-sky-blue' : 'text-charcoal hover:bg-cloud-gray/40'
                    }`}
                    key={value}
                    type="button"
                    onClick={() => {
                      setSortLabel(value);
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid h-14 min-w-0 grid-cols-2 gap-4 md:h-[72px] md:py-2">
            <div className="card-duo flex h-full items-center justify-between gap-[12px] px-[16px] py-3">
              <p className="shrink-0 whitespace-nowrap text-sm font-black text-charcoal">
                {formatFriendCount(locale, totalFriends)}
              </p>
              <p className="shrink-0 whitespace-nowrap text-right text-sm font-black text-sky-blue">
                {resultSummary}
              </p>
            </div>

            <div className="card-duo flex h-full items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase text-silver">
                  {t('friends.onlineSummary')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-graphite">{filterLabel}</p>
              </div>
              <p className="shrink-0 text-heading-sm font-feather text-duo-green">
                {onlineFriends} / {totalFriends}
              </p>
            </div>
          </div>
        </section>

        {removedFriendName ? (
          <p className="card-duo p-4 text-sm font-bold text-duo-green" role="status">
            {t('friends.removed', { name: removedFriendName })}
          </p>
        ) : null}

        {removeFriendMutation.isError ? (
          <p
            className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c]"
            role="alert"
          >
            {getFriendsApiErrorMessage(removeFriendMutation.error)}
          </p>
        ) : null}

        {friendsQuery.isPending ? (
          <FriendsStatePanel role="status">
            <p className="text-sm font-bold text-graphite">{t('friends.loading')}</p>
          </FriendsStatePanel>
        ) : null}

        {friendsQuery.isError ? (
          <FriendsStatePanel role="alert">
            <p className="text-sm font-bold text-[#b91c1c]">
              {getFriendsApiErrorMessage(friendsQuery.error)}
            </p>
          </FriendsStatePanel>
        ) : null}

        {friendsQuery.data ? (
          <>
            <FriendsResults
              friends={filteredFriends}
              isRemoving={removeFriendMutation.isPending}
              isSearching={isSearching}
              openMenuFriendId={openMenuFriendId}
              onMenuChange={setOpenMenuFriendId}
              onRemove={handleRemove}
            />
            <FriendsCta />
          </>
        ) : null}
      </div>
    </main>
  );
}

function compareOnlineFirst(a: Friend, b: Friend) {
  return Number(isFriendOnline(b)) - Number(isFriendOnline(a));
}
