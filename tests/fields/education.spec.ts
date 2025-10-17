import { test, expect } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';
import { EducatieData } from '../support/data';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Educatie filled passes', async ({ page }) => {
  await page.locator(Form.educatie).fill(EducatieData.valid[0]);
});

test('"Nu doresc sa completez" disables textarea', async ({ page }) => {
  await page.locator(Form.educatieSkip).check();
  await expect(page.locator(Form.educatie)).toBeDisabled();
});
