// Dropdown validation tests for "Modulul Dorit" and dependent "Perioada Dorita".
// Validates that selecting modules reveals appropriate period selectors and
// that the UI flags missing/invalid choices via standard error signals.
import { test, expect } from '@playwright/test';
import { hasRedOutline, screenshotAfterEach } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

async function clickSubmit(page: any) {
  const btn = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
  await expect(btn).toBeVisible({ timeout: 15000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
}

test.describe('Modulul Dorit and Perioada Dorita dropdown validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[name="modul"]')).toBeVisible({ timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'modul-perioada'));

  test('modul default value is invalid (red outline)', async ({ page }) => {
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await clickSubmit(page);
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
      await clickSubmit(page);
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

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'modul-perioada'));

  test('perioada dorita not present when default module selected', async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await clickSubmit(page);
    // The markup may include periode elements hidden when not applicable; ensure none are visible
    const perioade = page.locator('#perioada-254, #perioada-261, #perioada-649');
    const count = await perioade.count();
    if (count === 0) return; // no elements at all -> good
    // if elements exist, assert they're not visible (fail fast if any visible)
    for (let i = 0; i < count; i++) {
      const el = perioade.nth(i);
      expect(await el.isVisible(), `Expected ${await el.evaluate((n) => n.id)} to be hidden when default module selected`).toBe(false);
    }
  });

  for (const module of moduleOptions) {
    test(`perioada dorita present and shows number for module: ${module.label}`, async ({ page }) => {
      await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
      const modulDropdown = page.locator('[name="modul"]');
      await modulDropdown.selectOption({ value: module.value });
  await clickSubmit(page);
    const perioadaDropdown = page.locator(module.perioadaId);
    // wait briefly for the periodo element to become visible and stable; fail quickly if it doesn't
    await expect(perioadaDropdown).toBeVisible({ timeout: 3000 });
    // allow small stabilization for dynamic content to populate
    await page.waitForTimeout(200);
    const slotText = (await perioadaDropdown.textContent()) || '';
      const match = slotText ? slotText.match(/\d+/) : null;
      const slotNumber = match ? match[0] : null;
      // Should show a number
      expect(slotNumber, `Expected a numeric slot in ${module.perioadaId} but got: ${slotText}`).not.toBeNull();
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
      await clickSubmit(page);
      const perioadaDropdown = page.locator(module.perioadaId);
      await expect(perioadaDropdown).toBeVisible({ timeout: 3000 });
      await page.waitForTimeout(200);
      const slotText = (await perioadaDropdown.textContent()) || '';
      const match = slotText ? slotText.match(/\d+/) : null;
      const slotNumber = match ? match[0] : null;
      // If no number, it's a bug
      expect(slotNumber, `Perioada dorita present but no number shown for ${module.label} (content=${slotText})`).not.toBeNull();
    });
  }

  test('no red outline when perioada dorita not present', async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
    const modulDropdown = page.locator('[name="modul"]');
    await modulDropdown.selectOption({ value: '0' });
    await clickSubmit(page);
    // Should not show red outline for perioada dorita
    for (const module of moduleOptions) {
      const hasPerioadaError = await hasRedOutline(page, module.perioadaId.replace('#', ''));
      expect(hasPerioadaError).toBe(false);
    }
  });
});

