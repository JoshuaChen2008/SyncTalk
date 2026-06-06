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
  FriendsFeatureBackground,
  HeroGlassPanel,
} from './friends-page-chrome';
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

function formatFriendCount(count: number) {
  return `${count} ${count === 1 ? 'friend' : 'friends'} ready`;
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
          Friend
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-slate-600">
        <p className="inline-flex items-center gap-2 rounded-lg bg-white/52 px-3 py-2">
          <MapPin aria-hidden="true" size={16} />
          {friend.timezone}
        </p>
        <p className="inline-flex items-center gap-2 rounded-lg bg-white/52 px-3 py-2">
          <Clock aria-hidden="true" size={16} />
          {friend.learningGoal}
        </p>
        {friend.bio ? (
          <p className="min-h-12 rounded-lg border border-white/58 bg-white/42 px-3 py-3 leading-6 text-slate-700">
            &quot;{friend.bio}&quot;
          </p>
        ) : (
          <p className="min-h-12 rounded-lg border border-white/58 bg-white/42 px-3 py-3 leading-6 text-slate-500">
            Ready for a language exchange.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-lg bg-white/72 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
          {friend.nativeLanguage}
        </span>
        <span className="rounded-lg bg-white/72 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
          {friend.targetLanguage}
        </span>
        <span className="rounded-lg bg-amber-50/88 px-3 py-1.5 text-xs font-black text-amber-800 shadow-sm">
          {friend.languageLevel}
        </span>
      </div>

      <div className="mt-auto pt-7">
        <Link
          aria-label={`Chat with ${friend.username}`}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgb(79_70_229_/_28%)] transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          to={`/app/chat/${friend.id}`}
        >
          <MessageCircle aria-hidden="true" size={17} />
          Chat
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            aria-label={`Call ${friend.username}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 text-sm font-black text-teal-900 transition hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 motion-reduce:transition-none"
            to={`/app/call/${friend.id}`}
          >
            <Phone aria-hidden="true" size={17} />
            Call
          </Link>
          <button
            aria-label={`Remove ${friend.username}`}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isRemoving}
            type="button"
            onClick={() => onRemove(friend)}
          >
            <Trash2 aria-hidden="true" size={17} />
            {isRemoving ? 'Removing...' : 'Remove'}
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
  if (friends.length === 0) {
    return (
      <FriendsStatePanel>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-[#4f46e5]">
          <UsersRound aria-hidden="true" size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-950">
          {isSearching ? 'No friends match your search' : 'No friends yet'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-slate-600">
          {isSearching
            ? 'Try another name, language, goal, or timezone.'
            : 'Send a request from Discover to start your first language exchange.'}
        </p>
      </FriendsStatePanel>
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Friends list">
      {friends.map((friend) => (
        <FriendCard friend={friend} isRemoving={isRemoving} key={friend.id} onRemove={onRemove} />
      ))}
    </section>
  );
}

function FriendsCta() {
  return (
    <section
      className={`${featureCardClass} grid items-center gap-6 p-7 md:grid-cols-[auto_1fr_auto]`}
    >
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-[#4648d4] bg-white/82 text-[#4648d4] shadow-[0_18px_44px_rgb(79_70_229_/_18%)] md:mx-0">
        <Languages aria-hidden="true" size={38} />
      </div>
      <div>
        <h2 className="text-2xl font-black leading-tight text-slate-950">
          Find more language partners
        </h2>
        <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-slate-600">
          Keep growing your exchange circle by discovering people with complementary language goals
          and schedules.
        </p>
      </div>
      <Link
        className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-teal-600 bg-white/46 px-6 text-sm font-black text-teal-700 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 motion-reduce:transition-none"
        to="/app/discover"
      >
        Find more language partners
      </Link>
    </section>
  );
}

export function FriendsPage() {
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
  const resultSummary = `Showing ${filteredFriends.length} of ${totalFriends}`;

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
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-950">
      <FriendsFeatureBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-8 lg:py-10">
        <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <HeroGlassPanel>
            <p className="inline-flex items-center gap-2 rounded-lg bg-white/72 px-3 py-1.5 text-sm font-black text-[#4648d4] shadow-sm backdrop-blur-xl">
              <UsersRound aria-hidden="true" size={16} />
              Friends
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
              Your Language Friends
            </h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">
              Keep track of accepted language partners and jump into chat or video practice when
              your schedules align.
            </p>
            {friendsQuery.data ? (
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
                <span className="inline-flex min-h-10 items-center rounded-lg border border-indigo-100 bg-white/62 px-4 text-[#4648d4]">
                  {formatFriendCount(totalFriends)}
                </span>
                <span className="inline-flex min-h-10 items-center rounded-lg border border-teal-100 bg-teal-50/72 px-4 text-teal-800">
                  Chat or call from each card
                </span>
              </div>
            ) : null}
          </HeroGlassPanel>

          <section
            className={`${featureCardClass} flex flex-col justify-between gap-5 p-5 sm:p-6`}
            aria-label="Friends controls"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-[#4648d4]">
                    Partner board
                  </p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                    Search your circle
                  </h2>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#4648d4] text-white shadow-[0_16px_32px_rgb(70_72_212_/_22%)]">
                  <Compass aria-hidden="true" size={22} />
                </div>
              </div>

              <label className="relative mt-5 block w-full">
                <span className="sr-only">Search friends</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <input
                  aria-label="Search friends"
                  className="min-h-14 w-full rounded-lg border border-white/80 bg-white/72 py-3 pl-12 pr-14 text-base font-bold text-slate-950 outline-none shadow-[0_18px_44px_rgb(79_70_229_/_10%)] backdrop-blur-2xl transition placeholder:text-slate-500 focus:border-[#4648d4] focus:ring-4 focus:ring-indigo-100 motion-reduce:transition-none"
                  placeholder="Search by name, language, goal..."
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
            </div>

            {friendsQuery.data ? (
              <div className="grid gap-3 text-sm font-black text-slate-700 sm:grid-cols-2">
                <p className="rounded-lg border border-white/70 bg-white/52 px-4 py-3">
                  <span className="block text-2xl text-slate-950">{totalFriends}</span>
                  Total friends
                </p>
                <p className="rounded-lg border border-white/70 bg-white/52 px-4 py-3">
                  <span className="block text-2xl text-slate-950">{filteredFriends.length}</span>
                  {resultSummary}
                </p>
              </div>
            ) : null}
          </section>
        </section>

        {removedFriendName ? (
          <p
            className={`${featureCardClass} p-4 text-sm font-black text-emerald-950`}
            role="status"
          >
            Removed {removedFriendName}
          </p>
        ) : null}

        {removeFriendMutation.isError ? (
          <p className={`${featureCardClass} p-4 text-sm font-black text-red-950`} role="alert">
            {getFriendsApiErrorMessage(removeFriendMutation.error)}
          </p>
        ) : null}

        {friendsQuery.isPending ? (
          <FriendsStatePanel role="status">
            <p className="text-sm font-black text-slate-700">Loading friends...</p>
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
