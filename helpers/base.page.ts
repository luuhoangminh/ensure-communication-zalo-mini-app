import { Page, Locator, expect, request } from "@playwright/test";
import { API } from "../config/env";

export class BasePage {
    constructor(protected page: Page) {}

    // Helper method to wait for data to load based on network idle or specific API response
    async waitForData(urlPart: string = "") {
        if (!urlPart) {
            await this.page.waitForLoadState("networkidle");
        } else {
            await this.page.waitForResponse(
                (res) => res.url().includes(urlPart) && res.status() === 200,
            );
        }
    }

    // Helper method to navigate to a URL and wait for the page to load
    async goto(url: string) {
        await Promise.all([
            this.waitForData(),
            this.page.goto(url)
        ]);
    }
    
    // Helper method to check placeholder text of a locator
    // This method only used for search input
    async checkPlaceholderText(locator: Locator, text: string) {
        await expect(locator).toHaveAttribute('placeholder', text);
    }
    
    // Helper method to perform search by keyword and wait for results to load
    async searchByKeyword(searchInput: Locator, keyword: string, urlPart: string) {
        await searchInput.fill(keyword);
        await this.page.keyboard.press('Enter');
        await this.waitForData(urlPart);
    }

    async getAccessToken() {
        return await this.page.evaluate(() => {
            return localStorage.getItem('access_token');
        });
    }

    async getResponseData(urlPart: string) {
        const accessToken = await this.getAccessToken();
        const apiContext = await request.newContext({
            baseURL: API.baseApiUrl,
            extraHTTPHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const response = await apiContext.get(urlPart);

        return response.json();
    }
}
