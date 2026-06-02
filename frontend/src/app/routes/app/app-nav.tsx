import { Bell, Compass, Inbox, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router';

import { useNotificationsQuery } from '../../../features/notifications/api/notifications-hooks';

const navItems = [
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/friends', label: 'Friends', icon: UsersRound },
  { to: '/app/requests', label: 'Friend Requests', icon: Inbox },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
];

export function AppNav() {
  const notificationsQuery = useNotificationsQuery();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <nav
      aria-label="Primary app navigation"
      className="flex flex-wrap gap-2 rounded-lg border border-white/65 bg-white/50 p-2 shadow-[0_18px_46px_rgb(49_46_129_/_12%)] backdrop-blur-2xl"
    >
      {navItems.map(({ icon: Icon, label, to }) => (
        <NavLink
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
              isActive
                ? 'bg-[#4f46e5] text-white shadow-[0_10px_24px_rgb(79_70_229_/_18%)]'
                : 'bg-white/54 text-slate-700 hover:bg-white/80 hover:text-slate-950'
            }`
          }
          key={to}
          to={to}
        >
          <Icon aria-hidden="true" size={17} />
          {label}
          {to === '/app/notifications' && unreadCount > 0 ? (
            <span
              aria-label={`${unreadCount} unread`}
              className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-xs font-black text-slate-950"
            >
              {unreadCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
