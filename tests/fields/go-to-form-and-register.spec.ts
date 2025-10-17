// tests/fields/go-to-form-and-register.spec.ts
import { test } from '@playwright/test';
import { Creds } from '../support/data';
import { goToForm, registerAccount, loginAccount } from '../support/flows';

let email = Creds.makeEmail();

test.describe.configure({ mode: 'serial' });

test('Register new user via Formular page', async ({ page }) => {
  await goToForm(page);
  await registerAccount(page, email, Creds.password);
});

test('Logout if logged in, then login using the new credentials', async ({ page }) => {
  await loginAccount(page, email, Creds.password);
});
