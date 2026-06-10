import { expect, test } from '@playwright/test';

import { discoveryDemoUsers } from '../src/features/discovery/demo/discovery-demo-users';

test.describe('auth smoke', () => {
  test('renders the login page', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByRole('heading', { name: /synctalk/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();

    await page.getByRole('button', { name: /switch language to chinese/i }).click();
    await expect(page.getByRole('heading', { name: '欢迎回来！' })).toBeVisible();

    await page.getByRole('button', { name: '切换到英文' }).click();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('redirects protected app pages to login', async ({ page }) => {
    await page.goto('/app/discover');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('redirects the protected profile page to login', async ({ page }) => {
    await page.goto('/app/profile');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('renders the profile form for a signed-in user', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: '',
            targetLanguage: '',
            languageLevel: '',
            learningGoal: '',
            bio: '',
            timezone: '',
            isProfileComplete: false,
          },
        }),
      });
    });

    await page.goto('/app/profile');

    await expect(page.getByRole('heading', { name: /complete your profile/i })).toBeVisible();
    await expect(page.getByLabel(/native language/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /finish setup/i })).toBeVisible();
  });

  test('renders discover recommendations for a signed-in complete profile', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/users/recommendations', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          users: discoveryDemoUsers,
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });

    await page.goto('/app/discover');

    await expect(page.getByRole('heading', { name: /discover partners/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /sam/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /lina/i })).toBeVisible();
    await expect(page.getByText(/already friends/i)).toBeVisible();
    await expect(page.getByLabel(/search partners/i)).toBeVisible();
  });

  test('persists settings theme and logs out from the app shell', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/app/settings');

    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();
    await expect(page.getByText(/mei@example\.com/i).first()).toBeVisible();

    await page.getByRole('button', { name: /use dark theme/i }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe('dark');

    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe('dark');

    await page
      .getByRole('button', { name: /switch language to chinese/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();

    await page.getByRole('button', { name: '切换到英文' }).first().click();
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();

    await page.getByRole('button', { name: /log out/i }).click();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('shows a permission error when a signed-in user opens chat with a non-friend', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });
    await page.route('**/api/chat/token', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'stream-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        }),
      });
    });
    await page.route('**/api/chat/channel/user-2', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Only friends can chat' }),
      });
    });

    await page.goto('/app/chat/user-2');

    await expect(page.getByRole('heading', { name: /chat unavailable/i })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/only friends can chat/i);
    await expect(page.getByRole('link', { name: /back to friends/i })).toHaveAttribute(
      'href',
      '/app/friends',
    );
  });

  test('shows a permission error when a signed-in user opens call with a non-friend', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });
    await page.route('**/api/call/token', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'video-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        }),
      });
    });
    await page.route('**/api/call/session/user-2', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Only friends can call' }),
      });
    });

    await page.goto('/app/call/user-2');

    await expect(page.getByRole('heading', { name: /call unavailable/i })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/only friends can call/i);
    await expect(page.getByRole('link', { name: /back to chat/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
  });

  test('supports mobile app navigation without horizontal overflow', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (message) => {
      const text = message.text();

      if (message.type() === 'error' && !text.includes('403 (Forbidden)')) {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'synctalk-locale',
        JSON.stringify({ state: { locale: 'zh-CN' }, version: 0 }),
      );
    });
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/users/recommendations', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ users: discoveryDemoUsers }),
      });
    });
    await page.route('**/api/friends', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          friends: [
            {
              id: 'user-2',
              username: 'sam',
              avatar: '',
              nativeLanguage: 'English',
              targetLanguage: 'Japanese',
              languageLevel: 'B2',
              learningGoal: 'Daily conversation',
              bio: 'Evening practice works best.',
              timezone: 'America/New_York',
            },
          ],
        }),
      });
    });
    await page.route('**/api/friends/requests', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          receivedRequests: [],
          sentRequests: [],
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });
    await page.route('**/api/chat/token', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'stream-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        }),
      });
    });
    await page.route('**/api/chat/channel/user-2', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Only friends can chat' }),
      });
    });
    await page.route('**/api/call/token', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'video-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        }),
      });
    });
    await page.route('**/api/call/session/user-2', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Only friends can call' }),
      });
    });
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    const pages = [
      { path: '/app/discover', heading: '发现伙伴' },
      { path: '/app/friends', heading: '你的语言好友' },
      { path: '/app/requests', heading: '好友请求' },
      { path: '/app/notifications', heading: '通知' },
      { path: '/app/profile', heading: '完善你的资料' },
      { path: '/app/settings', heading: '设置' },
      { path: '/app/chat/user-2', heading: '聊天不可用' },
      { path: '/app/call/user-2', heading: '通话不可用' },
    ];

    for (const appPage of pages) {
      await page.goto(appPage.path);
      await expect(page.getByRole('heading', { name: appPage.heading })).toBeVisible();
      await expect(page.getByLabel('移动端应用导航')).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    }

    await expect(page.getByLabel('发现 标签')).toHaveAttribute('href', '/app/discover');
    await expect(page.getByLabel('好友 标签')).toHaveAttribute('href', '/app/friends');
    await expect(page.getByLabel('请求 标签')).toHaveAttribute('href', '/app/requests');
    await expect(page.getByLabel('通知 标签')).toHaveAttribute('href', '/app/notifications');
    await expect(page.getByLabel('设置 标签')).toHaveAttribute('href', '/app/settings');
    expect(consoleErrors).toEqual([]);
  });

  test('keeps the English mobile friends card actions inside the card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'synctalk-locale',
        JSON.stringify({ state: { locale: 'en' }, version: 0 }),
      );
    });
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
        }),
      });
    });
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        }),
      });
    });
    await page.route('**/api/friends', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          friends: [
            {
              id: 'user-2',
              username: 'sam',
              avatar: '',
              nativeLanguage: 'Korean',
              targetLanguage: 'Chinese',
              languageLevel: 'A2',
              learningGoal: 'Travel practice',
              bio: '',
              timezone: 'America/New_York',
            },
          ],
        }),
      });
    });
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          unreadCount: 0,
        }),
      });
    });

    await page.goto('/app/friends');

    await expect(page.getByRole('heading', { name: /your language friends/i })).toBeVisible();

    const card = page.getByRole('article').filter({ hasText: /ready for a language exchange/i });
    const chatAction = page.getByRole('link', { name: /chat with sam/i });
    const callAction = page.getByRole('link', { name: /call sam/i });
    const manageAction = page.getByRole('button', { name: /manage sam/i });
    const actionGroup = chatAction.locator('xpath=..');
    const cta = page.getByRole('link', { name: /find more language partners/i });

    const metrics = await page.evaluate(
      ([cardElement, chatElement, callElement, manageElement, ctaElement, actionGroupElement]) => {
        const cardRect = cardElement.getBoundingClientRect();
        const actionBottom = Math.max(
          chatElement.getBoundingClientRect().bottom,
          callElement.getBoundingClientRect().bottom,
          manageElement.getBoundingClientRect().bottom,
        );
        const ctaRect = ctaElement.getBoundingClientRect();

        return {
          actionBottom,
          borderTopWidth: getComputedStyle(actionGroupElement).borderTopWidth,
          cardBottom: cardRect.bottom,
          ctaTop: ctaRect.top,
          hasHorizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      },
      [
        await card.elementHandle(),
        await chatAction.elementHandle(),
        await callAction.elementHandle(),
        await manageAction.elementHandle(),
        await cta.elementHandle(),
        await actionGroup.elementHandle(),
      ],
    );

    expect(metrics.hasHorizontalOverflow).toBe(false);
    expect(metrics.actionBottom).toBeLessThanOrEqual(metrics.cardBottom);
    expect(metrics.ctaTop).toBeGreaterThan(metrics.actionBottom);
    expect(metrics.borderTopWidth).toBe('0px');
  });
});
