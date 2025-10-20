// Dropdown validation tests for "Modulul Dorit" and dependent "Perioada Dorita".
// Validates that selecting modules reveals appropriate period selectors and
// that the UI flags missing/invalid choices via standard error signals.
import { test, expect, Page } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Heuristic for detecting validation error styling on inputs
async function hasRedOutline(page: Page, fieldName: string): Promise<boolean> {
  const field = page.locator(`[name="${fieldName}"]`).first();
  const ariaInvalid = (await field.getAttribute('aria-invalid')) || '';
  if (ariaInvalid === 'true') return true;
  const cls = (await field.getAttribute('class')) || '';
  if (cls.includes('failed')) return true;
  const borderColor = await field.evaluate((el) => {
    const computed = window.getComputedStyle(el as Element);
    return (computed as any).borderColor || (computed as any).borderTopColor || '';
  });
  return typeof borderColor === 'string' && (borderColor.includes('255, 0, 0') || borderColor.includes('220, 53, 69') || borderColor.includes('red'));
}

// ─── Test Data ──────────────────────────────────────────────────────────────

const validModules = [
  'Iniţiere în Software Testing - 900',
  'Introducere în Test Automation - 1800 RON',
  'Iniţiere în REST API testing – discount sarbatori - 1500 RON',
];
const defaultModule = 'Alege Modulul Dorit';

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Modulul Dorit and Perioada Dorita dropdown validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[name="modul"]')).toBeVisible({ timeout: 15000 });
  });

  test('modul default value is invalid (red outline)', async ({ page }) => {
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    await page.waitForTimeout(300);
    const hasError = await hasRedOutline(page, 'modul');
    expect(hasError).toBe(true);
  });

  const moduleOptions = [
    { value: '254', label: 'Iniţiere în Software Testing - 900' },
    { value: '261', label: 'Introducere în Test Automation - 1800 RON' },
    { value: '649', label: 'Iniţiere în REST API testing – discount sarbatori - 1500 RON' },
  ];
  for (const module of moduleOptions) {
    test(`modul valid: ${module.label} (no red outline)`, async ({ page }) => {
      const modulDropdown = page.locator('[name="modul"]');
      await modulDropdown.selectOption({ value: module.value });
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      await page.waitForTimeout(300);
      const hasError = await hasRedOutline(page, 'modul');
      expect(hasError).toBe(false);
    });
  }
});

// Perioada dorita behavior tests
test.describe('Perioada Dorita dropdown behavior', () => {
  const moduleOptions = [
    { value: '254', label: 'Iniţiere în Software Testing - 900', perioadaId: '#perioada-254' },
    { value: '261', label: 'Introducere în Test Automation - 1800 RON', perioadaId: '#perioada-261' },
    { value: '649', label: 'Iniţiere în REST API testing – discount sarbatori - 1500 RON', perioadaId: '#perioada-649' },
  ];

  test('perioada dorita not present when default module selected', async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#perioada-254, #perioada-261, #perioada-649')).toHaveCount(0);
  });

  for (const module of moduleOptions) {
    test(`perioada dorita present and shows number for module: ${module.label}`, async ({ page }) => {
      await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
      const modulDropdown = page.locator('[name="modul"]');
      await modulDropdown.selectOption({ value: module.value });
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      await page.waitForTimeout(300);
      const perioadaDropdown = page.locator(module.perioadaId);
      await expect(perioadaDropdown).toBeVisible({ timeout: 5000 });
      const slotText = await perioadaDropdown.textContent();
      const match = slotText ? slotText.match(/\d+/) : null;
      const slotNumber = match ? match[0] : null;
      // Should show a number
      expect(slotNumber).not.toBeNull();
      // Should show red outline
      const hasPerioadaError = await hasRedOutline(page, module.perioadaId.replace('#', ''));
      expect(hasPerioadaError).toBe(true);
    });
  }

  for (const module of moduleOptions) {
    test(`perioada dorita present but no number for module: ${module.label} (bug)`, async ({ page }) => {
      await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
      const modulDropdown = page.locator('[name="modul"]');
      await modulDropdown.selectOption({ value: module.value });
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      await page.waitForTimeout(300);
      const perioadaDropdown = page.locator(module.perioadaId);
      await expect(perioadaDropdown).toBeVisible({ timeout: 5000 });
      const slotText = await perioadaDropdown.textContent();
      const match = slotText ? slotText.match(/\d+/) : null;
      const slotNumber = match ? match[0] : null;
      // If no number, it's a bug
      if (!slotNumber) {
        throw new Error('Perioada dorita present but no number shown (bug)');
      }
    });
  }

  test('no red outline when perioada dorita not present', async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    await page.waitForTimeout(300);
    // Should not show red outline for perioada dorita
    for (const module of moduleOptions) {
      const hasPerioadaError = await hasRedOutline(page, module.perioadaId.replace('#', ''));
      expect(hasPerioadaError).toBe(false);
    }
  });
});

