import { test, expect } from "@playwright/test";
import { NewsListPage } from "../helpers/news-list.page";
import { Helper } from "../helpers/utils.helper";
import { API } from "../config/env";
import fs from 'fs';
import path from 'path';
import { NEWS_LIST_PAGE } from "../config/env";

const placeholderFilter = "Tìm kiếm"; // Expected placeholder text in search input
const searchText = "Test 1"; // Example search text for role code
const notFoundText = "xxxx"; // Example text for not found search
const statusText = ["Draft", "Published"]; // Example role type for filtering
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = "edit"; // Expected URL pattern when clicking edit
const pageSizeOption = "100"; // Example page size option
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = "Trường này là bắt buộc"; // Expected error message when validation fails
const allNews = {
  title: "Abbott thúc đẩy hiến máu với thực tế ảo tích hợp",
  seoTitle: "Abbott thúc đẩy hiến máu với thực tế ảo tích hợp",
  slug: "",
  shortDescription:
    "Abbott giới thiệu trải nghiệm thực tế ảo tích hợp mới trong hiến máu tình nguyện tại Việt Nam.",
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
};

test.describe("NEWS LIST (AUTHENTICATED)", () => {
  test.beforeEach(async ({ page }) => {
    const news = new NewsListPage(page);
    await news.goto();
  });

  test("Check placeholder text at filter", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.checkPlaceholderText(news.searchInput, placeholderFilter);
  });

  test("Search by keyword", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.search(searchText);
    const rows = news.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(new RegExp(searchText, "i"));
    }
  });

  test("Search not found", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.search(notFoundText);

    await expect(news.rowActions).toHaveCount(0);
  });

  test("Clear filter by search box", async ({ page }) => {
    const user = new NewsListPage(page);
    await user.search(notFoundText);
    await user.clearFilter();

    await expect(user.tableRows).not.toHaveCount(0);
  });

  test("Click edit role", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.clickEditFirst();
    await expect(page).toHaveURL(new RegExp(editURL));
  });

  test("SQL Injection search", async ({ page }) => {
    const news = new NewsListPage(page);

    await news.search(sqlInjectionText);

    await expect(news.tableRows).not.toHaveCount(9999);
  });

  test("Pagination next", async ({ page }) => {
    const user = new NewsListPage(page);
    await user.nextPageBtn.click();

    await expect(page).toHaveURL(/page=2/);
  });

  test("Pagination previous", async ({ page }) => {
    const user = new NewsListPage(page);
    await user.nextPageBtn.click();
    await user.prevPageBtn.click();
  });

  test("Change page size", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.pageSizeDropdown.click();
    const options = news.pageSizeOption;
    const optionCount = await options.count();
    for (let i = 0; i < optionCount; i++) {
      const optionText = (await options.nth(i).textContent())?.trim() ?? "";
      await news.changePageSizeByIndex(i);
      await expect(news.pageSizeDropdown).toContainText(optionText);
      await news.pageSizeDropdown.click();
    }
  });

  test("Role list load performance", async ({ page }) => {
    const start = Date.now();
    const news = new NewsListPage(page);
    await news.goto();
    const end = Date.now();

    expect(end - start).toBeLessThan(loadTimeThreshold);
  });

  test("Sort Role Code ASC", async ({ page }) => {
    const news = new NewsListPage(page);
    const columnsHasSort = news.tableColumnsHasSort;
    for (let i = 0; i < (await columnsHasSort.count()); i++) {
      await news.clickSortByColumn(i);
      await Helper.verifyColumnSortedAsc(page, i);
    }
  });

  test("Sort Role Code DESC", async ({ page }) => {
    const news = new NewsListPage(page);
    const columnsHasSort = news.tableColumnsHasSort;
    for (let i = 0; i < (await columnsHasSort.count()); i++) {
      await news.clickSortByColumn(i);
      await news.clickSortByColumn(i);
      await Helper.verifyColumnSortedDesc(page, i);
    }
  });
});

