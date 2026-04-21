import { Page, Locator, expect } from '@playwright/test';
import { MR_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class MrListPage extends BasePage {
    readonly searchInput: Locator;
    readonly clearFilterBtn: Locator;
    readonly tableRows: Locator;
    readonly tableColumns: Locator;
    readonly nextPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly pageSizeDropdown: Locator;
    readonly pageSizeOption: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(MR_LIST_PAGE.searchInput);
        this.clearFilterBtn = page.locator(MR_LIST_PAGE.clearFilterButton);

        this.tableRows = page.locator(MR_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(MR_LIST_PAGE.tableColumns);

        this.nextPageBtn = page.locator(MR_LIST_PAGE.nextPageButton);
        this.prevPageBtn = page.locator(MR_LIST_PAGE.prevPageButton);
        this.pageSizeDropdown = page.locator(MR_LIST_PAGE.pageSizeDropdown);
        this.pageSizeOption = page.locator(MR_LIST_PAGE.pageSizeOption);
    }

    async goto() {
        await super.goto(MR_LIST_PAGE.url);
    }

    // Helper method to check placeholder text of a locator
    // This method only used for search input
    async checkPlaceholderText(locator: Locator, text: string) {
        await expect(locator).toHaveAttribute('placeholder', text);
    }

    async search(keyword: string) {
        await this.searchInput.fill(keyword);
        await this.page.keyboard.press('Enter');
        await this.waitForData(MR_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
    }

    async clickSortByColumn(columnIndex: number) {
        await this.tableColumns.nth(columnIndex).click();
        await this.waitForData(MR_LIST_PAGE.apiUrl);
    }

    // async getRoleOptions() {
    //     const roleOptions = await this.getResponseData(MR_LIST_PAGE.roleListApiUrl);
    //     return roleOptions.map((option: { name: string }) => option.name);
    // }
}