// First/last name validation tests (Nume/Prenume) for the public form.
// Covers valid/invalid character sets and length boundaries using UI error signals.
import { test, expect, Page } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Detects red outline via computed styles (heuristic)
async function hasRedOutline(page: Page, fieldName: string): Promise<boolean> {
  const field = page.locator(`input[name="${fieldName}"]`);
  const borderColor = await field.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return computed.borderColor || computed.borderTopColor;
  });
  // Red can be rgb(255, 0, 0) or variations like rgb(220, 53, 69) etc.
  return borderColor.includes('255, 0, 0') || borderColor.includes('220, 53, 69') || borderColor.includes('red');
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Nume and Prenume field validation', () => {
  const email = 'e2e_numeprenume@example.com';
  const password = 'Test1234!';

  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="nume"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="prenume"]')).toBeVisible({ timeout: 15000 });
  });

  test.describe('Nume field', () => {
    const validValues = [
      'A',
      'B'.repeat(29),
      'C'.repeat(30),
      'Z'
    ];
    const invalidValues = [
      { label: 'lowercase', value: 'a' },
      { label: 'lowercase', value: 'z' },
      { label: 'diacritic', value: 'â' },
      { label: 'space', value: ' ' },
      { label: 'empty', value: '' },
      { label: 'digit', value: '3' },
      { label: 'symbol', value: '!' },
      { label: 'too long', value: 'D'.repeat(31) }
    ];


    for (const value of validValues) {
      test(`nume valid: "${value}"`, async ({ page }) => {
        const numeField = page.locator('input[name="nume"]');
        await numeField.fill(value);
        await numeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
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
        await numeField.fill(value);
        await numeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const hasError = await hasRedOutline(page, 'nume');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });

  test.describe('Prenume field', () => {
    const validValues = [
      'A',
      'Y'.repeat(29),
      'Z'.repeat(30)
    ];
    const invalidValues = [
      { label: 'lowercase', value: 'a' },
      { label: 'lowercase', value: 'z' },
      { label: 'diacritic', value: 'â' },
      { label: 'space', value: ' ' },
      { label: 'empty', value: '' },
      { label: 'digit', value: '3' },
      { label: 'symbol', value: '!' },
      { label: 'too long', value: 'D'.repeat(31) }
    ];

    for (const value of validValues) {
      test(`prenume valid: "${value}"`, async ({ page }) => {
        const prenumeField = page.locator('input[name="prenume"]');
        await prenumeField.fill(value);
        await prenumeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
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
        await prenumeField.fill(value);
        await prenumeField.blur();
        await page.waitForTimeout(100);
        // Click Trimite to trigger validation
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const hasError = await hasRedOutline(page, 'prenume');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });
});
