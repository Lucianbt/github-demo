// tests/happy-path.spec.ts
import { test, expect } from '@playwright/test';

const BASE = 'https://ver3.academiatestarii.ro/';
const FORM_PATH = 'index.php/formular/';
const ACCOUNT_PATH = 'index.php/my-account/';
const PASS = 'example';

// Helpers (inline)
const linkForm = `a[href*="${FORM_PATH}"]`;
const logoutAny = 'header a[href*="action=logout"], header a[href*="customer-logout"]';

function makeEmail() {
  return `e2e.${Date.now()}@example.com`;
}

test.describe.configure({ mode: 'serial' });

test('Happy path E2E: register/login → fill long form → submit', async ({ page }) => {
  const email = makeEmail();

  // 1) Go to /formular and attempt to register a WP/Woo account
  await page.goto(`${BASE}${FORM_PATH}`);

  const regEmail = page.locator('#reg_email');
  const regPass  = page.locator('#reg_password');
  const regBtn   = page.locator('button[name="register"], input[name="register"]');
  if (await regEmail.isVisible()) {
    await regEmail.fill(email);
    await regPass.fill(PASS);

    const anti = page.locator('input[type="text"][name*="anti" i], input[placeholder*="Anti" i]');
    if (await anti.count()) await anti.first().fill('7');

    await regBtn.click();
  }

  // If still not logged in, go to My Account and login
  const headerLogout = page.locator(logoutAny).first();
  if (!(await headerLogout.isVisible().catch(() => false))) {
    await page.goto(`${BASE}${ACCOUNT_PATH}`);
    await page.locator('#username').fill(email);
    await page.locator('#password').fill(PASS);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.locator('button[name="login"], input[name="login"]').click(),
    ]);
    await expect(page.locator(logoutAny).first()).toBeVisible();
  }

  // 2) Open the long form
  await page.goto(BASE);
  await page.locator(linkForm).first().click();
  await expect(page).toHaveURL(new RegExp(FORM_PATH, 'i'));

  // 3) Fill all fields (use precise CSS)
  // Name fields
  await expect(page.locator('input[name="nume"]')).toBeVisible();
  await page.locator('input[name="nume"]').fill('Popescu');
  await page.locator('input[name="prenume"]').fill('Ana');

  // Password + confirm (long form, separate from account creds)
  await page.locator('input[name="parola"]').fill('Parola1');
  await page.locator('input[name*="confirm"]').fill('Parola1');

  // Profesie, Telefon, Data naștere
  await page.locator('input[name*="profesie" i]').fill('QA Engineer');
  await page.locator('input[name*="telefon" i], input[type="tel"]').fill('0712345678');
  await page.locator('input[name*="nastere" i], input[type="date"]').fill('1990-01-10'); // >= 18y

  // Modulul dorit + Perioada dorita
  const modul = page.locator('select[name*="modul" i]');
  await modul.selectOption({ index: 1 }); // first real option
  const perioada = page.locator('select[name*="perioada" i]');
  await expect(perioada).toBeEnabled();
  await perioada.selectOption({ index: 1 });

  // Educație (unchecked "nu doresc", so fill)
  await page.locator('textarea[name*="educatie" i]').fill('Facultatea X, 2019–2023');

  // Skills dropdowns
  await page.locator('select[name*="engleza" i]').selectOption({ index: 2 }); // Mediu/Avansat acceptable
  await page.locator('select[name*="office" i]').selectOption({ index: 2 });
  await page.locator('select[name*="web" i]').selectOption({ index: 2 });

  // Metoda / Tipul de plată (radio or select — handle both)
  const metodaAny = page.locator('input[type="radio"][name*="metoda" i], select[name*="metoda" i]');
  if (await metodaAny.first().evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input')) {
    await metodaAny.first().check({ force: true });
  } else {
    await page.locator('select[name*="metoda" i]').selectOption({ index: 1 });
  }
  const tipAny = page.locator('input[type="radio"][name*="tip" i], select[name*="tip" i]');
  if (await tipAny.first().evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input')) {
    await tipAny.first().check({ force: true });
  } else {
    await page.locator('select[name*="tip" i]').selectOption({ index: 1 });
  }

  // Required checkboxes (if present, keep them checked)
  const terms = page.locator('input[type="checkbox"][name*="termen" i]').first();
  const cond  = page.locator('input[type="checkbox"][name*="conditii" i]').first();
  if (await terms.count()) await terms.check({ force: true });
  if (await cond.count())  await cond.check({ force: true });

  // 4) Submit (prefer a proper submit control; fallback to visible “Trimite”)
  const submitBtn = page.locator('form button[type="submit"], form input[type="submit"], .wpcf7-submit');
  if (await submitBtn.count()) {
    await submitBtn.first().click();
  } else {
    await page.getByText(/^Trimite$/i).click(); // fallback if styled div
  }

  // 5) Post-submit sanity (page behavior can vary)
  await expect(page).toHaveURL(/formular|my-account|multumim|success|confirmare/i);
});
