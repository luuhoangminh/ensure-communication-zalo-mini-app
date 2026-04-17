import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login.page';
import { VALID_USER, INVALID_USER, LOGIN_PAGE } from '../config/env';
import { Helper } from '../helpers/utils.helper';

test.describe('LOGIN FUNCTIONAL', () => {

    test.describe('LOGIN', () => {

        test('limit characters in email and password fields', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();
            await Helper.verifyTextLength(login.email, 255);
            await Helper.verifyTextLength(login.password, 255);
        });
        // Xác minh rằng người dùng sẽ có thể đăng nhập bằng 
        // tài khoản của họ bằng thông tin đăng nhập chính xác.
        test('Login with correct credential', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.login(VALID_USER.email, VALID_USER.password);

            await login.verifyLogin();
        });

        // Xác minh thông tin đăng nhập của người dùng 
        // vẫn còn trên field input sau khi nhấp vào ghi nhớ 
        // và quay lại màn hình đăng nhập một lần nữa.
        // test('Remember me keeps credential', async ({ page }) => {
        //     const login = new LoginPage(page);
        //     await login.goto();

        //     await login.email.fill(VALID_USER.email);
        //     await login.password.fill(VALID_USER.password);
        //     await login.remember.check();
        //     await login.loginBtn.click();

        //     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        //     await page.locator('#userDropdown').click();
        //     await page.locator('.lpx-content-container').locator('#MenuItem_Account_Logout').click();
        //     // await page.reload();

        //     await expect(login.email).toHaveValue(VALID_USER.email);
        // });

        // Xác minh rằng người dùng đăng nhập bằng 
        // cách nhấn phím Enter sau khi nhập thông tin 
        // đăng nhập chính xác sẽ được chuyển hướng đến trang tổng quan.
        test('Login by Enter key', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.email.fill(VALID_USER.email);
            await login.password.fill(VALID_USER.password);
            await login.password.press('Enter');
            
            await login.verifyLogin();
        });

        // Xác minh rằng người dùng sẽ không thể nhìn thấy mật khẩu của họ khi nhập vào trường mật khẩu.
        test('Password must be masked', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await expect(login.password).toHaveAttribute('type', 'password');
        });

        // Xác minh rằng người dùng có thể nhấp vào biểu tượng con mắt để hiển thị mật khẩu của họ.
        test('Eye icon toggles password', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.eyeIcon.click();
            await expect(login.password).toHaveAttribute('type', 'text');
        });

        // Xác minh rằng người dùng sẽ không thể đăng nhập 
        // với thông tin đăng nhập thiếu password 
        // và sẽ nhận được thông báo lỗi phù hợp.
        test('Error when only email entered', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.email.fill(VALID_USER.email);
            await login.loginBtn.click();
            await expect(login.errorMsgPass).toBeVisible();
        });

        // Xác minh rằng người dùng sẽ không thể đăng nhập 
        // với thông tin đăng nhập thiếu username password 
        // và sẽ nhận được thông báo lỗi phù hợp.
        test('Error when entered', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.loginBtn.click();

            await expect(login.errorMsgUser).toBeVisible();
            await expect(login.errorMsgPass).toBeVisible();
        });

        // Xác minh rằng người dùng sẽ không thể đăng nhập 
        // với thông tin đăng nhập không chính xác 
        // và sẽ nhận được thông báo lỗi phù hợp.
        test('Invalid credential error', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.email.fill(INVALID_USER.email);
            await login.password.fill(INVALID_USER.password);
            await login.loginBtn.click();

            await expect(login.errorMsg).toBeVisible();
            await expect(login.errorMsg).toHaveText('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
        });

        // Xác minh rằng người dùng sẽ không thể đăng nhập 
        // với username không hợp lệ 
        // và sẽ nhận được thông báo lỗi phù hợp.
        test('Error invalid username', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.login(INVALID_USER.email, VALID_USER.password);

            await expect(login.errorMsg).toBeVisible();
            await expect(login.errorMsg).toHaveText('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
        });

        // Xác minh rằng người dùng sẽ không thể đăng nhập
        // với nội dung SQL Injection trong trường username hoặc password
        // và sẽ nhận được thông báo lỗi phù hợp.
        test('SQL Injection prevention', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();

            await login.login("' OR 1=1 --", "anything");

            await expect(login.errorMsg).toBeVisible();
            await expect(login.errorMsg).toHaveText('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
        });

        // Xác minh rằng người dùng sẽ bị giới hạn số lần đăng nhập thất bại
        // và sẽ nhận được thông báo lỗi phù hợp sau một số lần cố gắng đăng nhập không thành công.
        // test('Rate limit after multiple fail login', async ({ page }) => {
        //     const login = new LoginPage(page);
        //     await login.goto();

        //     for (let i = 0; i < 6; i++) {
        //         await login.login('wrong@test.com', 'wrong');
        //     }

        //     await expect(login.errorMsg).toContainText('Too many attempts');
        // });

        // Cần kiểm tra thêm nội dung thông báo lỗi để 
        // đảm bảo rằng nó phản ánh chính xác vấn đề 
        // với thông tin đăng nhập của người dùng.
    });

    test.describe('FORGOT PASSWORD', () => {
        test('Forgot password link is visible and clickable', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();
            await expect(login.forgotPasswordLink).toBeVisible();
            await login.forgotPasswordLink.click();
            await expect(page).toHaveURL(/forgot-password/);
        });

        test('Forgot password show error message for email format', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();
            await expect(login.forgotPasswordLink).toBeVisible();
            await login.forgotPasswordLink.click();
            await expect(page).toHaveURL(/forgot-password/);
            await login.emailForgotPasswordInput.fill(INVALID_USER.email);
            
            await expect(login.errorMsg).toHaveText('Trường này phải là email!');
        });

        test('Forgot password show error message for invalid email', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();
            await expect(login.forgotPasswordLink).toBeVisible();
            await login.forgotPasswordLink.click();
            await expect(page).toHaveURL(/forgot-password/);
            await login.emailForgotPasswordInput.fill('wrongemail@123.vn');
            await login.loginBtn.click();
            await login.waitForData();

            await expect(login.errorMsg).toHaveText('Không tìm thấy người dùng được chỉ định.');
        });

        test('Forgot password send mail successfully', async ({ page }) => {
            const login = new LoginPage(page);
            await login.goto();
            await expect(login.forgotPasswordLink).toBeVisible();
            await login.forgotPasswordLink.click();
            await expect(page).toHaveURL(/forgot-password/);
            await login.emailForgotPasswordInput.fill('minh.luu@fractal.vn');
            await login.loginBtn.click();
            await login.waitForData();

            await expect(page.locator('p.ng-star-inserted')).toContainText('Email hướng dẫn thiết lập mật khẩu mới đã được gửi. Vui lòng kiểm tra email');
        });
    });
    
});