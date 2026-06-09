import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useCurrentUserQuery, useLogoutMutation } from '../../auth/api/auth-hooks';
import {
  pageContainerClass,
  pageShellClass,
  pageTitleClass,
} from '../../friends/components/friends-page-chrome';
import { useTranslation } from '../../../i18n/i18n-store';
import { LanguageToggle } from '../../../i18n/language-toggle';
import { useThemeStore, type AppTheme } from '../../../stores/theme-store';

function getThemeButtonClass(isActive: boolean) {
  return `btn-3d-base min-h-14 gap-2 px-5 text-base ${
    isActive ? 'btn-3d-green' : 'btn-3d-muted'
  }`;
}

export function SettingsPage() {
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const currentUser = currentUserQuery.data;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate('/auth/login', { replace: true });
  }

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
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
          </section>

          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
              {t('settings.theme.title')}
            </h2>
            <p className="mb-3 text-sm font-bold leading-6 text-graphite">
              {t('settings.theme.description')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                aria-pressed={theme === 'light'}
                className={getThemeButtonClass(theme === 'light')}
                type="button"
                onClick={() => handleThemeChange('light')}
              >
                <Sun aria-hidden="true" size={18} />
                {t('settings.theme.light')}
              </button>
              <button
                aria-pressed={theme === 'dark'}
                className={getThemeButtonClass(theme === 'dark')}
                type="button"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon aria-hidden="true" size={18} />
                {t('settings.theme.dark')}
              </button>
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
              {t('settings.logout.title')}
            </h2>
            <p className="text-sm font-bold leading-6 text-graphite">
              {t('settings.logout.description')}
            </p>
            <div className="py-4">
              <button
                className="btn-3d-base min-h-14 w-full max-w-xs gap-2 bg-[#dc2626] px-6 text-base text-snow-white shadow-[0_4px_0_#991b1b] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={logoutMutation.isPending}
                type="button"
                onClick={handleLogout}
              >
                <LogOut aria-hidden="true" size={18} />
                {logoutMutation.isPending ? t('settings.logout.pending') : t('settings.logout.action')}
              </button>
            </div>
            {logoutMutation.isError ? (
              <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#991b1b]" role="alert">
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
                <div className="rounded-xl bg-[#ddf4ff] px-4 py-3 text-sm font-bold text-sky-blue">
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
