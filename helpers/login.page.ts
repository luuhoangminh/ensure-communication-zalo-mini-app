import { Page, Locator, expect, request } from '@playwright/test';
import { API, LOGIN_PAGE, LOGOUT_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly loginBtn: Locator;
  readonly remember: Locator;
  readonly eyeIcon: Locator;
  readonly errorMsg: Locator;
  readonly errorMsgPass: Locator;
  readonly errorMsgUser: Locator;
  readonly forgotPasswordLink: Locator;
  readonly emailForgotPasswordInput: Locator;
//   readonly captcha: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.email = page.locator(LOGIN_PAGE.email);
    this.password = page.locator(LOGIN_PAGE.password);
    this.loginBtn = page.locator(LOGIN_PAGE.button);
    this.remember = page.locator(LOGIN_PAGE.rememberMe);
    this.eyeIcon = page.locator(LOGIN_PAGE.eyeIcon);
    this.errorMsg = page.locator(LOGIN_PAGE.errorMsg);
    this.errorMsgPass = page.locator(LOGIN_PAGE.errorMsgPass);
    this.errorMsgUser = page.locator(LOGIN_PAGE.errorMsgUser);
    this.forgotPasswordLink = page.locator(LOGIN_PAGE.forgotPasswordLink);
    this.emailForgotPasswordInput = page.locator(LOGIN_PAGE.emailForgotPasswordInput);
    // this.captcha = page.locator('.captcha');
  }

  async goto() {
    await super.goto(LOGIN_PAGE.url);
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginBtn.click();
    await super.waitForData();
  }

  async verifyLogin() {
    await expect(this.page.locator('.ant-menu-title-content span').nth(0)).toHaveText('Dashboard');
    await super.waitForData();
    await this.page.locator(LOGOUT_PAGE.userProfile).click();

    const response = await this.getResponseData(API.myProfile);
    await expect(this.page.locator(LOGOUT_PAGE.username)).toHaveText(response.profile.full_name);
    await expect(this.page.locator(LOGOUT_PAGE.role)).toHaveText(response.user_roles[0].role.name);
  }
}