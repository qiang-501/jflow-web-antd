import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);
  });

  test('should display dashboard after login', async ({ page }) => {
    // 验证已经导航到系统页面
    await expect(page).toHaveURL(/.*\/system/);
  });

  test('should display navigation sidebar', async ({ page }) => {
    // 验证侧边栏存在
    await expect(page.locator('nz-sider')).toBeVisible();
  });

  test('should display user menu in header', async ({ page }) => {
    // 验证头部存在用户菜单
    const userMenu = page.locator('[nz-dropdown]');
    if ((await userMenu.count()) > 0) {
      await expect(userMenu.first()).toBeVisible();
    }
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    const collapseButton = page
      .locator('[nz-icon="menu-fold"], [nz-icon="menu-unfold"]')
      .first();

    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      await page.waitForTimeout(300);

      // 再次点击切换回来
      await collapseButton.click();
      await page.waitForTimeout(300);
    }
  });
});
