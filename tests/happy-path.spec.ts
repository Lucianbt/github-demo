// End-to-end "happy path" for the registration and form submission flow.
// Generates random credentials, registers/logs in as needed, fills the form,
// submits, and asserts success (or PayU presence) without relying on fragile selectors.
import { test, expect } from '@playwright/test';
import { ensureLoggedIn, screenshotAfterEach } from './helpers';

test.describe('Happy path E2E', () => {
  test.afterEach(async ({ page }, testInfo) => {
    // Wait for PayU button or 'multumim' text after submit, or fallback to timeout
    const payuOrThanks = page.locator('text=/payu|mulțumim|multumim/i');
    try {
      await payuOrThanks.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // If not found, fallback to a longer timeout to allow UI to update
      await page.waitForTimeout(3000);
    }
    await screenshotAfterEach(page, testInfo, 'happy-path');
  });

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
  // Fill the first visible, enabled, empty text input (likely the required ASasfas//asdasdhasd field)
  const emptyVisibleInputs = await page.locator('input[type="text"]:visible:enabled').all();
  for (const input of emptyVisibleInputs) {
    const value = await input.inputValue();
    if (!value) {
      await input.fill('test-value');
      break;
    }
  }
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
  
  // Wait for success message or PayU button to be visible
  await page.waitForTimeout(2000); // Additional wait for animations/rendering
  const successLocator = page.locator('text=/mulţumim|payu/i');
  await successLocator.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  });
});
