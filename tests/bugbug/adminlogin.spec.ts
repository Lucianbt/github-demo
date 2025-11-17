import { test, expect } from '@playwright/test';

test('admin login', async ({ page }) => {
  // prefer BASE_URL when running behind a tunnel or in CI
  const base = process.env.BASE_URL ?? 'https://triton-qa.getdeveloper.net';
  const startUrl = `${base.replace(/\/$/, '')}/launchpad/mips/`;

  await page.goto(startUrl, { waitUntil: 'networkidle' });

  // find email input using multiple fallbacks for cross-browser robustness
  const email = page.locator('input[type="email"], input[name="email"], input[placeholder*="Email"], [aria-label="Email"]').first();
  await email.waitFor({ state: 'visible', timeout: 5000 });
  await email.click();
  await email.fill('admin');

  const password = page.locator('input[type="password"], input[name="password"], input[placeholder*="Password"], [aria-label="Password"]').first();
  await password.waitFor({ state: 'visible', timeout: 5000 });
  await password.click();
  await password.fill('admin');

  const loginButton = page.locator('button:has-text("Login"), input[type="submit"][value="Login"], button[aria-label="Login"]').first();
  await loginButton.waitFor({ state: 'visible', timeout: 5000 });

  // Click and then wait for either a navigation or a known post-login indicator
  await Promise.all([
    loginButton.click(),
    // give the app a chance to start navigation / network activity
  ]);

  // Wait for either URL change or an on-page indicator (try both with fallbacks)
  let loggedIn = false;
  try {
    await page.waitForURL(url => url.toString() !== startUrl, { timeout: 15000 });
    loggedIn = true;
  } catch (e) {
    // not navigated — try to detect a post-login element instead
    const busy = page.locator('text=Triton Busy, button:has-text("Triton Busy")');
    try {
      await busy.first().waitFor({ state: 'visible', timeout: 8000 });
      loggedIn = true;
    } catch (e2) {
      loggedIn = false;
    }
  }

  expect(loggedIn, 'expected to navigate away from login or show a post-login indicator').toBeTruthy();
});