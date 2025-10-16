// tests/drag-and-drop.spec.ts
import { test, expect } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/drag_and_drop';
const colA = '#column-a';
const colB = '#column-b';
const header = 'header';

// HTML5 DnD helper (works in WebKit)
async function html5DragAndDrop(page, from: string, to: string) {
  await page.evaluate(({ from, to }) => {
    const src = document.querySelector(from) as HTMLElement | null;
    const dst = document.querySelector(to) as HTMLElement | null;
    if (!src || !dst) throw new Error('DnD: selector not found');

    // Ensure DataTransfer exists (Safari/WebKit does support it, but guard anyway)
    const dataTransfer = new DataTransfer();

    const fire = (type: string, el: Element) =>
      el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));

    fire('dragstart', src);
    fire('dragenter', dst);
    fire('dragover', dst);
    fire('drop', dst);
    fire('dragend', src);
  }, { from, to });
}

test.describe('Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });

  test('1) Drag A to B - success', async ({ page, browserName }) => {
    if (browserName === 'webkit') {
      await html5DragAndDrop(page, colA, colB);
    } else {
      await page.locator(colA).dragTo(page.locator(colB));
    }
    await expect(page.locator(`${colA} ${header}`)).toHaveText('B');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('A');
  });

  test('2) Drag B to A - success', async ({ page, browserName }) => {
    if (browserName === 'webkit') {
      await html5DragAndDrop(page, colB, colA);
    } else {
      await page.locator(colB).dragTo(page.locator(colA));
    }
    await expect(page.locator(`${colA} ${header}`)).toHaveText('B');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('A');
  });

  test('3) Drag A to anywhere besides B - snaps back to A', async ({ page, browserName }) => {
    if (browserName === 'webkit') {
      // Drop on a neutral target (body) with helper
      await html5DragAndDrop(page, colA, 'body');
    } else {
      await page.locator(colA).dragTo(page.locator('body'));
    }
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });

  test('4) Drag B to anywhere besides A - snaps back to B', async ({ page, browserName }) => {
    if (browserName === 'webkit') {
      await html5DragAndDrop(page, colB, 'body');
    } else {
      await page.locator(colB).dragTo(page.locator('body'));
    }
    await expect(page.locator(`${colA} ${header}`)).toHaveText('A');
    await expect(page.locator(`${colB} ${header}`)).toHaveText('B');
  });
});
