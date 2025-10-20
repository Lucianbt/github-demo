// Field validation tests for current profession (Profesie Actuala) and phone number (Telefon).
// Ensures valid inputs pass and invalid inputs trigger visible UI validation.
import { test, expect, Page } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Heuristic to detect validation error states via aria-invalid, class, or red border
async function hasRedOutline(page: Page, fieldName: string): Promise<boolean> {
  const field = page.locator(`input[name="${fieldName}"]`).first();
  // Check aria-invalid
  const ariaInvalid = (await field.getAttribute('aria-invalid')) || '';
  if (ariaInvalid === 'true') return true;
  // Check class contains 'failed' (site adds this on validation)
  const cls = (await field.getAttribute('class')) || '';
  if (cls.includes('failed')) return true;
  // Fallback to computed border color
  const borderColor = await field.evaluate((el) => {
    const computed = window.getComputedStyle(el as Element);
    return (computed as any).borderColor || (computed as any).borderTopColor || '';
  });
  return typeof borderColor === 'string' && (borderColor.includes('255, 0, 0') || borderColor.includes('220, 53, 69') || borderColor.includes('red'));
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Profesie Actuala and Telefon field validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[name="profesie"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="telefon"]')).toBeVisible({ timeout: 15000 });
  });

  test.describe('Profesie Actuala field', () => {
    const validValues = [
      'A',
      'a',
      'Â',
      ' ',
      '1',
      '&',
      '*',
      'X'.repeat(100)
    ];
    const invalidValues = [
      { label: 'empty', value: '' },
      { label: 'too long', value: 'Y'.repeat(101) }
    ];

    for (const value of validValues) {
      test(`profesie valid: "${value}"`, async ({ page }) => {
        const field = page.locator('input[name="profesie"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
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

    for (const { label, value } of invalidValues) {
      test(`profesie invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="profesie"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
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
    const validValues = [
      '0742123123',
      '0711111111',
      '0799999999'
    ];
    const invalidValues = [
      { label: '10 letters', value: 'abcdefghij' },
      { label: '10 special', value: '!@#$%^&*()' },
      { label: '10 spaces', value: '          ' },
      { label: '9 digits starting 07', value: '074212312' },
      { label: '11 digits starting 07', value: '07421231234' },
      { label: '10 digits not starting 07', value: '0842123123' },
      { label: 'empty', value: '' }
    ];

    for (const value of validValues) {
      test(`telefon valid: "${value}"`, async ({ page }) => {
        const field = page.locator('input[name="telefon"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const hasError = await hasRedOutline(page, 'telefon');
        if (hasError) {
          throw new Error(`bug present: valid value '${value}' triggers red outline`);
        }
        expect(hasError).toBe(false);
      });
    }

    for (const { label, value } of invalidValues) {
      test(`telefon invalid: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="telefon"]');
        await field.fill(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const hasError = await hasRedOutline(page, 'telefon');
        if (!hasError) {
          throw new Error(`bug present: invalid value '${value}' does NOT trigger red outline`);
        }
        expect(hasError).toBe(true);
      });
    }
  });
});
