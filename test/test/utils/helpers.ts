import { Page, expect } from '@playwright/test';

export interface UserCredentials {
  username: string;
  password: string;
}

export const login = async (page: Page, credentials: UserCredentials) => {
  await page.fill('input[formControlName="username"]', credentials.username);
  await page.fill('input[formControlName="password"]', credentials.password);
  await page.click('button[nz-button]:has-text("登录")');
  await page.waitForLoadState('networkidle');
};

export const logout = async (page: Page) => {
  await page.click('[nz-dropdown-menu]');
  await page.click('text=退出登录');
  await page.waitForURL('**/login');
};

export const waitForElement = async (
  page: Page,
  selector: string,
  timeout = 5000,
) => {
  await page.waitForSelector(selector, { timeout });
};

export const assertElementVisible = async (page: Page, selector: string) => {
  const isVisible = await page.isVisible(selector);
  if (!isVisible) {
    throw new Error(`Element ${selector} is not visible`);
  }
};
