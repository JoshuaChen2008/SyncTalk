import { expect, test } from '@playwright/test';

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
});
