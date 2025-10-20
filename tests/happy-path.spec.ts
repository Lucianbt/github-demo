// End-to-end "happy path" for the registration and form submission flow.
// Generates random credentials, registers/logs in as needed, fills the form,
// submits, and asserts success (or PayU presence) without relying on fragile selectors.
import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Log in only if not already authenticated and a login form is present.
// Keeps tests idempotent when sessions persist across runs.
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

// ─── Tests ──────────────────────────────────────────────────────────────────

test('Happy path E2E registration form', async ({ page }) => {
  // Generate random email and password
  const email = `e2e_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
  const password = `Secret${Math.floor(Math.random()*10000)}!`;

  // 1. Register with random credentials (site auto-logs in after registration)
  await page.goto('https://ver3.academiatestarii.ro/index.php/formular/');
  const regEmail = page.locator('#reg_email');
  if (await regEmail.count()) {
    await regEmail.fill(email);
    await page.locator('#reg_password').fill(password);
    await Promise.all([
      page.waitForURL('**/formular/**', { waitUntil: 'networkidle' }),
      page.locator('button:has-text("Înregistrează-te"), input[type="submit"]:has-text("Înregistrează-te")').click(),
    ]);
  } else {
    // Likely already logged in or registration section hidden on this page version
    // Continue with the flow; ensure login below if needed
  }

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
  // Perioada dorita: select first available option (required field)
  const perioadaSelect = page.locator('select').filter({ hasText: /perioada/i }).or(page.locator('xpath=//p[contains(text(),"Perioada dorita")]/following-sibling::select[1]'));
  if (await perioadaSelect.count()) {
    const options = await perioadaSelect.locator('option[value!=""]').all();
    if (options.length > 0) {
      await perioadaSelect.selectOption({ index: 1 }); // Select first non-empty option
    }
  }
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
  
  // Submit the form
  await submit.click();
  await page.waitForTimeout(2000); // Wait for AJAX submission
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  // Assert that the success message is displayed
  // Pass if either the success message or PayU button is present
  const bodyText = (await page.locator('body').textContent())?.toLowerCase() || '';
  const hasSuccess = bodyText.includes('mulţumim') && bodyText.includes('plata');
  const hasPayU = bodyText.includes('payu');
  expect(hasSuccess || hasPayU).toBeTruthy();
});
