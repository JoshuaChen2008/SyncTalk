import type { ReactNode } from 'react';

import { LanguageToggle } from '../../../i18n/language-toggle';
import { useTranslation } from '../../../i18n/i18n-store';

type AuthShellProps = {
  children: ReactNode;
};

// Figma 登录稿里的周围插画被抽成纯装饰层，登录/注册表单只关心 children 内容。
const visualCards = [
  'auth-visual-card auth-visual-card-tv',
  'auth-visual-card auth-visual-card-eye',
  'auth-visual-card auth-visual-card-glasses',
  'auth-visual-card auth-visual-card-ui',
  'auth-visual-card auth-visual-card-soft',
  'auth-visual-card auth-visual-card-device',
];

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#fbfbfa] text-slate-950">
      {/* 装饰图形不参与交互和读屏，避免影响表单可访问性。 */}
      <section className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {visualCards.map((className) => (
          <div className={className} key={className} />
        ))}
      </section>

      <section className="relative z-10 flex min-h-screen w-full flex-col px-4 pt-20 pb-10 sm:px-6 lg:pt-32">
        <div className="absolute right-4 top-4 sm:right-6">
          <LanguageToggle compact />
        </div>
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-5xl font-black tracking-[0.28em] text-indigo-600 sm:text-6xl">
            SYNCTALK
          </h1>
          <p className="mt-4 text-sm font-bold uppercase text-red-700">
            {t('auth.shell.tagline')}
          </p>
        </div>

        {/* 登录页和注册页共享同一个品牌外壳，只替换中间卡片内容。 */}
        <div className="mx-auto mt-14 w-full max-w-[512px]">{children}</div>

        <footer className="mt-auto flex flex-col items-center gap-3 border-t border-indigo-100 pt-6 text-xs font-semibold text-slate-500 sm:flex-row sm:justify-between">
          <span className="text-xl font-black text-indigo-600">SyncTalk</span>
          <span>{t('auth.shell.footerStatus')}</span>
          <nav className="flex gap-5" aria-label={t('auth.shell.footerNav')}>
            <a className="hover:text-indigo-600" href="/auth/login">
              {t('auth.shell.privacy')}
            </a>
            <a className="hover:text-indigo-600" href="/auth/login">
              {t('auth.shell.terms')}
            </a>
            <a className="hover:text-indigo-600" href="/auth/login">
              {t('auth.shell.apiDocs')}
            </a>
            <a className="hover:text-indigo-600" href="/auth/login">
              {t('auth.shell.status')}
            </a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
