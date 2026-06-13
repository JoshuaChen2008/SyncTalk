import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

type ThemeState = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveAppTheme(theme: AppTheme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function applyAppTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = resolveAppTheme(theme);
}

let removeSystemThemeListener: (() => void) | null = null;

export function watchSystemTheme(theme: AppTheme) {
  removeSystemThemeListener?.();
  removeSystemThemeListener = null;

  if (theme !== 'system' || typeof window === 'undefined') {
    return;
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    applyAppTheme('system');
  };

  mediaQuery.addEventListener('change', handleChange);

  removeSystemThemeListener = () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme(theme) {
        applyAppTheme(theme);
        watchSystemTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'synctalk-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyAppTheme(state.theme);
          watchSystemTheme(state.theme);
        }
      },
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
