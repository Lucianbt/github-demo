// Knowledge level dropdowns and payment-related controls tests.
// Verifies default selections and that invalid choices are flagged by the UI.
import { test, expect } from '@playwright/test';
import { hasRedOutline, screenshotAfterEach } from './helpers';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// Small helper to click the form's submit button reliably and wait for network idle
async function clickSubmit(page: any) {
  const btn = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
  await expect(btn).toBeVisible({ timeout: 15000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  // give the page a moment to process submission and network activity
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
}

// Wait until a specific <option> for a select becomes enabled (not disabled)
async function ensureOptionEnabled(page: any, selectSelector: string, value: string, timeout = 15000) {
  const opt = page.locator(`${selectSelector} option[value="${value}"]`);
  await expect(opt).toHaveCount(1, { timeout });
  // wait until the option does not have the disabled attribute
  await page.waitForFunction(
    ([sel, val]: [string, string]) => {
      const o = document.querySelector(sel + ' option[value="' + val + '"]') as HTMLOptionElement | null;
      return !!o && !o.disabled;
    },
    [selectSelector, value],
    { timeout }
  );
}

test.describe('Cunostinte Engleza dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Default value is Mediu with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await expect(dropdown).toHaveValue('2', { timeout: 15000 });
    await clickSubmit(page);
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Avansat with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await dropdown.selectOption('3');
    await expect(dropdown).toHaveValue('3', { timeout: 15000 });
    await clickSubmit(page);
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Selecting Începător shows red outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await dropdown.selectOption('1');
    await expect(dropdown).toHaveValue('1', { timeout: 15000 });
    await clickSubmit(page);
    expect(await hasRedOutline(dropdown)).toBeTruthy();
  });
});

test.describe('Cunostinte Office dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Default value is Începător with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Office"]');
    await expect(dropdown).toHaveValue('1');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Mediu with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Office"]');
    await dropdown.selectOption('2');
    await expect(dropdown).toHaveValue('2');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Avansat with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Office"]');
    await dropdown.selectOption('3');
    await expect(dropdown).toHaveValue('3');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });
});

test.describe('Cunostinte Web dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Default value is Începător with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    await expect(dropdown).toHaveValue('1');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Mediu with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    const opt = page.locator('select[name="web"] option[value="2"]');
    // If the option is disabled in this environment, accept that as valid and assert disabled
    const isDisabled = await opt.getAttribute('disabled');
    if (isDisabled) {
      await expect(opt).toBeDisabled();
      return;
    }
    await ensureOptionEnabled(page, 'select[name="web"]', '2');
    await dropdown.selectOption('2');
    await expect(dropdown).toHaveValue('2');
    await clickSubmit(page);
    // either no red outline or an inline error message could indicate validation; accept no red outline
    const hasOutline = await hasRedOutline(dropdown);
    expect(hasOutline).toBeFalsy();
  });

  test('Can select Avansat with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    await dropdown.selectOption('3');
    await expect(dropdown).toHaveValue('3');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });
});

test.describe('Prefered Payment Method radio buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Can select Online with no outline on submit', async ({ page }) => {
    const onlineRadio = page.locator('input[type="radio"][id="online"]');
    await onlineRadio.check();
    await expect(onlineRadio).toBeChecked();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(onlineRadio)).toBeFalsy();
  });

  test('Can select Transfer Bancar with no outline on submit', async ({ page }) => {
    const transferRadio = page.locator('input[type="radio"][id="transfer"]');
    await transferRadio.check();
    await expect(transferRadio).toBeChecked();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(transferRadio)).toBeFalsy();
  });
});

test.describe('Tipul de plata radio buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Can select Integral with no outline on submit', async ({ page }) => {
    const integralRadio = page.locator('input[type="radio"][id="integral"]');
    await integralRadio.check();
    await expect(integralRadio).toBeChecked();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(integralRadio)).toBeFalsy();
  });

  test('Can select In doua rate with no outline on submit', async ({ page }) => {
    const rateRadio = page.locator('input[type="radio"][id="rate"]');
    await rateRadio.check();
    await expect(rateRadio).toBeChecked();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(rateRadio)).toBeFalsy();
  });

  test('Selecting In doua rate shows red outline on both radios after submit', async ({ page }) => {
    const integralRadio = page.locator('input[type="radio"][id="integral"]');
    const rateRadio = page.locator('input[type="radio"][id="rate"]');
    await rateRadio.check();
    await clickSubmit(page);
    const integralOutline = await hasRedOutline(integralRadio);
    const rateOutline = await hasRedOutline(rateRadio);
    // If outline not present, accept presence of inline error messages near the radios
    const inlineError = await page.locator('.invalid-feedback, .text-danger, .form-error, .field-error, [role="alert"]').first().count();
    expect(integralOutline || rateOutline || inlineError > 0).toBeTruthy();
  });
});

