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
    readonly contentBody: Locator;
    readonly backButton: Locator;
    readonly saveButton: Locator;
    readonly errorMsg: Locator;
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

        this.bannerField = page.locator(NEWS_LIST_PAGE.bannerField).first();
        this.radioGroup = page.locator(NEWS_LIST_PAGE.radioGroup);
        this.titleField = page.locator(NEWS_LIST_PAGE.titleField);
        this.publicationTimeField = page.locator(NEWS_LIST_PAGE.publicationTimeField);
        this.categoryDropdown = page.locator(NEWS_LIST_PAGE.categoryDropdown);
        this.categoryOption = page.locator(NEWS_LIST_PAGE.categoryOption);
        this.hiddenTimeField = page.locator(NEWS_LIST_PAGE.hiddenTimeField);
        this.contentField = page.locator(NEWS_LIST_PAGE.contentField);
        this.contentBody = page
            .frameLocator(NEWS_LIST_PAGE.contentField)
            .locator("body");
        this.backButton = page.locator(NEWS_LIST_PAGE.backButton);
        this.saveButton = page.locator(NEWS_LIST_PAGE.saveButton);
        this.errorMsg = page.locator(NEWS_LIST_PAGE.errorMsg);
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

    async changePageSizeByIndex(index: number) {
        await this.pageSizeDropdown.scrollIntoViewIfNeeded();
        if (!(await this.pageSizeDropdown.isVisible())) {
            await this.pageSizeDropdown.click();
        }
        await this.pageSizeOption.nth(index).click();
        await this.waitForData();
    }
    
    async getCategoryOptions() {
        const categoryOptions = await this.getResponseData(NEWS_LIST_PAGE.categoryListApiUrl);
        return categoryOptions.map((option: { id: number; name: string }) => ({
            id: option.id,
            name: option.name
        }));
    }

    private async selectDateTime(
        page: Page,
        datePicker: Locator,
        dateTime: string
    ) {
        // Parse datetime
        const [timePart, datePart] = dateTime.split(' ');

        const [hour, minute, second] = timePart.split(':');
        const [day, month, year] = datePart.split('/');

        // Open picker
        await datePicker.click();

        // ===== SELECT YEAR =====
        await page.locator('.ant-picker-header-view').first().getByText(new Date().getFullYear().toString(), { exact: true }).click();

        page.waitForTimeout(1000);

        // Chọn year
        await page
            .locator('.ant-picker-cell')
            .getByText(year, { exact: true })
            .click();

        // ===== SELECT MONTH =====
        await page.locator('.ant-picker-header-view').first().getByText('thg ' + (new Date().getMonth() + 1), { exact: true }).click();

        const monthIndex = Number(month) - 1;

        const shortMonths = [
            'thg 1', 'thg 2', 'thg 3', 'thg 4',
            'thg 5', 'thg 6', 'thg 7', 'thg 8',
            'thg 9', 'thg 10', 'thg 11', 'thg 12'
        ];

        await page
            .locator('.ant-picker-cell')
            .getByText(shortMonths[monthIndex], { exact: true })
            .click();

        // ===== SELECT DAY =====
        await page
            .locator('.ant-picker-cell-in-view')
            .getByText(day.replace(/^0/, ''), { exact: true })
            .click();

        // ===== SELECT TIME =====
        // Hour
        await page
            .locator('.ant-picker-time-panel-column')
            .nth(0)
            .getByText(hour, { exact: true })
            .click();

        // Minute
        await page
            .locator('.ant-picker-time-panel-column')
            .nth(1)
            .getByText(minute, { exact: true })
            .click();

        // Second
        await page
            .locator('.ant-picker-time-panel-column')
            .nth(2)
            .getByText(second, { exact: true })
            .click();
    }
    
    async inputFields(imageURL: string, statusLabel: string, title: string, publicationTime: string, category: string, hiddenTime: string, type: string, content: {isHTML: boolean, value: string} | string) {
        if (imageURL !== '') {
            await this.bannerField.setInputFiles(imageURL);
        }
        if (statusLabel !== '') {
            await this.radioGroup.getByLabel(statusLabel, { exact: true }).click();
        }
        if (title !== '') {
            await this.titleField.fill(title);
        }
        if (publicationTime !== '') {
            await this.selectDateTime(this.page, this.publicationTimeField, publicationTime);
        }
        if (category !== '') {
            await this.categoryDropdown.click();
            await this.categoryDropdown.fill(category);
            await this.waitForData();
            await this.page.locator(NEWS_LIST_PAGE.categoryOption + `[title="${category}"]`).click();
        }
        if (hiddenTime !== '') {
            await this.selectDateTime(this.page, this.hiddenTimeField, hiddenTime);
        }
        if (type !== '') {
            await this.radioGroup.getByLabel(type).click();
        }
        if (content !== '') {
            await this.contentField.scrollIntoViewIfNeeded();
            await this.contentBody.waitFor({ state: "visible" });
            if (typeof content === 'object') {
                if (content.isHTML) {
                await this.contentBody.click();
                    await this.contentBody.evaluate((body, value) => {
                        body.innerHTML = value;
                    }, content.value);
                } else {
                    await this.contentBody.click();
                    await this.contentBody.fill(content.value);
                }
            } else {
                await this.contentBody.click();
                await this.contentBody.fill(content);
            }
            
        }
    }
}