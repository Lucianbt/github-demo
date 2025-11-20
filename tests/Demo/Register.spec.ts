/// <reference types="node" />
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length) + Math.random().toString(36).substring(2, 2 + length);
}

function randomPhone() {
  // Romanian-style mobile starting with 07 and 8 more digits
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return '07' + num.toString();
}

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

test('register with random data and save pass/fail screenshots', async ({ page }) => {
  const info = test.info();

  const firstName = 'FN' + randomString(4);
  const lastName = 'LN' + randomString(4);
  const email = `e2e_${Date.now()}_${randomString(4)}@example.com`;
  const telephone = randomPhone();
  const password = randomString(10) + 'A1!';

  // ensure target screenshots directory exists in repo root: screenshots/Demo
  try {
    const dir = path.join(process.cwd(), 'screenshots', 'Demo');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore directory creation errors — Playwright may still write files
  }

  try {
    await page.goto('https://ecommerce-playground.lambdatest.io/index.php?route=common/home');
    const myAccountBtn = page.getByRole('button', { name: ' My account' });
    await expect(myAccountBtn).toBeVisible();
    // Open the account menu first — Register is inside the dropdown on some layouts
    await myAccountBtn.click();
    // wait for Register link to appear then click
    // multiple 'Register' links exist on the page; pick the first visible one
    const registerLink = page.getByRole('link', { name: 'Register' }).first();
    await expect(registerLink).toBeVisible({ timeout: 5000 });
    await registerLink.click();

    await page.getByRole('textbox', { name: 'First Name*' }).click();
    await page.getByRole('textbox', { name: 'First Name*' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Last Name*' }).click();
    await page.getByRole('textbox', { name: 'Last Name*' }).fill(lastName);
    await page.getByRole('textbox', { name: 'E-Mail*' }).click();
    await page.getByRole('textbox', { name: 'E-Mail*' }).fill(email);
    await page.getByRole('textbox', { name: 'Telephone*' }).click();
    await page.getByRole('textbox', { name: 'Telephone*' }).fill(telephone);
    await page.getByRole('textbox', { name: 'Password*' }).click();
    await page.getByRole('textbox', { name: 'Password*' }).fill(password);
    await page.getByRole('textbox', { name: 'Password Confirm*' }).click();
    await page.getByRole('textbox', { name: 'Password Confirm*' }).fill(password);
    await page.getByText('Yes').click();
    await page.getByText('I have read and agree to the').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // final assertions
    await expect(page.getByRole('heading', { name: ' Your Account Has Been' })).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

    // passed: wait 2s and take screenshot (use Playwright outputPath to ensure directory)
    await page.waitForTimeout(2000);
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const passName = `register_${timestampForFile()}_${browserName}_PASSED.png`;
    const passPath = path.join(process.cwd(), 'screenshots', 'Demo', passName);
    await page.screenshot({ path: passPath, fullPage: true });
    console.log('Saved screenshot:', passPath);
  } catch (err) {
    // on failure: wait 2s, take screenshot and rethrow so Playwright marks test failed
    await page.waitForTimeout(2000).catch(() => {});
    const browserName = info.project && info.project.name ? info.project.name : 'browser';
    const failName = `register_${timestampForFile()}_${browserName}_FAILED.png`;
    const failPath = path.join(process.cwd(), 'screenshots', 'Demo', failName);
    await page.screenshot({ path: failPath, fullPage: true }).catch(() => {});
    console.log('Saved screenshot:', failPath);
    throw err;
  }
});