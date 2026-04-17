import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_PAGE, LOGOUT_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class LogoutPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly loginBtn: Locator;
  readonly userProfile: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.email = page.locator(LOGIN_PAGE.email);
    this.password = page.locator(LOGIN_PAGE.password);
    this.loginBtn = page.locator(LOGIN_PAGE.button);
    this.userProfile = page.locator(LOGOUT_PAGE.userProfile);
    this.logoutBtn = page.locator(LOGOUT_PAGE.logoutButton);
  }

  async logout(email: string = '', password: string = '') {
    if (email !== '' && password !== '') {
        await this.page.goto(LOGIN_PAGE.url);
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginBtn.click();

        await expect(this.page.locator('.ant-menu-title-content span').nth(0)).toHaveText('Dashboard');
    }
    await this.userProfile.click();
    await this.logoutBtn.click();
    await super.waitForData();
  }
}