// Field validation tests for current profession (Profesie Actuala) and phone number (Telefon).
// Ensures valid inputs pass and invalid inputs trigger visible UI validation.
import { test, expect } from '@playwright/test';
import { readCsvSync } from './helpers/readCsv';
import { hasRedOutline, screenshotAfterEach } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

const csv = readCsvSync('tests/data/profesie-telefon.csv');

test.describe('Profesie Actuala and Telefon field validation', () => {
  // Use the top-level CSV already read above
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[name="profesie"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="telefon"]')).toBeVisible({ timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'profesie-telefon'));

  test.describe('Profesie Actuala field', () => {
  const profesieValid: string[] = csv.filter((r: string[]) => r[0] === 'profesie_valid').map((r: string[]) => r[1]);
  const profesieInvalid: { label: string; value: string }[] = csv
    .filter((r: string[]) => r[0] === 'profesie_invalid')
    .map((r: string[]) => ({ label: r[1], value: r[2] }));

  for (const value of profesieValid) {
      test(`profesie valid: "${value}"`, async ({ page }) => {
        const field = page.locator('input[name="profesie"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'profesie');
        if (hasError) {
          throw new Error(`bug present: valid value '${value}' triggers red outline`);
        }
        expect(hasError).toBe(false);
        // Truncation check
        const actualValue = await field.inputValue();
        if (actualValue !== value) {
          throw new Error(`bug present: value '${value}' was truncated to '${actualValue}'`);
        }
      });
    }

  for (const { label, value } of profesieInvalid) {
      test(`profesie invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="profesie"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'profesie');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
        // Truncation check
        const actualValue = await field.inputValue();
        if (label === 'too long' && actualValue.length !== 101) {
          throw new Error(`bug present: value '${value}' was truncated to '${actualValue}'`);
        }
      });
    }
  });

  test.describe('Telefon field', () => {
  const telefonValid: string[] = csv.filter((r: string[]) => r[0] === 'telefon_valid').map((r: string[]) => r[1]);
  const telefonInvalid: { label: string; value: string }[] = csv
    .filter((r: string[]) => r[0] === 'telefon_invalid')
    .map((r: string[]) => ({ label: r[1], value: r[2] }));

  for (const value of telefonValid) {
      test(`telefon valid: "${value}"`, async ({ page }) => {
        const field = page.locator('input[name="telefon"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'telefon');
        if (hasError) {
          throw new Error(`bug present: valid value '${value}' triggers red outline`);
        }
        expect(hasError).toBe(false);
      });
    }

  for (const { label, value } of telefonInvalid) {
      test(`telefon invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="telefon"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'telefon');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });
});
