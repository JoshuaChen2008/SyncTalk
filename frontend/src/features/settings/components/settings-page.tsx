import { Check, LogOut, Moon, Sun, Monitor, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useCurrentUserQuery, useLogoutMutation } from '../../auth/api/auth-hooks';
import { useMyProfileQuery } from '../../profile/api/profile-hooks';
import {
  pageContainerClass,
  pageShellClass,
  pageTitleClass,
} from '../../friends/components/friends-page-chrome';
import { useTranslation } from '../../../i18n/i18n-store';
import { LanguageToggle } from '../../../i18n/language-toggle';
import { useThemeStore, type AppTheme } from '../../../stores/theme-store';

function getThemeOptionClass(isActive: boolean) {
  return `theme-option-card group min-h-[13rem] text-left ${isActive ? 'theme-option-card-active' : ''
    }`;
}

function ThemePreview({ variant }: { variant: AppTheme }) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-cloud-gray bg-snow-white p-3">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`h-8 w-8 rounded-xl shadow-[0_3px_0_#46a300] ${variant === 'dark' || variant === 'system' ? 'bg-duo-green' : 'bg-sky-blue'
            }`}
        />
        <span className="h-3 flex-1 rounded-full bg-cloud-gray" />
      </div>
      <div className="grid gap-2 rounded-xl bg-cloud-gray/30 p-2">
        <span className="h-2.5 rounded-full bg-silver/50" />
        <span className="h-2.5 w-2/3 rounded-full bg-silver/50" />
      </div>
    </div>
  );
}

function ThemeOption({
  description,
  icon: Icon,
  isActive,
  label,
  onSelect,
  title,
  variant,
}: {
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onSelect: () => void;
  title: string;
  variant: AppTheme;
}) {
  return (
    <button
      aria-pressed={isActive}
      className={getThemeOptionClass(isActive)}
      type="button"
      onClick={onSelect}
    >
      <span className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-cloud-gray bg-snow-white text-sky-blue shadow-[0_2px_0_var(--color-cloud-gray)]">
          <Icon aria-hidden="true" size={22} strokeWidth={2.6} />
        </span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-sm transition-colors ${isActive
            ? 'border-duo-green bg-duo-green text-white'
            : 'border-cloud-gray text-transparent'
            }`}
        >
          <Check aria-hidden="true" size={16} strokeWidth={3} />
        </span>
      </span>
      <span className="mt-4 block text-lg font-black text-almost-black">
        {title}
      </span>
      <span className="mt-2 block text-sm font-bold leading-6 text-graphite">
        {description}
      </span>
      <span className="sr-only">{label}</span>
      <ThemePreview variant={variant} />
    </button>
  );
}

