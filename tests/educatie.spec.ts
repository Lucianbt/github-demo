// "Educatie" textarea behavior and validation tests.
// Covers enable/disable via checkbox, valid/invalid content, and typing behavior.
import { test, expect } from '@playwright/test';
import { readCsvSync } from './helpers/readCsv';
import { hasRedOutline, pressSequentially, screenshotAfterEach, expandPlaceholders } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

test.describe('Educatie textarea', () => {
  const csv = readCsvSync('tests/data/educatie.csv');
  const validValues: string[] = csv.filter((r) => r[0] === 'valid').map((r) => expandPlaceholders(r[1]));
  const invalidValues: string[] = csv.filter((r) => r[0] === 'invalid').map((r) => expandPlaceholders(r[1]));

  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'educatie'));

  // Ensure the controlling checkbox properly toggles the textarea enabled state
  test('Checkbox disables and enables textarea', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][name="educatie-no"]');
    const textarea = page.locator('textarea[name="educatie"], input[name="educatie"]');
    // Unchecked: textarea enabled
    await expect(checkbox).not.toBeChecked();
    await expect(textarea).toBeEnabled();
    // Check the box: textarea disabled
    await checkbox.check();
    await expect(textarea).toBeDisabled();
    // Uncheck: textarea enabled again
    await checkbox.uncheck();
    await expect(textarea).toBeEnabled();
  });

  // Accepts: these inputs should not produce validation errors or truncation (except at 256 boundary)
  for (const value of validValues) {
    test(`Accepts valid value: "${value.length > 20 ? value.slice(0, 20) + '...' : value}"`, async ({ page }) => {
  const checkbox = page.locator('input[type="checkbox"][name="educatie-no"]');
  const textarea = page.locator('textarea[name="educatie"], input[name="educatie"]');
      await checkbox.uncheck();
  await textarea.fill('');
  // Use pressSequentially to simulate typing and trigger validators/masks
  await pressSequentially(textarea, value);
  // Submit
  await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
  // Should not have red outline
  expect(await hasRedOutline(textarea)).toBeFalsy();
      // Truncation logic: if 256 characters are typed, value should be exactly 256. If less, it was truncated.
      const val = await textarea.inputValue();
      if (value.length === 256) {
        expect(val.length).toBe(256);
      } else if (value.length > 256) {
        // Should be truncated to 256
        expect(val.length).toBeLessThan(256);
      } else {
        expect(val.length).toBe(value.length);
      }
    });
  }

  // Rejects: these inputs should surface validation styling when submitted
  for (const value of invalidValues) {
    test(`Rejects invalid value: "${value.length > 20 ? value.slice(0, 20) + '...' : value}"`, async ({ page }) => {
  const checkbox = page.locator('input[type="checkbox"][name="educatie-no"]');
  const textarea = page.locator('textarea[name="educatie"], input[name="educatie"]');
      await checkbox.uncheck();
  await textarea.fill('');
  await pressSequentially(textarea, value);
  // Submit
  await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
  // Should have red outline
  expect(await hasRedOutline(textarea)).toBeTruthy();
    });
  }

  // When disabled, typing should not change the value
  test('Textarea is disabled when checkbox is checked', async ({ page }) => {
  const checkbox = page.locator('input[type="checkbox"][name="educatie-no"]');
  const textarea = page.locator('textarea[name="educatie"], input[name="educatie"]');
    await checkbox.check();
    await expect(textarea).toBeDisabled();
    // Try to type: Playwright does not throw, so check value remains unchanged
    const initialValue = await textarea.inputValue();
  await pressSequentially(textarea, 'Should not work');
    expect(await textarea.inputValue()).toBe(initialValue);
  });

  // When enabled, user input should be accepted normally
  test('Can type when checkbox is unchecked', async ({ page }) => {
  const checkbox = page.locator('input[type="checkbox"][name="educatie-no"]');
  const textarea = page.locator('textarea[name="educatie"], input[name="educatie"]');
    await checkbox.uncheck();
    await expect(textarea).toBeEnabled();
  await textarea.fill('');
  await pressSequentially(textarea, 'abc');
    expect(await textarea.inputValue()).toBe('abc');
  });
});
