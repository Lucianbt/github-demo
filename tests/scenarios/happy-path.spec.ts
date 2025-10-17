// tests/scenarios/happy-path.spec.ts
import { test, expect } from '@playwright/test';
import { Creds, NameData, PasswordData, ProfesieData, TelefonData, DobData, EducatieData } from '../support/data';
import { Url, Nav, Form } from '../support/selectors';
import { goToForm, loginAccount, registerAccount, logoutIfLoggedIn } from '../support/flows';

test.describe.configure({ mode: 'serial' });

const accountEmail = Creds.makeEmail();

test('Setup: create account (or login if needed)', async ({ page }) => {
  await page.goto(`${Url.base}${Url.formPath}`);
  await registerAccount(page, accountEmail, Creds.password);

  const logoutHeader = page.locator(Nav.logoutAny).first();
  if (!(await logoutHeader.isVisible().catch(() => false))) {
    await loginAccount(page, accountEmail, Creds.password);
  }
});

test('Happy path E2E: fill form and submit', async ({ page }) => {
  await loginAccount(page, accountEmail, Creds.password);
  await goToForm(page);

  await page.locator(Form.nume).fill(NameData.validNume[0]);
  await page.locator(Form.prenume).fill(NameData.validPrenume[0]);

  const strongPass = PasswordData.valid[0];
  await page.locator(Form.parola).fill(strongPass);
  await page.locator(Form.confirmaParola).fill(strongPass);

  await page.locator(Form.profesie).fill(ProfesieData.valid[0]);
  await page.locator(Form.telefon).fill(TelefonData.valid[0]);
  await page.locator(Form.dataNastere).fill(DobData.adultISO);

  const modul = page.locator(Form.modulDorit);
  await modul.selectOption({ index: 1 });

  const perioada = page.locator(Form.perioadaDorita);
  await expect(perioada).toBeEnabled();
  await perioada.selectOption({ index: 1 });

  await page.locator(Form.educatie).fill(EducatieData.valid[0]);

  await page.locator(Form.engleza).selectOption({ index: 1 });
  await page.locator(Form.office).selectOption({ index: 1 });
  await page.locator(Form.web).selectOption({ index: 1 });

  const metodaPlata = page.locator(Form.metodaPlata).first();
  if (await metodaPlata.evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input')) {
    await metodaPlata.check({ force: true });
  } else {
    await page.locator('select[name*="metoda" i]').selectOption({ index: 1 });
  }
  const tipPlata = page.locator(Form.tipPlata).first();
  if (await tipPlata.evaluate(el => (el as HTMLInputElement).tagName.toLowerCase() === 'input')) {
    await tipPlata.check({ force: true });
  } else {
    await page.locator('select[name*="tip" i]').selectOption({ index: 1 });
  }

  const terms = page.locator(Form.terms).first();
  const minCond = page.locator(Form.conditiiMinime).first();
  if (await terms.count()) await terms.check({ force: true });
  if (await minCond.count()) await minCond.check({ force: true });

  await page.locator(Form.submit).first().click();

  await expect(page).toHaveURL(/formular|my-account|multumim|success|confirmare/i);
});

test.afterAll(async ({ page }) => {
  await logoutIfLoggedIn(page);
});
