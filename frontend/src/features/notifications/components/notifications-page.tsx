import { Bell, CheckCircle2, ExternalLink, Inbox, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import {
  featureCardClass,
  FriendsFeatureBackground,
  HeroGlassPanel,
} from '../../friends/components/friends-page-chrome';
import {
  getNotificationsApiErrorMessage,
  type AppNotification,
} from '../api/notifications-api';
import {
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '../api/notifications-hooks';

const safeNotificationTargets = new Set(['/app/requests', '/app/friends']);

function getSafeHref(notification: AppNotification) {
  const href = notification.metadata.href;
  return href && safeNotificationTargets.has(href) ? href : '';
}

function getNotificationIcon(notification: AppNotification) {
  if (notification.type === 'friend_accepted') {
    return UsersRound;
  }

  return Inbox;
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function NotificationsStatePanel({
  children,
  role,
}: {
  children: string;
  role?: 'alert' | 'status';
}) {
  return (
    <section className={`${featureCardClass} p-6 text-sm font-black text-slate-700`} role={role}>
      {children}
    </section>
  );
}

function NotificationCard({
  isMarkingRead,
  notification,
  onMarkRead,
}: {
  isMarkingRead: boolean;
  notification: AppNotification;
  onMarkRead: (notificationId: string) => void;
}) {
  const Icon = getNotificationIcon(notification);
  const safeHref = getSafeHref(notification);
  const isUnread = !notification.readAt;

  return (
    <article className={`${featureCardClass} grid gap-5 p-6 md:grid-cols-[auto_1fr_auto]`}>
      <div
        className={
          isUnread
            ? 'grid h-12 w-12 place-items-center rounded-lg bg-[#4f46e5] text-white shadow-[0_14px_26px_rgb(79_70_229_/_20%)]'
            : 'grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-800'
        }
      >
        <Icon aria-hidden="true" size={22} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-black text-slate-950">{notification.title}</h2>
          <span
            className={
              isUnread
                ? 'rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800'
                : 'rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800'
            }
          >
            {isUnread ? 'Unread' : 'Read'}
          </span>
        </div>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{notification.content}</p>
        <p className="mt-3 text-xs font-black text-slate-500">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:min-w-44">
        {safeHref ? (
          <Link
            aria-label={`Open ${notification.title}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgb(79_70_229_/_22%)] transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
            to={safeHref}
          >
            <ExternalLink aria-hidden="true" size={17} />
            Open
          </Link>
        ) : (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-black text-red-950">
            Invalid notification target
          </p>
        )}

        {isUnread ? (
          <button
            aria-label={`Mark ${notification.title} as read`}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMarkingRead}
            type="button"
            onClick={() => onMarkRead(notification.id)}
          >
            <CheckCircle2 aria-hidden="true" size={17} />
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function NotificationsPage() {
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationAsReadMutation();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  function handleMarkRead(notificationId: string) {
    markReadMutation.mutate(notificationId);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6ff] text-slate-950">
      <FriendsFeatureBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
        <HeroGlassPanel>
          <p className="inline-flex items-center gap-2 rounded-lg bg-white/74 px-3 py-1.5 text-sm font-black text-[#4f46e5] shadow-sm backdrop-blur-xl">
            <Bell aria-hidden="true" size={16} />
            Notifications
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
            Notifications
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">
            Follow friend requests and accepted language partner connections from one place.
          </p>
          <p className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-indigo-100 px-4 text-sm font-black text-[#4f46e5]">
            {unreadCount} unread
          </p>
        </HeroGlassPanel>

        {notificationsQuery.isPending ? (
          <NotificationsStatePanel role="status">Loading notifications...</NotificationsStatePanel>
        ) : null}

        {notificationsQuery.isError ? (
          <NotificationsStatePanel role="alert">
            {getNotificationsApiErrorMessage(notificationsQuery.error)}
          </NotificationsStatePanel>
        ) : null}

        {markReadMutation.isError ? (
          <p className={`${featureCardClass} p-4 text-sm font-black text-red-950`} role="alert">
            {getNotificationsApiErrorMessage(markReadMutation.error)}
          </p>
        ) : null}

        {notificationsQuery.data ? (
          notificationsQuery.data.notifications.length === 0 ? (
            <NotificationsStatePanel>No notifications yet</NotificationsStatePanel>
          ) : (
            <section className="flex flex-col gap-4" aria-label="Notifications list">
              {notificationsQuery.data.notifications.map((notification) => (
                <NotificationCard
                  isMarkingRead={markReadMutation.isPending}
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </section>
          )
        ) : null}
      </div>
    </main>
  );
}
