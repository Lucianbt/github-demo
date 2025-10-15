// tests/checkboxes.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/checkboxes');
    // Sanity: page has exactly two checkboxes
    await expect(page.getByRole('checkbox')).toHaveCount(2);
  });

  test('tick both checkboxes', async ({ page }) => {
    const boxes = page.getByRole('checkbox');

    // .check() is idempotent—safe even if already checked
    await boxes.nth(0).check();
    await boxes.nth(1).check();

    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
  });

  test('untick both checkboxes', async ({ page }) => {
    const boxes = page.getByRole('checkbox');

    // .uncheck() is idempotent—safe even if already unchecked
    await boxes.nth(0).uncheck();
    await boxes.nth(1).uncheck();

    await expect(boxes.nth(0)).not.toBeChecked();
    await expect(boxes.nth(1)).not.toBeChecked();
  });
});
