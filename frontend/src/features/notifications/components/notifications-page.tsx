import { Bell, CheckCircle2, ExternalLink, Inbox, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import {
  discoverGlassPanel,
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  featureCardClass,
} from '../../friends/components/friends-page-chrome';
import {
  getNotificationsApiErrorMessage,
  type AppNotification,
} from '../api/notifications-api';
import {
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '../api/notifications-hooks';
import { formatDateTime } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';

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
  const { locale, t } = useTranslation();
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
            {isUnread ? t('notifications.unread') : t('notifications.read')}
          </span>
        </div>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{notification.content}</p>
        <p className="mt-3 text-xs font-black text-slate-500">
          {formatDateTime(locale, notification.createdAt)}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:min-w-44">
        {safeHref ? (
          <Link
            aria-label={t('notifications.openName', { title: notification.title })}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgb(79_70_229_/_22%)] transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none"
            to={safeHref}
          >
            <ExternalLink aria-hidden="true" size={17} />
            {t('notifications.open')}
          </Link>
        ) : (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-black text-red-950">
            {t('notifications.invalidTarget')}
          </p>
        )}

        {isUnread ? (
          <button
            aria-label={t('notifications.markReadName', { title: notification.title })}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            disabled={isMarkingRead}
            type="button"
            onClick={() => onMarkRead(notification.id)}
          >
            <CheckCircle2 aria-hidden="true" size={17} />
            {t('notifications.markRead')}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function NotificationsPage() {
  const { t } = useTranslation();
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationAsReadMutation();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  function handleMarkRead(notificationId: string) {
    markReadMutation.mutate(notificationId);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef2ff] px-4 py-5 text-slate-950 sm:px-8">
      <DiscoverStyleBackground />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className={`grid overflow-hidden rounded-lg ${discoverGlassPanel} lg:grid-cols-[1.1fr_0.9fr]`}>
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 bg-[#4f46e5]/70 p-6 text-white backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/70 bg-[#22c55e]/72 text-slate-950 shadow-[0_14px_28px_rgb(34_197_94_/_28%)] backdrop-blur-xl">
                <Bell aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-black uppercase tracking-normal">
                {t('app.nav.notifications')}
              </span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/55 bg-white/18 px-3 py-1.5 text-sm font-black backdrop-blur-xl">
                <CheckCircle2 aria-hidden="true" size={16} />
                {t('notifications.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl">
                {t('notifications.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-indigo-50">
                {t('notifications.description')}
              </p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm font-black text-slate-950 sm:grid-cols-2">
              <p className="rounded-lg border border-white/60 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgb(15_23_42_/_12%)] backdrop-blur-xl">
                <span className="block text-2xl">{unreadCount}</span>
                {t('notifications.unreadCount')}
              </p>
              <p className="rounded-lg border border-white/60 bg-white/24 px-4 py-3 text-white backdrop-blur-xl">
                {t('notifications.safeLinks')}
              </p>
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        {notificationsQuery.isPending ? (
          <NotificationsStatePanel role="status">{t('notifications.loading')}</NotificationsStatePanel>
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
            <NotificationsStatePanel>{t('notifications.empty')}</NotificationsStatePanel>
          ) : (
            <section className="flex flex-col gap-4" aria-label={t('notifications.list')}>
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
