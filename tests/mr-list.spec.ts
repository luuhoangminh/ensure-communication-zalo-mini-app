import { test, expect } from "@playwright/test";
import { MrListPage } from "../helpers/mr-list.page";
import { Helper } from "../helpers/utils.helper";
import { API } from "../config/env";

const placeholderFilter = "Tìm kiếm"; // Expected placeholder text in search input
const searchText = {
  upi: "HHTANH247",
  name: "Nguyen Thi Kieu Ni",
  phone: "",
};
const notFoundText = "xxxx"; // Example text for not found search
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = "user/edit"; // Expected URL pattern when clicking edit
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = 'Trường này là bắt buộc'; // Expected error message

test.describe("MR LIST (AUTHENTICATED)", () => {
  test.describe("MR LIST", () => {
    test.beforeEach(async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.goto();
    });

    test("Check placeholder text at filter", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.checkPlaceholderText(mr.searchInput, placeholderFilter);
    });

    test("limit search text length", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.goto();
      await Helper.verifyTextLength(mr.searchInput, 250);
    });

    test("Search by keyword", async ({ page }) => {
      const mr = new MrListPage(page);
      for (const key in searchText) {
        await mr.search(searchText[key as keyof typeof searchText]);
        const rows = mr.tableRows;
        await expect(rows).not.toHaveCount(0);
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

    test("Search not found", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.search(notFoundText);

      await expect(mr.tableRows).toHaveCount(0);
    });

    test("Clear filter by search box", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.search(notFoundText);
      await mr.clearFilter();

      await expect(mr.tableRows).not.toHaveCount(0);
    });

    test("SQL Injection search", async ({ page }) => {
      const mr = new MrListPage(page);

      await mr.search(sqlInjectionText);

      await expect(mr.tableRows).toHaveCount(0);
    });

    test("Pagination next", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.nextPageBtn.click();

      await expect(page).toHaveURL(/page=2/);
    });

    test("Pagination previous", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.nextPageBtn.click();
      await mr.prevPageBtn.click();
    });

    test("Change page size", async ({ page }) => {
      const mr = new MrListPage(page);
      await mr.pageSizeDropdown.click();
      const options = mr.pageSizeOption;
      const optionCount = await options.count();
      for (let i = 0; i < optionCount; i++) {
        await page.waitForTimeout(1000);
        await page.keyboard.press('End');
        await options.nth(i).click();
        await mr.waitForData();
        await expect(
          mr.pageSizeDropdown.getByText(await options.nth(i).textContent()),
        ).toBeVisible();
        await mr.pageSizeDropdown.click();
      }
    });

    test("MR list load performance", async ({ page }) => {
      const start = Date.now();
      const mr = new MrListPage(page);
      await mr.goto();
      const end = Date.now();

      expect(end - start).toBeLessThan(loadTimeThreshold);
    });
  });
});
