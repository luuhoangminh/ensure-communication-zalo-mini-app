import { Page, Locator, expect } from '@playwright/test';
import { ROLE_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class RoleListPage extends BasePage {
    readonly searchInput: Locator;
    // readonly roleTypeDropdown: Locator;
    // readonly filterBtn: Locator;
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
    readonly roleNameField: Locator;
    readonly roleCodeField: Locator;
    readonly errorMsg: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(ROLE_LIST_PAGE.searchInput);
        // this.roleTypeDropdown = page.locator(ROLE_LIST_PAGE.roleTypeDropdown);
        // this.filterBtn = page.locator(ROLE_LIST_PAGE.filterButton);
        this.clearFilterBtn = page.locator(ROLE_LIST_PAGE.clearFilterButton);
        this.createBtn = page.locator(ROLE_LIST_PAGE.createBtn);

        this.tableRows = page.locator(ROLE_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(ROLE_LIST_PAGE.tableColumns);
        this.tableColumnsHasSort = page.locator(ROLE_LIST_PAGE.tableColumnsHasSort);
        this.editIcons = page.locator(ROLE_LIST_PAGE.editIcons);

        this.nextPageBtn = page.locator(ROLE_LIST_PAGE.nextPageButton);
        this.prevPageBtn = page.locator(ROLE_LIST_PAGE.prevPageButton);
        this.pageSizeDropdown = page.locator(ROLE_LIST_PAGE.pageSizeDropdown);
        this.pageSizeOption = page.locator(ROLE_LIST_PAGE.pageSizeOption);

        this.roleNameField = page.locator(ROLE_LIST_PAGE.roleNameField);
        this.roleCodeField = page.locator(ROLE_LIST_PAGE.roleCodeField);
        this.errorMsg = page.locator(ROLE_LIST_PAGE.errorMsg);
        this.backButton = page.locator(ROLE_LIST_PAGE.backButton);
        this.saveButton = page.locator(ROLE_LIST_PAGE.saveButton);
    }

    async goto() {
        await super.goto(ROLE_LIST_PAGE.url);
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
        await this.waitForData(ROLE_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
    }

    async clickEditFirst() {
        await this.editIcons.nth(0).click();
    }

    async clickSortByColumn(columnIndex: number) {
        await this.tableColumns.nth(columnIndex).click();
        await this.waitForData(ROLE_LIST_PAGE.apiUrl);
    }

    async inputFields(roleCode: string, roleName: string) {
        if (roleName !== '') {
            await this.roleNameField.fill(roleName);
        }
        if (roleCode !== '') {
            await this.roleCodeField.fill(roleCode);
        }
    }
}