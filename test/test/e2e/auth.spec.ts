import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Authentication Tests', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1:has-text("系统登录")')).toBeVisible();
    await expect(
      page.locator('input[formControlName="username"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[formControlName="password"]'),
    ).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);

    // 验证登录成功后跳转到系统页面
    await expect(page).toHaveURL(/.*\/system/);
  });

  test('should login with user credentials', async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.user);

    // 验证登录成功后跳转到系统页面
    await expect(page).toHaveURL(/.*\/system/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill(
      'input[formControlName="username"]',
      userCredentials.invalidUser.username,
    );
    await page.fill(
      'input[formControlName="password"]',
      userCredentials.invalidUser.password,
    );
    await page.click('button[nz-button]:has-text("登录")');

    // 等待错误消息（根据实际情况调整选择器）
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*\/login/);
  });
});
