// Knowledge level dropdowns and payment-related controls tests.
// Verifies default selections, allowed choices, and that invalid choices are flagged.
import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Heuristic to detect validation error styles (outline/box-shadow)
async function hasRedOutline(element: Locator) {
  const outline = await element.evaluate((el: HTMLElement) => getComputedStyle(el).outlineColor || getComputedStyle(el).borderColor);
    const style = await element.evaluate((el) => window.getComputedStyle(el));
    // Check both outline and box-shadow for red
    const outlineIsRed = style.outlineStyle === 'solid' && (style.outlineColor === 'rgb(255, 0, 0)' || style.outlineColor === 'red' || style.outlineColor.includes('255, 0, 0'));
    const boxShadowIsRed = style.boxShadow && style.boxShadow.includes('255, 0, 0');
    return outlineIsRed || boxShadowIsRed;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

// English proficiency dropdown validation
test.describe('Cunostinte Engleza dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test('Default value is Mediu with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await expect(dropdown).toHaveValue('2');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Avansat with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await dropdown.selectOption('3');
    await expect(dropdown).toHaveValue('3');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Selecting Începător shows red outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="Engleza"]');
    await dropdown.selectOption('1');
    await expect(dropdown).toHaveValue('1');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeTruthy();
  });
});

// Office proficiency dropdown validation
test.describe('Cunostinte Office dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

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

// Web proficiency dropdown validation
test.describe('Cunostinte Web dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test('Default value is Începător with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    await expect(dropdown).toHaveValue('1');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Mediu with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    await dropdown.selectOption('2');
    await expect(dropdown).toHaveValue('2');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });

  test('Can select Avansat with no outline on submit', async ({ page }) => {
    const dropdown = page.locator('select[name="web"]');
    await dropdown.selectOption('3');
    await expect(dropdown).toHaveValue('3');
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(dropdown)).toBeFalsy();
  });
});

// Preferred payment method radios (online vs transfer)
test.describe('Prefered Payment Method radio buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

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

// Payment type radios (integral vs installment)
test.describe('Tipul de plata radio buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

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
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      expect(await hasRedOutline(integralRadio)).toBeTruthy();
      expect(await hasRedOutline(rateRadio)).toBeTruthy();
    });
});

// Terms and conditions checkbox behavior and link target
test.describe('Termeni si conditii checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

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
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(checkbox)).toBeTruthy();
  });

    test('Red outline when Termeni is unchecked on submit', async ({ page }) => {
      const termeniCheckbox = page.locator('input[type="checkbox"][id="termeni"][name="termeni"]');
      await termeniCheckbox.uncheck();
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      expect(await hasRedOutline(termeniCheckbox)).toBeTruthy();
    });

    test('Red outline when Conditii minime is unchecked on submit', async ({ page }) => {
      const conditiiCheckbox = page.locator('input[type="checkbox"][id="conditii"][name="conditii"]');
        if (await conditiiCheckbox.isChecked()) {
          await conditiiCheckbox.uncheck();
        }
      await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
      expect(await hasRedOutline(conditiiCheckbox)).toBeTruthy();
    });

  test('Link opens terms page', async ({ page }) => {
  const link = page.locator('a[href*="termeni-si-conditiiasdasd"]');
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  // Should point to correct terms page (update as needed)
  expect(href).toBe('https://ver3.academiatestarii.ro/index.php/termeni-si-conditiiasdasd/');
  });
});

// Minimum requirements checkbox behavior and link target
test.describe('Conditii minime checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

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
    await page.locator('div.dima-button.trimite, .dima-button.trimite').click();
    expect(await hasRedOutline(checkbox)).toBeTruthy();
  });

  test('Link opens course info page', async ({ page }) => {
  const link = page.locator('a[id="conditii-target"]');
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  // Should point to correct course info page (update as needed)
  expect(href).toBe('https://ver3.academiatestarii.ro/index.php/conditii-minime-curs/');
  });
});

// Submit button visibility and layout checks
test.describe('Trimite button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });
  });

  test('Button is visible and has similar width to inputs', async ({ page }) => {
    const submitButton = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
    await expect(submitButton).toBeVisible();
    
    // Check that button has reasonable width (similar to form inputs)
    const buttonBox = await submitButton.boundingBox();
    const numeInput = page.locator('input[name="nume"]');
    const inputBox = await numeInput.boundingBox();
    
    if (buttonBox && inputBox) {
      // Button width should be in a reasonable range compared to inputs
      expect(buttonBox.width).toBeGreaterThan(100);
      expect(buttonBox.width).toBeLessThan(inputBox.width * 2);
    }
  });

  test('Button is at the bottom of the form', async ({ page }) => {
    const submitButton = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
    const buttonBox = await submitButton.boundingBox();
    const lastCheckbox = page.locator('input[type="checkbox"][id="conditii"]');
    const lastCheckboxBox = await lastCheckbox.boundingBox();
    
    if (buttonBox && lastCheckboxBox) {
      // Submit button should be below the last checkbox
      expect(buttonBox.y).toBeGreaterThan(lastCheckboxBox.y);
    }
  });
});
