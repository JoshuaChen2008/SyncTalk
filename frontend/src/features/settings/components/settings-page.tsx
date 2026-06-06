import { LogOut, Moon, Settings, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useCurrentUserQuery, useLogoutMutation } from '../../auth/api/auth-hooks';
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
import { useTranslation } from '../../../i18n/i18n-store';
import { LanguageToggle } from '../../../i18n/language-toggle';
import { useThemeStore, type AppTheme } from '../../../stores/theme-store';

function getThemeButtonClass(isActive: boolean) {
  return `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 motion-reduce:transition-none ${
    isActive
      ? 'border-duo-green bg-duo-green text-snow-white shadow-[0_4px_0_#3f8f01]'
      : 'border-cloud-gray bg-snow-white text-charcoal hover:bg-cloud-gray/20'
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
  const isDark = theme === 'dark';
  const cardClass = isDark
    ? 'rounded-xl border-2 border-charcoal bg-almost-black p-6 text-snow-white'
    : `${featureCardClass} p-6`;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate('/auth/login', { replace: true });
  }

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
  }

  return (
    <main className={pageShellClass}>
      <DiscoverStyleBackground />
      <div className={`relative ${pageContainerClass}`}>
        <header className={heroHeaderClass}>
          <section className={heroContentClass}>
            <div className="flex items-center gap-3">
              <span className={heroIconClass}>
                <Settings aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-bold uppercase text-graphite">
                {t('settings.title')}
              </span>
            </div>

            <div>
              <p className={heroEyebrowClass}>
                <UserCircle aria-hidden="true" size={16} />
                {t('settings.badge')}
              </p>
              <h1 className={heroTitleClass}>
                {t('settings.title')}
              </h1>
              <p className={heroDescriptionClass}>
                {t('settings.description')}
              </p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm font-bold text-charcoal sm:grid-cols-2">
              <p className={heroStatCardClass}>
                <span className="block text-heading-sm font-feather text-duo-green">{currentUser?.username ?? t('app.user.fallback')}</span>
                {t('settings.signedIn')}
              </p>
              <p className={heroStatCardClass}>
                {t('settings.themeSaved')}
              </p>
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-xl border-2 border-cloud-gray bg-sky-blue/10 text-sky-blue shadow-[0_4px_0_#e5e5e5]">
                <UserCircle aria-hidden="true" size={34} />
              </div>
              <div className="min-w-0">
                <h2 className={`truncate text-heading-sm font-feather ${isDark ? 'text-snow-white' : 'text-almost-black'}`}>
                  {currentUser?.username ?? t('settings.account.userFallback')}
                </h2>
                <p className={`mt-1 truncate text-sm font-bold ${isDark ? 'text-cloud-gray' : 'text-graphite'}`}>
                  {currentUser?.email ?? t('settings.account.loading')}
                </p>
              </div>
            </div>
            <div
              className={`mt-6 grid gap-3 text-sm font-black sm:grid-cols-2 ${
                isDark ? 'text-cloud-gray' : 'text-charcoal'
              }`}
            >
              <p
                className={`rounded-xl border-2 px-4 py-3 ${
                  isDark ? 'border-charcoal bg-charcoal' : 'border-cloud-gray bg-snow-white'
                }`}
              >
                <span className={`block text-xs uppercase ${isDark ? 'text-silver' : 'text-graphite'}`}>
                  {t('settings.workspace')}
                </span>
                {t('settings.protectedApp')}
              </p>
              <p
                className={`rounded-xl border-2 px-4 py-3 ${
                  isDark ? 'border-charcoal bg-charcoal' : 'border-cloud-gray bg-snow-white'
                }`}
              >
                <span className={`block text-xs uppercase ${isDark ? 'text-silver' : 'text-graphite'}`}>
                  {t('settings.session')}
                </span>
                {t('settings.cookieSecured')}
              </p>
            </div>
          </article>

          <article className={cardClass}>
            <h2 className={`text-heading-sm font-feather ${isDark ? 'text-snow-white' : 'text-almost-black'}`}>
              {t('settings.theme.title')}
            </h2>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                isDark ? 'text-cloud-gray' : 'text-graphite'
              }`}
            >
              {t('settings.theme.description')}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
          </article>

          <article className={cardClass}>
            <h2 className={`text-heading-sm font-feather ${isDark ? 'text-snow-white' : 'text-almost-black'}`}>
              {t('settings.language.title')}
            </h2>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                isDark ? 'text-cloud-gray' : 'text-graphite'
              }`}
            >
              {t('settings.language.description')}
            </p>
            <p
              className={`mt-5 rounded-xl border-2 px-4 py-3 text-sm font-bold ${
                isDark
                  ? 'border-charcoal bg-charcoal text-cloud-gray'
                  : 'border-cloud-gray bg-snow-white text-charcoal'
              }`}
            >
              <span className={`block text-xs uppercase ${isDark ? 'text-silver' : 'text-graphite'}`}>
                {t('settings.language.currentLabel')}
              </span>
              {locale === 'en' ? t('settings.language.english') : t('settings.language.chinese')}
            </p>
            <div className="mt-5">
              <LanguageToggle />
            </div>
          </article>
        </section>

        <section className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-heading-sm font-feather text-[#991b1b]">{t('settings.logout.title')}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-red-800">
                {t('settings.logout.description')}
              </p>
            </div>
            <button
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#dc2626] px-5 text-sm font-bold text-snow-white shadow-[0_4px_0_#991b1b] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 motion-reduce:transition-none"
              disabled={logoutMutation.isPending}
              type="button"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" size={18} />
              {logoutMutation.isPending ? t('settings.logout.pending') : t('settings.logout.action')}
            </button>
          </div>
          {logoutMutation.isError ? (
            <p className="mt-4 rounded-xl border-2 border-[#fecaca] bg-snow-white px-4 py-3 text-sm font-bold text-[#991b1b]" role="alert">
              {t('settings.logout.error')}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
