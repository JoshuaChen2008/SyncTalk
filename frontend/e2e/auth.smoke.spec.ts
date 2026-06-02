import { expect, test } from '@playwright/test';

import { discoveryDemoUsers } from '../src/features/discovery/demo/discovery-demo-users';

test.describe('auth smoke', () => {
  test('renders the login page', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByRole('heading', { name: /synctalk/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
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
});
