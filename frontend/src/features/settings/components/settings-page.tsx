import { LogOut, Moon, Settings, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useCurrentUserQuery, useLogoutMutation } from '../../auth/api/auth-hooks';
import { useThemeStore, type AppTheme } from '../../../stores/theme-store';

function getThemeButtonClass(isActive: boolean) {
  return `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none ${
    isActive
      ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-[0_14px_30px_rgb(79_70_229_/_22%)]'
      : 'border-white/70 bg-white/72 text-slate-700 hover:bg-white hover:text-slate-950'
  }`;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const currentUser = currentUserQuery.data;
  const isDark = theme === 'dark';
  const heroPanelClass = isDark
    ? 'rounded-lg border border-slate-700 bg-slate-900/78 p-6 shadow-[0_24px_70px_rgb(0_0_0_/_20%)] backdrop-blur-2xl sm:p-8'
    : 'rounded-lg border border-white/70 bg-white/62 p-6 shadow-[0_24px_70px_rgb(49_46_129_/_12%)] backdrop-blur-2xl sm:p-8';
  const cardClass = isDark
    ? 'rounded-lg border border-slate-700 bg-slate-900/82 p-6 shadow-[0_24px_60px_rgb(0_0_0_/_18%)] backdrop-blur-2xl'
    : 'rounded-lg border border-white/70 bg-white/72 p-6 shadow-[0_24px_60px_rgb(49_46_129_/_13%)] backdrop-blur-2xl';

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate('/auth/login', { replace: true });
  }

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className={heroPanelClass}>
          <p className="inline-flex items-center gap-2 rounded-lg bg-white/74 px-3 py-1.5 text-sm font-black text-[#4f46e5] shadow-sm backdrop-blur-xl">
            <Settings aria-hidden="true" size={16} />
            Settings
          </p>
          <h1
            className={`mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal sm:text-6xl ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Settings
          </h1>
          <p
            className={`mt-4 max-w-3xl text-base font-bold leading-7 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Manage your account session and keep the workspace comfortable for focused language
            practice.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-indigo-100 text-[#4f46e5]">
                <UserCircle aria-hidden="true" size={34} />
              </div>
              <div className="min-w-0">
                <h2 className={`truncate text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {currentUser?.username ?? 'Signed-in user'}
                </h2>
                <p className={`mt-1 truncate text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentUser?.email ?? 'Loading account...'}
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
                <span className="block text-xs uppercase text-slate-500">Workspace</span>
                Protected app
              </p>
              <p
                className={`rounded-lg border px-4 py-3 ${
                  isDark ? 'border-slate-700 bg-slate-800/78' : 'border-white/70 bg-white/62'
                }`}
              >
                <span className="block text-xs uppercase text-slate-500">Session</span>
                Cookie secured
              </p>
            </div>
          </article>

          <article className={cardClass}>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Theme
            </h2>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Theme preference is saved on this device and restored after refresh.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                aria-pressed={theme === 'light'}
                className={getThemeButtonClass(theme === 'light')}
                type="button"
                onClick={() => handleThemeChange('light')}
              >
                <Sun aria-hidden="true" size={18} />
                Use light theme
              </button>
              <button
                aria-pressed={theme === 'dark'}
                className={getThemeButtonClass(theme === 'dark')}
                type="button"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon aria-hidden="true" size={18} />
                Use dark theme
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-red-200 bg-red-50/88 p-6 shadow-[0_18px_45px_rgb(127_29_29_/_10%)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-red-950">End this session</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-red-800">
                Logging out clears the current session cookie on the server.
              </p>
            </div>
            <button
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 motion-reduce:transition-none"
              disabled={logoutMutation.isPending}
              type="button"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" size={18} />
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </button>
          </div>
          {logoutMutation.isError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-white/72 px-4 py-3 text-sm font-black text-red-950" role="alert">
              Could not log out. Please try again.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
