import { test } from '@playwright/test';
import { goToForm } from '../support/flows';
import { Form } from '../support/selectors';

test.beforeEach(async ({ page }) => { await goToForm(page); });

test('Select payment method + type and submit form section (smoke)', async ({ page }) => {
  const metoda = page.locator(Form.metodaPlata).first();
  const tip = page.locator(Form.tipPlata).first();

  if (await metoda.evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input' && (el as HTMLInputElement).type === 'radio')) {
    await metoda.check({ force: true });
  } else {
    await page.locator('select[name*="metoda" i]').selectOption({ index: 1 });
  }

  if (await tip.evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input' && (el as HTMLInputElement).type === 'radio')) {
    await tip.check({ force: true });
  } else {
    await page.locator('select[name*="tip" i]').selectOption({ index: 1 });
  }

  const chTerms = page.locator(Form.terms);
  const chCond = page.locator(Form.conditiiMinime);
  if (await chTerms.count()) await chTerms.first().check({ force: true });
  if (await chCond.count()) await chCond.first().check({ force: true });

  await page.locator(Form.submit).first().click();
});
