import { Page, Locator, expect } from '@playwright/test';
import { USER_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class UserListPage extends BasePage {
    readonly searchInput: Locator;
    readonly clearFilterBtn: Locator;
    readonly createBtn: Locator;
    readonly tableRows: Locator;
    readonly tableColumns: Locator;
    readonly tableColumnsHasSort: Locator;
    readonly editIcons: Locator;
    readonly nextPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly pageSizeDropdown: Locator;
    readonly pageSizeOption: Locator;
    readonly userUpiField: Locator;
    readonly userNameField: Locator;
    readonly userEmailField: Locator;
    readonly userRoleDropdown: Locator;
    readonly userRoleOption: Locator;
    readonly statusToggle: Locator;
    readonly errorMsg: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(USER_LIST_PAGE.searchInput);
        // this.roleTypeDropdown = page.locator(USER_LIST_PAGE.roleTypeDropdown);
        // this.filterBtn = page.locator(USER_LIST_PAGE.filterButton);
        this.clearFilterBtn = page.locator(USER_LIST_PAGE.clearFilterButton);
        this.createBtn = page.locator(USER_LIST_PAGE.createBtn);

        this.tableRows = page.locator(USER_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(USER_LIST_PAGE.tableColumns);
        this.tableColumnsHasSort = page.locator(USER_LIST_PAGE.tableColumnsHasSort);
        this.editIcons = page.locator(USER_LIST_PAGE.editIcons);

        this.nextPageBtn = page.locator(USER_LIST_PAGE.nextPageButton);
        this.prevPageBtn = page.locator(USER_LIST_PAGE.prevPageButton);
        this.pageSizeDropdown = page.locator(USER_LIST_PAGE.pageSizeDropdown);
        this.pageSizeOption = page.locator(USER_LIST_PAGE.pageSizeOption);

        this.userUpiField = page.locator(USER_LIST_PAGE.userUpiField);
        this.userNameField = page.locator(USER_LIST_PAGE.userNameField);
        this.userEmailField = page.locator(USER_LIST_PAGE.userEmailField);
        this.userRoleDropdown = page.locator(USER_LIST_PAGE.userRoleDropdown);
        this.userRoleOption = page.locator(USER_LIST_PAGE.userRoleOption);
        this.statusToggle = page.locator(USER_LIST_PAGE.statusToggle);
        this.errorMsg = page.locator(USER_LIST_PAGE.errorMsg);
        this.backButton = page.locator(USER_LIST_PAGE.backButton);
        this.saveButton = page.locator(USER_LIST_PAGE.saveButton);
    }

    async goto() {
        await super.goto(USER_LIST_PAGE.url);
    }

    async gotoCreate() {
        await this.goto();
        await this.createBtn.click();
        await super.waitForData();
    }

    // Helper method to check placeholder text of a locator
    // This method only used for search input
    async checkPlaceholderText(locator: Locator, text: string) {
        await expect(locator).toHaveAttribute('placeholder', text);
    }

    async search(keyword: string) {
        await this.searchInput.fill(keyword);
        await this.page.keyboard.press('Enter');
        await this.waitForData(USER_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
    }

    async clickEditFirst() {
        await this.editIcons.nth(0).click();
    }

    async clickSortByColumn(columnIndex: number) {
        await this.tableColumns.nth(columnIndex).click();
        await this.waitForData(USER_LIST_PAGE.apiUrl);
    }

    async inputFields(userUpi: string, userName: string, userEmail: string, userRole: string, status: boolean = true) {
        if (userUpi !== '') {
            await this.userUpiField.fill(userUpi);
        }
        if (userName !== '') {
            await this.userNameField.fill(userName);
        }
        if (userEmail !== '') {
            await this.userEmailField.fill(userEmail);
        }
        if (userRole !== '') {
            await this.userRoleDropdown.click();
            await this.userRoleDropdown.fill(userRole);
            await this.waitForData();
            await this.page.locator(USER_LIST_PAGE.userRoleOption + `[title="${userRole}"]`).click();
        }
        if (!status) {
            await this.statusToggle.click();
        }
    }

    async getRoleOptions() {
        const roleOptions = await this.getResponseData(USER_LIST_PAGE.roleListApiUrl);
        return roleOptions.map((option: { name: string }) => option.name);
    }
}