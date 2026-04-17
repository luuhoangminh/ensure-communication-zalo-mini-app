import { expect, Locator, Page } from "@playwright/test";
import { RoleListPage } from "./role-list.page";

type RandomTextOptions = {
  alphabet?: boolean;
  number?: boolean;
  special?: boolean;
  space?: boolean;
  vietnamese?: boolean;
};

export class Helper {
  static async getColumnValues(page: Page, columnIndex: number) {
    const role = new RoleListPage(page);
    const index = columnIndex + 1; // Adjust for nth-child starting at 1
    return role.tableRows.locator(`td:nth-child(${index})`).allTextContents();
  }

  static isSortedAsc(arr: string[]) {
    return arr.every(
      (v, i, a) =>
        !i ||
        v.localeCompare(a[i - 1], undefined, { sensitivity: "base" }) >= 0,
    );
  }

  static isSortedDesc(arr: string[]) {
    return arr.every(
      (v, i, a) =>
        !i ||
        v.localeCompare(a[i - 1], undefined, { sensitivity: "base" }) <= 0,
    );
  }

  static async verifyColumnSortedAsc(page: Page, columnIndex: number) {
    const values = await this.getColumnValues(page, columnIndex);
    expect(this.isSortedAsc(values)).toBeTruthy();
  }

  static async verifyColumnSortedDesc(page: Page, columnIndex: number) {
    const values = await this.getColumnValues(page, columnIndex);
    expect(this.isSortedDesc(values)).toBeTruthy();
  }

  static async verifyTextLength(
    locator: Locator,
    maxLength: number,
    options: RandomTextOptions = {},
  ) {
    await locator.fill(await Helper.randomText(maxLength + 1, options));

    // Lấy giá trị thực tế trong input
    const searchValue = await locator.inputValue();

    expect(searchValue.length).toBeLessThanOrEqual(maxLength);
  }

  static async randomText(length: number, options: RandomTextOptions = {}): Promise<string> {
    const defaultOptions = {
      alphabet: true,
      number: true,
      special: true,
      space: true,
      vietnamese: true,
    };

    const finalOptions = { ...defaultOptions, ...options };

    const chars = {
      alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
      number: "0123456789",
      special: "!@#$%^&*()_+[]{}|;:,.<>?",
      space: " ",
      vietnamese:
        "aàáạảãâầấậẩẫăằắặẳẵeèéẹẻẽêềếệểễiìíịỉĩoòóọỏõôồốộổỗơờớợởỡuùúụủũưừứựửữyỳýỵỷỹdđ" +
        "AÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴEÈÉẸẺẼÊỀẾỆỂỄIÌÍỊỈĨOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠUÙÚỤỦŨƯỪỨỰỬỮYỲÝỴỶỸDĐ",
    };

    const enabledSets: string[] = [];

    if (finalOptions.alphabet) enabledSets.push(chars.alphabet);
    if (finalOptions.number) enabledSets.push(chars.number);
    if (finalOptions.special) enabledSets.push(chars.special);
    if (finalOptions.space) enabledSets.push(chars.space);
    if (finalOptions.vietnamese) enabledSets.push(chars.vietnamese);

    if (enabledSets.length === 0) {
      throw new Error("At least one character type must be selected");
    }

    // ❗ Nếu length < số loại → không thể đảm bảo đủ
    if (length < enabledSets.length) {
      throw new Error("Length must be >= number of enabled character sets");
    }

    let result: string[] = [];

    for (const set of enabledSets) {
      const rand = set[Math.floor(Math.random() * set.length)];
      result.push(rand);
    }

    const pool = enabledSets.join("");

    // Fill phần còn lại
    for (let i = result.length; i < length; i++) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      result.push(rand);
    }

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result.join("");
  }

  static async verifyInputText(inputLocator: Locator, errorMsg: Locator, expectedText: string, options: RandomTextOptions = {}) {
    const defaultOptions = {
      alphabet: false,
      number: false,
      special: false,
      space: false,
      vietnamese: false,
    };
    const finalOptions = { ...defaultOptions, ...options };

    for (const key in finalOptions) {
      const options = {
        alphabet: false,
        number: false,
        special: false,
        space: false,
        vietnamese: false,
      };
      if (finalOptions[key as keyof RandomTextOptions]) {
        options[key as keyof RandomTextOptions] = true;
        await inputLocator.fill("");
        await inputLocator.fill(await Helper.randomText(5, options));
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(expectedText);
      }
    }
  }
}
