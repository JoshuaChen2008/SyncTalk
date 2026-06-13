import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Search,
  UserCircle,
  Video,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';

import { useTranslation } from '../../../i18n/i18n-store';
import type { Friend } from '../api/friends-api';

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
          className="duo-shadow-sm h-12 w-12 rounded-full border-2 border-snow-white object-cover"
          src={avatar}
        />
      ) : (
        <div className="duo-shadow-sm grid h-12 w-12 place-items-center rounded-full border-2 border-snow-white bg-sunshine-yellow text-sm font-feather text-almost-black">
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isChat = mode === 'chat';
  const label = isChat ? t('session.chat.conversations') : t('session.call.conversations');
  const workspaceLabel = isChat
    ? t('session.chat.workspace')
    : t('session.call.workspace');
  const basePath = isChat ? '/app/chat' : '/app/call';
  const activeName = title ?? activeFriend?.username ?? (isChat ? 'Chat' : 'Call');
  const sidebarFriends = friends.length > 0 ? friends : activeFriend ? [activeFriend] : [];
  const HeaderIcon = isChat ? MessageCircle : Video;
  const sidebarBadgeText = isChat ? t('chat.badge') : t('call.badge');
  const activeMeta = [activeFriend?.targetLanguage ?? '', activeFriend?.languageLevel ?? '']
    .filter(Boolean)
    .join(' / ');
  const toggleLabel = isSidebarCollapsed
    ? t('session.sidebar.expand')
    : t('session.sidebar.collapse');

  return (
    <main className="custom-scrollbar min-h-screen overflow-y-auto bg-snow-white px-4 py-6 pb-24 text-almost-black sm:px-8 md:px-12 md:py-8 lg:pb-12">
      <div className="duo-shadow-lg mx-auto flex h-[calc(100dvh-5rem)] min-h-[34rem] w-full max-w-[1320px] overflow-hidden rounded-[2rem] border-2 border-cloud-gray bg-snow-white">
        <aside
          className={`hidden shrink-0 flex-col border-r-2 border-cloud-gray bg-snow-white transition-[width] duration-300 md:flex ${
            isSidebarCollapsed ? 'w-[5.75rem]' : 'w-[18.5rem] lg:w-[21rem]'
          }`}
        >
          <div
            className={`border-b-2 border-cloud-gray ${
              isSidebarCollapsed ? 'px-3 py-4' : 'px-4 py-5 lg:px-5'
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              {isSidebarCollapsed ? null : (
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-normal text-silver">
                    SyncTalk
                  </p>
                  <h2 className="truncate text-heading-sm font-feather text-charcoal">
                    {isChat ? t('session.chat.title') : t('session.call.title')}
                  </h2>
                </div>
              )}

              {!isSidebarCollapsed ? (
                <div className="flex items-center gap-2">
                  <span className="duo-shadow-sm surface-muted grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-cloud-gray text-sky-blue">
                    <HeaderIcon aria-hidden="true" size={18} />
                  </span>
                  <button
                    aria-controls={`${mode}-conversation-list`}
                    aria-expanded={!isSidebarCollapsed}
                    aria-label={toggleLabel}
                    className="duo-shadow-sm surface-hover grid h-10 w-10 place-items-center rounded-2xl border-2 border-cloud-gray bg-snow-white text-graphite transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/20"
                    onClick={() => setIsSidebarCollapsed(true)}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" size={18} />
                  </button>
                </div>
              ) : (
                <button
                  aria-controls={`${mode}-conversation-list`}
                  aria-expanded={!isSidebarCollapsed}
                  aria-label={toggleLabel}
                  className="duo-shadow-sm surface-hover grid h-10 w-10 place-items-center rounded-2xl border-2 border-cloud-gray bg-snow-white text-graphite transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/20"
                  onClick={() => setIsSidebarCollapsed(false)}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              )}
            </div>

            {isSidebarCollapsed ? null : (
              <>
                <p className="mt-2 text-xs font-bold text-graphite">{sidebarBadgeText}</p>
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
                    className="surface-muted h-11 w-full rounded-xl border-2 border-transparent pl-10 pr-4 text-sm font-bold text-charcoal outline-none transition-colors placeholder:text-silver focus:border-sky-blue focus:bg-snow-white"
                    id={`${mode}-friend-search`}
                    placeholder={isChat ? t('session.chat.search') : t('session.call.search')}
                    type="search"
                  />
                </div>
              </>
            )}
          </div>

          <nav
            aria-label={label}
            className={`custom-scrollbar flex-1 overflow-y-auto bg-snow-white ${
              isSidebarCollapsed ? 'px-2 py-3' : 'p-2'
            }`}
            id={`${mode}-conversation-list`}
          >
            {sidebarFriends.length > 0 ? (
              <div className="space-y-1">
                {sidebarFriends.map((friend) => {
                  const isActive = friend.id === activeFriend?.id;

                  return (
                    <Link
                      aria-label={isChat ? `Chat with ${friend.username}` : `Call with ${friend.username}`}
                      className={`flex items-center rounded-2xl border-2 transition-colors ${
                        isSidebarCollapsed
                          ? 'mx-auto h-[4.25rem] w-[4.25rem] justify-center rounded-full p-0'
                          : 'gap-3 p-3'
                      } ${
                        isActive
                          ? 'border-sky-blue surface-info text-sky-blue'
                          : 'surface-hover border-transparent text-charcoal'
                      }`}
                      key={friend.id}
                      state={isChat ? undefined : { ring: true }}
                      title={friend.username}
                      to={`${basePath}/${friend.id}`}
                    >
                      <SessionAvatar
                        avatar={friend.avatar}
                        isActive={isActive}
                        name={friend.username}
                      />
                      {isSidebarCollapsed ? null : (
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-black">
                              {friend.username}
                            </span>
                            <span
                              className={`shrink-0 text-[11px] font-black ${
                                isActive ? 'text-sky-blue' : 'text-silver'
                              }`}
                            >
                              {isActive ? t('session.status.online') : sidebarBadgeText}
                            </span>
                          </span>
                          <span className="mt-1 block truncate text-xs font-bold text-graphite">
                            {friend.targetLanguage || 'Language partner'}
                            {friend.languageLevel ? ` / ${friend.languageLevel}` : ''}
                          </span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p
                className={`surface-muted rounded-2xl border-2 border-cloud-gray font-bold text-graphite ${
                  isSidebarCollapsed ? 'p-3 text-center text-xs' : 'p-4 text-sm'
                }`}
              >
                {t('session.empty')}
              </p>
            )}
          </nav>
        </aside>

        <section
          aria-label={workspaceLabel}
          className="flex min-w-0 flex-1 flex-col bg-snow-white"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cloud-gray bg-snow-white px-4 py-4 md:px-5">
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-xs font-black text-duo-green">{statusText}</p>
                  {activeMeta ? (
                    <p className="truncate text-xs font-bold text-graphite">{activeMeta}</p>
                  ) : null}
                </div>
              </div>
            </div>
            {activeFriend ? (
              <Link
                aria-label={isChat ? `Call ${activeFriend.username}` : `Chat with ${activeFriend.username}`}
                className="btn-3d-base btn-3d-green mb-0 h-10 w-10 rounded-full"
                state={isChat ? { ring: true } : undefined}
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

          <div className="surface-muted min-h-0 flex-1 p-3 md:p-4 lg:p-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
