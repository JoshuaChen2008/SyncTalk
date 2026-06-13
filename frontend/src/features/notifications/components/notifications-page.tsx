import { CheckCircle2, ExternalLink, Inbox, Trash2, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import {
  featureCardClass,
  pageContainerClass,
  pageShellClass,
  pageTitleClass,
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
    <article className={`${featureCardClass} relative p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#e5e5e5] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6`}>
      {isUnread ? (
        <span
          aria-hidden="true"
          className="absolute right-6 top-6 h-3 w-3 rounded-full bg-sky-blue md:right-8 md:top-8"
        />
      ) : null}

      <div className="flex gap-4">
      <div
        className={
          isUnread
            ? 'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-sky-blue bg-[#ddf4ff] text-sky-blue md:h-14 md:w-14'
            : 'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-cloud-gray bg-duo-green-light text-duo-green md:h-14 md:w-14'
        }
      >
        <Icon aria-hidden="true" size={24} />
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-black text-almost-black md:text-2xl">{notification.title}</h2>
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
        <p className="mt-2 text-xs font-bold text-silver">
          {formatDateTime(locale, notification.createdAt)}
        </p>
        <p className="mt-3 text-base font-bold leading-6 text-graphite">{notification.content}</p>

        <div className="mt-5 flex flex-wrap gap-3">
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
          <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c] shadow-[0_3px_0_#fecaca]">
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
      </div>
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
      <div className={pageContainerClass}>
        <header className="flex flex-col gap-4 border-b-2 border-gray-100 pb-6 md:min-h-[104px] md:flex-row md:items-end md:justify-between">
            <div>
            <h1 className={`mb-2 ${pageTitleClass} text-duo-green [text-shadow:2px_2px_0_#58a700]`}>
                {t('notifications.title')}
              </h1>
            <p className="text-base font-bold text-graphite">
                {t('notifications.description')}
              </p>
            </div>

          <div className="flex flex-wrap gap-3">
            <button
              aria-label={t('notifications.markVisibleName')}
              className="btn-3d-base btn-3d-green min-h-11 gap-2 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              <CheckCircle2 aria-hidden="true" size={17} />
              {t('notifications.markVisible')}
            </button>
            <button
              aria-label={t('notifications.deleteVisibleName')}
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#ff4b4b] px-5 text-sm font-black text-white opacity-60 shadow-[0_4px_0_#ea2b2b]"
              disabled
              type="button"
            >
              <Trash2 aria-hidden="true" size={17} />
              {t('notifications.deleteVisible')}
            </button>
          </div>
        </header>

        <section className="card-duo flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase text-sky-blue">{t('notifications.inbox')}</p>
            <p className="mt-1 text-sm font-bold text-graphite">
              {t('notifications.inboxDescription')}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-sky-blue/10 bg-sky-blue/10 px-4 py-2 font-black text-sky-blue">
            {unreadCount} {t('notifications.unreadCount')}
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
