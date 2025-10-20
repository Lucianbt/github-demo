// Calendar/date-of-birth field validation tests for the public form.
// Feeds valid/invalid values, submits the form, and checks UI error signals.
import { test, expect, Page } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Detects a validation error by checking common UI signals (heuristic)
async function hasRedOutline(page: Page, fieldName: string): Promise<boolean> {
  const field = page.locator(`input[name="${fieldName}"]`).first();
  // aria-invalid=true
  const ariaInvalid = (await field.getAttribute('aria-invalid')) || '';
  if (ariaInvalid === 'true') return true;
  // class contains 'failed'
  const cls = (await field.getAttribute('class')) || '';
  if (cls.includes('failed')) return true;
  // fallback to computed border color
  const borderColor = await field.evaluate((el) => {
    const computed = window.getComputedStyle(el as Element);
    return (computed as any).borderColor || (computed as any).borderTopColor || '';
  });
  return typeof borderColor === 'string' && (borderColor.includes('255, 0, 0') || borderColor.includes('220, 53, 69') || borderColor.includes('red'));
}

// ─── Test Data ──────────────────────────────────────────────────────────────

// Test data: valid dates
const validDates = [
  '10/18/2007',
  '12/20/1975',
];

// Test data: invalid dates and edge cases
const invalidDates = [
  { label: 'letters', value: 'aaaaaa' },
  { label: 'digits random', value: '1231233' },
  { label: 'specials', value: '!!!!' },
  { label: 'space', value: ' ' },
  { label: 'empty', value: '' },
  { label: 'under 18', value: '11/18/2007' },
  { label: 'future date', value: '10/18/2026' },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Data de Nastere (calendar) field validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="data"]')).toBeVisible({ timeout: 15000 });
  });

  test.describe('Valid dates', () => {
    for (const value of validDates) {
      test(`valid date: ${value}`, async ({ page }) => {
        const field = page.locator('input[name="data"]');
        await field.click();
        await field.fill('');
        await field.pressSequentially(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const red = await hasRedOutline(page, 'data');
        if (red) {
          throw new Error(`bug present: valid date '${value}' triggers red outline`);
        }
        expect(red).toBe(false);
      });
    }
  });

  test.describe('Invalid dates', () => {
    for (const { label, value } of invalidDates) {
      test(`invalid date: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const field = page.locator('input[name="data"]');
        await field.click();
        await field.fill('');
        await field.pressSequentially(value);
        await field.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const actual = await field.inputValue();
        const red = await hasRedOutline(page, 'data');
        // For invalids that the UI rejects, the field may end up empty, which is still invalid => should be red
        if (!red) {
          throw new Error(`bug present: invalid date '${value}' (actual '${actual}') does NOT trigger red outline`);
        }
        expect(red).toBe(true);
      });
    }
  });
});
