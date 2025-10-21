// Calendar (date of birth) validation tests.
// Each scenario feeds values (from CSV) into the date field, submits the form
// and verifies whether the UI marks the input as invalid (red outline) or not.
import { test, expect } from '@playwright/test';
import { readCsvSync } from './helpers/readCsv';
import { hasRedOutline, pressSequentially, screenshotAfterEach } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// Test data (CSV-driven)
const csv = readCsvSync('tests/data/calendar.csv');
const validDates: string[] = csv.filter((r: string[]) => r[0] === 'valid').map((r: string[]) => r[1]);
const invalidDates: { label: string; value: string }[] = csv
  .filter((r: string[]) => r[0] === 'invalid')
  .map((r: string[]) => ({ label: r[1], value: r[1] }));

test.describe('Data de Nastere (calendar) field validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="data"]')).toBeVisible({ timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'calendar'));

  // Valid dates - each should NOT trigger a validation error
  test.describe('Valid dates', () => {
    for (const value of validDates) {
      test(`valid date: ${value}`, async ({ page }) => {
        const field = page.locator('input[name="data"]');
        await field.click();
        await field.fill('');
        await pressSequentially(field, value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const red = await hasRedOutline(page, 'data');
        if (red) throw new Error(`bug present: valid date '${value}' triggers red outline`);
        expect(red).toBe(false);
      });
    }
  });

  // Invalid dates - each should produce a validation error
  test.describe('Invalid dates', () => {
    for (const { label, value } of invalidDates) {
      test(`invalid date: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="data"]');
        await field.click();
        await field.fill('');
        await pressSequentially(field, value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const actual = await field.inputValue();
        const red = await hasRedOutline(page, 'data');
        // If UI rejects the value and clears the input, it still counts as invalid
        if (!red) throw new Error(`bug present: invalid date '${value}' (actual '${actual}') does NOT trigger red outline`);
        expect(red).toBe(true);
      });
    }
  });
});
