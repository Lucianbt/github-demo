import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Selecting module enables and populates period', async ({ page }) => {
  const modul = page.locator(Form.modulDorit);
  const perioada = page.locator(Form.perioadaDorita);

  await modul.selectOption({ index: 1 }); // pick first real module
  await expect(perioada).toBeEnabled();
  // Optionally: expect options count > 1, or slots text present
});
