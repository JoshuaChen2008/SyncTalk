import { MessageCircle, Phone, Search, UserCircle, Video } from 'lucide-react';
import { Link } from 'react-router';
import type { ReactNode } from 'react';

import type { Friend } from '../api/friends-api';
import { useTranslation } from '../../../i18n/i18n-store';

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function SessionAvatar({
  avatar,
  name,
  isActive,
}: {
  avatar?: string;
  name: string;
  isActive?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      {avatar ? (
        <img
          alt={`${name} avatar`}
          className="h-12 w-12 rounded-full border-2 border-snow-white object-cover shadow-[0_2px_0_#e5e5e5]"
          src={avatar}
        />
      ) : (
        <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-snow-white bg-sunshine-yellow text-sm font-feather text-almost-black shadow-[0_2px_0_#e5e5e5]">
          {getInitials(name)}
        </div>
      )}
      <span
        aria-hidden="true"
        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-snow-white ${
          isActive ? 'bg-duo-green' : 'bg-cloud-gray'
        }`}
      />
    </div>
  );
}

export function SessionWorkspace({
  activeFriend,
  children,
  friends,
  mode,
  statusText,
  title,
}: {
  activeFriend?: Pick<Friend, 'avatar' | 'id' | 'languageLevel' | 'targetLanguage' | 'username'>;
  children: ReactNode;
  friends: Array<Pick<Friend, 'avatar' | 'id' | 'languageLevel' | 'targetLanguage' | 'username'>>;
  mode: 'chat' | 'call';
  statusText: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const isChat = mode === 'chat';
  const label = isChat ? t('session.chat.conversations') : t('session.call.conversations');
  const workspaceLabel = isChat
    ? t('session.chat.workspace')
    : t('session.call.workspace');
  const basePath = isChat ? '/app/chat' : '/app/call';
  const activeName = title ?? activeFriend?.username ?? (isChat ? 'Chat' : 'Call');
  const sidebarFriends = friends.length > 0 ? friends : activeFriend ? [activeFriend] : [];
  const HeaderIcon = isChat ? MessageCircle : Video;

  return (
    <main className="min-h-screen bg-snow-white text-almost-black">
      <div className="flex min-h-screen bg-snow-white">
        <aside className="hidden w-72 shrink-0 flex-col border-r-2 border-cloud-gray bg-snow-white md:flex lg:w-80">
          <div className="border-b-2 border-cloud-gray p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-sm font-feather text-charcoal">
                {isChat ? t('session.chat.title') : t('session.call.title')}
              </h2>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-duo-green text-snow-white shadow-[0_4px_0_#46a300]">
                <HeaderIcon aria-hidden="true" size={19} />
              </span>
            </div>
            <label className="sr-only" htmlFor={`${mode}-friend-search`}>
              {isChat ? 'Search chat friends' : 'Search call friends'}
            </label>
            <div className="relative mt-4">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-silver"
                size={18}
              />
              <input
                className="input-gamified h-11 min-h-0 bg-[#f7f7f7] pl-10 text-sm"
                id={`${mode}-friend-search`}
                placeholder={
                  isChat ? t('session.chat.search') : t('session.call.search')
                }
                type="search"
              />
            </div>
          </div>

          <nav aria-label={label} className="custom-scrollbar flex-1 overflow-y-auto p-2">
            {sidebarFriends.length > 0 ? (
              <div className="space-y-1">
                {sidebarFriends.map((friend) => {
                  const isActive = friend.id === activeFriend?.id;

                  return (
                    <Link
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-colors ${
                        isActive
                          ? 'border-[#84d8ff] bg-[#ddf4ff] text-sky-blue'
                          : 'border-transparent text-charcoal hover:bg-cloud-gray/30'
                      }`}
                      key={friend.id}
                      to={`${basePath}/${friend.id}`}
                    >
                      <SessionAvatar
                        avatar={friend.avatar}
                        isActive={isActive}
                        name={friend.username}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">
                          {friend.username}
                        </span>
                        <span className="block truncate text-xs font-bold text-graphite">
                          {friend.targetLanguage || 'Language partner'}
                          {friend.languageLevel ? ` · ${friend.languageLevel}` : ''}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border-2 border-cloud-gray bg-[#f7f7f7] p-4 text-sm font-bold text-graphite">
                {t('session.empty')}
              </p>
            )}
          </nav>
        </aside>

        <section
          aria-label={workspaceLabel}
          className="flex min-w-0 flex-1 flex-col bg-snow-white"
        >
          <header className="flex items-center justify-between gap-3 border-b-2 border-cloud-gray bg-snow-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              {activeFriend ? (
                <SessionAvatar avatar={activeFriend.avatar} isActive name={activeFriend.username} />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-cloud-gray bg-duo-green-light text-duo-green">
                  <UserCircle aria-hidden="true" size={24} />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-heading-sm font-feather text-charcoal">
                  {activeName}
                </h1>
                <p className="text-xs font-black text-duo-green">{statusText}</p>
              </div>
            </div>
            {activeFriend ? (
              <Link
                aria-label={isChat ? `Call ${activeFriend.username}` : `Chat with ${activeFriend.username}`}
                className="btn-3d-base btn-3d-green mb-0 h-10 w-10 rounded-full"
                to={`${isChat ? '/app/call' : '/app/chat'}/${activeFriend.id}`}
              >
                {isChat ? (
                  <Phone aria-hidden="true" size={18} />
                ) : (
                  <MessageCircle aria-hidden="true" size={18} />
                )}
              </Link>
            ) : null}
          </header>

          <div className="min-h-0 flex-1 bg-[#f7f7f7] p-4 md:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
