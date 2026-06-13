import { Monitor, Moon, Sun } from 'lucide-react';

import { useTranslation } from '../../i18n/i18n-store';
import { useThemeStore, type AppTheme } from '../../stores/theme-store';

const themeCycle: Record<AppTheme, AppTheme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

function getThemeLabelKey(theme: AppTheme) {
  if (theme === 'dark') {
    return 'app.theme.switchToDark';
  }

  if (theme === 'system') {
    return 'app.theme.switchToSystem';
  }

  return 'app.theme.switchToLight';
}

export function ThemeModeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const nextTheme = themeCycle[theme];
  const Icon = themeIcons[theme];

  return (
    <button
      aria-label={t(getThemeLabelKey(nextTheme))}
      aria-pressed={theme !== 'light'}
      className={`group grid shrink-0 cursor-pointer place-items-center border-2 border-cloud-gray bg-snow-white text-sky-blue shadow-[0_3px_0_var(--color-cloud-gray)] transition-colors hover:bg-cloud-gray/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30 motion-reduce:transition-none ${
        compact ? 'h-10 w-10 rounded-2xl' : 'h-14 w-14 rounded-[1.25rem]'
      }`}
      type="button"
      onClick={() => setTheme(nextTheme)}
    >
      <Icon
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        size={compact ? 22 : 27}
        strokeWidth={2.7}
      />
    </button>
  );
}
