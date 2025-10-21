import type { Page } from '@playwright/test';

/**
 * Ensure the user is logged in. Attempts to detect current auth state and,
 * if needed, perform a login using provided email/password. This mirrors the
 * logic originally embedded in `happy-path.spec.ts`.
 */
export async function ensureLoggedIn(page: Page, email: string, password: string) {
  // Wait for page to be stable before checking auth state
  await page.waitForLoadState('domcontentloaded');
  // If logout is visible, we're already authenticated.
  const logoutLink = page.getByRole('link', { name: /logout/i });
  const isLoggedIn = await logoutLink.isVisible({ timeout: 3000 }).catch(() => false);
  if (isLoggedIn) return;

  // Check if login inputs are visible
  const usernameInput = page.locator('input[name="username"]');
  const isLoginVisible = await usernameInput.isVisible({ timeout: 2000 }).catch(() => false);
  if (!isLoginVisible) return;

  // Perform login using specific selectors
  await usernameInput.fill(email);
  await page.waitForTimeout(500);
  // Use specific ID for login password (login form has id="password")
  const loginPasswordInput = page.locator('input#password, input[type="password"]').first();
  await loginPasswordInput.waitFor({ state: 'visible', timeout: 5000 });
  await loginPasswordInput.fill(password);
  const loginButton = page.getByRole('button', { name: /login/i });
  await loginButton.click();
  // Wait for login to complete - check for logout link appearance
  await page.waitForSelector('a[href*="logout"], a[href*="delogare"]', { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}
