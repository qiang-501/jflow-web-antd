import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('User Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);
    await page.goto('/main/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display user management page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/users/);
    await expect(page.locator('nz-table')).toBeVisible();
  });

  test('should open create user modal', async ({ page }) => {
    const createButton = page.locator('button:has-text("添加用户")').first();

    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page.locator('.ant-modal')).toBeVisible();
      await expect(
        page.locator('input[formControlName="username"]'),
      ).toBeVisible();
    }
  });

  test('should search for user', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('admin');
      await page.waitForTimeout(500);

      // 验证表格中包含搜索结果
      await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 5000 });
    }
  });

  test('should display user details', async ({ page }) => {
    // 点击第一行的查看按钮
    const viewButton = page.locator('button:has-text("查看")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('.ant-modal')).toBeVisible();
    }
  });
});
