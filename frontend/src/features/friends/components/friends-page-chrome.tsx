import { Bell, Search, UserCircle } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';

import { useNotificationsQuery } from '../../notifications/api/notifications-hooks';
import profileCollage1 from '../../../assets/synctalk/profile-collage-1.png';
import profileCollage3 from '../../../assets/synctalk/profile-collage-3.png';
import profileCollage5 from '../../../assets/synctalk/profile-collage-5.png';
import profileCollage6 from '../../../assets/synctalk/profile-collage-6.png';

const pageNavItems = [
  { to: '/app/discover', label: 'Discover' },
  { to: '/app/friends', label: 'Friends' },
  { to: '/app/requests', label: 'Requests' },
  { to: '/app/notifications', label: 'Notifications' },
];

export const featureCardClass =
  'rounded-lg border border-white/75 bg-white/88 shadow-[0_22px_56px_rgb(79_70_229_/_12%)] backdrop-blur-2xl';

export function FriendsFeatureTopNav() {
  const notificationsQuery = useNotificationsQuery();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <header className="relative z-10 flex min-h-16 items-center justify-between gap-4 border-b border-indigo-100/80 bg-white/72 px-4 backdrop-blur-2xl sm:px-8">
      <Link className="text-3xl font-black tracking-normal text-[#4f46e5]" to="/app/discover">
        SyncTalk
      </Link>

      <nav
        aria-label="Friends app navigation"
        className="hidden items-center gap-8 text-sm font-black text-slate-600 md:flex"
      >
        {pageNavItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `border-b-2 py-5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
                isActive
                  ? 'border-[#4f46e5] text-[#4f46e5]'
                  : 'border-transparent hover:border-indigo-200 hover:text-slate-950'
              }`
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
            {item.to === '/app/notifications' && unreadCount > 0 ? (
              <span
                aria-label={`${unreadCount} unread`}
                className="ml-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-xs font-black text-slate-950"
              >
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 text-[#4f46e5]">
        <button
          aria-label="Search"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          type="button"
        >
          <Search aria-hidden="true" size={22} />
        </button>
        <Link
          aria-label="Notifications"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          to="/app/notifications"
        >
          <Bell aria-hidden="true" size={22} />
        </Link>
        <button
          aria-label="Profile"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          type="button"
        >
          <UserCircle aria-hidden="true" size={22} />
        </button>
      </div>
    </header>
  );
}

export function FriendsFeatureBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        alt=""
        className="absolute -left-14 top-10 h-36 w-64 rotate-[-11deg] rounded-lg object-cover opacity-80 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] sm:left-0"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute right-8 top-16 hidden h-40 w-72 rotate-[6deg] rounded-lg object-cover opacity-78 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] lg:block"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-7 left-10 hidden h-36 w-72 rotate-[-8deg] rounded-lg object-cover opacity-60 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] md:block"
        src={profileCollage5}
      />
      <img
        alt=""
        className="absolute bottom-12 right-24 hidden h-32 w-64 rotate-[8deg] rounded-lg object-cover opacity-66 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] lg:block"
        src={profileCollage6}
      />
    </div>
  );
}

export function HeroGlassPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/75 bg-white/82 p-6 shadow-[0_22px_56px_rgb(79_70_229_/_14%)] backdrop-blur-2xl sm:p-8">
      {children}
    </div>
  );
}
