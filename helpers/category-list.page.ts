import { Page, Locator, expect } from '@playwright/test';
import { CATEGORY_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class CategoryListPage extends BasePage {
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
    readonly categoryNameField: Locator;
    readonly categoryCodeField: Locator;
    readonly statusToggle: Locator;
    readonly errorMsg: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(CATEGORY_LIST_PAGE.searchInput);
        this.clearFilterBtn = page.locator(CATEGORY_LIST_PAGE.clearFilterButton);
        this.createBtn = page.locator(CATEGORY_LIST_PAGE.createBtn);

        this.tableRows = page.locator(CATEGORY_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(CATEGORY_LIST_PAGE.tableColumns);
        this.tableColumnsHasSort = page.locator(CATEGORY_LIST_PAGE.tableColumnsHasSort);
        this.editIcons = page.locator(CATEGORY_LIST_PAGE.editIcons);

        this.nextPageBtn = page.locator(CATEGORY_LIST_PAGE.nextPageButton);
        this.prevPageBtn = page.locator(CATEGORY_LIST_PAGE.prevPageButton);
        this.pageSizeDropdown = page.locator(CATEGORY_LIST_PAGE.pageSizeDropdown);
        this.pageSizeOption = page.locator(CATEGORY_LIST_PAGE.pageSizeOption);

        this.categoryNameField = page.locator(CATEGORY_LIST_PAGE.categoryNameField);
        this.categoryCodeField = page.locator(CATEGORY_LIST_PAGE.categoryCodeField);
        this.statusToggle = page.locator(CATEGORY_LIST_PAGE.statusToggle);
        this.errorMsg = page.locator(CATEGORY_LIST_PAGE.errorMsg);
        this.backButton = page.locator(CATEGORY_LIST_PAGE.backButton);
        this.saveButton = page.locator(CATEGORY_LIST_PAGE.saveButton);
    }

    async goto() {
        await super.goto(CATEGORY_LIST_PAGE.url);
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
        await this.waitForData(CATEGORY_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
    }

    async clickEditFirst() {
        await this.editIcons.nth(0).click();
    }

    async clickSortByColumn(columnIndex: number) {
        await this.tableColumns.nth(columnIndex).click();
        await this.waitForData(CATEGORY_LIST_PAGE.apiUrl);
    }

    async inputFields(roleCode: string, roleName: string, status: boolean = true) {
        if (roleName !== '') {
            await this.categoryNameField.fill(roleName);
        }
        if (roleCode !== '') {
            await this.categoryCodeField.clear();
            await this.categoryCodeField.fill(roleCode);
        }
        if (!status) {
            await this.statusToggle.click();
        }
    }
}