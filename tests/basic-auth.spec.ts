// tests/basic-auth.spec.ts
import { test, expect } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/basic_auth';

test.describe('Basic Auth (the-internet.herokuapp.com)', () => {
  // 1) Success: correct username/password
  test.describe('success', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'admin' } });

    test('login succeeds and content is visible', async ({ page }) => {
      const resp = await page.goto(URL);
      expect(resp?.status(), 'HTTP status should be 200 on success').toBe(200);

      await expect(page.locator('h3')).toHaveText('Basic Auth');
      await expect(page.locator('p')).toContainText('Congratulations');
    });
  });

  // 2) Wrong username → still unauthorized
  test.describe('wrong username', () => {
    test.use({ httpCredentials: { username: 'wrong', password: 'admin' } });

    test('remains unauthorized', async ({ page }) => {
      const resp = await page.goto(URL);
      expect(resp?.status(), 'HTTP status should be 401 when username is wrong').toBe(401);

      // Headless browsers don’t show the native popup; you see the 401 page instead:
      await expect(page.getByText(/Not authorized/i)).toBeVisible();
    });
  });

  // 3) Wrong password → still unauthorized
  test.describe('wrong password', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'wrong' } });

    test('remains unauthorized', async ({ page }) => {
      const resp = await page.goto(URL);
      expect(resp?.status(), 'HTTP status should be 401 when password is wrong').toBe(401);
      await expect(page.getByText(/Not authorized/i)).toBeVisible();
    });
  });

  // 4) "Cancel" scenario → no credentials at all
test.describe('no credentials (cancel)', () => {
  test.use({ httpCredentials: undefined });

  test('shows unauthorized (401) without credentials', async ({ page, request, browserName }) => {
    // Try to navigate; Chromium may reject on 401 – that’s okay.
    await page.goto('https://the-internet.herokuapp.com/basic_auth', { waitUntil: 'commit' }).catch(() => {});

    // Source of truth: server returns 401
    const res = await request.get('https://the-internet.herokuapp.com/basic_auth');
    expect(res.status()).toBe(401);

    // Only assert the "Not authorized" text where a DOM is actually rendered.
    if (browserName !== 'chromium') {
      await expect(page.getByText(/Not authorized/i)).toBeVisible();
    }
  });
});


});
