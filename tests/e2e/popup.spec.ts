import { test, expect } from '@playwright/test';

test.describe('IP Show Popup', () => {
  test('should display popup with title', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('h1')).toContainText('IP Show');
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should expand/collapse details', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('text=展开▼');
    await page.click('text=展开▼');
    await expect(page.locator('text=收起▲')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('text=重新测试');
    await expect(page.locator('text=重新测试')).toBeVisible();
  });
});
