import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';

type ThemeState = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

export function applyAppTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme(theme) {
        applyAppTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'synctalk-theme',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
