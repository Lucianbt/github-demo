// Password and confirm-password validation tests.
// Uses CSV-driven input to verify valid and invalid password behavior.
import { test, expect } from '@playwright/test';
import { readCsvSync } from './helpers/readCsv';
import { hasRedOutline, screenshotAfterEach, fillByJs } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// Test data
const csv = readCsvSync('tests/data/confirmareparola.csv');
const validPasswords: { label: string; value: string }[] = csv
  .filter((r: string[]) => r[0] === 'valid')
  .map((r: string[]) => ({ label: r[1], value: r[2] }));
const invalidPasswords: { label: string; value: string }[] = csv
  .filter((r: string[]) => r[0] === 'invalid')
  .map((r: string[]) => ({ label: r[1], value: r[2] }));

test.describe('Parola si Confirmare Parola field validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="parola"]', { timeout: 15000 });
    await page.waitForSelector('input[name="confirmare"]', { timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'confirmareparola'));

  // Valid matching passwords: both fields filled with a valid password -> no red outline
  test.describe('Valid matching passwords', () => {
    for (const { label, value } of validPasswords) {
      test(`valid matching: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
  const parolaField = page.locator('input[name="parola"]');
  const confirmareField = page.locator('input[name="confirmare"]');
  // Use JS fill to bypass client-side truncation and ensure exact value is set
  await fillByJs(parolaField, value);
  await fillByJs(confirmareField, value);
        await parolaField.blur();
        await confirmareField.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const parolaRed = await hasRedOutline(page, 'parola');
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (parolaRed) throw new Error(`bug present: valid value '${value}' triggers red outline on parola`);
        if (confirmareRed) throw new Error(`bug present: valid value '${value}' triggers red outline on confirmare`);
        expect(parolaRed).toBe(false);
        expect(confirmareRed).toBe(false);
      });
    }
  });

  // Invalid matching passwords: UI should either sanitize/truncate (fail) or mark invalid
  test.describe('Invalid matching passwords', () => {
    for (const { label, value } of invalidPasswords) {
      test(`invalid matching: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const parolaField = page.locator('input[name="parola"]');
        const confirmareField = page.locator('input[name="confirmare"]');
        await parolaField.fill(value);
        await confirmareField.fill(value);
        await parolaField.blur();
        await confirmareField.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const actualParola = await parolaField.inputValue();
        const parolaRed = await hasRedOutline(page, 'parola');
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (actualParola !== value) throw new Error(`bug present: attempted invalid value was modified by UI ('${value}' -> '${actualParola}')`);
        if (!parolaRed && !confirmareRed) throw new Error(`bug present: invalid password '${value}' did NOT mark any field as invalid`);
        expect(parolaRed || confirmareRed).toBe(true);
      });
    }
  });

  // Non-matching passwords: confirmare must be marked invalid
  test.describe('Non-matching passwords', () => {
    for (const { label, value } of validPasswords.concat(invalidPasswords)) {
      test(`non-matching: ${label} (${JSON.stringify(value)} + 'x')`, async ({ page }) => {
  const parolaField = page.locator('input[name="parola"]');
  const confirmareField = page.locator('input[name="confirmare"]');
  await fillByJs(parolaField, value);
  await fillByJs(confirmareField, value + 'x');
        await parolaField.blur();
        await confirmareField.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(1500);
        const actualParola = await parolaField.inputValue();
        const actualConfirmare = await confirmareField.inputValue();
        if (actualParola === actualConfirmare) throw new Error(`bug present: intended mismatch for '${value}' could not be represented after input (both are '${actualParola}')`);
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (!confirmareRed) throw new Error(`bug present: mismatch for '${value}' did NOT mark 'confirmare' as invalid`);
        expect(confirmareRed).toBe(true);
      });
    }
  });
});
