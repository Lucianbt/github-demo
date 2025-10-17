import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';
import { TelefonData } from '../support/data';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Telefon valid', async ({ page }) => {
  await page.locator(Form.telefon).fill(TelefonData.valid[0]);
});

test('Telefon invalid – not starting 07', async ({ page }) => {
  await page.locator(Form.telefon).fill(TelefonData.invalid.notStart07[0]);
  await page.locator(Form.telefon).blur();
  await expect(page.locator(Form.invalidField)).toBeVisible();
});
