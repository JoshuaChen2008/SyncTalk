import { describe, expect, it } from 'vitest';

import {
  formatDateTime,
  formatFriendCount,
  formatResultSummary,
  translateDisplayValue,
} from '../format';
import { translate } from '../i18n-store';

describe('i18n helpers', () => {
  it('translates stable keys and interpolates parameters', () => {
    expect(translate('zh-CN', 'chat.hero.titleWithName', { name: 'mei' })).toBe('和 mei 聊天');
    expect(translate('en', 'chat.hero.titleWithName', { name: 'mei' })).toBe('Chat with mei');
  });

  it('falls back to English when a Chinese key is missing', () => {
    expect(translate('zh-CN', 'test.onlyEnglish')).toBe('English fallback');
  });

  it('formats counts with the active locale', () => {
    expect(formatFriendCount('en', 1)).toBe('1 friend ready');
    expect(formatFriendCount('en', 2)).toBe('2 friends ready');
    expect(formatFriendCount('zh-CN', 2)).toBe('2 位好友已就绪');
    expect(formatResultSummary('zh-CN', 3, 5)).toBe('显示 3 / 5');
  });

  it('maps persisted values to localized display labels without changing values', () => {
    expect(translateDisplayValue('zh-CN', 'English')).toBe('英语');
    expect(translateDisplayValue('zh-CN', 'Daily conversation')).toBe('日常对话');
    expect(translateDisplayValue('en', 'Daily conversation')).toBe('Daily conversation');
    expect(translateDisplayValue('zh-CN', 'Asia/Tokyo')).toBe('Asia/Tokyo');
  });

  it('formats notification dates using the active locale', () => {
    const value = '2026-06-06T08:30:00.000Z';

    expect(formatDateTime('en', value)).toContain('Jun');
    expect(formatDateTime('zh-CN', value)).toContain('2026');
  });
});
