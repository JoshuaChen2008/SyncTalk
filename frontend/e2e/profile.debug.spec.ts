import { expect, test } from '@playwright/test';

test('debug profile page with mocked login', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-1',
          username: 'demo',
          email: 'demo@example.com',
        },
      }),
    });
  });

  await page.route('**/api/profile/me', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'demo',
            email: 'demo@example.com',
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
      return;
    }

    if (method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'user-1',
            username: 'demo',
            email: 'demo@example.com',
            avatar: '',
            nativeLanguage: 'Chinese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Business communication',
            bio: '',
            timezone: 'Asia/Shanghai',
            isProfileComplete: true,
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/app/profile');

  await expect(page.getByRole('heading', { name: /complete your profile/i })).toBeVisible();

  await page.pause();
});
