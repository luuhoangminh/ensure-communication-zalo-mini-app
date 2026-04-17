import { Page, Locator, expect } from '@playwright/test';
import { NEWS_LIST_PAGE } from '../config/env';
import { BasePage } from './base.page';

export class NewsListPage extends BasePage {
    readonly searchInput: Locator;
    readonly roleTypeDropdown: Locator;
    readonly filterBtn: Locator;
    readonly clearFilterBtn: Locator;
    readonly createBtn: Locator;
    readonly tableRows: Locator;
    readonly tableColumns: Locator;
    readonly tableColumnsHasSort: Locator;
    readonly rowActions: Locator;
    readonly firstPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly pageActive: Locator;
    readonly nextPageBtn: Locator;
    readonly lastPageBtn: Locator;
    readonly pageSizeDropdown: Locator;
    readonly titleField: Locator;
    readonly seoTitleField: Locator;
    readonly slugField: Locator;
    readonly shortDescriptionField: Locator;
    readonly contentField: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.searchInput = page.locator(NEWS_LIST_PAGE.searchInput);
        this.roleTypeDropdown = page.locator(NEWS_LIST_PAGE.roleTypeDropdown);
        this.filterBtn = page.locator(NEWS_LIST_PAGE.filterButton);
        this.clearFilterBtn = page.locator(NEWS_LIST_PAGE.clearFilterButton);
        this.createBtn = page.locator(NEWS_LIST_PAGE.createBtn);

        this.tableRows = page.locator(NEWS_LIST_PAGE.tableRows);
        this.tableColumns = page.locator(NEWS_LIST_PAGE.tableColumns);
        this.tableColumnsHasSort = page.locator(NEWS_LIST_PAGE.tableColumnsHasSort);
        this.rowActions = page.locator(NEWS_LIST_PAGE.rowActions);

        this.firstPageBtn = page.locator(NEWS_LIST_PAGE.firstPageButton);
        this.prevPageBtn = page.locator(NEWS_LIST_PAGE.prevPageButton);
        this.pageActive = page.locator(NEWS_LIST_PAGE.pageActive);
        this.nextPageBtn = page.locator(NEWS_LIST_PAGE.nextPageButton);
        this.lastPageBtn = page.locator(NEWS_LIST_PAGE.lastPageButton);
        this.pageSizeDropdown = page.locator(NEWS_LIST_PAGE.pageSizeDropdown);

        this.titleField = page.locator(NEWS_LIST_PAGE.titleField);
        this.seoTitleField = page.locator(NEWS_LIST_PAGE.seoTitleField);
        this.slugField = page.locator(NEWS_LIST_PAGE.slugField);
        this.shortDescriptionField = page.locator(NEWS_LIST_PAGE.shortDescriptionField);
        this.contentField = page.locator(NEWS_LIST_PAGE.contentField);
        this.backButton = page.locator(NEWS_LIST_PAGE.backButton);
        this.saveButton = page.locator(NEWS_LIST_PAGE.saveButton);
    }

    async waitForTableData(urlPart: string = '') {
        if (urlPart === '') {
            await this.page.waitForLoadState('networkidle');
        } else {
            await this.page.waitForResponse(res =>
                res.url().includes(urlPart) &&
                res.status() === 200
            );
        }
    }

    async goto() {
        await super.goto(NEWS_LIST_PAGE.url);
    }
    
    async gotoCreate() {
        await this.goto();
        await this.createBtn.click();
        await this.waitForData();
    }

    async search(keyword: string) {
        await super.searchByKeyword(this.searchInput, keyword, NEWS_LIST_PAGE.apiUrl);
    }

    async filterStatus(type: string) {
        await this.roleTypeDropdown.click();
        await this.roleTypeDropdown.selectOption({ label: type });
        await this.filterBtn.click();
        await this.waitForTableData(NEWS_LIST_PAGE.apiUrl);
    }

    async clearFilter() {
        await this.clearFilterBtn.click();
        await this.roleTypeDropdown.click();
        await this.roleTypeDropdown.selectOption({ label: 'Status — All' });
        await this.filterBtn.click();
        await this.waitForTableData(NEWS_LIST_PAGE.apiUrl);
    }

    async clickEditFirst() {
        if (await this.rowActions.count() > 1) {
            await this.rowActions.nth(1).click();
        } else {
            await this.rowActions.click();
        }
        await expect(this.page.locator('.dropdown-menu.show')).toBeVisible();
        await this.page.locator('.dropdown-menu.show').getByText('edit').click();
    }

    async clickSortByColumn(columnIndex: number) {
        await Promise.all([
            this.waitForTableData(NEWS_LIST_PAGE.apiUrl),
            this.tableColumnsHasSort.nth(columnIndex).click()
        ]);
    }

    async createNews(news: { title: string, seoTitle: string, slug: string, shortDescription: string, content: string }) {
        const { title, seoTitle, slug, shortDescription, content } = news;
        if (title !== '') {
            await this.titleField.fill(title);
        }
        if (seoTitle !== '') {
            await this.seoTitleField.fill(seoTitle);
        }
        if (slug !== '') {
            await this.slugField.fill(slug);
        }
        if (shortDescription !== '') {
            await this.shortDescriptionField.fill(shortDescription);
        }
        if (content !== '') {
            await this.contentField.click();
            await this.contentField.fill(content);
        }
        await this.saveButton.click();
        await this.waitForTableData();
    }
}