test.describe("CREATE NEWS (AUTHENTICATED)", () => {
  test.beforeEach(async ({ page }) => {
    const news = new NewsListPage(page);
    await news.gotoCreate();
  });
  
  test('Click "Thêm" navigate đến /post/create', async ({ page }) => {
    await expect(page).toHaveURL(/\/post\/create/);
  });

  test('Trang /post/create có các trường bắc buộc', async ({ page }) => {
    const news = new NewsListPage(page);
    
    // Tiêu đề
    await expect(news.titleField).toBeVisible({ timeout: 10_000 });
    await expect(news.titleField).toHaveAttribute('placeholder', 'Tiêu đề');

    // Danh mục
    await expect(news.categoryDropdown).toBeVisible({ timeout: 10_000 });

    // Loại bài viết
    await expect(news.radioGroup.getByText('Công khai', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(news.radioGroup.getByText('Riêng tư theo danh sách', { exact: true })).toBeVisible({ timeout: 10_000 });
    
    // Ảnh bìa
    await expect(news.bannerField).toBeVisible({ timeout: 10_000 });

    // Trạng thái
    await expect(news.radioGroup.getByText('Hoạt động', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(news.radioGroup.getByText('Không hoạt động', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(news.radioGroup.getByText('Nháp', { exact: true })).toBeVisible({ timeout: 10_000 });

    // Thời gian xuất bản
    await expect(news.publicationTimeField).toBeVisible({ timeout: 10_000 });
    await expect(news.publicationTimeField).toHaveAttribute('placeholder', 'Thời gian xuất bản');

    // Thời gian ẩn
    await expect(news.hiddenTimeField).toBeVisible({ timeout: 10_000 });
    await expect(news.hiddenTimeField).toHaveAttribute('placeholder', 'Thời gian ẩn');

    // Nội dung
    await news.contentField.scrollIntoViewIfNeeded();
    await expect(news.contentField).toBeVisible({ timeout: 10_000 });
  });

  test("Check list categories", async ({ page }) => {
    const news = new NewsListPage(page);
    type Category = {
      id: number;
      name: string;
      status: boolean;
    };
    const response = await news.getResponseData(API.categoryList, 99999);
    const allCategories = response.data.map(
      (item: Category) => ({
          id: item.id,
          name: item.name + (item.status ? "" : " (vô hiệu hóa)")
      })
    );
    const categoryOptions = await news.getCategoryOptions();

    Helper.verifyArrayByIdAndName(allCategories, categoryOptions);
  });

  test("Check not fill any field", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "test", "", "", "", "", "");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(5);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check not fill title", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "", "05:29:38 08/05/2026", "Ensure 1777883719258", "09:30:55 22/05/2026", "Công khai", "test");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(1);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check not fill publish time", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "test", "", "Ensure 1777883719258", "09:30:55 22/05/2026", "Công khai", "test");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(1);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check not fill category", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "test", "09:30:55 22/05/2026", "", "09:30:55 22/05/2026", "Công khai", "test");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(1);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check not fill hidden time", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "test", "05:29:38 08/05/2026", "Ensure 1777883719258", "", "Công khai", "test");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(1);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check not fill content", async ({ page }) => {
    const news = new NewsListPage(page);
    await news.inputFields("data/images/image1.jpg", "Nháp", "test", "05:29:38 08/05/2026", "Ensure 1777883719258", "09:30:55 22/05/2026", "Công khai", "");
    await news.saveButton.click();
    const errmsg = news.errorMsg;
    await expect(errmsg).toHaveCount(1);
    for (let i = 0; i < (await errmsg.count()); i++) {
      await errmsg.nth(i).scrollIntoViewIfNeeded();
      await expect(errmsg.nth(i)).toHaveText(errorMsg);
    }
  });

  test("Check create news", async ({ page }) => {
    const news = new NewsListPage(page);
    const files = fs.readdirSync('data/images');
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    const arrCategory = await news.getCategoryOptions().then(options => options.map(option => option.name));
    for (let i = 0; i < 1; i++) {
      const increment = (await Helper.getAndIncrementCounter('data/news-id.csv')).toString();
      const banner = 'data/images/' + imageFiles[Math.floor(Math.random() * imageFiles.length)];
      const statusLabel = ["Hoạt động", "Không hoạt động", "Nháp"][Math.floor(Math.random() * 3)];
      const title = 'Tin tức số ' + increment;
      const puslishDate = await Helper.getCurrentDateTime();
      const hiddenDate = await Helper.getCurrentDateTime(20);
      const category = arrCategory[Math.floor(Math.random() * arrCategory.length)];
      const typeNews = ["Công khai", "Riêng tư theo danh sách"][Math.floor(Math.random() * 2)];
      const fileContent = fs.readFileSync('data/news-content.csv', 'utf-8');
      await news.inputFields(banner, statusLabel, title, puslishDate, category, hiddenDate, typeNews, { isHTML: true, value: fileContent });
      await news.saveButton.click();
      await news.waitForData();
      await expect(news.tableRows.first()).toContainText(title);
      await expect(news.tableRows.first()).toContainText(typeNews);
      await expect(news.tableRows.first()).toContainText(statusLabel);
      await news.createBtn.click();
      await news.waitForData();
    }
  });
});
