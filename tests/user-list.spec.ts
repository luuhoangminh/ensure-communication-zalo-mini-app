import { test, expect } from "@playwright/test";
import { UserListPage } from "../helpers/user-list.page";
import { Helper } from "../helpers/utils.helper";
import { API } from "../config/env";

const placeholderFilter = "Tìm kiếm"; // Expected placeholder text in search input
const searchText = {
  upi: "testuser",
  email: "minh.lh1999@gmail.com",
  name: "Test User",
};
const notFoundText = "xxxx"; // Example text for not found search
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = "user/edit"; // Expected URL pattern when clicking edit
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = 'Trường này là bắt buộc'; // Expected error message

test.describe("USER LIST (AUTHENTICATED)", () => {
  test.describe("USER LIST", () => {
    test.beforeEach(async ({ page }) => {
      const user = new UserListPage(page);
      await user.goto();
    });

    test("Check placeholder text at filter", async ({ page }) => {
      const user = new UserListPage(page);
      await user.checkPlaceholderText(user.searchInput, placeholderFilter);
    });

    test("Search by keyword", async ({ page }) => {
      const user = new UserListPage(page);
      for (const key in searchText) {
        await user.search(searchText[key as keyof typeof searchText]);
        const rows = user.tableRows;
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

    test("limit search text length", async ({ page }) => {
      const user = new UserListPage(page);
      await user.goto();
      await Helper.verifyTextLength(user.searchInput, 250);
    });

    test("Search not found", async ({ page }) => {
      const user = new UserListPage(page);
      await user.search(notFoundText);

      await expect(user.tableRows).toHaveCount(0);
    });

    test("Clear filter by search box", async ({ page }) => {
      const user = new UserListPage(page);
      await user.search(notFoundText);
      await user.clearFilter();

      await expect(user.tableRows).not.toHaveCount(0);
    });

    test("Click edit user", async ({ page }) => {
      const user = new UserListPage(page);
      await user.clickEditFirst();
      await expect(page).toHaveURL(new RegExp(editURL));
    });

    test("SQL Injection search", async ({ page }) => {
      const user = new UserListPage(page);

      await user.search(sqlInjectionText);

      await expect(user.tableRows).toHaveCount(0);
    });

    test("Pagination next", async ({ page }) => {
      const user = new UserListPage(page);
      await user.nextPageBtn.click();

      await expect(page).toHaveURL(/page=2/);
    });

    test("Pagination previous", async ({ page }) => {
      const user = new UserListPage(page);
      await user.nextPageBtn.click();
      await user.prevPageBtn.click();
    });

    test("Change page size", async ({ page }) => {
      const user = new UserListPage(page);
      await user.pageSizeDropdown.click();
      const options = user.pageSizeOption;
      const optionCount = await options.count();
      for (let i = 0; i < optionCount; i++) {
        await options.nth(i).click();
        await user.waitForData();
        await expect(
          user.pageSizeDropdown.getByText(await options.nth(i).textContent()),
        ).toBeVisible();
        await user.pageSizeDropdown.click();
      }
    });

    test("User list load performance", async ({ page }) => {
      const start = Date.now();
      const user = new UserListPage(page);
      await user.goto();
      const end = Date.now();

      expect(end - start).toBeLessThan(loadTimeThreshold);
    });

    test("Sort User Code ASC", async ({ page }) => {
      const user = new UserListPage(page);
      const columnsHasSort = user.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await user.clickSortByColumn(i);
        await Helper.verifyColumnSortedAsc(page, i);
      }
    });

    test("Sort User Code DESC", async ({ page }) => {
      const user = new UserListPage(page);
      const columnsHasSort = user.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await user.clickSortByColumn(i);
        await user.clickSortByColumn(i);
        await Helper.verifyColumnSortedDesc(page, i);
      }
    });
  });

  test.describe("USER CREATE", () => {
    test.beforeEach(async ({ page }) => {
      const user = new UserListPage(page);
      await user.gotoCreate();
    });

    test("limit UPI text length", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyTextLength(user.userUpiField, 50);
    });

    test("Reject Vietnamese, space, special characters in UPI field", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyInputText(user.userUpiField, user.errorMsg , "Vui lòng nhập đúng định dạng yêu cầu", { vietnamese: true, space: true, special: true });
    });

    test("limit name text length", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyTextLength(user.userNameField, 255);
    });

    test("Accept all characters in name field", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyInputText(user.userNameField, user.errorMsg , "");
    });

    test("limit email text length", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyTextLength(user.userEmailField, 255);
    });

    test("Reject invalid email format", async ({ page }) => {
      const user = new UserListPage(page);
      await Helper.verifyInputEmail(user.userEmailField, user.errorMsg , "Vui lòng nhập địa chỉ email hợp lệ");
    });

    test("Check not fill any field", async ({ page }) => {
      const user = new UserListPage(page);
      await user.inputFields("", "", "", "");
      await user.saveButton.click();
      const errmsg = user.errorMsg;
      await expect(errmsg).toHaveCount(4);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test("Check not fill UPI", async ({ page }) => {
      const validUserUPI = await Helper.randomText(10, { vietnamese: false, space: false, special: false }); // Example valid user name
      const newUser = {
        upi: '',
        name: `Test ${validUserUPI}`,
        email: `${validUserUPI}@fractal.vn`,
        user: 'Admin',
      }
      const user = new UserListPage(page);
      await user.inputFields(newUser.upi, newUser.name, newUser.email, newUser.user);
      await user.saveButton.click();
      const errmsg = user.errorMsg;
      await expect(errmsg).toHaveCount(1);
      await expect(errmsg).toHaveText(errorMsg);
    });

    test("Check not fill name", async ({ page }) => {
      const validUserUPI = await Helper.randomText(10, { vietnamese: false, space: false, special: false }); // Example valid user name
      const newUser = {
        upi: `${validUserUPI}`,
        name: ``,
        email: `${validUserUPI}@fractal.vn`,
        user: 'Admin',
      }
      const user = new UserListPage(page);
      await user.inputFields(newUser.upi, newUser.name, newUser.email, newUser.user);
      await user.saveButton.click();
      const errmsg = user.errorMsg;
      await expect(errmsg).toHaveCount(1);
      await expect(errmsg).toHaveText(errorMsg);
    });

    test("Check not fill email", async ({ page }) => {
      const validUserUPI = await Helper.randomText(10, { vietnamese: false, space: false, special: false }); // Example valid user name
      const newUser = {
        upi: `${validUserUPI}`,
        name: `Test ${validUserUPI}`,
        email: ``,
        user: 'Admin',
      }
      const user = new UserListPage(page);
      await user.inputFields(newUser.upi, newUser.name, newUser.email, newUser.user);
      await user.saveButton.click();
      const errmsg = user.errorMsg;
      await expect(errmsg).toHaveCount(1);
      await expect(errmsg).toHaveText(errorMsg);
    });

    test("Check not fill user", async ({ page }) => {
      const validUserUPI = await Helper.randomText(10, { vietnamese: false, space: false, special: false }); // Example valid user name
      const newUser = {
        upi: `${validUserUPI}`,
        name: `Test ${validUserUPI}`,
        email: `${validUserUPI}@fractal.vn`,
        user: '',
      }
      const user = new UserListPage(page);
      await user.inputFields(newUser.upi, newUser.name, newUser.email, newUser.user);
      await user.saveButton.click();
      const errmsg = user.errorMsg;
      await expect(errmsg).toHaveCount(1);
      await expect(errmsg).toHaveText(errorMsg);
    });

    test('Check create a news', async ({ page }) => {
      const user = new UserListPage(page);
      const arrRole = await user.getRoleOptions();
      for (let i = 0; i < 1; i++) {
        const id = `${Date.now()}`;
        const name = 'Test ' + id;
        const email = 'email' + id + '@fractal.vn';
        const role = arrRole[Math.floor(Math.random() * arrRole.length)];
        const status = Boolean(Math.random() < 0.5)
        await user.inputFields(id, name, email, role, status);
        await user.saveButton.click();
        await user.waitForData();
        await expect(user.tableRows.first()).toContainText(id);
        await expect(user.tableRows.first()).toContainText(name);
        await user.createBtn.click();
        await user.waitForData();
      }
    });
  });
});
