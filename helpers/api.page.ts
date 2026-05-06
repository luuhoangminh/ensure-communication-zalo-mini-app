import { API, CATEGORY_LIST_PAGE, MR_LIST_PAGE, NEWS_LIST_PAGE, ROLE_LIST_PAGE, USER_LIST_PAGE } from "../config/env";

export class ApiPage {
    static readonly endpoints = {
        myProfile: API.myProfile,
        roleList: API.roleList,
        userList: API.userList,
        mrList: API.mrList,
        roleListPage: ROLE_LIST_PAGE.apiUrl,
        userListPage: USER_LIST_PAGE.apiUrl,
        userRoleList: USER_LIST_PAGE.roleListApiUrl,
        newsListPage: NEWS_LIST_PAGE.apiUrl,
        categoryListPage: CATEGORY_LIST_PAGE.apiUrl,
        mrListPage: MR_LIST_PAGE.apiUrl,
    };

    // APIs that return list data and can be limited by item count.
    static readonly listEndpoints = new Set<string>([
        ApiPage.endpoints.roleList,
        ApiPage.endpoints.userList,
        ApiPage.endpoints.mrList,
        ApiPage.endpoints.roleListPage,
        ApiPage.endpoints.userListPage,
        ApiPage.endpoints.userRoleList,
        ApiPage.endpoints.newsListPage,
        ApiPage.endpoints.categoryListPage,
        ApiPage.endpoints.mrListPage,
    ]);

    static buildListUrl(urlPart: string, itemCount: number = 10): string {
        const normalizedCount = Number.isFinite(itemCount) && itemCount > 0 ? Math.floor(itemCount) : 10;
        const [path, queryString = ""] = urlPart.split("?");
        const params = new URLSearchParams(queryString);

        params.set("limit", String(normalizedCount));
        if (!params.has("page")) {
            params.set("page", "1");
        }

        const query = params.toString();
        return query ? `${path}?${query}` : path;
    }

    static getApiUrl(urlPart: string, itemCount?: number): string {
        if (!ApiPage.listEndpoints.has(urlPart)) {
            return urlPart;
        }

        return ApiPage.buildListUrl(urlPart, itemCount ?? 10);
    }
}
