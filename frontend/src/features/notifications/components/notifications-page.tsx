import { Bell, CheckCircle2, ExternalLink, Inbox, Trash2, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import {
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  featureCardClass,
  heroContentClass,
  heroDescriptionClass,
  heroEyebrowClass,
  heroHeaderClass,
  heroIconClass,
  heroStatCardClass,
  heroTitleClass,
  pageContainerClass,
  pageShellClass,
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
    <section className={`${featureCardClass} p-6 text-sm font-bold text-graphite`} role={role}>
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
    <article className={`${featureCardClass} grid gap-5 p-5 sm:p-6 md:grid-cols-[auto_1fr_auto]`}>
      <div
        className={
          isUnread
            ? 'grid h-12 w-12 place-items-center rounded-xl bg-duo-green text-snow-white shadow-[0_4px_0_#3f8f01]'
            : 'grid h-12 w-12 place-items-center rounded-xl border-2 border-cloud-gray bg-duo-green-light text-duo-green'
        }
      >
        <Icon aria-hidden="true" size={22} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-heading-sm font-feather text-almost-black">{notification.title}</h2>
          <span
            className={
              isUnread
                ? 'rounded-xl border-2 border-cloud-gray bg-sunshine-yellow/20 px-2.5 py-1 text-xs font-bold text-almost-black'
                : 'rounded-xl border-2 border-cloud-gray bg-duo-green-light px-2.5 py-1 text-xs font-bold text-duo-green'
            }
          >
            {isUnread ? t('notifications.unread') : t('notifications.read')}
          </span>
        </div>
        <p className="mt-2 text-sm font-bold leading-6 text-charcoal">{notification.content}</p>
        <p className="mt-3 text-xs font-bold text-graphite">
          {formatDateTime(locale, notification.createdAt)}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:min-w-44">
        {safeHref ? (
          <Link
            aria-label={t('notifications.openName', { title: notification.title })}
            className="btn-3d-base btn-3d-green min-h-11 gap-2 px-4 text-sm"
            to={safeHref}
          >
            <ExternalLink aria-hidden="true" size={17} />
            {t('notifications.open')}
          </Link>
        ) : (
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-center text-sm font-bold text-[#b91c1c] shadow-[0_3px_0_#fecaca]">
            {t('notifications.invalidTarget')}
          </p>
        )}

        {isUnread ? (
          <button
            aria-label={t('notifications.markReadName', { title: notification.title })}
            className="btn-3d-base btn-3d-sky min-h-11 cursor-pointer gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
    <main className={pageShellClass}>
      <DiscoverStyleBackground />

      <div className={`relative ${pageContainerClass}`}>
        <header className={heroHeaderClass}>
          <section className={heroContentClass}>
            <div className="flex items-center gap-3">
              <span className={heroIconClass}>
                <Bell aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-bold uppercase text-graphite">
                {t('app.nav.notifications')}
              </span>
            </div>

            <div>
              <p className={heroEyebrowClass}>
                <CheckCircle2 aria-hidden="true" size={16} />
                {t('notifications.badge')}
              </p>
              <h1 className={heroTitleClass}>
                {t('notifications.title')}
              </h1>
              <p className={heroDescriptionClass}>
                {t('notifications.description')}
              </p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm font-bold text-charcoal sm:grid-cols-2">
              <p className={heroStatCardClass}>
                <span className="block text-heading-sm font-feather text-duo-green">{unreadCount}</span>
                {t('notifications.unreadCount')}
              </p>
              <p className={heroStatCardClass}>
                {t('notifications.safeLinks')}
              </p>
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        <section className={`${featureCardClass} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}>
          <div>
            <p className="text-xs font-black uppercase text-sky-blue">{t('notifications.inbox')}</p>
            <p className="mt-1 text-sm font-bold text-graphite">
              {t('notifications.inboxDescription')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              aria-label={t('notifications.markVisibleName')}
              className="btn-3d-base btn-3d-green min-h-11 gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              <CheckCircle2 aria-hidden="true" size={17} />
              {t('notifications.markVisible')}
            </button>
            <button
              aria-label={t('notifications.deleteVisibleName')}
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 text-sm font-black text-[#b91c1c] opacity-60 shadow-[0_4px_0_#fecaca]"
              disabled
              type="button"
            >
              <Trash2 aria-hidden="true" size={17} />
              {t('notifications.deleteVisible')}
            </button>
          </div>
        </section>

        {notificationsQuery.isPending ? (
          <NotificationsStatePanel role="status">{t('notifications.loading')}</NotificationsStatePanel>
        ) : null}

        {notificationsQuery.isError ? (
          <NotificationsStatePanel role="alert">
            {getNotificationsApiErrorMessage(notificationsQuery.error)}
          </NotificationsStatePanel>
        ) : null}

        {markReadMutation.isError ? (
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-bold text-[#b91c1c]" role="alert">
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
