// tests/drag-and-drop.spec.ts
import { test, expect } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/drag_and_drop';
const colA = '#column-a';
const colB = '#column-b';
const header = 'header'; // the letter is inside a <header> in each column

test.describe('Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // sanity: initial letters
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });

  test('1) Drag A to B - success', async ({ page }) => {
    await page.locator(colA).dragTo(page.locator(colB));
    await expect(page.locator(`${colA} ${header}`)).toHaveText('B');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('A');
  });

  test('2) Drag B to A - success', async ({ page }) => {
    await page.locator(colB).dragTo(page.locator(colA));
    await expect(page.locator(`${colA} ${header}`)).toHaveText('B');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('A');
  });

  test('3) Drag A to anywhere besides B - snaps back to A', async ({ page }) => {
    // Drop onto a neutral element that doesn't accept the drop (e.g., page body)
    await page.locator(colA).dragTo(page.locator('body'));
    // Expect no swap happened
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });

  test('4) Drag B to anywhere besides A - snaps back to B', async ({ page }) => {
    await page.locator(colB).dragTo(page.locator('body'));
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });
});
