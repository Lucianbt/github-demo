// First/last name validation tests (Nume/Prenume) for the public form.
// Covers valid/invalid character sets and length boundaries using UI error signals.
import { test, expect } from '@playwright/test';
import { readCsvSync } from './helpers/readCsv';
import { hasRedOutline, screenshotAfterEach, fillByJs } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

  test.describe('Nume and Prenume field validation', () => {
  // email/password were previously used for end-to-end flows; not needed by these validation tests
  const csv = readCsvSync('tests/data/numeprenume.csv');
  const numeValid = csv.filter((r: string[]) => r[0] === 'nume_valid').map((r: string[]) => r[1]);
  const numeInvalid = csv.filter((r: string[]) => r[0] === 'nume_invalid').map((r: string[]) => ({ label: r[1], value: r[2] }));
  const prenumeValid = csv.filter((r: string[]) => r[0] === 'prenume_valid').map((r: string[]) => r[1]);
  const prenumeInvalid = csv.filter((r: string[]) => r[0] === 'prenume_invalid').map((r: string[]) => ({ label: r[1], value: r[2] }));

  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="nume"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="prenume"]')).toBeVisible({ timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'numeprenume'));

  test.describe('Nume field', () => {
    const validValues = numeValid;
    const invalidValues = numeInvalid;


    for (const value of validValues) {
      test(`nume valid: "${value}"`, async ({ page }) => {
        const numeField = page.locator('input[name="nume"]');
  await fillByJs(numeField, value);
        await numeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'nume');
        if (hasError) {
          throw new Error(`bug present: valid value '${value}' triggers red outline`);
        }
        expect(hasError).toBe(false);
      });
    }

    for (const { label, value } of invalidValues) {
      test(`nume invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const numeField = page.locator('input[name="nume"]');
  await fillByJs(numeField, value);
        await numeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'nume');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });

  test.describe('Prenume field', () => {
    const validValues = prenumeValid;
    const invalidValues = prenumeInvalid;

    for (const value of validValues) {
      test(`prenume valid: "${value}"`, async ({ page }) => {
        const prenumeField = page.locator('input[name="prenume"]');
  await fillByJs(prenumeField, value);
        await prenumeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'prenume');
        if (hasError) {
          throw new Error(`bug present: valid value '${value}' triggers red outline`);
        }
        expect(hasError).toBe(false);
      });
    }

    for (const { label, value } of invalidValues) {
      test(`prenume invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const prenumeField = page.locator('input[name="prenume"]');
  await fillByJs(prenumeField, value);
        await prenumeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const hasError = await hasRedOutline(page, 'prenume');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });
});
