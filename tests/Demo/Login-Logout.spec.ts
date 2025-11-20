import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

test('test', async ({ page }) => {
  // ensure target screenshots directory exists in repo root: screenshots/Demo
  try {
    const dir = path.join(process.cwd(), 'screenshots', 'Demo');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore directory creation errors — Playwright may still write files
  }

  const info = test.info();
  try {
    await page.goto('https://ecommerce-playground.lambdatest.io/index.php?route=common/home');
    const myAccountBtn = page.getByRole('button', { name: ' My account' });
    await expect(myAccountBtn).toBeVisible();
    // Open the account menu first — Login is inside the dropdown on some layouts
    await myAccountBtn.click();
    const loginLink = page.getByRole('link', { name: 'Login' }).first();
    await expect(loginLink).toBeVisible({ timeout: 5000 });
    await loginLink.click();
    await expect(page.locator('#content')).toContainText('I am a returning customer');
    await page.getByRole('textbox', { name: 'E-Mail Address' }).click();
    await page.getByRole('textbox', { name: 'E-Mail Address' }).fill('lucianpetrariubt@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('vexedzxc47');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Logout' })).toBeVisible();
    await page.getByRole('link', { name: ' Logout' }).click();
    await expect(page.getByRole('heading', { name: ' Account Logout' })).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();

    // passed: wait and capture screenshot
    await page.waitForTimeout(3000);
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const passName = `login_${timestampForFile()}_${browserName}_PASSED.png`;
    const passPath = path.join(process.cwd(), 'screenshots', 'Demo', passName);
    await page.screenshot({ path: passPath, fullPage: true });
    console.log('Saved screenshot:', passPath);
  } catch (err) {
    // on failure: capture screenshot then rethrow
    await page.waitForTimeout(3000).catch(() => {});
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const failName = `login_${timestampForFile()}_${browserName}_FAILED.png`;
    const failPath = path.join(process.cwd(), 'screenshots', 'Demo', failName);
    await page.screenshot({ path: failPath, fullPage: true }).catch(() => {});
    console.log('Saved screenshot:', failPath);
    throw err;
  }
});