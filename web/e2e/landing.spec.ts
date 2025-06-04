import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/open\/actuaries/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Actuarial',
  );
});
