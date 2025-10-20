// Production E2E flow against academiatestarii.ro
// Logs in, navigates to the specific course, clicks "Ia cursul",
// and asserts the exact URL (stability check for the purchase entrypoint).
import { test, expect } from '@playwright/test';

// ─── Tests ──────────────────────────────────────────────────────────────────

// E2E: Login first, then navigate to course and try to buy
test('E2E production: cannot buy Introducere in Testarea Software', async ({ page }) => {
  // Go to homepage
  await page.goto('https://academiatestarii.ro/');

  // Accept cookies if present
  const acceptCookies = page.locator('button', { hasText: /Accept/i });
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
  }

  // Go to login page
  await page.getByRole('link', { name: /Intră în cont/i }).click();

  // Fill login form (replace with valid credentials if needed)
  await page.getByRole('textbox', { name: 'Introdu adresa de email sau' }).fill('lucianpetrariubt@gmail.com');
  await page.getByRole('textbox', { name: 'Introdu parola' }).nth(0).fill('vexedzxc47');
  await page.getByRole('link', { name: 'Sign In' }).click();

  // Wait for login to complete: wait for the user greeting link (e.g., 'Salut Petrariu Lucian')
  await page.getByRole('link', { name: /Salut Petrariu Lucian/i }).waitFor({ timeout: 10000 });

  // Go to homepage again (if not redirected)
  await page.goto('https://academiatestarii.ro/');

  // Click on 'Vezi toate cursurile' or 'Vezi cursurile'
  const allCourses = page.locator('a', { hasText: /Vezi (toate )?cursurile/i });
  if (await allCourses.isVisible().catch(() => false)) {
    await allCourses.first().click();
  } else {
    // fallback: go directly to courses page
    await page.goto('https://academiatestarii.ro/cursuri-testare-sofware/');
  }

  // Click on 'Introducere în Testarea Software' course
  await page.getByRole('link', { name: /Introducere în Testarea Software/i }).click();

  // Click on 'Ia cursul' button
  await page.getByRole('link', { name: 'Ia cursul' }).click();

  // Assert the exact URL after clicking 'Ia cursul'
  await expect(page).toHaveURL('https://academiatestarii.ro/courses-archive/introducere-in-testarea-software/#');
});
