import { test, expect } from "@playwright/test";
import { LogoutPage } from "../helpers/logout.page";
import { ENV, VALID_USER } from "../config/env";

test.describe("LOGOUT TEST", () => {
  test.beforeEach(async ({ page }) => {
    const logout = new LogoutPage(page);
    await logout.logout(VALID_USER.email, VALID_USER.password);
  });

  // Xác minh rằng người dùng sẽ được chuyển
  // hướng đến trang đăng nhập sau khi đăng xuất.
  test("Redirect to login page after logout", async ({ page }) => {
    await expect(page).toHaveURL(/login/);
  });

  test('Session data cleared after logout', async ({ page }) => {
    await page.waitForTimeout(1000); // Đợi một chút để đảm bảo mọi thao tác đã hoàn thành
    const storage = await page.evaluate(() => localStorage.length);
    expect(storage).toBe(0);
  });

  // Xác minh rằng người dùng sẽ không thể truy
  // cập vào các trang bị hạn chế sau khi đăng xuất.
  test("Cannot access restricted page after logout", async ({ page }) => {
    await page.goto(ENV.baseUrl);
    await expect(page).toHaveURL(/login/);
  });

  // Xác minh rằng token xác thực của người dùng sẽ
  // bị vô hiệu hóa sau khi đăng xuất, ngăn chặn
  // việc sử dụng token cũ để truy cập vào tài nguyên được bảo vệ.
  test("Auth token invalidated after logout", async ({ page }) => {
    await page.waitForTimeout(1000); // Đợi một chút để đảm bảo mọi thao tác đã hoàn thành
    const logout = new LogoutPage(page);
    const token = await logout.getAccessToken();
    expect(token).toBeNull();
  });
});

// Xác minh rằng logout hoạt động đúng cho người dùng admin.
test("Logout works for admin", async ({ page }) => {
  const logout = new LogoutPage(page);
  await logout.logout(ENV.username, ENV.password);

  await expect(page).toHaveURL(/login/);
});
