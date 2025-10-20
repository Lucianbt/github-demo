// Password and confirm-password validation tests.
// Verifies valid/invalid password rules and matching vs non-matching behavior.
import { test, expect, Page } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Test Data ──────────────────────────────────────────────────────────────

const validPasswords: { label: string, value: string }[] = [
  { label: 'A.repeat(5)+0 (digit)', value: 'AAAAA0' },
  { label: 'B.repeat(39)+0 (digit)', value: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0' },
  { label: 'a.repeat(5)+9 (digit)', value: 'aaaaa9' },
  { label: 'b.repeat(39)+9 (digit)', value: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb9' },
  { label: 'Z.repeat(4)+1+! (special)', value: 'ZZZZ1!' },
  { label: 'Y.repeat(38)+8+@ (special)', value: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY8@' },
  { label: 'z.repeat(38)+1+# (special)', value: 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz1#' },
  { label: 'y.repeat(4)+8+$ (special)', value: 'yyyy8$' },
  { label: 'digit+letter', value: '12345A' },
  { label: 'digit+letter', value: '12345Z' },
  { label: 'digit+letter', value: '98765a' },
  { label: 'digit+letter', value: '98765z' },
];

const invalidPasswords: { label: string, value: string }[] = [
  { label: 'too short (A)', value: 'AAAAA' },
  { label: 'too short (a)', value: 'aaaaa' },
  { label: 'too short (y)', value: 'yyyyy' },
  { label: 'too short (Z)', value: 'ZZZZZ' },
  { label: 'too long (B)', value: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB11' },
  { label: 'too long (b)', value: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb22' },
  { label: 'too long (Y)', value: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY33' },
  { label: 'too long (z)', value: 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz44' },
  { label: 'only letters (abcdef)', value: 'abcdef' },
  { label: 'only digits', value: '123456' },
  { label: 'only special', value: '!@#$!@' },
  { label: 'missing digit', value: 'abcde@' },
  { label: 'missing letter', value: '12345!' },
  { label: 'invalid special', value: 'abcd2%' },
  { label: 'diacritics', value: 'ȘȘȘȘȘ5' },
  { label: 'six spaces', value: '      ' },
  { label: 'empty', value: '' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

// Detects a validation error by checking common UI signals (heuristic)
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

test.describe('Parola si Confirmare Parola field validation', () => {
  const email = 'e2e_numeprenume@example.com';
  const password = 'Test1234!';
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="parola"]', { timeout: 15000 });
    await page.waitForSelector('input[name="confirmare"]', { timeout: 15000 });
  });

  test.describe('Valid matching passwords', () => {
    for (const { label, value } of validPasswords) {
      test(`valid matching: ${label} (${JSON.stringify(value)})`, async ({ page }) => {
        const parolaField = page.locator('input[name="parola"]');
        const confirmareField = page.locator('input[name="confirmare"]');
        await parolaField.fill(value);
        await confirmareField.fill(value);
        await parolaField.blur();
        await confirmareField.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const parolaRed = await hasRedOutline(page, 'parola');
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (parolaRed) {
          throw new Error(`bug present: valid value '${value}' triggers red outline on parola`);
        }
        if (confirmareRed) {
          throw new Error(`bug present: valid value '${value}' triggers red outline on confirmare`);
        }
        expect(parolaRed).toBe(false);
        expect(confirmareRed).toBe(false);
      });
    }
  });

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
        await page.waitForTimeout(300);
        // Read the actual values the browser accepted (maxlength or scripts may truncate/change)
        const actualParola = await parolaField.inputValue();
        const actualConfirmare = await confirmareField.inputValue();
        const parolaRed = await hasRedOutline(page, 'parola');
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (actualParola !== value) {
          // The UI modified the input (likely maxlength or sanitization). Treat as a failure.
          throw new Error(`bug present: attempted invalid value was modified by UI ('${value}' -> '${actualParola}')`);
        }
        // If the UI left the value intact, require at least one of the fields to be marked invalid.
        if (!parolaRed && !confirmareRed) {
          throw new Error(`bug present: invalid password '${value}' did NOT mark any field as invalid`);
        }
        expect(parolaRed || confirmareRed).toBe(true);
      });
    }
  });

  test.describe('Non-matching passwords', () => {
    for (const { label, value } of validPasswords.concat(invalidPasswords)) {
      test(`non-matching: ${label} (${JSON.stringify(value)} + 'x')`, async ({ page }) => {
        const parolaField = page.locator('input[name="parola"]');
        const confirmareField = page.locator('input[name="confirmare"]');
        await parolaField.fill(value);
        await confirmareField.fill(value + 'x');
        await parolaField.blur();
        await confirmareField.blur();
        await page.waitForTimeout(100);
        await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
        await page.waitForTimeout(300);
        const actualParola = await parolaField.inputValue();
        const actualConfirmare = await confirmareField.inputValue();
        // If the UI truncated/modified the values such that they are equal, mismatch can't be represented
        if (actualParola === actualConfirmare) {
          throw new Error(`bug present: intended mismatch for '${value}' could not be represented after input (both are '${actualParola}')`);
        }
        const confirmareRed = await hasRedOutline(page, 'confirmare');
        if (!confirmareRed) {
          throw new Error(`bug present: mismatch for '${value}' did NOT mark 'confirmare' as invalid`);
        }
        expect(confirmareRed).toBe(true);
      });
    }
  });
});
