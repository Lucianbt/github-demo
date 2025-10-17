import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Office/Web allow any option (smoke)', async ({ page }) => {
  await page.locator(Form.office).selectOption({ index: 1 });
  await page.locator(Form.web).selectOption({ index: 2 });
});