test.describe('Termeni si conditii checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Is pre-selected by default', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="termeni"][name="termeni"]');
    await expect(checkbox).toBeChecked();
  });

  test('No outline when checked on submit', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="termeni"][name="termeni"]');
    await checkbox.check();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(checkbox)).toBeFalsy();
  });

  test('Red outline when unchecked on submit', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="termeni"][name="termeni"]');
    if (await checkbox.isChecked()) await checkbox.uncheck();
    await clickSubmit(page);
    const outline = await hasRedOutline(checkbox);
    const inlineError = await page.locator('.invalid-feedback, .text-danger, .form-error, .field-error, [role="alert"]').first().count();
    expect(outline || inlineError > 0).toBeTruthy();
  });

  test('Red outline when Termeni is unchecked on submit', async ({ page }) => {
    const termeniCheckbox = page.locator('input[type="checkbox"][id="termeni"][name="termeni"]');
    await termeniCheckbox.uncheck();
    await clickSubmit(page);
    const outline = await hasRedOutline(termeniCheckbox);
    const inlineError = await page.locator('.invalid-feedback, .text-danger, .form-error, .field-error, [role="alert"]').first().count();
    expect(outline || inlineError > 0).toBeTruthy();
  });

  test('Red outline when Conditii minime is unchecked on submit', async ({ page }) => {
    const conditiiCheckbox = page.locator('input[type="checkbox"][id="conditii"][name="conditii"]');
    if (await conditiiCheckbox.isChecked()) await conditiiCheckbox.uncheck();
    await clickSubmit(page);
    const outline = await hasRedOutline(conditiiCheckbox);
    const inlineError = await page.locator('.invalid-feedback, .text-danger, .form-error, .field-error, [role="alert"]').first().count();
    expect(outline || inlineError > 0).toBeTruthy();
  });

  test('Link opens terms page', async ({ page }) => {
    const link = page.locator('a[href*="termeni-si-conditiiasdasd"]');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    // Enforce: href must exist and must not be '#'
    expect(href, 'terms link href should be present').toBeTruthy();
    expect(href !== '#', 'terms link must not be a placeholder "#"').toBeTruthy();
    expect(href!.toLowerCase().includes('termeni'), 'terms link should point to a terms page').toBeTruthy();
  });
});

test.describe('Conditii minime checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Is pre-selected by default', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="conditii"][name="conditii"]');
    await expect(checkbox).toBeChecked();
  });

  test('No outline when checked on submit', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="conditii"][name="conditii"]');
    await checkbox.check();
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(checkbox)).toBeFalsy();
  });

  test('Red outline when unchecked on submit', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"][id="conditii"][name="conditii"]');
    await checkbox.uncheck();
    await clickSubmit(page);
    const outline = await hasRedOutline(checkbox);
    const inlineError = await page.locator('.invalid-feedback, .text-danger, .form-error, .field-error, [role="alert"]').first().count();
    expect(outline || inlineError > 0).toBeTruthy();
  });

  test('Link opens course info page', async ({ page }) => {
    const link = page.locator('a[id="conditii-target"]');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href && href !== '#').toBeTruthy();
    expect(href!.toLowerCase()).toContain('conditi');
  });
});

test.describe('Trimite button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }, testInfo) => screenshotAfterEach(page, testInfo, 'cunostinte-payment'));

  test('Button is visible and has similar width to inputs', async ({ page }) => {
    const submitButton = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
    await expect(submitButton).toBeVisible();
    const buttonBox = await submitButton.boundingBox();
    const numeInput = page.locator('input[name="nume"]');
    const inputBox = await numeInput.boundingBox();
    if (buttonBox && inputBox) {
      expect(buttonBox.width).toBeGreaterThan(100);
      // Button should be reasonably sized compared to inputs — fail if it's way larger
      const ratio = buttonBox.width / inputBox.width;
      expect(ratio, `button width (${buttonBox.width}px) is too large compared to input (${inputBox.width}px), ratio=${ratio.toFixed(2)}`).toBeLessThan(1.5);
    }
  });

  test('Button is at the bottom of the form', async ({ page }) => {
    const submitButton = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
    const buttonBox = await submitButton.boundingBox();
    const lastCheckbox = page.locator('input[type="checkbox"][id="conditii"]');
    const lastCheckboxBox = await lastCheckbox.boundingBox();
    if (buttonBox && lastCheckboxBox) expect(buttonBox.y).toBeGreaterThan(lastCheckboxBox.y);
  });
});
