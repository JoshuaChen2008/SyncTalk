import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCallback } from 'react';

import { translations, type AppLocale, type TranslationKey } from './translations';

type TranslationParams = Record<string, string | number>;

type I18nState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
};

export const defaultLocale: AppLocale = 'en';
export const supportedLocales = ['en', 'zh-CN'] as const satisfies AppLocale[];

function interpolate(template: string, params: TranslationParams = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(locale: AppLocale, key: TranslationKey, params?: TranslationParams) {
  const localizedResources = translations[locale] as Partial<Record<TranslationKey, string>>;
  const defaultResources = translations[defaultLocale] as Record<TranslationKey, string>;
  const template = localizedResources[key] ?? defaultResources[key];

  return interpolate(template, params);
}

export function t(key: TranslationKey, params?: TranslationParams) {
  return translate(useI18nStore.getState().locale, key, params);
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale(locale) {
        set({ locale });
      },
      toggleLocale() {
        set((state) => ({ locale: state.locale === 'en' ? 'zh-CN' : 'en' }));
      },
    }),
    {
      name: 'synctalk-locale',
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);

export function useTranslation() {
  const locale = useI18nStore((state) => state.locale);
  const toggleLocale = useI18nStore((state) => state.toggleLocale);
  const setLocale = useI18nStore((state) => state.setLocale);

  return {
    locale,
    setLocale,
    t: useCallback(
      (key: TranslationKey, params?: TranslationParams) => translate(locale, key, params),
      [locale],
    ),
    toggleLocale,
  };
}
