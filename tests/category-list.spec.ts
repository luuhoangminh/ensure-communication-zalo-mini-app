import { test, expect } from "@playwright/test";
import { CategoryListPage } from "../helpers/category-list.page";
import { Helper } from "../helpers/utils.helper";

const placeholderFilter = "Tìm kiếm"; // Expected placeholder text in search input
const placeholderCategoryType = "loại vai trò"; // Expected placeholder text in category type dropdown
const searchText = {
  code: "CATEGORY001",
  name: "Sữa ",
};
const notFoundText = "xxxx"; // Example text for not found search
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = "category/edit"; // Expected URL pattern when clicking edit
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = 'Trường này là bắt buộc'; // Expected error message
const validCategoryID = `CATEGORY${Date.now()}`; // Example valid category name
const validCategoryName = `Test ${validCategoryID}`; // Example valid category name

test.describe("CATEGORY LIST (AUTHENTICATED)", () => {
  test.describe("CATEGORY LIST", () => {
    test.beforeEach(async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.goto();
    });

    test("Check placeholder text at filter", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.checkPlaceholderText(category.searchInput, placeholderFilter);
    });

    test("Search by keyword", async ({ page }) => {
      const category = new CategoryListPage(page);
      for (const key in searchText) {
        await category.search(searchText[key as keyof typeof searchText]);
        const rows = category.tableRows;
        const count = await rows.count();
        console.log(
          `Found ${count} rows for search text: ${searchText[key as keyof typeof searchText]}`,
        );
        for (let i = 0; i < count; i++) {
          await expect(rows.nth(i)).toContainText(
            new RegExp(searchText[key as keyof typeof searchText], "i"),
          );
        }
      }
    });

    test("limit search text length", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.goto();
      await Helper.verifyTextLength(category.searchInput, 250);
    });

    test("Search not found", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.search(notFoundText);

      await expect(category.tableRows).toHaveCount(0);
    });

    test("Clear filter by search box", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.search(notFoundText);
      await category.clearFilter();

      await expect(category.tableRows).not.toHaveCount(0);
    });

    test("Click edit category", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.clickEditFirst();
      await expect(page).toHaveURL(new RegExp(editURL));
    });

    test("SQL Injection search", async ({ page }) => {
      const category = new CategoryListPage(page);

      await category.search(sqlInjectionText);

      await expect(category.tableRows).not.toHaveCount(9999);
    });

    test("Pagination next", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.nextPageBtn.click();

      await expect(page).toHaveURL(/page=2/);
    });

    test("Pagination previous", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.nextPageBtn.click();
      await category.prevPageBtn.click();
    });

    test("Change page size", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.pageSizeDropdown.click();
      const options = category.pageSizeOption;
      const optionCount = await options.count();
      for (let i = 0; i < optionCount; i++) {
        await page.waitForTimeout(1000);
        await page.keyboard.press('End');
        await options.nth(i).click();
        await category.waitForData();
        await expect(
          category.pageSizeDropdown.getByText(await options.nth(i).textContent()),
        ).toBeVisible();
        await category.pageSizeDropdown.click();
      }
    });

    test("Category list load performance", async ({ page }) => {
      const start = Date.now();
      const category = new CategoryListPage(page);
      await category.goto();
      const end = Date.now();

      expect(end - start).toBeLessThan(loadTimeThreshold);
    });

    test("Sort Category Code ASC", async ({ page }) => {
      const category = new CategoryListPage(page);
      const columnsHasSort = category.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await category.clickSortByColumn(i);
        await Helper.verifyColumnSortedAsc(page, i);
      }
    });

    test("Sort Category Code DESC", async ({ page }) => {
      const category = new CategoryListPage(page);
      const columnsHasSort = category.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await category.clickSortByColumn(i);
        await category.clickSortByColumn(i);
        await Helper.verifyColumnSortedDesc(page, i);
      }
    });
  });

  test.describe("CATEGORY CREATE", () => {
    test.beforeEach(async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.gotoCreate();
    });

    test("limit code text length", async ({ page }) => {
      const category = new CategoryListPage(page);
      await Helper.verifyTextLength(category.categoryCodeField, 50);
    });

    test("Reject Vietnamese, space characters in code field", async ({ page }) => {
      const category = new CategoryListPage(page);
      await Helper.verifyInputText(category.categoryCodeField, category.errorMsg , "Vui lòng nhập đúng định dạng yêu cầu", { vietnamese: true, space: true });
    });

    test("limit name text length", async ({ page }) => {
      const category = new CategoryListPage(page);
      await Helper.verifyTextLength(category.categoryNameField, 255);
    });

    test("Accept all characters in name field", async ({ page }) => {
      const category = new CategoryListPage(page);
      await Helper.verifyInputText(category.categoryNameField, category.errorMsg , "");
    });

    test("Check not fill any field", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.inputFields("", "");
      await category.saveButton.click();
      const errmsg = category.errorMsg;
      await expect(errmsg).toHaveCount(2);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test("Check not fill name", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.inputFields(validCategoryID, "");
      await category.saveButton.click();
      const errmsg = category.errorMsg;
      await expect(errmsg).toHaveCount(1);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test("Check not fill category ID", async ({ page }) => {
      const category = new CategoryListPage(page);
      await category.inputFields("", validCategoryName);
      await category.saveButton.click();
      const errmsg = category.errorMsg;
      await expect(errmsg).toHaveCount(1);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test('Check create a category', async ({ page }) => {
      const category = new CategoryListPage(page);
      for (let i = 0; i < 11; i++) {
        const date = Date.now();
        const id = `CATEGORY${date}`;
        const name = 'Ensure ' + date;
        const status = Boolean(Math.random() < 0.5)
        await category.inputFields(id, name, status);
        await category.saveButton.click();
        await category.waitForData();
        await expect(category.tableRows.first()).toContainText(id);
        await expect(category.tableRows.first()).toContainText(name);
        await category.createBtn.click();
        await category.waitForData();
      }
    });
  });
});
