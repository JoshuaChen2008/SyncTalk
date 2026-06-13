import { useTranslation } from './i18n-store';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, t, toggleLocale } = useTranslation();
  const isEnglish = locale === 'en';
  const label = isEnglish ? '中' : 'Eng';
  const ariaLabel = isEnglish
    ? t('app.language.switchToChinese')
    : t('app.language.switchToEnglish');

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={!isEnglish}
      className={`grid shrink-0 cursor-pointer place-items-center border-2 border-cloud-gray bg-snow-white font-black text-sky-blue shadow-[0_3px_0_var(--color-cloud-gray)] transition-colors hover:bg-cloud-gray/20 hover:text-duo-green focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 motion-reduce:transition-none ${
        compact ? 'h-10 w-10 rounded-2xl' : 'h-14 w-14 rounded-[1.25rem]'
      }`}
      type="button"
      onClick={toggleLocale}
    >
      <span aria-hidden="true" className={compact ? 'text-base leading-none' : 'text-lg leading-none'}>
        {label}
      </span>
    </button>
  );
}
