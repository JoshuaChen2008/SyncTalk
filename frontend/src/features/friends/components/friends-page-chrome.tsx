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
  'rounded-lg border border-white/70 bg-white/72 shadow-[0_24px_60px_rgb(49_46_129_/_13%)] backdrop-blur-2xl';

export function FriendsFeatureTopNav() {
  const notificationsQuery = useNotificationsQuery();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 mx-auto mt-0 flex min-h-16 w-full items-center justify-between gap-4 border-b border-white/70 bg-white/64 px-4 shadow-[0_12px_36px_rgb(79_70_229_/_8%)] backdrop-blur-2xl sm:px-8">
      <Link className="text-3xl font-black tracking-normal text-[#4648d4]" to="/app/discover">
        SyncTalk
      </Link>

      <nav
        aria-label="Friends app navigation"
        className="hidden items-center gap-7 text-sm font-black text-slate-600 md:flex"
      >
        {pageNavItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `border-b-2 py-5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
                isActive
                  ? 'border-[#4648d4] text-[#4648d4]'
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

      <div className="flex items-center gap-2 text-[#4648d4]">
        <button
          aria-label="Search"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg bg-white/42 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          type="button"
        >
          <Search aria-hidden="true" size={22} />
        </button>
        <Link
          aria-label="Notifications"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg bg-white/42 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
          to="/app/notifications"
        >
          <Bell aria-hidden="true" size={22} />
        </Link>
        <button
          aria-label="Profile"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg bg-white/42 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
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
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(248_250_252)_0%,rgb(238_242_255)_38%,rgb(240_253_250)_70%,rgb(255_251_235)_100%)]" />
      <div className="absolute inset-x-[-10%] top-[-18rem] h-[38rem] rotate-[-6deg] bg-[linear-gradient(90deg,rgb(79_70_229_/_16%),rgb(34_197_94_/_10%),rgb(251_191_36_/_16%))] blur-3xl" />
      <div className="absolute inset-x-[-6%] bottom-[-20rem] h-[34rem] rotate-[5deg] bg-[linear-gradient(90deg,rgb(20_184_166_/_14%),rgb(255_255_255_/_0%),rgb(129_140_248_/_18%))] blur-3xl" />
      <img
        alt=""
        className="absolute -left-14 top-20 h-36 w-64 rotate-[-11deg] rounded-lg border border-white/70 object-cover opacity-54 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] sm:left-0"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute right-8 top-24 hidden h-40 w-72 rotate-[6deg] rounded-lg border border-white/70 object-cover opacity-52 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] lg:block"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-10 left-10 hidden h-36 w-72 rotate-[-8deg] rounded-lg border border-white/70 object-cover opacity-40 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] md:block"
        src={profileCollage5}
      />
      <img
        alt=""
        className="absolute bottom-12 right-24 hidden h-32 w-64 rotate-[8deg] rounded-lg border border-white/70 object-cover opacity-42 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] lg:block"
        src={profileCollage6}
      />
    </div>
  );
}

export function HeroGlassPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-[0_24px_70px_rgb(49_46_129_/_12%)] backdrop-blur-2xl sm:p-8">
      {children}
    </div>
  );
}
