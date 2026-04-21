import { test, expect } from "@playwright/test";
import { RoleListPage } from "../helpers/role-list.page";
import { Helper } from "../helpers/utils.helper";

const placeholderFilter = "Tìm kiếm"; // Expected placeholder text in search input
const placeholderRoleType = "loại vai trò"; // Expected placeholder text in role type dropdown
const searchText = {
  code: "test-",
  name: "Test ",
};
const notFoundText = "xxxx"; // Example text for not found search
const sqlInjectionText = "' OR 1=1 --"; // Example SQL injection text
const editURL = "role/edit"; // Expected URL pattern when clicking edit
const loadTimeThreshold = 3000; // Load time threshold in milliseconds

const errorMsg = 'Trường này là bắt buộc'; // Expected error message
const validRoleID = `ROLE${Date.now()}`; // Example valid role name
const validRoleName = `Test ${validRoleID}`; // Example valid role name

test.describe("ROLE LIST (AUTHENTICATED)", () => {
  test.describe("ROLE LIST", () => {
    test.beforeEach(async ({ page }) => {
      const role = new RoleListPage(page);
      await role.goto();
    });

    test("Check placeholder text at filter", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.checkPlaceholderText(role.searchInput, placeholderFilter);
    });

    test("Search by keyword", async ({ page }) => {
      const role = new RoleListPage(page);
      for (const key in searchText) {
        await role.search(searchText[key as keyof typeof searchText]);
        const rows = role.tableRows;
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
      const role = new RoleListPage(page);
      await role.goto();
      await Helper.verifyTextLength(role.searchInput, 250);
    });

    test("Search not found", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.search(notFoundText);

      await expect(role.tableRows).toHaveCount(0);
    });

    test("Clear filter by search box", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.search(notFoundText);
      await role.clearFilter();

      await expect(role.tableRows).not.toHaveCount(0);
    });

    test("Click edit role", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.clickEditFirst();
      await expect(page).toHaveURL(new RegExp(editURL));
    });

    test("SQL Injection search", async ({ page }) => {
      const role = new RoleListPage(page);

      await role.search(sqlInjectionText);

      await expect(role.tableRows).not.toHaveCount(9999);
    });

    test("Pagination next", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.nextPageBtn.click();

      await expect(page).toHaveURL(/page=2/);
    });

    test("Pagination previous", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.nextPageBtn.click();
      await role.prevPageBtn.click();
    });

    test("Change page size", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.pageSizeDropdown.click();
      const options = role.pageSizeOption;
      const optionCount = await options.count();
      for (let i = 0; i < optionCount; i++) {
        await options.nth(i).click();
        await role.waitForData();
        await expect(
          role.pageSizeDropdown.getByText(await options.nth(i).textContent()),
        ).toBeVisible();
        await role.pageSizeDropdown.click();
      }
    });

    test("Role list load performance", async ({ page }) => {
      const start = Date.now();
      const role = new RoleListPage(page);
      await role.goto();
      const end = Date.now();

      expect(end - start).toBeLessThan(loadTimeThreshold);
    });

    test("Sort Role Code ASC", async ({ page }) => {
      const role = new RoleListPage(page);
      const columnsHasSort = role.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await role.clickSortByColumn(i);
        await Helper.verifyColumnSortedAsc(page, i);
      }
    });

    test("Sort Role Code DESC", async ({ page }) => {
      const role = new RoleListPage(page);
      const columnsHasSort = role.tableColumnsHasSort;
      for (let i = 0; i < (await columnsHasSort.count()); i++) {
        await role.clickSortByColumn(i);
        await role.clickSortByColumn(i);
        await Helper.verifyColumnSortedDesc(page, i);
      }
    });
  });

  test.describe("ROLE CREATE", () => {
    test.beforeEach(async ({ page }) => {
      const role = new RoleListPage(page);
      await role.gotoCreate();
    });

    test("limit code text length", async ({ page }) => {
      const role = new RoleListPage(page);
      await Helper.verifyTextLength(role.roleCodeField, 50);
    });

    test("Reject Vietnamese, space characters in code field", async ({ page }) => {
      const role = new RoleListPage(page);
      await Helper.verifyInputText(role.roleCodeField, role.errorMsg , "Vui lòng nhập đúng định dạng yêu cầu", { vietnamese: true, space: true });
    });

    test("limit name text length", async ({ page }) => {
      const role = new RoleListPage(page);
      await Helper.verifyTextLength(role.roleNameField, 255);
    });

    test("Accept all characters in name field", async ({ page }) => {
      const role = new RoleListPage(page);
      await Helper.verifyInputText(role.roleNameField, role.errorMsg , "");
    });

    test("Check not fill any field", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.inputFields("", "");
      await role.saveButton.click();
      const errmsg = role.errorMsg;
      await expect(errmsg).toHaveCount(2);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test("Check not fill name", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.inputFields(validRoleID, "");
      await role.saveButton.click();
      const errmsg = role.errorMsg;
      await expect(errmsg).toHaveCount(1);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test("Check not fill role ID", async ({ page }) => {
      const role = new RoleListPage(page);
      await role.inputFields("", validRoleName);
      await role.saveButton.click();
      const errmsg = role.errorMsg;
      await expect(errmsg).toHaveCount(1);
      for (let i = 0; i < (await errmsg.count()); i++) {
        await expect(errmsg.nth(i)).toHaveText(errorMsg);
      }
    });

    test('Check create a role', async ({ page }) => {
      const role = new RoleListPage(page);
      for (let i = 0; i < 1; i++) {
        const id = `${Date.now()}`;
        const name = 'Test ' + id;
        await role.inputFields(id, name);
        await role.saveButton.click();
        await role.waitForData();
        await expect(role.tableRows.first()).toContainText(id);
        await expect(role.tableRows.first()).toContainText(name);
        await role.createBtn.click();
        await role.waitForData();
      }
    });
  });
});
