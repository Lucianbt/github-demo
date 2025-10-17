// tests/support/flows.ts
import { expect, Page } from '@playwright/test';
import { Url, Nav, Register, Login } from './selectors';

export async function goToForm(page: Page) {
  await page.goto(Url.base);
  await page.locator(Nav.linkForm).first().click();
  await expect(page).toHaveURL(new RegExp(Url.formPath, 'i'));
}

export async function logoutIfLoggedIn(page: Page) {
  const logout = page.locator(Nav.logoutAny);
  if (await logout.count()) {
    await logout.first().click();
    await page.waitForLoadState('domcontentloaded');
  }
}

export async function registerAccount(page: Page, email: string, password: string) {
  await expect(page.locator(Register.email)).toBeVisible();
  await page.locator(Register.email).fill(email);
  await page.locator(Register.password).fill(password);

  const anti = page.locator(Register.antiSpam);
  if (await anti.count()) await anti.first().fill('7');

  await page.locator(Register.submit).click();
  await expect(page).toHaveURL(/formular|my-account|register|contul-meu|login/i);
}

export async function loginAccount(page: Page, email: string, password: string) {
  await page.goto(`${Url.base}${Url.accountPath}`);
  await logoutIfLoggedIn(page);

  await page.locator(Login.username).fill(email);
  await page.locator(Login.password).fill(password);

  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.locator(Login.submit).click(),
  ]);

  await expect(page.locator(Nav.logoutAny).first()).toBeVisible();
}

export async function goToFormAuthenticated(page: Page, email: string, password: string) {
  const loggedIn = await page.locator(Nav.logoutAny).first().isVisible().catch(() => false);
  if (!loggedIn) {
    await loginAccount(page, email, password);
  }
  await page.goto(`${Url.base}${Url.formPath}`);
}
