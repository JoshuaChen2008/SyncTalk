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
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  heroContentClass,
  heroDescriptionClass,
  heroEyebrowClass,
  heroHeaderClass,
  heroIconClass,
  heroStatCardClass,
  heroTitleClass,
  pageContainerClass,
  pageShellClass,
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
      className={`${featureCardClass} group flex min-h-[22rem] flex-col p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#e5e5e5] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {friend.avatar ? (
            <img
              alt={`${friend.username} avatar`}
              className="h-16 w-16 shrink-0 rounded-xl border-2 border-cloud-gray object-cover"
              src={friend.avatar}
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border-2 border-cloud-gray bg-duo-green-light text-lg font-feather text-duo-green shadow-[0_4px_0_#e5e5e5]">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-heading-sm font-feather text-almost-black">{friend.username}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-xl border-2 border-cloud-gray bg-sky-blue/10 px-2.5 py-1 text-xs font-bold text-sky-blue">
                {getLanguageCode(friend.nativeLanguage)}
              </span>
              <span className="rounded-xl border-2 border-cloud-gray bg-duo-green-light px-2.5 py-1 text-xs font-bold text-duo-green">
                {getLanguageCode(friend.targetLanguage)}
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex min-h-9 shrink-0 items-center rounded-xl border-2 border-cloud-gray bg-snow-white px-3 text-xs font-bold text-duo-green">
          {t('friends.status.friend')}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-graphite">
        <p className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-2">
          <MapPin aria-hidden="true" size={16} />
          {friend.timezone}
        </p>
        <p className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-2">
          <Clock aria-hidden="true" size={16} />
          {translateDisplayValue(locale, friend.learningGoal)}
        </p>
        {friend.bio ? (
          <p className="min-h-12 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-3 leading-6 text-charcoal">
            &quot;{friend.bio}&quot;
          </p>
        ) : (
          <p className="min-h-12 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-3 leading-6 text-silver">
            {t('friends.defaultBio')}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-bold text-charcoal">
          {translateDisplayValue(locale, friend.nativeLanguage)}
        </span>
        <span className="rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-xs font-bold text-charcoal">
          {translateDisplayValue(locale, friend.targetLanguage)}
        </span>
        <span className="rounded-xl border-2 border-cloud-gray bg-sunshine-yellow/20 px-3 py-1.5 text-xs font-bold text-almost-black">
          {friend.languageLevel}
        </span>
      </div>

      <div className="mt-auto pt-7">
        <Link
          aria-label={t('friends.chatWith', { name: friend.username })}
          className="btn-primary min-h-12 w-full gap-2 px-4"
          to={`/app/chat/${friend.id}`}
        >
          <MessageCircle aria-hidden="true" size={17} />
          {t('friends.chat')}
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            aria-label={t('friends.callName', { name: friend.username })}
            className="btn-outline min-h-11 gap-2 px-4 text-sm"
            to={`/app/call/${friend.id}`}
          >
            <Phone aria-hidden="true" size={17} />
            {t('friends.call')}
          </Link>
          <button
            aria-label={t('friends.removeName', { name: friend.username })}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 text-sm font-bold text-[#b91c1c] transition-colors hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
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
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl border-2 border-cloud-gray bg-duo-green-light text-duo-green shadow-[0_4px_0_#e5e5e5]">
          <UsersRound aria-hidden="true" size={26} />
        </div>
        <h2 className="mt-5 text-heading-sm font-feather text-almost-black">
          {isSearching ? t('friends.emptySearchTitle') : t('friends.emptyTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-graphite">
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
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-xl border-2 border-cloud-gray bg-sky-blue/10 text-sky-blue shadow-[0_4px_0_#e5e5e5] md:mx-0">
        <Languages aria-hidden="true" size={38} />
      </div>
      <div>
        <h2 className="text-heading-sm font-feather leading-tight text-almost-black">
          {t('friends.cta.title')}
        </h2>
        <p className="mt-3 max-w-2xl text-body font-bold leading-7 text-graphite">
          {t('friends.cta.description')}
        </p>
      </div>
      <Link
        className="btn-outline min-h-12 px-6 text-sm"
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
    <main className={pageShellClass}>
      <DiscoverStyleBackground />

      <div className={`relative ${pageContainerClass}`}>
        <header className={heroHeaderClass}>
          <section className={heroContentClass}>
            <div className="flex items-center gap-3">
              <span className={heroIconClass}>
                <UsersRound aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-bold uppercase text-graphite">
                {t('app.nav.friends')}
              </span>
            </div>

            <div>
              <p className={heroEyebrowClass}>
                <Compass aria-hidden="true" size={16} />
                {t('friends.badge')}
              </p>
              <h1 className={heroTitleClass}>
                {t('friends.title')}
              </h1>
              <p className={heroDescriptionClass}>
                {t('friends.description')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="relative block w-full max-w-xl">
                <span className="sr-only">{t('friends.search.sr')}</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-graphite"
                  size={20}
                />
                <input
                  aria-label={t('friends.search.sr')}
                  className="input-gamified min-h-14 pl-12 pr-14 shadow-[0_4px_0_#e5e5e5]"
                  placeholder={t('friends.search.placeholder')}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <SlidersHorizontal
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sky-blue"
                  size={20}
                />
              </label>

              {friendsQuery.data ? (
                <div className="grid max-w-xl gap-3 text-sm font-bold text-charcoal sm:grid-cols-2">
                  <p className={heroStatCardClass}>
                    <span className="block text-heading-sm font-feather text-duo-green">{totalFriends}</span>
                    {formatFriendCount(locale, totalFriends)}
                  </p>
                  <p className={heroStatCardClass}>
                    <span className="block text-heading-sm font-feather text-sky-blue">{filteredFriends.length}</span>
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
            className={`${featureCardClass} p-4 text-sm font-bold text-duo-green`}
            role="status"
          >
            {t('friends.removed', { name: removedFriendName })}
          </p>
        ) : null}

        {removeFriendMutation.isError ? (
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c]" role="alert">
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
              onRemove={handleRemove}
            />
            <FriendsCta />
          </>
        ) : null}
      </div>
    </main>
  );
}
