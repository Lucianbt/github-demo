// tests/add-remove.spec.ts
import { test, expect } from '@playwright/test';

test('add 3 elements then remove 3 elements', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');

  const addBtn = page.getByRole('button', { name: 'Add Element' });
  const deleteBtns = page.getByRole('button', { name: 'Delete' });

  // Add 3 elements
  for (let i = 0; i < 3; i++) {
    await addBtn.click();
  }
  await expect(deleteBtns).toHaveCount(3);

  // Remove 3 elements (click the first each time as the list shrinks)
  for (let i = 0; i < 3; i++) {
    await deleteBtns.first().click();
  }
  await expect(deleteBtns).toHaveCount(0);
});
