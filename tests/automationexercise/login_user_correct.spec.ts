import { test, expect } from '@playwright/test';
import path from 'path';

const credsFile = path.join(__dirname, 'last-created-user.json');

function randString(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len);
}

test('register -> logout -> login -> delete account (end-to-end)', async ({ page }) => {
  const firstName = `User${randString(4)}`;
  const lastName = `Auto${randString(4)}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@example.com`;
  const password = 'vexedzxc47';

  // Register
  await page.goto('https://automationexercise.com/');
  const consent = page.getByRole('button', { name: 'Consent' });
  if (await consent.count() && await consent.isVisible()) { try { await consent.click(); } catch {} }
  await expect(page.getByRole('link', { name: ' Signup / Login' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: ' Signup / Login' }).click();
  await expect(page.getByText('New User Signup! Signup')).toBeVisible({ timeout: 5000 });
  await page.getByRole('textbox', { name: 'Name' }).fill(`${firstName} ${lastName}`);
  await page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address').fill(email);
  await page.getByRole('button', { name: 'Signup' }).click();

  const grippy = page.locator('.grippy-host');
  if (await grippy.count()) { try { if (await grippy.isVisible()) await grippy.click(); } catch {} }

  await expect(page.getByText('Enter Account Information')).toBeVisible({ timeout: 10000 });
  await page.getByRole('radio', { name: 'Mr.' }).check();
  await page.getByRole('textbox', { name: 'Password *' }).fill(password);
  await page.locator('#days').selectOption('17');
  await page.locator('#months').selectOption('5');
  await page.locator('#years').selectOption('2005');
  const newsletter = page.getByRole('checkbox', { name: 'Sign up for our newsletter!' });
  if (await newsletter.count()) await newsletter.check().catch(() => {});
  await page.getByRole('textbox', { name: 'First name *' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last name *' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Address * (Street address, P.' }).fill('1 Test St');
  await page.getByLabel('Country *').selectOption('United States').catch(() => {});
  await page.getByRole('textbox', { name: 'City * Zipcode *' }).fill('TestCity');
  await page.getByRole('textbox', { name: 'State *' }).fill('Florida');
  await page.locator('#zipcode').fill('00000');
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill('+10000000000');
  await page.getByRole('button', { name: 'Create Account' }).click();

  // wait for created or continue
  const createdLocator = page.getByText('Account Created!');
  const continueLocator = page.getByRole('link', { name: 'Continue' });
  for (let i = 0; i < 20; i++) {
    if (await createdLocator.count() && await createdLocator.isVisible().catch(() => false)) break;
    if (await continueLocator.count() && await continueLocator.isVisible().catch(() => false)) break;
    await page.waitForTimeout(500);
  }
  if (await continueLocator.count()) await continueLocator.click().catch(() => {});

  // make sure we're logged in
  const loggedInText = page.getByText(new RegExp(`Logged in as\\s+${firstName}`, 'i'));
  const logout = page.getByRole('link', { name: ' Logout' });
  const deleteLink = page.getByRole('link', { name: ' Delete Account' });
  let ok = false;
  for (let i = 0; i < 20; i++) {
    if (await loggedInText.count() && await loggedInText.isVisible().catch(() => false)) { ok = true; break; }
    if (await logout.count() && await logout.isVisible().catch(() => false)) { ok = true; break; }
    if (await deleteLink.count() && await deleteLink.isVisible().catch(() => false)) { ok = true; break; }
    await page.waitForTimeout(500);
  }
  if (!ok) throw new Error('Did not detect logged-in state after registration');

  // logout then login to verify credentials
  if (await logout.count()) await logout.click().catch(() => {});
  await page.getByRole('link', { name: ' Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible({ timeout: 5000 });
  await page.locator('form').filter({ hasText: 'Login' }).getByPlaceholder('Email Address').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  // confirm login
  await expect(page.getByText(new RegExp(`Logged in as\\s+${firstName}`, 'i'))).toBeVisible({ timeout: 10000 });

  // delete account at the end
  await page.getByRole('link', { name: ' Delete Account' }).click();
  await expect(page.getByText('Account Deleted!')).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: 'Continue' }).click();
});