export function SettingsPage() {
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const profileQuery = useMyProfileQuery();
  const logoutMutation = useLogoutMutation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const currentUser = currentUserQuery.data;
  const [themeSavedMessage, setThemeSavedMessage] = useState('');

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate('/auth/login', { replace: true });
  }

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
    setThemeSavedMessage(t('settings.themeSaved'));
  }

  return (
    <main className={pageShellClass}>
      <div className={`${pageContainerClass} gap-10 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-start md:gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20`}>
        <section className="min-w-0">
          <h1 className={`mb-8 ${pageTitleClass} text-almost-black`}>
            {t('settings.title')}
          </h1>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.signedIn')}
            </h2>
            <div className="flex flex-col justify-between py-4 sm:flex-row sm:items-center">
              <span className="mb-2 text-base font-bold text-graphite sm:mb-0">
                {t('settings.account.userFallback')}
              </span>
              <span className="text-base font-bold text-almost-black">
                {currentUser?.username ?? t('app.user.fallback')}
              </span>
            </div>
            <div className="flex flex-col justify-between py-4 sm:flex-row sm:items-center">
              <span className="mb-2 text-base font-bold text-graphite sm:mb-0">
                {t('settings.session')}
              </span>
              <span className="break-all text-base font-bold text-almost-black">
                {currentUser?.email ?? t('settings.account.loading')}
              </span>
            </div>
            <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-base font-bold text-graphite">
                  {t('settings.profile.title')}
                </span>
                <p className="mt-1 text-sm font-bold text-graphite">
                  {profileQuery.data?.isProfileComplete
                    ? t('settings.profile.complete')
                    : t('settings.profile.incomplete')}
                </p>
              </div>
              <Link
                className="btn-3d-base btn-3d-sky min-h-12 px-5 text-sm"
                to="/app/profile"
              >
                {t('settings.profile.edit')}
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.theme.title')}
            </h2>
            <p className="mb-3 text-sm font-bold leading-6 text-graphite">
              {t('settings.theme.description')}
            </p>
            {themeSavedMessage ? (
              <p className="surface-info mb-4 rounded-xl border-2 border-sky-blue px-4 py-3 text-sm font-bold text-sky-blue" role="status">
                {themeSavedMessage}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <ThemeOption
                description={t('settings.theme.lightDescription')}
                icon={Sun}
                isActive={theme === 'light'}
                label={t('settings.theme.light')}
                title={t('settings.theme.lightTitle')}
                variant="light"
                onSelect={() => handleThemeChange('light')}
              />
              <ThemeOption
                description={t('settings.theme.darkDescription')}
                icon={Moon}
                isActive={theme === 'dark'}
                label={t('settings.theme.dark')}
                title={t('settings.theme.darkTitle')}
                variant="dark"
                onSelect={() => handleThemeChange('dark')}
              />
              <ThemeOption
                description={t('settings.theme.systemDescription')}
                icon={Monitor}
                isActive={theme === 'system'}
                label={t('settings.theme.system')}
                title={t('settings.theme.systemTitle')}
                variant="system"
                onSelect={() => handleThemeChange('system')}
              />


            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.language.title')}
            </h2>
            <p className="mb-4 text-sm font-bold leading-6 text-graphite">
              {t('settings.language.description')}
            </p>
            <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <span className="text-base font-bold text-graphite">
                {t('settings.language.currentLabel')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-almost-black">
                  {locale === 'en' ? t('settings.language.english') : t('settings.language.chinese')}
                </span>
                <LanguageToggle />
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.notifications.title')}
            </h2>
            <p className="text-sm font-bold leading-6 text-graphite">
              {t('settings.notifications.description')}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="card-duo p-4">
                <p className="text-sm font-black text-duo-green">
                  {t('settings.notifications.inAppOn')}
                </p>
                <p className="mt-2 text-xs font-bold leading-5 text-graphite">
                  {t('settings.notifications.mode')}
                </p>
              </div>
              <div className="card-duo p-4">
                <p className="text-sm font-black text-silver">
                  {t('settings.notifications.disabled')}
                </p>
                <p className="mt-2 text-xs font-bold leading-5 text-graphite">
                  {t('settings.notifications.mvpOnly')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.logout.title')}
            </h2>
            <p className="text-sm font-bold leading-6 text-graphite">
              {t('settings.logout.description')}
            </p>
            <div className="py-4">
              <button
                className="btn-3d-base min-h-14 w-full max-w-xs gap-2 bg-[#dc2626] px-6 text-base text-white shadow-[0_4px_0_#991b1b] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={logoutMutation.isPending}
                type="button"
                onClick={handleLogout}
              >
                <LogOut aria-hidden="true" size={18} />
                {logoutMutation.isPending ? t('settings.logout.pending') : t('settings.logout.action')}
              </button>
            </div>
            {logoutMutation.isError ? (
              <p className="surface-error rounded-xl border-2 px-4 py-3 text-sm font-bold" role="alert">
                {t('settings.logout.error')}
              </p>
            ) : null}
          </section>
        </section>

        <aside className="hidden shrink-0 md:block">
          <div className="mb-6 rounded-2xl border-2 border-cloud-gray bg-snow-white p-4">
            <ul className="flex flex-col gap-1">
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-60">
                  {t('settings.signedIn')}
                </div>
              </li>
              <li>
                <div className="surface-info rounded-xl px-4 py-3 text-sm font-bold text-sky-blue">
                  {t('settings.title')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-60">
                  {t('app.nav.notifications')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-60">
                  {t('settings.theme.title')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-60">
                  {t('settings.language.title')}
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-cloud-gray bg-snow-white p-4">
            <h3 className="mb-3 px-4 text-sm font-bold text-graphite">
              {t('settings.notifications.title')}
            </h3>
            <p className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-70">
              {t('settings.notifications.mode')}
            </p>
            <p className="rounded-xl px-4 py-3 text-sm font-bold text-graphite opacity-70">
              {t('settings.notifications.disabled')}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
