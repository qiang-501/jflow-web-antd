import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Role Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);
    await page.goto('/main/roles');
    await page.waitForLoadState('networkidle');
  });

  test('should display role management page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/roles/);
    await expect(page.locator('nz-table')).toBeVisible();
  });

  test('should open create role modal', async ({ page }) => {
    const createButton = page.locator('button:has-text("添加角色")').first();

    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page.locator('.ant-modal')).toBeVisible();
      await expect(page.locator('input[formControlName="name"]')).toBeVisible();
    }
  });

  test('should display role list', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('tbody tr', { timeout: 5000 });

    // 验证至少有一个角色
    const roleCount = await page.locator('tbody tr').count();
    expect(roleCount).toBeGreaterThan(0);
  });

  test('should open edit role modal', async ({ page }) => {
    const editButton = page.locator('button:has-text("编辑")').first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('.ant-modal')).toBeVisible();
      await expect(page.locator('input[formControlName="name"]')).toBeVisible();
    }
  });
});
