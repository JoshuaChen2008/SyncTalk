import { Languages } from 'lucide-react';

import { useTranslation } from './i18n-store';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, t, toggleLocale } = useTranslation();
  const isEnglish = locale === 'en';
  const label = isEnglish ? t('app.language.toggleToChinese') : t('app.language.toggleToEnglish');
  const ariaLabel = isEnglish
    ? t('app.language.switchToChinese')
    : t('app.language.switchToEnglish');

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={!isEnglish}
      className={
        compact
          ? 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 px-3 text-sm font-black text-[#4f46e5] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none'
          : 'inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-lg border border-indigo-100 bg-white text-sm font-black text-slate-700 shadow-[0_12px_28px_rgb(79_70_229_/_10%)] transition hover:bg-indigo-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 motion-reduce:transition-none'
      }
      type="button"
      onClick={toggleLocale}
    >
      <Languages aria-hidden="true" size={compact ? 17 : 18} />
      {label}
    </button>
  );
}
