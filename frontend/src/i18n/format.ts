import { translate } from './i18n-store';
import type { AppLocale, TranslationKey } from './translations';

const displayValueKeys: Record<string, TranslationKey> = {
  English: 'option.language.English',
  Japanese: 'option.language.Japanese',
  Korean: 'option.language.Korean',
  Spanish: 'option.language.Spanish',
  French: 'option.language.French',
  German: 'option.language.German',
  Chinese: 'option.language.Chinese',
  Beginner: 'option.level.Beginner',
  Elementary: 'option.level.Elementary',
  Intermediate: 'option.level.Intermediate',
  Advanced: 'option.level.Advanced',
  Fluent: 'option.level.Fluent',
  Travel: 'option.goal.Travel practice',
  Work: 'option.goal.Business communication',
  Culture: 'option.goal.Culture exchange',
  Conversation: 'option.goal.Daily conversation',
  'Travel practice': 'option.value.Travel practice',
  'Business communication': 'option.value.Business communication',
  'Culture exchange': 'option.value.Culture exchange',
  'Daily conversation': 'option.value.Daily conversation',
};

export function translateDisplayValue(locale: AppLocale, value: string) {
  const key = displayValueKeys[value];
  return key ? translate(locale, key) : value;
}

export function formatFriendCount(locale: AppLocale, count: number) {
  return translate(locale, count === 1 ? 'friends.count.one' : 'friends.count.other', { count });
}

export function formatResultSummary(locale: AppLocale, visible: number, total: number) {
  return translate(locale, 'friends.resultSummary', { visible, total });
}

export function formatDateTime(locale: AppLocale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
