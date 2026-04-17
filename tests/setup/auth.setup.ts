import { test as setup } from '@playwright/test';
import { LoginPage } from '../../helpers/login.page';
import { ENV, LOGIN_PAGE } from '../../config/env';

setup('login and save session', async ({ page }) => {
  await page.goto(LOGIN_PAGE.url);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(ENV.username, ENV.password);
  await page.waitForTimeout(1000);
  await page.context().storageState({
    path: 'storage/auth.json'
  });
});