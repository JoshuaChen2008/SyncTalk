import type { ReactNode } from 'react';

import { LanguageToggle } from '../../../i18n/language-toggle';
import { useTranslation } from '../../../i18n/i18n-store';

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen flex text-almost-black bg-snow-white">
      {/* Left Illustration Section */}
      <section className="hidden lg:flex w-1/2 bg-duo-green-light flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, var(--color-duo-green) 2px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-display font-feather text-duo-green">
            SYNCTALK
          </h1>
          <p className="mt-6 text-heading-sm font-bold text-duo-green uppercase tracking-wider">
            {t('auth.shell.tagline')}
          </p>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex-1 flex flex-col pt-8 pb-10 px-4 sm:px-12 md:px-24">
        <div className="flex justify-end">
          <LanguageToggle compact />
        </div>
        
        <div className="flex-1 flex items-center justify-center mt-10 lg:mt-0">
          <div className="w-full max-w-md">
            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-heading-lg font-feather text-duo-green">
                SYNCTALK
              </h1>
              <p className="mt-2 text-body font-bold text-almost-black uppercase">
                {t('auth.shell.tagline')}
              </p>
            </div>
            
            {children}
          </div>
        </div>

        <footer className="mt-12 flex flex-col items-center gap-3 border-t-2 border-cloud-gray pt-6 text-caption font-bold text-graphite sm:flex-row sm:justify-between">
          <span className="font-feather text-heading-sm text-almost-black">SyncTalk</span>
          <span>{t('auth.shell.footerStatus')}</span>
          <nav className="flex gap-4" aria-label={t('auth.shell.footerNav')}>
            <a className="hover:text-duo-green transition-colors" href="/auth/login">
              {t('auth.shell.privacy')}
            </a>
            <a className="hover:text-duo-green transition-colors" href="/auth/login">
              {t('auth.shell.terms')}
            </a>
            <a className="hover:text-duo-green transition-colors" href="/auth/login">
              {t('auth.shell.status')}
            </a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
