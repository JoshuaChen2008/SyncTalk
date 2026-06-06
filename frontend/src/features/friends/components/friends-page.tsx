import {
  Clock,
  Compass,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  SlidersHorizontal,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  featureCardClass,
  discoverGlassPanel,
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
} from './friends-page-chrome';
import {
  formatFriendCount,
  formatResultSummary,
  translateDisplayValue,
} from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import { getFriendsApiErrorMessage, type Friend } from '../api/friends-api';
import { useFriendsQuery, useRemoveFriendMutation } from '../api/friends-hooks';

function getLanguageCode(language: string) {
  return language.slice(0, 2).toUpperCase();
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
  isRemoving,
  onRemove,
}: {
  friend: Friend;
  isRemoving: boolean;
  onRemove: (friend: Friend) => void;
}) {
  const { locale, t } = useTranslation();
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <article
      className={`${featureCardClass} group flex min-h-[22rem] flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white/82 hover:shadow-[0_28px_70px_rgb(49_46_129_/_16%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {friend.avatar ? (
            <img
              alt={`${friend.username} avatar`}
              className="h-16 w-16 shrink-0 rounded-full border border-white object-cover shadow-[0_12px_24px_rgb(79_70_229_/_16%)]"
              src={friend.avatar}
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/80 bg-[#22c55e]/78 text-lg font-black text-slate-950 shadow-[0_12px_24px_rgb(34_197_94_/_18%)]">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black text-slate-950">{friend.username}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-black text-[#4f46e5]">
                {getLanguageCode(friend.nativeLanguage)}
              </span>
              <span className="rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-800">
                {getLanguageCode(friend.targetLanguage)}
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50/82 px-3 text-xs font-black text-emerald-800">
          {t('friends.status.friend')}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-slate-600">
        <p className="inline-flex items-center gap-2 rounded-lg bg-white/52 px-3 py-2">
          <MapPin aria-hidden="true" size={16} />
          {friend.timezone}
        </p>
        <p className="inline-flex items-center gap-2 rounded-lg bg-white/52 px-3 py-2">
          <Clock aria-hidden="true" size={16} />
          {translateDisplayValue(locale, friend.learningGoal)}
        </p>
        {friend.bio ? (
          <p className="min-h-12 rounded-lg border border-white/58 bg-white/42 px-3 py-3 leading-6 text-slate-700">
            &quot;{friend.bio}&quot;
          </p>
        ) : (
          <p className="min-h-12 rounded-lg border border-white/58 bg-white/42 px-3 py-3 leading-6 text-slate-500">
            {t('friends.defaultBio')}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-lg bg-white/72 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
          {translateDisplayValue(locale, friend.nativeLanguage)}
        </span>
        <span className="rounded-lg bg-white/72 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
          {translateDisplayValue(locale, friend.targetLanguage)}
        </span>
        <span className="rounded-lg bg-amber-50/88 px-3 py-1.5 text-xs font-black text-amber-800 shadow-sm">
          {friend.languageLevel}
        </span>
      </div>

      <div className="mt-auto pt-7">
        <Link
          aria-label={t('friends.chatWith', { name: friend.username })}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgb(79_70_229_/_28%)] transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          to={`/app/chat/${friend.id}`}
        >
          <MessageCircle aria-hidden="true" size={17} />
          {t('friends.chat')}
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            aria-label={t('friends.callName', { name: friend.username })}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 text-sm font-black text-teal-900 transition hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 motion-reduce:transition-none"
            to={`/app/call/${friend.id}`}
          >
            <Phone aria-hidden="true" size={17} />
            {t('friends.call')}
          </Link>
          <button
            aria-label={t('friends.removeName', { name: friend.username })}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isRemoving}
            type="button"
            onClick={() => onRemove(friend)}
          >
            <Trash2 aria-hidden="true" size={17} />
            {isRemoving ? t('friends.removing') : t('friends.remove')}
          </button>
        </div>
      </div>
    </article>
  );
}

function FriendsStatePanel({ children, role }: { children: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <section className={`${featureCardClass} p-8 text-center`} role={role}>
      {children}
    </section>
  );
}

function FriendsResults({
  friends,
  isRemoving,
  isSearching,
  onRemove,
}: {
  friends: Friend[];
  isRemoving: boolean;
  isSearching: boolean;
  onRemove: (friend: Friend) => void;
}) {
  const { t } = useTranslation();

  if (friends.length === 0) {
    return (
      <FriendsStatePanel>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-[#4f46e5]">
          <UsersRound aria-hidden="true" size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-950">
          {isSearching ? t('friends.emptySearchTitle') : t('friends.emptyTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-slate-600">
          {isSearching
            ? t('friends.emptySearchDescription')
            : t('friends.emptyDescription')}
        </p>
      </FriendsStatePanel>
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label={t('friends.list')}>
      {friends.map((friend) => (
        <FriendCard friend={friend} isRemoving={isRemoving} key={friend.id} onRemove={onRemove} />
      ))}
    </section>
  );
}

function FriendsCta() {
  const { t } = useTranslation();

  return (
    <section
      className={`${featureCardClass} grid items-center gap-6 p-7 md:grid-cols-[auto_1fr_auto]`}
    >
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-[#4648d4] bg-white/82 text-[#4648d4] shadow-[0_18px_44px_rgb(79_70_229_/_18%)] md:mx-0">
        <Languages aria-hidden="true" size={38} />
      </div>
      <div>
        <h2 className="text-2xl font-black leading-tight text-slate-950">
          {t('friends.cta.title')}
        </h2>
        <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-slate-600">
          {t('friends.cta.description')}
        </p>
      </div>
      <Link
        className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-teal-600 bg-white/46 px-6 text-sm font-black text-teal-700 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 motion-reduce:transition-none"
        to="/app/discover"
      >
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
  const filteredFriends = useMemo(
    () => friendsQuery.data?.filter((friend) => matchesFriendSearch(friend, searchTerm)) ?? [],
    [friendsQuery.data, searchTerm],
  );
  const isSearching = searchTerm.trim().length > 0;
  const totalFriends = friendsQuery.data?.length ?? 0;
  const resultSummary = formatResultSummary(locale, filteredFriends.length, totalFriends);

  async function handleRemove(friend: Friend) {
    setRemovedFriendName('');

    try {
      await removeFriendMutation.mutateAsync(friend.id);
      setRemovedFriendName(friend.username);
    } catch {
      // The mutation error is rendered below.
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef2ff] px-4 py-5 text-slate-950 sm:px-8">
      <DiscoverStyleBackground />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className={`grid overflow-hidden rounded-lg ${discoverGlassPanel} lg:grid-cols-[1.1fr_0.9fr]`}>
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 bg-[#4f46e5]/70 p-6 text-white backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/70 bg-[#22c55e]/72 text-slate-950 shadow-[0_14px_28px_rgb(34_197_94_/_28%)] backdrop-blur-xl">
                <UsersRound aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-black uppercase tracking-normal">
                {t('app.nav.friends')}
              </span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/55 bg-white/18 px-3 py-1.5 text-sm font-black backdrop-blur-xl">
                <Compass aria-hidden="true" size={16} />
                {t('friends.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl">
                {t('friends.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-indigo-50">
                {t('friends.description')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="relative block w-full max-w-xl">
                <span className="sr-only">{t('friends.search.sr')}</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <input
                  aria-label={t('friends.search.sr')}
                  className="min-h-14 w-full rounded-lg border border-white/75 bg-white/74 py-3 pl-12 pr-14 text-base font-black text-slate-950 outline-none shadow-[0_18px_50px_rgb(15_23_42_/_22%)] backdrop-blur-2xl transition placeholder:text-slate-500 focus:border-white focus:ring-4 focus:ring-white/35 motion-reduce:transition-none"
                  placeholder={t('friends.search.placeholder')}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <SlidersHorizontal
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4648d4]"
                  size={20}
                />
              </label>

              {friendsQuery.data ? (
                <div className="grid max-w-xl gap-3 text-sm font-black text-slate-950 sm:grid-cols-2">
                  <p className="rounded-lg border border-white/60 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgb(15_23_42_/_12%)] backdrop-blur-xl">
                    <span className="block text-2xl">{totalFriends}</span>
                    {formatFriendCount(locale, totalFriends)}
                  </p>
                  <p className="rounded-lg border border-white/60 bg-white/24 px-4 py-3 text-white backdrop-blur-xl">
                    <span className="block text-2xl">{filteredFriends.length}</span>
                    {resultSummary}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        {removedFriendName ? (
          <p
            className={`${featureCardClass} p-4 text-sm font-black text-emerald-950`}
            role="status"
          >
            {t('friends.removed', { name: removedFriendName })}
          </p>
        ) : null}

        {removeFriendMutation.isError ? (
          <p className={`${featureCardClass} p-4 text-sm font-black text-red-950`} role="alert">
            {getFriendsApiErrorMessage(removeFriendMutation.error)}
          </p>
        ) : null}

        {friendsQuery.isPending ? (
          <FriendsStatePanel role="status">
            <p className="text-sm font-black text-slate-700">{t('friends.loading')}</p>
          </FriendsStatePanel>
        ) : null}

        {friendsQuery.isError ? (
          <FriendsStatePanel role="alert">
            <p className="text-sm font-black text-red-950">
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
              onRemove={handleRemove}
            />
            <FriendsCta />
          </>
        ) : null}
      </div>
    </main>
  );
}
