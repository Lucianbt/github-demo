import { test, expect, Page } from '@playwright/test';

// Helper: run only if a visible login form is present; otherwise skip (already logged in)
async function ensureLoggedIn(page: Page, email: string, password: string) {
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

  // Perform login
  await usernameInput.fill(email);
  await page.locator('input[name="password"]').fill(password);
  
  // Click the login button and wait for navigation
  const loginButton = page.getByRole('button', { name: /login/i });
  await loginButton.click();
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

test('Happy path E2E registration form', async ({ page }) => {
  // Generate random email and password
  const email = `e2e_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
  const password = `Secret${Math.floor(Math.random()*10000)}!`;

  // 1. Register with random credentials (site auto-logs in after registration)
  await page.goto('https://ver3.academiatestarii.ro/index.php/formular/');
  await page.locator('#reg_email').fill(email);
  await page.locator('#reg_password').fill(password);
  await Promise.all([
    page.waitForURL('**/formular/**', { waitUntil: 'networkidle' }),
    page.locator('button:has-text("Înregistrează-te"), input[type="submit"]:has-text("Înregistrează-te")').click(),
  ]);
  // Note: do NOT fill anti-spam honeypot fields; leave them blank

  // 2. Navigate to form page and ensure logged in (single check)
  await page.goto('https://ver3.academiatestarii.ro/index.php/formular/');
  await ensureLoggedIn(page, email, password);

  // 3. Ensure form is ready
  await page.waitForSelector('input[name="nume"], input[name="prenume"]', { timeout: 20000 });
  await page.locator('input[name="nume"]').fill('Popescu');
  await page.locator('input[name="prenume"]').fill('Ana');
  await page.locator('input[name*="parola" i]').fill(password);
  await page.locator('input[name*="confirmare" i]').fill(password);
  await page.locator('input[name*="profesie" i]').fill('inginer');
  await page.locator('input[name*="telefon" i]').fill('0742123123');
  // Do not interact with any anti-spam honeypots on the form
  // Modulul dorit
  await page.locator('select[name*="modul" i]').selectOption({ label: 'Iniţiere în Software Testing - 900 RON' });
  // Perioada dorita: skip
  // Educatie: tick 'nu doresc sa completez' (avoid overlay interception)
  const skipEducatie = page.locator('#educatie-no, input[name="educatie-no"]');
  if (await skipEducatie.count()) {
    if (!(await skipEducatie.isChecked())) {
      // Avoid overlay interception by setting via DOM and dispatching events
      await skipEducatie.evaluate((el: HTMLInputElement) => {
        el.checked = true;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(skipEducatie).toBeChecked();
    }
  } else {
    // Fallback: fill educatie if checkbox missing
    await page.locator('input[name="educatie"]').fill('secret');
  }
  // Cunostinte Engleza
  await page.locator('select[name*="engleza" i]').selectOption({ label: 'Avansat' });
  // Cunostinte Office
  await page.locator('select[name*="office" i]').selectOption({ label: 'Avansat' });
  // Cunostinte Web
  await page.locator('select[name*="web" i]').selectOption({ label: 'Avansat' });
  // Prefered Payment Method: 'online' is checked by default
  const onlineRadio = page.locator('input[type="radio"][value*="online" i]');
  if (await onlineRadio.count()) {
    await expect(onlineRadio).toBeChecked();
  }
  // Tipul de plata: 'integral' is checked by default
  const integralRadio = page.locator('input[type="radio"][value*="integral" i]');
  if (await integralRadio.count()) {
    await expect(integralRadio).toBeChecked();
  }
  // Sunt de acord cu Termenii si conditiile site-ului (already checked)
  const terms = page.locator('input[type="checkbox"]:near(:text("Termenii"))').first();
  if (await terms.count()) {
    await expect(terms).toBeChecked();
  }
  // Am citit si indeplinesc conditiile minime ale cursului (already checked)
  const cond = page.locator('input[type="checkbox"]:near(:text("conditiile minime"))').first();
  if (await cond.count()) {
    await expect(cond).toBeChecked();
  }
  // Click on Trimite (visible div trigger as in UI)
  const submit = page.locator('div.dima-button.trimite, .dima-button.trimite').first();
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeVisible({ timeout: 10000 });
  await page.locator('.dima-loading, .ajax-loader').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  await submit.click({ force: true });

  // Assert no errors
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const errorCount = await page.locator('input[style*="red"], .error, .wpcf7-not-valid, [aria-invalid="true"]').count();
  expect(errorCount).toBe(0);
  await expect(page).toHaveURL(/(multumim|success|confirmare|my-account|formular)/i, { timeout: 10000 });
});
