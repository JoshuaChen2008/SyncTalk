import {
  Bell,
  Compass,
  Inbox,
  Settings,
  UserCircle,
  UsersRound,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router';

import { useCurrentUserQuery } from '../../../features/auth/api/auth-hooks';
import { useNotificationsQuery } from '../../../features/notifications/api/notifications-hooks';
import { applyAppTheme, useThemeStore } from '../../../stores/theme-store';

const navItems = [
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/friends', label: 'Friends', icon: UsersRound },
  { to: '/app/requests', label: 'Requests', icon: Inbox },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

function getNavLabel(label: string, unreadCount: number) {
  if (label === 'Notifications' && unreadCount > 0) {
    return `${label} ${unreadCount} unread`;
  }

  return label;
}

function AppShellNav({ variant }: { variant: 'desktop' | 'mobile' }) {
  const notificationsQuery = useNotificationsQuery();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const isDesktop = variant === 'desktop';

  return (
    <nav
      aria-label={isDesktop ? 'Primary app navigation' : 'Mobile app navigation'}
      className={
        isDesktop
          ? 'hidden flex-col gap-2 lg:flex'
          : 'fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-lg border border-white/70 bg-white/88 p-1.5 shadow-[0_20px_60px_rgb(15_23_42_/_18%)] backdrop-blur-2xl lg:hidden'
      }
    >
      {navItems.map(({ icon: Icon, label, to }) => (
        <NavLink
          aria-label={
            isDesktop ? getNavLabel(label, unreadCount) : `${getNavLabel(label, unreadCount)} tab`
          }
          className={({ isActive }) =>
            isDesktop
              ? `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
                  isActive
                    ? 'bg-[#4f46e5] text-white shadow-[0_14px_30px_rgb(79_70_229_/_20%)]'
                    : 'text-slate-700 hover:bg-white/82 hover:text-slate-950'
                }`
              : `relative grid min-h-12 place-items-center rounded-lg text-slate-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
                  isActive ? 'bg-[#4f46e5] text-white' : 'hover:bg-indigo-50'
                }`
          }
          key={to}
          to={to}
        >
          <Icon aria-hidden="true" size={isDesktop ? 18 : 20} />
          {isDesktop ? <span>{label}</span> : <span className="sr-only">{label}</span>}
          {label === 'Notifications' && unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className={
                isDesktop
                  ? 'ml-auto inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-xs font-black text-slate-950'
                  : 'absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#fbbf24] px-1 text-[0.65rem] font-black text-slate-950'
              }
            >
              {unreadCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const currentUserQuery = useCurrentUserQuery();
  const theme = useThemeStore((state) => state.theme);
  const currentUser = currentUserQuery.data;
  const isDark = theme === 'dark';

  useEffect(() => {
    applyAppTheme(theme);
  }, [theme]);

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-slate-950 text-slate-100'
          : 'min-h-screen bg-[#eef2ff] text-slate-950'
      }
    >
      <div
        className={
          isDark
            ? 'pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)] [background-size:32px_32px]'
            : 'pointer-events-none fixed inset-0 opacity-50 [background-image:linear-gradient(#c7d2fe_1px,transparent_1px),linear-gradient(90deg,#c7d2fe_1px,transparent_1px)] [background-size:32px_32px]'
        }
      />
      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`sticky top-0 z-30 hidden h-screen w-72 shrink-0 border-r px-5 py-6 shadow-[0_20px_70px_rgb(49_46_129_/_12%)] lg:flex lg:flex-col ${
            isDark ? 'border-slate-700 bg-slate-900' : 'border-indigo-100 bg-white'
          }`}
        >
          <Link className="text-3xl font-black tracking-normal text-[#4648d4]" to="/app/discover">
            SyncTalk
          </Link>
          <p className={`mt-2 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Language practice workspace
          </p>

          <div className="mt-8">
            <AppShellNav variant="desktop" />
          </div>

          <Link
            className={`mt-auto flex min-h-14 items-center gap-3 rounded-lg border px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-800'
                : 'border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50'
            }`}
            to="/app/settings"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-100 text-[#4f46e5]">
              <UserCircle aria-hidden="true" size={20} />
            </span>
            <span className="min-w-0">
              <span className={`block truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {currentUser?.username ?? 'User'}
              </span>
              <span className={`block truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentUser?.email ?? 'Settings'}
              </span>
            </span>
          </Link>
        </aside>

        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <header
            className={`sticky top-0 z-40 flex min-h-16 items-center justify-between border-b px-4 shadow-[0_12px_36px_rgb(79_70_229_/_8%)] backdrop-blur-2xl lg:hidden ${
              isDark ? 'border-slate-700 bg-slate-900/82' : 'border-white/70 bg-white/76'
            }`}
          >
            <Link className="text-2xl font-black text-[#4648d4]" to="/app/discover">
              SyncTalk
            </Link>
            <Link
              aria-label="Open settings"
              className="grid h-10 w-10 place-items-center rounded-lg bg-white/60 text-[#4f46e5] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
              to="/app/settings"
            >
              <Settings aria-hidden="true" size={21} />
            </Link>
          </header>

          <Outlet />
        </div>
      </div>
      <AppShellNav variant="mobile" />
    </div>
  );
}
