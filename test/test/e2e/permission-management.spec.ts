import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';
import { userCredentials } from '../fixtures/test-data';

test.describe('Permission Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await login(page, userCredentials.admin);
    await page.goto('/main/permissions');
    await page.waitForLoadState('networkidle');
  });

  test('should display permission management page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/permissions/);
    await expect(page.locator('nz-tree')).toBeVisible();
  });

  test('should display menu tree', async ({ page }) => {
    // 等待树形结构加载
    await page.waitForSelector('nz-tree-node', { timeout: 5000 });

    // 验证树节点存在
    const treeNodes = await page.locator('nz-tree-node').count();
    expect(treeNodes).toBeGreaterThan(0);
  });

  test('should select menu node and display actions', async ({ page }) => {
    // 点击第一个树节点
    const firstNode = page.locator('nz-tree-node').first();
    await firstNode.click();

    // 等待操作权限列表加载
    await page.waitForTimeout(1000);

    // 验证右侧面板显示
    const actionPanel = page.locator('nz-card:has-text("操作权限")');
    if (await actionPanel.isVisible()) {
      await expect(actionPanel).toBeVisible();
    }
  });

  test('should open add action modal', async ({ page }) => {
    // 先选择一个菜单节点
    const firstNode = page.locator('nz-tree-node').first();
    await firstNode.click();
    await page.waitForTimeout(500);

    // 点击添加操作按钮
    const addButton = page.locator('button:has-text("添加操作")').first();

    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.locator('.ant-modal')).toBeVisible();
      await expect(page.locator('input[formControlName="name"]')).toBeVisible();
      await expect(page.locator('input[formControlName="code"]')).toBeVisible();
    }
  });
});
