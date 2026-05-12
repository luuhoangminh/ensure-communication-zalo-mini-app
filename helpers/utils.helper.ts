import { expect, Locator, Page } from "@playwright/test";
import { RoleListPage } from "./role-list.page";
import fs from 'fs';
import { error } from "node:console";

type RandomTextOptions = {
  alphabet?: boolean;
  number?: boolean;
  special?: boolean;
  space?: boolean;
  vietnamese?: boolean;
};

type DenyTextOptions = {
  alphabet?: boolean;
  number?: boolean;
  special?: boolean;
  space?: boolean;
  vietnamese?: boolean;
};

type CompareItem = {
    id: number;
    name: string;
};

export class Helper {
  static async getColumnValues(page: Page, columnIndex: number) {
    const role = new RoleListPage(page);
    const index = columnIndex + 1; // Adjust for nth-child starting at 1
    return role.tableRows.locator(`td:nth-child(${index})`).allTextContents();
  }

  static parseDate(dateStr: string): Date {
    const [day, month, year] =
      dateStr.split('/').map(Number);

    return new Date(year, month - 1, day);
  }
  
  static parseDateTime(dateTimeStr: string): Date {
    const [timePart, datePart] =
      dateTimeStr.split(' ');

    const [hour, minute, second] =
      timePart.split(':').map(Number);

    const [day, month, year] =
      datePart.split('/').map(Number);

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );
  }

  static compareValues(a: string, b: string): number {
    const valA = a.trim();
    const valB = b.trim();

    // ===== DATE: DD/MM/YYYY =====
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

    if (dateRegex.test(valA) && dateRegex.test(valB)) {
      const dateA = this.parseDate(valA).getTime();
      const dateB = this.parseDate(valB).getTime();

      return dateA - dateB;
    }

    // ===== DATETIME: HH:mm:ss DD/MM/YYYY =====
    const dateTimeRegex =
      /^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/;

    if (
      dateTimeRegex.test(valA) &&
      dateTimeRegex.test(valB)
    ) {
      const dateA = this.parseDateTime(valA).getTime();
      const dateB = this.parseDateTime(valB).getTime();

      return dateA - dateB;
    }

    // ===== NUMBER =====
    if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
      return Number(valA) - Number(valB);
    }

    // ===== DEFAULT STRING =====
    return valA.localeCompare(valB, undefined, {
      sensitivity: 'base',
    });
  }

  static isSortedAsc(arr: string[]) {
    return arr.every((v, i, a) => {
      if (i === 0) return true;

      return (
        this.compareValues(a[i - 1], v) <= 0
      );
    });
  }

  static isSortedDesc(arr: string[]) {
    return arr.every((v, i, a) => {
      if (i === 0) return true;

      return (
        this.compareValues(a[i - 1], v) >= 0
      );
    });
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

  static async verifyInputText(inputLocator: Locator, errorMsg: Locator, expectedText: string, options: DenyTextOptions = {}) {
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
      if (finalOptions[key as keyof DenyTextOptions]) {
        options[key as keyof DenyTextOptions] = true;
        await inputLocator.fill("");
        await inputLocator.fill(await Helper.randomText(5, options));
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(expectedText);
      } else {
        options[key as keyof DenyTextOptions] = true;
        await inputLocator.fill("");
        await inputLocator.fill(await Helper.randomText(5, options));
        await expect(errorMsg).not.toBeVisible();
      }
    }
  }

  static async verifyInputEmail(inputLocator: Locator, errorMsg: Locator, expectedText: string) {
    const page = inputLocator.page();
    const invalidEmails = [
      "plainaddress",
      "plainaddress@",
      "plainaddress@gmail",
      "plainaddress @gmail",
      "@missingusername.com",
      "username@.com",
      "username@com",
      "username@domain..com",
    ];

    for (const email of invalidEmails) {
      await inputLocator.fill(email);
      await page.waitForTimeout(500);
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText(expectedText);
    }
    await inputLocator.fill('test@gmail.com');
    await page.waitForTimeout(500);
    await expect(errorMsg).not.toBeVisible();
  }

  static async verifyArrayByIdAndName(
    actual: { id: number; name: string }[],
    expected: { id: number; name: string }[]
  ) {
      // verify length
      expect(
          actual.length,
          `Different array length:
            actual=${actual.length}
            expected=${expected.length}`
      ).toBe(expected.length);

      const expectedMap = new Map(
          expected.map((item) => [item.id, item.name])
      );

      const differences: string[] = [];

      for (const actualItem of actual) {
          const expectedName = expectedMap.get(actualItem.id);

          // missing id
          if (expectedName === undefined) {
              differences.push(
                  `Missing id=${actualItem.id} in expected array`
              );
              continue;
          }

          // different name
          if (actualItem.name !== expectedName) {
              differences.push(
                  `Different name at id=${actualItem.id}
                  actual="${actualItem.name}"
                  expected="${expectedName}"`
              );
          }
      }

      expect(
          differences,
          differences.join("\n")
      ).toEqual([]);
  }

  static async getAndIncrementCounter(filePath: string) {
    // đọc file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // parse csv
    const lines = fileContent.trim().split('\n');

    // lấy số hiện tại
    const currentNumber = Number(lines[0]);

    // tăng +1
    const newNumber = currentNumber + 1;

    // update lại csv
    const updatedContent =
    `${newNumber}`;

    fs.writeFileSync(filePath, updatedContent);

    // return số mới
    return newNumber;
  }

  static async getCurrentDateTime(daysToAdd: number = 0) {
    const now = new Date();

    // cộng thêm ngày
    now.setDate(now.getDate() + daysToAdd);

    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
  }
}
