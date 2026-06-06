import {
  Bell,
  Compass,
  Inbox,
  Settings,
  UserCircle,
  UsersRound,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';

import { useCurrentUserQuery } from '../../../features/auth/api/auth-hooks';
import { useNotificationsQuery } from '../../../features/notifications/api/notifications-hooks';
import { useTranslation } from '../../../i18n/i18n-store';
import { LanguageToggle } from '../../../i18n/language-toggle';

const navItems = [
  { to: '/app/discover', labelKey: 'app.nav.discover', icon: Compass },
  { to: '/app/friends', labelKey: 'app.nav.friends', icon: UsersRound },
  { to: '/app/requests', labelKey: 'app.nav.requests', icon: Inbox },
  { to: '/app/notifications', labelKey: 'app.nav.notifications', icon: Bell },
  { to: '/app/settings', labelKey: 'app.nav.settings', icon: Settings },
] as const;

function getNavLabel({
  isNotifications,
  label,
  t,
  unreadCount,
}: {
  isNotifications: boolean;
  label: string;
  t: ReturnType<typeof useTranslation>['t'];
  unreadCount: number;
}) {
  if (isNotifications && unreadCount > 0) {
    return t('app.nav.unread', { count: unreadCount, label });
  }

  return label;
}

function AppShellNav({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { t } = useTranslation();
  const notificationsQuery = useNotificationsQuery();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const isDesktop = variant === 'desktop';

  return (
    <nav
      aria-label={isDesktop ? t('app.nav.primary') : t('app.nav.mobile')}
      className={
        isDesktop
          ? 'hidden flex-col gap-2 lg:flex'
          : 'fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-xl border-2 border-cloud-gray bg-snow-white p-1.5 shadow-none lg:hidden'
      }
    >
      {navItems.map(({ icon: Icon, labelKey, to }) => {
        const label = t(labelKey);
        const isNotifications = labelKey === 'app.nav.notifications';
        const navLabel = getNavLabel({ isNotifications, label, t, unreadCount });

        return (
          <NavLink
            aria-label={isDesktop ? navLabel : t('app.nav.mobileTab', { label: navLabel })}
            className={({ isActive }) =>
              isDesktop
                ? `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 ${
                    isActive
                      ? 'bg-sky-blue/10 text-sky-blue border-2 border-transparent'
                      : 'text-graphite hover:bg-cloud-gray/30 hover:text-almost-black border-2 border-transparent'
                  }`
                : `relative grid min-h-12 place-items-center rounded-xl text-graphite transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 ${
                    isActive ? 'bg-sky-blue/10 text-sky-blue' : 'hover:bg-cloud-gray/30'
                  }`
            }
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" size={isDesktop ? 22 : 24} strokeWidth={2.5} />
            {isDesktop ? <span>{label}</span> : <span className="sr-only">{label}</span>}
            {isNotifications && unreadCount > 0 ? (
              <span
                aria-hidden="true"
                className={
                  isDesktop
                    ? 'ml-auto inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-sunshine-yellow px-1.5 text-xs font-black text-almost-black'
                    : 'absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-sunshine-yellow px-1 text-[0.65rem] font-black text-almost-black'
                }
              >
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const { t } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;

  // The design specifically calls for a light theme ("Theme: light") so we remove dark mode logic.
  // The system is intentionally flat, avoiding traditional shadows for elevation.

  return (
    <div className="min-h-screen bg-snow-white text-almost-black">
      <div className="relative z-10 flex min-h-screen max-w-[1440px] mx-auto">
        <aside className="sticky top-0 z-30 hidden h-screen w-72 shrink-0 border-r-2 border-cloud-gray bg-snow-white px-5 py-6 lg:flex lg:flex-col">
          <Link className="text-heading font-feather text-duo-green hover:brightness-110 transition-all" to="/app/discover">
            SyncTalk
          </Link>
          <p className="mt-2 text-sm font-bold text-silver uppercase tracking-wider">
            {t('app.brand.tagline')}
          </p>

          <div className="mt-8">
            <AppShellNav variant="desktop" />
          </div>

          <div className="mt-auto">
            <LanguageToggle />
          </div>

          <Link
            className="mt-3 flex min-h-14 items-center gap-3 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 text-sm font-bold text-almost-black transition-colors hover:bg-cloud-gray/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30"
            to="/app/settings"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cloud-gray/40 text-graphite">
              <UserCircle aria-hidden="true" size={20} strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-almost-black font-bold">
                {currentUser?.username ?? t('app.user.fallback')}
              </span>
              <span className="block truncate text-xs text-graphite">
                {currentUser?.email ?? t('app.user.emailFallback')}
              </span>
            </span>
          </Link>
        </aside>

        <div className="min-w-0 flex-1 pb-20 lg:pb-0 bg-snow-white">
          <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b-2 border-cloud-gray bg-snow-white px-4 lg:hidden">
            <Link className="text-heading-sm font-feather text-duo-green" to="/app/discover">
              SyncTalk
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle compact />
              <Link
                aria-label={t('app.settings.open')}
                className="grid h-10 w-10 place-items-center rounded-xl bg-transparent text-graphite transition hover:bg-cloud-gray/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30"
                to="/app/settings"
              >
                <Settings aria-hidden="true" size={22} strokeWidth={2.5} />
              </Link>
            </div>
          </header>

          <Outlet />
        </div>
      </div>
      <AppShellNav variant="mobile" />
    </div>
  );
}
