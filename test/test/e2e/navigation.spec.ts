import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await login(page, userCredentials.admin);
    // 确保登录完成并加载侧边栏
    await page.waitForLoadState('networkidle');
  });

  test('should display main navigation menu', async ({ page }) => {
    // 验证侧边栏菜单可见
    await expect(page.locator('nz-sider')).toBeVisible();
  });

  test('should navigate to user management', async ({ page }) => {
    // 直接导航到用户管理页面
    await page.goto('/main/users');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/users/);
  });

  test('should navigate to role management', async ({ page }) => {
    // 直接导航到角色管理页面
    await page.goto('/main/roles');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/roles/);
  });

  test('should navigate to permission management', async ({ page }) => {
    // 直接导航到权限管理页面
    await page.goto('/main/permissions');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/permissions/);
  });

  test('should navigate using browser back button', async ({ page }) => {
    // 导航到用户管理
    await page.goto('/main/users');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/users/);

    // 使用后退按钮
    await page.goBack();
    await expect(page).toHaveURL(/.*\/system/);
  });
});
