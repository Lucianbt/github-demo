import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';
import { DobData } from '../support/data';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('DOB adult (>=18) accepted', async ({ page }) => {
  await page.locator(Form.dataNastere).fill(DobData.adultISO);
});

test('DOB future rejected', async ({ page }) => {
  await page.locator(Form.dataNastere).fill(DobData.futureISO);
  await page.locator(Form.dataNastere).blur();
  await expect(page.locator(Form.invalidField)).toBeVisible();
});
