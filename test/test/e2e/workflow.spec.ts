import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);
  });

  test('should display workflow management page', async ({ page }) => {
    // 直接导航到工作流管理页面
    await page.goto('/main/workflow');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/workflow/);
  });

  test('should open create workflow modal', async ({ page }) => {
    await page.goto('/main/workflow');
    await page.waitForLoadState('networkidle');

    // 点击创建按钮
    const createButton = page.locator('button:has-text("新建")').first();
    if (await createButton.isVisible()) {
      await createButton.click();

      // 验证模态框出现
      await expect(page.locator('.ant-modal')).toBeVisible();
    }
  });

  test('should display workflow list', async ({ page }) => {
    await page.goto('/main/workflow');
    await page.waitForLoadState('networkidle');

    // 等待表格加载
    await page.waitForSelector('nz-table', { timeout: 5000 });

    // 验证表格可见
    await expect(page.locator('nz-table')).toBeVisible();
  });
});
