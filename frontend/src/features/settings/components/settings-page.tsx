import { LogOut, Moon, Settings, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useCurrentUserQuery, useLogoutMutation } from '../../auth/api/auth-hooks';
import {
  discoverGlassPanel,
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
} from '../../friends/components/friends-page-chrome';
import { useTranslation } from '../../../i18n/i18n-store';
import { LanguageToggle } from '../../../i18n/language-toggle';
import { useThemeStore, type AppTheme } from '../../../stores/theme-store';

function getThemeButtonClass(isActive: boolean) {
  return `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
    isActive
      ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-[0_14px_30px_rgb(79_70_229_/_22%)]'
      : 'border-white/70 bg-white/72 text-slate-700 hover:bg-white hover:text-slate-950'
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
    ? 'rounded-lg border border-slate-700 bg-slate-900/82 p-6 shadow-[0_24px_60px_rgb(0_0_0_/_18%)] backdrop-blur-2xl'
    : `${discoverGlassPanel} rounded-lg p-6`;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate('/auth/login', { replace: true });
  }

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef2ff] px-4 py-5 text-slate-950 sm:px-8">
      <DiscoverStyleBackground />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className={`grid overflow-hidden rounded-lg ${discoverGlassPanel} lg:grid-cols-[1.1fr_0.9fr]`}>
          <section className="flex min-h-[21rem] flex-col justify-between gap-8 bg-[#4f46e5]/70 p-6 text-white backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/70 bg-[#22c55e]/72 text-slate-950 shadow-[0_14px_28px_rgb(34_197_94_/_28%)] backdrop-blur-xl">
                <Settings aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-black uppercase tracking-normal">
                {t('settings.title')}
              </span>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/55 bg-white/18 px-3 py-1.5 text-sm font-black backdrop-blur-xl">
                <UserCircle aria-hidden="true" size={16} />
                {t('settings.badge')}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl">
                {t('settings.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-indigo-50">
                {t('settings.description')}
              </p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm font-black text-slate-950 sm:grid-cols-2">
              <p className="rounded-lg border border-white/60 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgb(15_23_42_/_12%)] backdrop-blur-xl">
                <span className="block text-2xl">{currentUser?.username ?? t('app.user.fallback')}</span>
                {t('settings.signedIn')}
              </p>
              <p className="rounded-lg border border-white/60 bg-white/24 px-4 py-3 text-white backdrop-blur-xl">
                {t('settings.themeSaved')}
              </p>
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-indigo-100 text-[#4f46e5]">
                <UserCircle aria-hidden="true" size={34} />
              </div>
              <div className="min-w-0">
                <h2 className={`truncate text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {currentUser?.username ?? t('settings.account.userFallback')}
                </h2>
                <p className={`mt-1 truncate text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentUser?.email ?? t('settings.account.loading')}
                </p>
              </div>
            </div>
            <div
              className={`mt-6 grid gap-3 text-sm font-black sm:grid-cols-2 ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              <p
                className={`rounded-lg border px-4 py-3 ${
                  isDark ? 'border-slate-700 bg-slate-800/78' : 'border-white/70 bg-white/62'
                }`}
              >
                <span className="block text-xs uppercase text-slate-500">
                  {t('settings.workspace')}
                </span>
                {t('settings.protectedApp')}
              </p>
              <p
                className={`rounded-lg border px-4 py-3 ${
                  isDark ? 'border-slate-700 bg-slate-800/78' : 'border-white/70 bg-white/62'
                }`}
              >
                <span className="block text-xs uppercase text-slate-500">
                  {t('settings.session')}
                </span>
                {t('settings.cookieSecured')}
              </p>
            </div>
          </article>

          <article className={cardClass}>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {t('settings.theme.title')}
            </h2>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
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
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {t('settings.language.title')}
            </h2>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t('settings.language.description')}
            </p>
            <p
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-black ${
                isDark
                  ? 'border-slate-700 bg-slate-800/78 text-slate-200'
                  : 'border-white/70 bg-white/62 text-slate-700'
              }`}
            >
              <span className="block text-xs uppercase text-slate-500">
                {t('settings.language.currentLabel')}
              </span>
              {locale === 'en' ? t('settings.language.english') : t('settings.language.chinese')}
            </p>
            <div className="mt-5">
              <LanguageToggle />
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-red-200 bg-red-50/88 p-6 shadow-[0_18px_45px_rgb(127_29_29_/_10%)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-red-950">{t('settings.logout.title')}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-red-800">
                {t('settings.logout.description')}
              </p>
            </div>
            <button
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 motion-reduce:transition-none"
              disabled={logoutMutation.isPending}
              type="button"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" size={18} />
              {logoutMutation.isPending ? t('settings.logout.pending') : t('settings.logout.action')}
            </button>
          </div>
          {logoutMutation.isError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-white/72 px-4 py-3 text-sm font-black text-red-950" role="alert">
              {t('settings.logout.error')}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
