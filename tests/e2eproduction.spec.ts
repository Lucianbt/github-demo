// Production E2E flow against academiatestarii.ro
// Logs in, navigates to the specific course, clicks "Ia cursul",
// and asserts the exact URL (stability check for the purchase entrypoint).
import { test, expect } from '@playwright/test';
import { screenshotAfterEach } from './helpers';

test('E2E production: cannot buy Introducere in Testarea Software', async ({ page }, testInfo) => {
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

  // Wait for login to complete: prefer getByRole but fallback to getByText for browsers
  // where role information may be unreliable (WebKit).
  let greetingLink = page.getByRole('link', { name: /Salut Petrariu Lucian/i });
  try {
    await expect(greetingLink).toBeVisible({ timeout: 15000 });
  } catch {
    greetingLink = page.getByText('Salut Petrariu Lucian');
    await expect(greetingLink).toBeVisible({ timeout: 15000 });
  }

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

  // Click on 'Ia cursul' button (try multiple selectors for cross-browser reliability)
  let iaCursulLink = page.getByRole('link', { name: 'Ia cursul' });
  try {
    await expect(iaCursulLink).toBeVisible({ timeout: 10000 });
  } catch {
    // Fallback: try button or alternative text
    iaCursulLink = page.locator('a:has-text("Ia cursul")');
    if (await iaCursulLink.count() && await iaCursulLink.first().isVisible()) {
      iaCursulLink = iaCursulLink.first();
    } else {
      iaCursulLink = page.locator('button:has-text("Ia cursul")');
      if (!(await iaCursulLink.count() && await iaCursulLink.first().isVisible())) {
        throw new Error('Could not find "Ia cursul" button or link');
      }
      iaCursulLink = iaCursulLink.first();
    }
  }
  await iaCursulLink.click();

  // Assert the exact URL after clicking 'Ia cursul'
  await expect(page).toHaveURL('https://academiatestarii.ro/courses-archive/introducere-in-testarea-software/#');
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  // Scroll to the course description heading for a consistent screenshot
  let mainContent = await page.$('h1:has-text("Introducere în Testarea Software")');
  if (!mainContent) {
    mainContent = await page.$('h2:has-text("Introducere în Testarea Software")');
  }
  if (!mainContent) {
    mainContent = await page.$('h1, h2'); // fallback to first heading
  }
  if (mainContent) {
    await mainContent.scrollIntoViewIfNeeded();
  }
  await screenshotAfterEach(page, testInfo, 'e2eproduction');
});
