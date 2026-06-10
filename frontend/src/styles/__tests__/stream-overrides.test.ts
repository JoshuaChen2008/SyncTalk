import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/stream-overrides.css'), 'utf8');

function getCssRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'm'));

  return match?.[1] ?? '';
}

describe('Stream chat style overrides', () => {
  it('keeps the message list as the constrained scroll container', () => {
    const messageListRule = getCssRule('.session-chat-shell .str-chat__message-list');

    expect(messageListRule).toContain('overflow-y: auto');
    expect(messageListRule).toContain('height: 100%');
    expect(messageListRule).toContain('max-height: 100%');
    expect(messageListRule).not.toContain('height: auto');
    expect(messageListRule).not.toContain('max-height: none');
  });

  it('does not bottom-lock the inner message list content', () => {
    const scrollRule = getCssRule('.session-chat-shell .str-chat__message-list-scroll');

    expect(scrollRule).not.toContain('justify-content: flex-end');
  });
});
