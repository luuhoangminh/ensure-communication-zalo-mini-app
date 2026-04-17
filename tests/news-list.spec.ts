import { test, expect } from '@playwright/test';
import { NewsListPage } from '../helpers/news-list.page';
import { Helper } from '../helpers/utils.helper';
import { NEWS_LIST_PAGE } from '../config/env';

const placeholderFilter = 'Keyword'; // Expected placeholder text in search input
const placeholderRoleType = 'Status — All'; // Expected placeholder text in role type dropdown
const searchText = 'Truy xét'; // Example search text for role code
const notFoundText = 'xxxx'; // Example text for not found search
const statusText = ['Draft', 'Published']; // Example role type for filtering
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = 'CreateOrEdit'; // Expected URL pattern when clicking edit
const pageSizeOption = '100'; // Example page size option
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = 'This field is required'; // Expected error message when validation fails
const allNews = {
  title: 'Abbott thúc đẩy hiến máu với thực tế ảo tích hợp',
  seoTitle: 'Abbott thúc đẩy hiến máu với thực tế ảo tích hợp',
  slug: '',
  shortDescription: 'Abbott giới thiệu trải nghiệm thực tế ảo tích hợp mới trong hiến máu tình nguyện tại Việt Nam.',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
};


test.describe('NEWS LIST (AUTHENTICATED)', () => {

  test.beforeEach(async ({ page }) => {
    const news = new NewsListPage(page);
    await news.goto();
  });

  test('Check placeholder text at filter', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.checkPlaceholderText(news.searchInput, placeholderFilter);
  });

  test('Search by keyword', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.search(searchText);
    const rows = news.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(new RegExp(searchText, 'i'));
    }
  });

  test('Search not found', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.search(notFoundText);

    await expect(news.rowActions).toHaveCount(0);
  });

  test('Search by status', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.filterStatus(statusText[0]);
    const rows = news.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(new RegExp(statusText[0], 'i'));
    }
  });

  test('Clear filter by search box', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.search(notFoundText);
    await news.filterStatus(statusText[0]);
    await news.clearFilter();

    await expect(news.tableRows).not.toHaveCount(0);
  });

  test('Filter status', async ({ page }) => {
    for (const status of statusText) {
      const news = new NewsListPage(page);
      await news.filterStatus(status);
      const rows = news.tableRows;
      const count = await rows.count();
      if (count === 1 && (await rows.nth(0).textContent()) === 'No data available') {
        continue;
      } else {
        for (let i = 0; i < count; i++) {
          const roleTypeCell = rows.nth(i).locator('td').nth(5);
          await expect(roleTypeCell).toHaveText(new RegExp(status, 'i'));
        }
      }
      
    }
  });

  test('Clear filter by filter role', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.filterStatus(statusText[0]);
    await news.clearFilter();

    await expect(news.tableRows).not.toHaveCount(0);
  });

  test('Click edit role', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.clickEditFirst();
    await expect(page).toHaveURL(new RegExp(editURL));
  });

  test('SQL Injection search', async ({ page }) => {
    const news = new NewsListPage(page);

    await news.search(sqlInjectionText);

    await expect(news.tableRows).not.toHaveCount(9999);
  });

  test('Pagination next', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.nextPageBtn.click();
    news.waitForTableData(NEWS_LIST_PAGE.apiUrl);
    await page.waitForTimeout(1000);
    await expect(news.pageActive).toHaveText('2');
  });

  test('Pagination previous', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.nextPageBtn.click();
    news.waitForTableData(NEWS_LIST_PAGE.apiUrl);
    await news.prevPageBtn.click();
    news.waitForTableData(NEWS_LIST_PAGE.apiUrl);
    await page.waitForTimeout(1000);
    await expect(news.pageActive).toHaveText('1');
  });

  test('Change page size', async ({ page }) => {
    const news = new NewsListPage(page);
    await news.pageSizeDropdown.click();
    await page.selectOption(NEWS_LIST_PAGE.pageSizeDropdown, pageSizeOption);
    await page.locator('#dt-length-0').blur();
    await expect(news.pageSizeDropdown.locator('option:checked')).toHaveText(pageSizeOption);
  });

  test('Role list load performance', async ({ page }) => {
    const start = Date.now();
    const news = new NewsListPage(page);
    await news.goto();
    const end = Date.now();

    expect(end - start).toBeLessThan(loadTimeThreshold);
  });

  test('Sort Role Code ASC', async ({ page }) => {
    const news = new NewsListPage(page);
    const columnsHasSort = news.tableColumnsHasSort;
    for (let i = 0; i < await columnsHasSort.count(); i++) {
      await news.clickSortByColumn(i);
      await Helper.verifyColumnSortedAsc(page, i);
    }
  });

  test('Sort Role Code DESC', async ({ page }) => {
    const news = new NewsListPage(page);
    const columnsHasSort = news.tableColumnsHasSort;
    for (let i = 0; i < await columnsHasSort.count(); i++) {
      await news.clickSortByColumn(i);
      await news.clickSortByColumn(i);
      await Helper.verifyColumnSortedDesc(page, i);
    }
  });

});

test.describe('CREATE NEWS (AUTHENTICATED)', () => {

  test.beforeEach(async ({ page }) => {
    const news = new NewsListPage(page);
    await news.gotoCreate();
  });

  test('Check create a news', async ({ page }) => {
    const news = new NewsListPage(page);
    for (let i = 0; i < 1; i++) {
      const title = allNews.title + ' ' + Date.now();
      const newNews = { ...allNews, title };
      await news.gotoCreate();
      await news.createNews(newNews);
      await expect(news.tableRows.first()).toContainText(title);
    }
  });

});