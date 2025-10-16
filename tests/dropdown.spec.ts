// tests/dropdown.spec.ts
import { test, expect } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/dropdown';

test.describe('Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole('heading', { level: 3, name: /dropdown/i })).toBeVisible();
  });

  test('1) Select option 1', async ({ page }) => {
    const dd = page.locator('#dropdown');
    await dd.selectOption('1');              // value="1"
    await expect(dd).toHaveValue('1');
  });

  test('2) Select option 2', async ({ page }) => {
    const dd = page.locator('#dropdown');
    await dd.selectOption('2');
    await expect(dd).toHaveValue('2');
  });

  test('3) Re-select option 1 after selecting 2', async ({ page }) => {
    const dd = page.locator('#dropdown');
    await dd.selectOption('2');
    await expect(dd).toHaveValue('2');
    await dd.selectOption('1');
    await expect(dd).toHaveValue('1');
  });

  test('4) Open dropdown then close elsewhere — selection remains', async ({ page }) => {
    const dd = page.locator('#dropdown');
    await dd.selectOption('1');
    await expect(dd).toHaveValue('1');

    await dd.click(); // open native dropdown
    await page.getByRole('heading', { name: /dropdown/i }).click(); // click outside
    await expect(dd).toHaveValue('1'); // unchanged
  });
});
