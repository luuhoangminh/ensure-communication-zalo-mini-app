import { Page, Locator, expect } from '@playwright/test';
import { NEWS_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class NewsListPage extends BasePage {
    readonly searchInput: Locator;
    readonly clearFilterBtn: Locator;
    readonly createBtn: Locator;
    readonly tableRows: Locator;
    readonly tableColumns: Locator;
    readonly tableColumnsHasSort: Locator;
    readonly rowActions: Locator;
    readonly nextPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly lastPageBtn: Locator;
    readonly pageSizeDropdown: Locator;
    readonly pageSizeOption: Locator;
    readonly bannerField: Locator;
    readonly radioGroup: Locator;
    readonly titleField: Locator;
    readonly publicationTimeField: Locator;
    readonly categoryDropdown: Locator;
    readonly categoryOption: Locator;
    readonly hiddenTimeField: Locator;
    readonly contentField: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;
    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(NEWS_LIST_PAGE.searchInput);
        this.clearFilterBtn = page.locator(NEWS_LIST_PAGE.clearFilterButton);
        this.createBtn = page.locator(NEWS_LIST_PAGE.createBtn);

        this.tableRows = page.locator(NEWS_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(NEWS_LIST_PAGE.tableColumns);
        this.tableColumnsHasSort = page.locator(NEWS_LIST_PAGE.tableColumnsHasSort);
        this.rowActions = page.locator(NEWS_LIST_PAGE.rowActions);

        this.nextPageBtn = page.locator(NEWS_LIST_PAGE.nextPageButton);
        this.prevPageBtn = page.locator(NEWS_LIST_PAGE.prevPageButton);
        this.pageSizeDropdown = page.locator(NEWS_LIST_PAGE.pageSizeDropdown);
        this.pageSizeOption = page.locator(NEWS_LIST_PAGE.pageSizeOption);

        this.bannerField = page.locator(NEWS_LIST_PAGE.bannerField);
        this.radioGroup = page.locator(NEWS_LIST_PAGE.radioGroup);
        this.titleField = page.locator(NEWS_LIST_PAGE.titleField);
        this.publicationTimeField = page.locator(NEWS_LIST_PAGE.publicationTimeField);
        this.categoryDropdown = page.locator(NEWS_LIST_PAGE.categoryDropdown);
        this.categoryOption = page.locator(NEWS_LIST_PAGE.categoryOption);
        this.hiddenTimeField = page.locator(NEWS_LIST_PAGE.hiddenTimeField);
        this.contentField = page.locator(NEWS_LIST_PAGE.contentField);
        this.backButton = page.locator(NEWS_LIST_PAGE.backButton);
        this.saveButton = page.locator(NEWS_LIST_PAGE.saveButton);
    }

    async goto() {
        await super.goto(NEWS_LIST_PAGE.url);
    }
    
    async gotoCreate() {
        await this.goto();
        await this.createBtn.click();
        await this.waitForData();
    }

    // Helper method to check placeholder text of a locator
    // This method only used for search input
    async checkPlaceholderText(locator: Locator, text: string) {
        await expect(locator).toHaveAttribute('placeholder', text);
    }

    async search(keyword: string) {
        await super.searchByKeyword(this.searchInput, keyword, NEWS_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
    }

    async clickEditFirst() {
        await this.rowActions.nth(0).click();
    }

    async clickSortByColumn(columnIndex: number) {
        await Promise.all([
            this.waitForData(NEWS_LIST_PAGE.apiUrl),
            this.tableColumnsHasSort.nth(columnIndex).click()
        ]);
    }
    
    async inputFields(imageURL: string, statusLabel: string, title: string, publicationTime: string, category: string, hiddenTime: string, type: string, content: string) {
        if (imageURL !== '') {
            await this.bannerField.setInputFiles(imageURL);
        }
        if (statusLabel !== '') {
            await this.radioGroup.getByLabel(statusLabel).click();
        }
        if (title !== '') {
            await this.titleField.fill(title);
        }
        if (publicationTime !== '') {
            await this.publicationTimeField.fill(publicationTime);
        }
        if (category !== '') {
            await this.categoryDropdown.click();
            await this.categoryDropdown.fill(category);
            await this.waitForData();
            await this.page.locator(NEWS_LIST_PAGE.categoryOption + `[title="${category}"]`).click();
        }
        if (hiddenTime !== '') {
            await this.hiddenTimeField.fill(hiddenTime);
        }
        if (type !== '') {
            await this.radioGroup.getByLabel(type).click();
        }
        if (content !== '') {
            await this.contentField.click();
            await this.contentField.fill(content);
        }
    }
}