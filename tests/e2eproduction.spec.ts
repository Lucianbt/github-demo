// Production E2E flow against academiatestarii.ro
// Logs in, navigates to the specific course, clicks "Ia cursul",
// and asserts the exact URL (stability check for the purchase entrypoint).
import { test, expect } from '@playwright/test';

// ─── Tests ──────────────────────────────────────────────────────────────────

// E2E: Login first, then navigate to course and try to buy
test('E2E production: cannot buy Introducere in Testarea Software', async ({ page }) => {
  test.slow(); // Allow more time for this E2E test (helps with WebKit flakiness)
  // Go to homepage
  await page.goto('https://academiatestarii.ro/');

  // Accept cookies if present
  const acceptCookies = page.locator('button', { hasText: /Accept/i });
  if (await acceptCookies.isVisible().catch(() => false)) {
    await expect(acceptCookies).toBeVisible({ timeout: 5000 });
    await acceptCookies.click();
  }

  // Go to login page
  const loginLink = page.getByRole('link', { name: /Intră în cont/i });
  await expect(loginLink).toBeVisible({ timeout: 10000 });
  await loginLink.click();

  // Fill login form (replace with valid credentials if needed)
  const emailInput = page.getByRole('textbox', { name: 'Introdu adresa de email sau' });
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill('lucianpetrariubt@gmail.com');
  const passwordInput = page.getByRole('textbox', { name: 'Introdu parola' }).nth(0);
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill('vexedzxc47');
  const signInLink = page.getByRole('link', { name: 'Sign In' });
  await expect(signInLink).toBeVisible({ timeout: 10000 });
  await signInLink.click();

  // Wait for login to complete: wait for the user greeting link (e.g., 'Salut Petrariu Lucian')
  const greetingLink = page.getByRole('link', { name: /Salut Petrariu Lucian/i });
  await expect(greetingLink).toBeVisible({ timeout: 15000 });

  // Go to homepage again (if not redirected)
  await page.goto('https://academiatestarii.ro/');

  // Click on 'Vezi toate cursurile' or 'Vezi cursurile'
  const allCourses = page.locator('a', { hasText: /Vezi (toate )?cursurile/i });
  if (await allCourses.isVisible().catch(() => false)) {
    await expect(allCourses.first()).toBeVisible({ timeout: 10000 });
      await allCourses.first().click();
  } else {
    // fallback: go directly to courses page
    await page.goto('https://academiatestarii.ro/cursuri-testare-sofware/');
  }

  // Click on 'Introducere în Testarea Software' course
  const courseLink = page.getByRole('link', { name: /Introducere în Testarea Software/i });
  await expect(courseLink).toBeVisible({ timeout: 10000 });
  await courseLink.click();

  // Click on 'Ia cursul' button
  const iaCursulLink = page.getByRole('link', { name: 'Ia cursul' });
  await expect(iaCursulLink).toBeVisible({ timeout: 10000 });
  await iaCursulLink.click();

  // Assert the exact URL after clicking 'Ia cursul'
  await expect(page).toHaveURL('https://academiatestarii.ro/courses-archive/introducere-in-testarea-software/#');
});
