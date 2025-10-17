import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';
import { PasswordData } from '../support/data';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Valid password passes', async ({ page }) => {
  await page.locator(Form.parola).fill(PasswordData.valid[0]);
  await page.locator(Form.confirmaParola).fill(PasswordData.valid[0]);
});

test('Password missing digit fails', async ({ page }) => {
  await page.locator(Form.parola).fill(PasswordData.noDigit[0]);
  await page.locator(Form.parola).blur();
  await expect(page.locator(Form.invalidField)).toBeVisible();
});

test('Confirm password mismatch shows error', async ({ page }) => {
  await page.locator(Form.parola).fill(PasswordData.confirmMismatch.pass);
  await page.locator(Form.confirmaParola).fill(PasswordData.confirmMismatch.confirm);
  await page.locator(Form.confirmaParola).blur();
  await expect(page.locator(Form.invalidField)).toBeVisible();
});
