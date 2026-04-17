import { test as setup } from '@playwright/test';
import { LoginPage } from '../../helpers/login.page';
import { VALID_USER, LOGIN_PAGE } from '../../config/env';

setup('login and save session', async ({ page }) => {
  await page.goto(LOGIN_PAGE.url);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(VALID_USER.email, VALID_USER.password);
  await page.waitForTimeout(1000);
  await page.context().storageState({
    path: 'storage/auth.json'
  });
});