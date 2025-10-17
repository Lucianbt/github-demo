import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';
import { NameData } from '../support/data';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Nume & Prenume accept valid values', async ({ page }) => {
  await page.locator(Form.nume).fill(NameData.validNume[0]);
  await page.locator(Form.prenume).fill(NameData.validPrenume[0]);
  // Optionally: blur and assert no error class if available
});

test('Nume invalid (digits)', async ({ page }) => {
  await page.locator(Form.nume).fill(NameData.withDigits[0]);
  await page.locator(Form.nume).blur();
  await expect(page.locator(Form.invalidField)).toBeVisible();
});
