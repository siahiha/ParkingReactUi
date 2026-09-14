import { expect, test } from '@playwright/test';

test('login form validates empty credentials', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-submit').click();
  await expect(page.getByText('نام کاربری را وارد کنید.')).toBeVisible();
  await expect(page.getByText('رمز عبور را وارد کنید.')).toBeVisible();
});
