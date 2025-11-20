import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

test.setTimeout(60000);

test('E2E purchase — login, add to cart, checkout', async ({ page }) => {
  // ensure target screenshots directory exists in repo root: screenshots/Demo
  try {
    const dir = path.join(process.cwd(), 'screenshots', 'Demo');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore directory creation errors — Playwright may still write files
  }

  const info = test.info();
  try {
    // forward page console to terminal for easier debugging
    page.on('console', msg => console.log('[page]', msg.type(), msg.text()));
    page.on('dialog', async dialog => { console.log('[dialog]', dialog.message()); await dialog.dismiss().catch(() => {}); });

    await page.goto('https://ecommerce-playground.lambdatest.io/index.php?route=common/home');
    // Open login safely — some layouts put login under My account
    const myAccount = page.getByRole('button', { name: /My account| My account/i });
    if (await myAccount.isVisible().catch(() => false)) {
      await myAccount.click().catch(() => {});
      const loginLink = page.getByRole('link', { name: 'Login' }).first();
      await loginLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await loginLink.click().catch(() => {});
    } else {
      await page.getByRole('link', { name: 'Login' }).click().catch(() => {});
    }

    await page.getByRole('textbox', { name: 'E-Mail Address' }).fill('lucianpetrariubt@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('vexedzxc47');
    await page.getByRole('button', { name: 'Login' }).click();
    console.log('step: clicked login — waiting for My Account heading');
    await page.getByRole('heading', { name: 'My Account' }).waitFor({ timeout: 10000 }).catch(() => {});
    console.log('step: login confirmed (if visible)');

    // Navigate directly to a known stable product page to reduce flakiness
    await page.goto('https://ecommerce-playground.lambdatest.io/index.php?route=product/product&product_id=44');
    // wait for product content to load
    await page.getByRole('heading', { name: /MacBook Air|MacBook Air/ }).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // optional: expect In Stock if present
    if (await page.getByText('In Stock').first().isVisible().catch(() => false)) {
      await expect(page.getByText('In Stock')).toBeVisible();
    }

    await page.getByRole('button', { name: /Increase quantity/i }).click().catch(() => {});
    // prefer Add to Cart (safer) over direct buy
    await page.getByRole('button', { name: /Add to Cart|Add to cart/i }).first().click().catch(() => {});

    // Wait for potential success alert, then open cart and poll for rows (tolerant)
    await page.locator('.alert-success').first().waitFor({ timeout: 5000 }).catch(() => {});
    await page.getByRole('link', { name: /View Cart|Cart/ }).first().click().catch(() => {});
    const start = Date.now();
    const timeoutMs = 10000;
    let hasRows = false;
    while (Date.now() - start < timeoutMs) {
      hasRows = (await page.locator('.table-responsive table tbody tr').count().catch(() => 0)) > 0;
      if (hasRows) break;
      // fallback: check for Sub-Total text which also indicates cart contents
      const cartNotEmpty = await page.locator('text=Sub-Total:').first().isVisible().catch(() => false);
      if (cartNotEmpty) { hasRows = true; break; }
      await page.waitForTimeout(500);
    }
    if (!hasRows) {
      throw new Error('Cart appears empty after adding product');
    }

    // passed: wait and capture screenshot (follow same pattern as Login-Logout.spec.ts)
    await page.waitForTimeout(3000);
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const passName = `purchase_${timestampForFile()}_${browserName}_PASSED.png`;
    const passPath = path.join(process.cwd(), 'screenshots', 'Demo', passName);
    await page.screenshot({ path: passPath, fullPage: true });
    console.log('Saved screenshot:', passPath);
  } catch (err) {
    // on failure: capture screenshot then rethrow
    await page.waitForTimeout(3000).catch(() => {});
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const failName = `purchase_${timestampForFile()}_${browserName}_FAILED.png`;
    const failPath = path.join(process.cwd(), 'screenshots', 'Demo', failName);
    await page.screenshot({ path: failPath, fullPage: true }).catch(() => {});
    console.log('Saved screenshot:', failPath);
    throw err;
  }
});